import { getServiceClient } from '@/lib/supabase';

type FacebookAttachment = {
  media_type?: string;
  media?: { image?: { src?: string }; source?: string };
  target?: { id?: string };
  url?: string;
  subattachments?: { data?: FacebookAttachment[] };
};

type FacebookPost = {
  id: string;
  message?: string;
  created_time?: string;
  updated_time?: string;
  permalink_url?: string;
  attachments?: { data?: FacebookAttachment[] };
};

type FacebookPostsResponse = {
  data?: FacebookPost[];
  error?: { message?: string };
};

type ProductReference = { name: string; category: string };

type FacebookSyncMarker = {
  caseId?: string;
  postId?: string;
};

export type FacebookCaseSyncResult = {
  imported: number;
  skipped: number;
  videosImported: number;
  videosFailed: number;
  failed: Array<{ postId: string; reason: string }>;
};

type FacebookCaseMedia = {
  sourceUrl?: string;
  imageUrls?: string[];
  videoUrls?: string[];
  facebookVideoIds?: string[];
};

type CopiedFacebookVideos = {
  urls: string[];
  videoIds: string[];
  failed: number;
};

const FACEBOOK_PAGE_ID = (process.env.FACEBOOK_PAGE_ID || '').trim();
const FACEBOOK_PAGE_ACCESS_TOKEN = (process.env.FACEBOOK_PAGE_ACCESS_TOKEN || '').trim();
const FACEBOOK_GRAPH_API_VERSION = (process.env.FACEBOOK_GRAPH_API_VERSION || 'v26.0').trim();

export function getFacebookSyncConfiguration() {
  return {
    configured: Boolean(FACEBOOK_PAGE_ID && FACEBOOK_PAGE_ACCESS_TOKEN),
    pageIdConfigured: Boolean(FACEBOOK_PAGE_ID),
    tokenConfigured: Boolean(FACEBOOK_PAGE_ACCESS_TOKEN),
  };
}

function normaliseText(value: string) {
  return value.toLowerCase().replace(/\s+/g, ' ').trim();
}

