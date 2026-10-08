import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/adminAuth';
import { getServiceClient } from '@/lib/supabase';

type CaseMedia = {
  sourceUrl?: string;
  imageUrls?: string[];
  imageCaptions?: string[];
  videoUrls?: string[];
  facebookVideoIds?: string[];
};

function mediaKey(caseId: string) {
  return `facebook_case_detail_${caseId}`;
}

function cleanUrls(value: unknown): string[] {
  return Array.isArray(value)
    ? [...new Set(value.filter((url): url is string => typeof url === 'string' && /^https:\/\//.test(url)).map(url => url.trim()))]
    : [];
}

function cleanIds(value: unknown): string[] {
  return Array.isArray(value)
    ? [...new Set(value.filter((item): item is string => typeof item === 'string').map(item => item.trim()).filter(Boolean))]
    : [];
}

function cleanCaptions(value: unknown, imageCount: number): string[] {
  const captions = Array.isArray(value) ? value.map(item => typeof item === 'string' ? item.trim().slice(0, 300) : '') : [];
  return Array.from({ length: imageCount }, (_, index) => captions[index] || '');
}

async function readMedia(caseId: string): Promise<CaseMedia> {
  const supabase = getServiceClient();
  const { data: publicMedia } = await supabase
    .from('public_case_media')
    .select('source_url, image_urls, video_urls')
    .eq('case_id', caseId)
    .maybeSingle();
  const { data: captionRecord } = await supabase
    .from('public_case_media')
    .select('image_captions')
    .eq('case_id', caseId)
    .maybeSingle();
  if (publicMedia) {
    return {
      sourceUrl: publicMedia.source_url || undefined,
      imageUrls: cleanUrls(publicMedia.image_urls),
      imageCaptions: cleanCaptions(captionRecord?.image_captions, cleanUrls(publicMedia.image_urls).length),
      videoUrls: cleanUrls(publicMedia.video_urls),
    };
  }

  const { data } = await supabase
    .from('site_content')
    .select('value')
    .eq('key', mediaKey(caseId))
    .maybeSingle();

  try {
    return data?.value ? JSON.parse(data.value) as CaseMedia : {};
  } catch {
    return {};
  }
}

export async function GET(request: NextRequest) {
  if (!await verifyAdminRequest(request)) {
    return NextResponse.json({ error: '未授權' }, { status: 401 });
  }

  const caseId = request.nextUrl.searchParams.get('caseId');
  if (!caseId) return NextResponse.json({ error: '缺少案例識別碼' }, { status: 400 });

  const media = await readMedia(caseId);
  return NextResponse.json({
    data: {
      imageUrls: cleanUrls(media.imageUrls),
      imageCaptions: cleanCaptions(media.imageCaptions, cleanUrls(media.imageUrls).length),
      videoUrls: cleanUrls(media.videoUrls),
    },
  });
}

export async function PUT(request: NextRequest) {
  if (!await verifyAdminRequest(request)) {
    return NextResponse.json({ error: '未授權' }, { status: 401 });
  }

  const { caseId, imageUrls, imageCaptions, videoUrls } = await request.json() as {
    caseId?: string;
    imageUrls?: unknown;
    imageCaptions?: unknown;
    videoUrls?: unknown;
  };
  if (!caseId || typeof caseId !== 'string') {
    return NextResponse.json({ error: '缺少案例識別碼' }, { status: 400 });
  }

  const existing = await readMedia(caseId);
  const value: CaseMedia = {
    ...existing,
    imageUrls: cleanUrls(imageUrls),
    imageCaptions: cleanCaptions(imageCaptions, cleanUrls(imageUrls).length),
    videoUrls: cleanUrls(videoUrls),
  };
  const supabase = getServiceClient();
  const { error } = await supabase
    .from('site_content')
    .upsert({ key: mediaKey(caseId), value: JSON.stringify(value) }, { onConflict: 'key' });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const { error: publicError } = await supabase
    .from('public_case_media')
    .upsert({
      case_id: caseId,
      source_url: value.sourceUrl || null,
      image_urls: cleanUrls(value.imageUrls),
      image_captions: cleanCaptions(value.imageCaptions, cleanUrls(value.imageUrls).length),
      video_urls: cleanUrls(value.videoUrls),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'case_id' });
  if (publicError && publicError.code !== 'PGRST205') {
    return NextResponse.json({ error: publicError.message }, { status: 500 });
  }
  return NextResponse.json({ data: value });
}
