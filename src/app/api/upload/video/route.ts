import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/adminAuth';
import { getServiceClient } from '@/lib/supabase';

function safeExtension(fileName: string) {
  const extension = fileName.split('.').pop()?.toLowerCase();
  return extension && /^[a-z0-9]{1,8}$/.test(extension) ? extension : 'mp4';
}

export async function POST(request: NextRequest) {
  if (!await verifyAdminRequest(request)) {
    return NextResponse.json({ error: '未授權' }, { status: 401 });
  }

  const { fileName, contentType } = await request.json() as { fileName?: string; contentType?: string };
  if (!fileName || !contentType?.startsWith('video/')) {
    return NextResponse.json({ error: '請選擇有效的影片檔案' }, { status: 400 });
  }

  const objectPath = `case-videos/${Date.now()}-${Math.random().toString(36).slice(2)}.${safeExtension(fileName)}`;
  const supabase = getServiceClient();
  const { data, error } = await supabase.storage.from('images').createSignedUploadUrl(objectPath);
  if (error || !data) return NextResponse.json({ error: error?.message || '無法準備影片上傳' }, { status: 500 });

  const { data: urlData } = supabase.storage.from('images').getPublicUrl(objectPath);
  return NextResponse.json({ path: data.path, token: data.token, url: urlData.publicUrl });
}