// Facebook 貼文常以 emoji、圖形符號作為段落裝飾；案例頁只保留可讀文字。
function removePostIcons(value: string) {
  return value
    .replace(/[\u{1F000}-\u{1FAFF}\u{1F1E6}-\u{1F1FF}\u{2600}-\u{27BF}\uFE0F\u200D\u20E3◆◇●○■□▶►▸▪▫★☆✦✧]/gu, '')
    .replace(/^[ \t]+|[ \t]+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function removeHashtags(value: string) {
  return value
    .replace(/(^|\s)#[^\s#]+/g, '$1')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function cleanCaseArticle(value: string) {
  const cleaned = removeHashtags(removePostIcons(value));
  const lines = cleaned.split(/\r?\n/);
  const articleLines: string[] = [];
  let skippingServiceFooter = false;

  for (const sourceLine of lines) {
    const line = sourceLine.trim();
    if (!line) {
      if (!skippingServiceFooter && articleLines.at(-1) !== '') articleLines.push('');
      continue;
    }

    // 粉專文末的服務清單、提供內容、聯絡方式屬於通用宣傳，不是單一案例內容。
    if (/^(?:我們協助|我們提供|本公司(?:協助|提供)|服務(?:項目|內容)|提供項目|合作服務)/u.test(line)) {
      skippingServiceFooter = true;
      continue;
    }
    if (skippingServiceFooter) continue;

    const isContactOrGenericSalesLine = /^(?:歡迎|立即|更多資訊|官方\s*(?:line|facebook)|私訊|洽詢)/iu.test(line);
    // 服務／商品名稱與其適用場合是本篇案例的有效資訊，保留作為前臺說明與欄位判斷依據。
    if (isContactOrGenericSalesLine || /^[-—–]$/u.test(line)) continue;

    articleLines.push(line);
  }

  return articleLines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

// 活動類型應僅看活動正文，不能讓商品的「可用場合」反過來改變活動分類。
function extractActivityNarrative(value: string) {
  const lines = removeHashtags(removePostIcons(value)).split(/\r?\n/);
  const narrative: string[] = [];

  for (const sourceLine of lines) {
    const line = sourceLine.trim();
    if (/^[-—–]$/u.test(line)) break;
    if (line.includes('｜') && /啟動|儀式|設備|租借|規劃|服務|道具|特效|調酒|show\s*girl/iu.test(line)) break;
    if (/^(?:我們協助|我們提供|本公司(?:協助|提供)|服務(?:項目|內容)|提供項目|合作服務)/u.test(line)) break;
    if (line) narrative.push(line);
  }

  return narrative.join('\n').trim();
}

function firstContentLine(message: string) {
  return message
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean) || '';
}

function cleanClientName(value: string) {
  const cleaned = removePostIcons(value)
    .replace(/^(?:主辦(?:單位|方)?|業主(?:單位|方)?|客戶|委託單位|協辦(?:單位)?)\s*[:：]?\s*/u, '')
    .replace(/[，,。；;｜|].*$/u, '')
    .trim();
  if (!cleaned || /^(?:本公司|境曜有限公司|境曜啟動儀式活動統包|bright events services)$/iu.test(cleaned)) return '';
  return cleaned.slice(0, 60);
}

function legalCompanyName(value: string) {
  const match = value.match(/([A-Za-z0-9\u3400-\u9FFF&（）()．·・\s]{2,50}?(?:股份有限公司|有限公司|公司))/u);
  return match ? cleanClientName(match[1]) : '';
}

function publicOrganisationName(value: string) {
  const match = value.match(/(教育部|文化部|經濟部|交通部|內政部|外交部|勞動部|衛生福利部|環境部|農業部|國防部|數位發展部|[\u3400-\u9FFF]{1,16}(?:市政府|縣政府|鄉公所|鎮公所|區公所|局|處|署|所|館|中心|大學|學校|協會|基金會))/u);
  return match ? cleanClientName(match[1]) : '';
}

function detectClientName(message: string) {
  const labelledMatch = message.match(/(?:主辦(?:單位|方)?|業主(?:單位|方)?|客戶|委託單位)\s*[:：]\s*([^\n]{2,80})/u);
  if (labelledMatch) {
    const labelledName = legalCompanyName(labelledMatch[1]) || publicOrganisationName(labelledMatch[1]) || cleanClientName(labelledMatch[1]);
    if (labelledName) return labelledName;
  }

  // 業主名稱多半會放在貼文標題；優先掃描標題，再掃描前幾行以免誤判文末標註。
  const lines = message.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).slice(0, 5);
  for (const line of lines) {
    const clientName = legalCompanyName(line) || publicOrganisationName(line);
    if (clientName) return clientName;
  }
  return '';
}

function compact(value: string) {
  return value.replace(/[\s｜|「」『』()（）]/g, '').toLowerCase();
}

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function detectUsedProducts(message: string, products: ProductReference[]) {
  const compactMessage = compact(message);
  return products
    .filter(product => compact(product.name).length >= 3 && compactMessage.includes(compact(product.name)))
    .map(product => product.name);
}

function detectUsedServices(message: string, matchedProducts: string[], products: ProductReference[]) {
  const serviceByCategory: Record<string, string> = {
    'AI互動道具': 'AI 互動道具',
    '專案企劃': '活動策劃統包',
    '啟動儀式': '啟動儀式',
    '活動特效': '活動特效',
    '燈光音響舞台': '燈光音響舞台',
    '外派調酒': '外派調酒',
    'Show Girl': 'SHOW GIRL',
  };
  const usedServices = products
    .filter(product => matchedProducts.includes(product.name))
    .map(product => serviceByCategory[product.category] || product.category);
  const phrases: Array<[RegExp, string]> = [
    [/啟動儀式規劃/u, '啟動儀式規劃'],
    [/客製化活動規劃/u, '客製化活動規劃'],
    [/品牌活動呈現/u, '品牌活動呈現'],
    [/活動現場執行/u, '活動現場執行'],
    [/活動視覺輸出/u, '活動視覺輸出'],
    [/活動設備租借|設備租借/u, '活動設備租借'],
  ];
  return unique([...usedServices, ...phrases.filter(([pattern]) => pattern.test(message)).map(([, label]) => label)]);
}

function detectOccasions(message: string) {
  const patterns: Array<[RegExp, string]> = [
    [/品牌(?:發表|發表會)|新品發表/u, '品牌發表會'],
    [/企業活動/u, '企業活動'],
    [/開幕(?:典禮)?/u, '開幕典禮'],
    [/剪綵(?:儀式)?/u, '剪綵儀式'],
    [/記者會/u, '記者會'],
    [/展覽(?:活動)?|展會/u, '展覽活動'],
    [/商場活動/u, '商場活動'],
    [/政府活動/u, '政府活動'],
    [/尾牙/u, '尾牙'],
    [/春酒/u, '春酒'],
    [/家庭日/u, '家庭日'],
    [/市集/u, '市集'],
  ];
  return unique(patterns.filter(([pattern]) => pattern.test(message)).map(([, label]) => label));
}

function classifyPost(message: string) {
  const text = normaliseText(message);

  if (/記者會|媒體發表|媒體活動/.test(text)) return { category: '記者會', serviceType: '活動策劃統包' };
  if (/新品|產品發表|品牌發表/.test(text)) return { category: '新品發表會', serviceType: '活動策劃統包' };
  if (/展覽|展會|攤位|booth/.test(text)) return { category: '展覽攤位', serviceType: '活動策劃統包' };
  if (/政府|市府|縣府|公所|部\b/.test(text)) return { category: '政府活動', serviceType: '活動策劃統包' };
  if (/尾牙|春酒|年會|晚宴/.test(text)) return { category: '春酒尾牙', serviceType: '活動策劃統包' };
  if (/啟動|開幕|揭幕|典禮|儀式|節慶|納涼季|嘉年華|[春夏秋冬]季/.test(text)) return { category: '典禮節慶', serviceType: '啟動儀式' };
  if (/調酒|bartend|雞尾酒|酒吧/.test(text)) return { category: '開幕典禮', serviceType: '外派調酒' };
  if (/特效|冷焰火|煙霧|彩帶|泡泡/.test(text)) return { category: '開幕典禮', serviceType: '活動特效' };

  return { category: '開幕典禮', serviceType: '活動策劃統包' };
}

function createTitle(message: string, createdAt?: string) {
  const firstLine = firstContentLine(message);
  const bracketedTitle = firstLine.match(/【[^】]{1,100}】/u)?.[0];

  // 粉專貼文的第一行是文章名稱；若含【】則完整採用其中文字，避免帶入後續正文。
  if (bracketedTitle) return bracketedTitle;
  if (firstLine) return firstLine.slice(0, 80);
  return `Facebook 活動案例 ${createdAt ? createdAt.slice(0, 10) : ''}`.trim();
}

function collectImageSources(attachments: FacebookAttachment[] = []) {
  const sources = new Set<string>();
  const visit = (attachment: FacebookAttachment) => {
    // 影片可能同時帶有預覽圖；影片與其預覽圖都不列入案例照片。
    if (attachment.media_type?.toLowerCase() === 'video') return;
    const src = attachment.media?.image?.src;
    if (src && /^https:\/\//.test(src)) sources.add(src);
    attachment.subattachments?.data?.forEach(visit);
  };
  attachments.forEach(visit);
  return [...sources];
}

function collectVideoAttachments(attachments: FacebookAttachment[] = []) {
  const videos: FacebookAttachment[] = [];
  const visit = (attachment: FacebookAttachment) => {
    if (attachment.media_type?.toLowerCase() === 'video') videos.push(attachment);
    attachment.subattachments?.data?.forEach(visit);
  };
  attachments.forEach(visit);
  return videos;
}

function cleanUrls(value: unknown) {
  return Array.isArray(value)
    ? [...new Set(value.filter((url): url is string => typeof url === 'string' && /^https:\/\//.test(url)).map(url => url.trim()))]
    : [];
}

function cleanVideoIds(value: unknown) {
  return Array.isArray(value)
    ? [...new Set(value.filter((id): id is string => typeof id === 'string' && id.trim().length > 0).map(id => id.trim()))]
    : [];
}

function parseCaseMedia(value: string | null | undefined): FacebookCaseMedia {
  if (!value) return {};

  try {
    const parsed = JSON.parse(value) as FacebookCaseMedia;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function parseFacebookSyncMarker(value: string | null | undefined): FacebookSyncMarker {
  if (!value) return {};

  try {
    const parsed = JSON.parse(value) as FacebookSyncMarker;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

async function copyFacebookImage(sourceUrl: string, postId: string, index: number) {
  const response = await fetch(sourceUrl);
  if (!response.ok) throw new Error(`圖片下載失敗（${response.status}）`);

  const contentType = response.headers.get('content-type') || 'image/jpeg';
  if (!contentType.startsWith('image/')) throw new Error('貼文附件不是可儲存的圖片');

  const extension = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg';
  const safePostId = postId.replace(/[^a-zA-Z0-9_-]/g, '_');
  const objectPath = `facebook-cases/${safePostId}/${Date.now()}-${index}.${extension}`;
  const bytes = Buffer.from(await response.arrayBuffer());
  const supabase = getServiceClient();
  const { error } = await supabase.storage.from('images').upload(objectPath, bytes, {
    contentType,
    upsert: false,
  });
  if (error) throw new Error(`圖片儲存失敗：${error.message}`);

  return supabase.storage.from('images').getPublicUrl(objectPath).data.publicUrl;
}

async function getFacebookVideoSource(attachment: FacebookAttachment) {
  if (attachment.media?.source && /^https:\/\//.test(attachment.media.source)) return attachment.media.source;
  const videoId = attachment.target?.id;
  if (!videoId) return '';

  const params = new URLSearchParams({ fields: 'source', access_token: FACEBOOK_PAGE_ACCESS_TOKEN });
  const response = await fetch(`https://graph.facebook.com/${FACEBOOK_GRAPH_API_VERSION}/${videoId}?${params.toString()}`, { cache: 'no-store' });
  const payload = (await response.json()) as { source?: string; error?: { message?: string } };
  if (!response.ok || payload.error) throw new Error(payload.error?.message || `影片來源讀取失敗（${response.status}）`);
  return payload.source && /^https:\/\//.test(payload.source) ? payload.source : '';
}

async function copyFacebookVideo(sourceUrl: string, postId: string, index: number) {
  const response = await fetch(sourceUrl, { cache: 'no-store' });
  if (!response.ok) throw new Error(`影片下載失敗（${response.status}）`);

  const contentType = response.headers.get('content-type') || 'video/mp4';
  if (!contentType.startsWith('video/')) throw new Error('貼文附件不是可儲存的影片');

  const declaredSize = Number(response.headers.get('content-length') || 0);
  const maxVideoBytes = 100 * 1024 * 1024;
  if (declaredSize > maxVideoBytes) throw new Error('影片檔案超過 100MB，無法自動備份');

  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.byteLength > maxVideoBytes) throw new Error('影片檔案超過 100MB，無法自動備份');

  const extension = contentType.includes('webm') ? 'webm' : contentType.includes('quicktime') ? 'mov' : 'mp4';
  const safePostId = postId.replace(/[^a-zA-Z0-9_-]/g, '_');
  const objectPath = `facebook-case-videos/${safePostId}/${Date.now()}-${index}.${extension}`;
  const supabase = getServiceClient();
  const { error } = await supabase.storage.from('images').upload(objectPath, bytes, {
    contentType,
    upsert: false,
  });
  if (error) throw new Error(`影片儲存失敗：${error.message}`);

  return supabase.storage.from('images').getPublicUrl(objectPath).data.publicUrl;
}

async function copyNewFacebookVideos(attachments: FacebookAttachment[] | undefined, postId: string, knownVideoIds: string[] = []): Promise<CopiedFacebookVideos> {
  const urls: string[] = [];
  const videoIds: string[] = [];
  let failed = 0;
  const known = new Set(knownVideoIds);

  for (const [index, attachment] of collectVideoAttachments(attachments).entries()) {
    const sourceKey = attachment.target?.id || attachment.media?.source || `attachment-${index}`;
    if (known.has(sourceKey)) continue;

    try {
      const sourceUrl = await getFacebookVideoSource(attachment);
      if (!sourceUrl) throw new Error('Facebook 未提供可下載的影片來源');
      urls.push(await copyFacebookVideo(sourceUrl, postId, index));
      videoIds.push(sourceKey);
      known.add(sourceKey);
    } catch {
      failed += 1;
    }
  }

  return { urls, videoIds, failed };
}

async function readCaseMedia(caseId: string) {
  const supabase = getServiceClient();
  const { data } = await supabase
    .from('site_content')
    .select('value')
    .eq('key', `facebook_case_detail_${caseId}`)
    .maybeSingle();
  return parseCaseMedia(data?.value);
}

async function syncExistingCaseVideos(post: FacebookPost, caseId: string) {
  const existing = await readCaseMedia(caseId);
  const copied = await copyNewFacebookVideos(post.attachments?.data, post.id, cleanVideoIds(existing.facebookVideoIds));
  if (copied.urls.length || copied.videoIds.length) {
    const value: FacebookCaseMedia = {
      ...existing,
      sourceUrl: existing.sourceUrl || post.permalink_url || '',
      imageUrls: cleanUrls(existing.imageUrls),
      videoUrls: cleanUrls([...(existing.videoUrls || []), ...copied.urls]),
      facebookVideoIds: cleanVideoIds([...(existing.facebookVideoIds || []), ...copied.videoIds]),
    };
    const { error } = await getServiceClient().from('site_content').upsert({
      key: `facebook_case_detail_${caseId}`,
      value: JSON.stringify(value),
    }, { onConflict: 'key' });
    if (error) throw new Error(`影片資料儲存失敗：${error.message}`);
  }
  return copied;
}

function facebookPostUpdatedAt(post: FacebookPost) {
  const timestamp = Date.parse(post.updated_time || post.created_time || '');
  return Number.isFinite(timestamp) ? timestamp : 0;
}

export async function syncFacebookCases(limit = 20): Promise<FacebookCaseSyncResult> {
  if (!FACEBOOK_PAGE_ID || !FACEBOOK_PAGE_ACCESS_TOKEN) {
    throw new Error('尚未設定 Facebook 粉專同步環境變數');
  }

  const params = new URLSearchParams({
    fields: 'id,message,created_time,updated_time,permalink_url,attachments.limit(10){media_type,media,target,url,subattachments.limit(10){media_type,media,target,url}}',
    limit: String(Math.min(Math.max(limit, 1), 20)),
    access_token: FACEBOOK_PAGE_ACCESS_TOKEN,
  });
  const endpoint = `https://graph.facebook.com/${FACEBOOK_GRAPH_API_VERSION}/${FACEBOOK_PAGE_ID}/posts?${params.toString()}`;
  const response = await fetch(endpoint, { cache: 'no-store' });
  const payload = (await response.json()) as FacebookPostsResponse;
  if (!response.ok || payload.error) {
    throw new Error(payload.error?.message || `Facebook 貼文讀取失敗（${response.status}）`);
  }

  const supabase = getServiceClient();
  const result: FacebookCaseSyncResult = { imported: 0, skipped: 0, videosImported: 0, videosFailed: 0, failed: [] };
  const { data: productReferences } = await supabase
    .from('products')
    .select('name, category')
    .eq('visible', true);
  const products = (productReferences || []) as ProductReference[];
  const posts = [...(payload.data || [])].sort((a, b) => facebookPostUpdatedAt(b) - facebookPostUpdatedAt(a));
  const { data: earliestCase } = await supabase
    .from('cases')
    .select('sort_order')
    .order('sort_order', { ascending: true })
    .limit(1)
    .maybeSingle();
  // 新同步的貼文使用既有最前排序之前的值；既有案例的手動排序完全不變。
  let nextSortOrder = Number(earliestCase?.sort_order || 0) - posts.length - 1;

  for (const post of posts) {
    const markerKey = `facebook_case_post_${post.id}`;
    const { data: existingMarker } = await supabase
      .from('site_content')
      .select('id, value')
      .eq('key', markerKey)
      .maybeSingle();
    if (existingMarker) {
      const marker = parseFacebookSyncMarker(existingMarker.value);
      if (marker.caseId) {
        const { data: existingCase } = await supabase
          .from('cases')
          .select('id')
          .eq('id', marker.caseId)
          .maybeSingle();
        if (existingCase) {
          result.skipped += 1;
          try {
            const copiedVideos = await syncExistingCaseVideos(post, marker.caseId);
            result.videosImported += copiedVideos.urls.length;
            result.videosFailed += copiedVideos.failed;
          } catch {
            result.videosFailed += collectVideoAttachments(post.attachments?.data).length;
          }
          continue;
        }

        // 案例可能已由後臺手動刪除；保留的同步標記不能阻止同一篇 FB 貼文重新建立。
        await supabase
          .from('site_content')
          .delete()
          .in('key', [markerKey, `facebook_case_detail_${marker.caseId}`]);
      } else {
        // 無法辨識舊版或損毀的標記時，將其視為失效，讓同步可以安全重建案例。
        await supabase.from('site_content').delete().eq('key', markerKey);
      }
    }

    try {
      const imageSources = collectImageSources(post.attachments?.data);
      if (imageSources.length === 0) {
        result.skipped += 1;
        continue;
      }

      const imageUrls = (await Promise.all(
        imageSources.slice(0, 8).map((sourceUrl, index) => copyFacebookImage(sourceUrl, post.id, index)),
      )).filter(Boolean);
      if (imageUrls.length === 0) throw new Error('貼文沒有可用圖片');
      const copiedVideos = await copyNewFacebookVideos(post.attachments?.data, post.id);
      result.videosImported += copiedVideos.urls.length;
      result.videosFailed += copiedVideos.failed;

      const rawMessage = post.message || '';
      // 分類與摘要只根據清理後的案例正文，避免粉專固定服務文案影響判斷。
      const message = cleanCaseArticle(rawMessage);
      const activityNarrative = extractActivityNarrative(rawMessage);
      const usedProducts = detectUsedProducts(message, products);
      const usedServices = detectUsedServices(message, usedProducts, products);
      const applicableOccasions = detectOccasions(message);
      const classified = classifyPost(activityNarrative);
      const { data: createdCase, error: insertError } = await supabase
        .from('cases')
        .insert({
          title: createTitle(message, post.created_time),
          category: classified.category,
          service_type: usedServices[0] || classified.serviceType,
          description: message || '此案例活動內容已由 Facebook 貼文同步，詳細資訊請參閱原始貼文。',
          image_url: imageUrls[0],
          client_name: detectClientName(rawMessage) || null,
          used_services: usedServices,
          used_products: usedProducts,
          applicable_occasions: applicableOccasions,
          event_date: post.created_time?.slice(0, 10) || null,
          // Facebook 同步完成後直接顯示於前臺；既有貼文仍以標記避免重複建立。
          visible: true,
          sort_order: nextSortOrder++,
        })
        .select('id')
        .single();
      if (insertError || !createdCase) throw new Error(insertError?.message || '案例草稿建立失敗');

      await supabase.from('site_content').upsert([
        { key: markerKey, value: JSON.stringify({ caseId: createdCase.id, postId: post.id }) },
        {
          key: `facebook_case_detail_${createdCase.id}`,
          value: JSON.stringify({
            sourceUrl: post.permalink_url || '',
            imageUrls,
            videoUrls: copiedVideos.urls,
            facebookVideoIds: copiedVideos.videoIds,
          }),
        },
      ], { onConflict: 'key' });
      result.imported += 1;
    } catch (error) {
      result.failed.push({
        postId: post.id,
        reason: error instanceof Error ? error.message : '未知錯誤',
      });
    }
  }

  return result;
}
