import { getServiceClient } from '@/lib/supabase';

type FacebookAttachment = {
  media_type?: string;
  media?: { image?: { src?: string } };
  subattachments?: { data?: FacebookAttachment[] };
};

type FacebookPost = {
  id: string;
  message?: string;
  created_time?: string;
  permalink_url?: string;
  attachments?: { data?: FacebookAttachment[] };
};

type FacebookPostsResponse = {
  data?: FacebookPost[];
  error?: { message?: string };
};

type ProductReference = { name: string; category: string };

export type FacebookCaseSyncResult = {
  imported: number;
  skipped: number;
  failed: Array<{ postId: string; reason: string }>;
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
  if (/啟動|開幕|揭幕|典禮|儀式|節慶/.test(text)) return { category: '典禮節慶', serviceType: '啟動儀式' };
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
    const src = attachment.media?.image?.src;
    if (src && /^https:\/\//.test(src)) sources.add(src);
    attachment.subattachments?.data?.forEach(visit);
  };
  attachments.forEach(visit);
  return [...sources];
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

export async function syncFacebookCases(limit = 20): Promise<FacebookCaseSyncResult> {
  if (!FACEBOOK_PAGE_ID || !FACEBOOK_PAGE_ACCESS_TOKEN) {
    throw new Error('尚未設定 Facebook 粉專同步環境變數');
  }

  const params = new URLSearchParams({
    fields: 'id,message,created_time,permalink_url,attachments.limit(10){media_type,media,subattachments.limit(10){media_type,media}}',
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
  const result: FacebookCaseSyncResult = { imported: 0, skipped: 0, failed: [] };
  const { data: productReferences } = await supabase
    .from('products')
    .select('name, category')
    .eq('visible', true);
  const products = (productReferences || []) as ProductReference[];
  const { data: newestCase } = await supabase
    .from('cases')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle();
  let nextSortOrder = Number(newestCase?.sort_order || 0) + 1;

  for (const post of payload.data || []) {
    const markerKey = `facebook_case_post_${post.id}`;
    const { data: existingMarker } = await supabase
      .from('site_content')
      .select('id')
      .eq('key', markerKey)
      .maybeSingle();
    if (existingMarker) {
      result.skipped += 1;
      continue;
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

      const rawMessage = post.message || '';
      // 分類與摘要只根據清理後的案例正文，避免粉專固定服務文案影響判斷。
      const message = cleanCaseArticle(rawMessage);
      const usedProducts = detectUsedProducts(message, products);
      const usedServices = detectUsedServices(message, usedProducts, products);
      const applicableOccasions = detectOccasions(message);
      const classified = classifyPost(message);
      const { data: createdCase, error: insertError } = await supabase
        .from('cases')
        .insert({
          title: createTitle(message, post.created_time),
          category: classified.category,
          service_type: classified.serviceType,
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
          value: JSON.stringify({ sourceUrl: post.permalink_url || '', imageUrls }),
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
