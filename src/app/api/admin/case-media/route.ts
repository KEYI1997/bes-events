import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/adminAuth';
import { getServiceClient } from '@/lib/supabase';

type CaseMedia = {
  sourceUrl?: string;
  imageUrls?: string[];
  videoUrls?: string[];
};

function mediaKey(caseId: string) {
  return `facebook_case_detail_${caseId}`;
}

function cleanUrls(value: unknown): string[] {
  return Array.isArray(value)
    ? [...new Set(value.filter((url): url is string => typeof url === 'string' && /^https:\/\//.test(url)).map(url => url.trim()))]
    : [];
}

async function readMedia(caseId: string): Promise<CaseMedia> {
  const supabase = getServiceClient();
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
      videoUrls: cleanUrls(media.videoUrls),
    },
  });
}

export async function PUT(request: NextRequest) {
  if (!await verifyAdminRequest(request)) {
    return NextResponse.json({ error: '未授權' }, { status: 401 });
  }

  const { caseId, imageUrls, videoUrls } = await request.json() as {
    caseId?: string;
    imageUrls?: unknown;
    videoUrls?: unknown;
  };
  if (!caseId || typeof caseId !== 'string') {
    return NextResponse.json({ error: '缺少案例識別碼' }, { status: 400 });
  }

  const existing = await readMedia(caseId);
  const value: CaseMedia = {
    ...existing,
    imageUrls: cleanUrls(imageUrls),
    videoUrls: cleanUrls(videoUrls),
  };
  const supabase = getServiceClient();
  const { error } = await supabase
    .from('site_content')
    .upsert({ key: mediaKey(caseId), value: JSON.stringify(value) }, { onConflict: 'key' });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: value });
}
