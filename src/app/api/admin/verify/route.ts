import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequestWithRateLimit } from '@/lib/adminAuth';

export async function POST(request: NextRequest) {
  const verification = await verifyAdminRequestWithRateLimit(request);
  if (!verification.ok) {
    if (verification.retryAfterSeconds) return NextResponse.json({ error: '嘗試次數過多，請稍後再試。' }, { status: 429, headers: { 'Retry-After': String(verification.retryAfterSeconds) } });
    return NextResponse.json({ error: '密碼錯誤' }, { status: 401 });
  }

  return NextResponse.json({ success: true });
}
