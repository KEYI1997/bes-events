import { NextRequest, NextResponse } from 'next/server';
import { syncFacebookCases } from '@/lib/facebookCaseSync';

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authorization = request.headers.get('authorization');
  if (!cronSecret || authorization !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: '未授權' }, { status: 401 });
  }

  try {
    const result = await syncFacebookCases(20);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Facebook 同步失敗' }, { status: 500 });
  }
}
