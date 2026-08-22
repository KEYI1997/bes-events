import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { getFacebookSyncConfiguration, syncFacebookCases } from '@/lib/facebookCaseSync';

async function verifyAdmin(request: NextRequest) {
  const password = request.headers.get('x-admin-password');
  let currentPassword = process.env.ADMIN_PASSWORD || '';
  try {
    const { data } = await getServiceClient()
      .from('site_content')
      .select('value')
      .eq('key', 'admin_password')
      .maybeSingle();
    if (data?.value) currentPassword = data.value;
  } catch {
    // 環境設定尚未完成時仍使用 ADMIN_PASSWORD。
  }
  return Boolean(currentPassword) && password === currentPassword;
}

export async function GET(request: NextRequest) {
  if (!await verifyAdmin(request)) return NextResponse.json({ error: '未授權' }, { status: 401 });
  return NextResponse.json(getFacebookSyncConfiguration());
}

export async function POST(request: NextRequest) {
  if (!await verifyAdmin(request)) return NextResponse.json({ error: '未授權' }, { status: 401 });

  try {
    const result = await syncFacebookCases(20);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Facebook 同步失敗' }, { status: 500 });
  }
}
