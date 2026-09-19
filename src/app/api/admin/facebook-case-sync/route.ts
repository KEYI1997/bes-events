import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { verifyAdminRequest } from '@/lib/adminAuth';
import { getFacebookSyncConfiguration, syncFacebookCases } from '@/lib/facebookCaseSync';

export async function GET(request: NextRequest) {
  if (!await verifyAdminRequest(request)) return NextResponse.json({ error: '未授權' }, { status: 401 });
  return NextResponse.json(getFacebookSyncConfiguration());
}

export async function POST(request: NextRequest) {
  if (!await verifyAdminRequest(request)) return NextResponse.json({ error: '未授權' }, { status: 401 });

  try {
    const result = await syncFacebookCases(20);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Facebook 同步失敗' }, { status: 500 });
  }
}
