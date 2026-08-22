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
  const firstLine = message
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean);

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

      const message = post.message?.trim() || '';
      const classified = classifyPost(message);
      const { data: createdCase, error: insertError } = await supabase
        .from('cases')
        .insert({
          title: createTitle(message, post.created_time),
          category: classified.category,
          service_type: classified.serviceType,
          description: message || '此案例內容請參閱原始 Facebook 貼文。',
          image_url: imageUrls[0],
          event_date: post.created_time?.slice(0, 10) || null,
          visible: false,
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
