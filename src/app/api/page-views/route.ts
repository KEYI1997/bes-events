import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const path = typeof body.path === 'string' ? body.path.trim() : '';
    const sessionId = typeof body.sessionId === 'string' ? body.sessionId.trim() : '';
    if (!path.startsWith('/') || path.length > 512 || !sessionId || sessionId.length > 100) {
      return NextResponse.json({ error: '無效的瀏覽資料' }, { status: 400 });
    }
    const userAgent = (request.headers.get('user-agent') || '').slice(0, 512);
    const { error } = await getServiceClient().from('page_views').insert({
      path,
      session_id: sessionId,
      user_agent: userAgent || null,
    });
    if (error) {
      console.error('page view insert error:', error.message);
      return NextResponse.json({ error: '瀏覽紀錄暫時無法寫入' }, { status: 503 });
    }
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: '無效的瀏覽資料' }, { status: 400 });
  }
}
