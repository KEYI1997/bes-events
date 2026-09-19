import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, ADMIN_SESSION_COOKIE_OPTIONS, authenticateSharedAdmin, createAdminSessionCookie } from '@/lib/adminAuth';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const password = typeof body.password === 'string' ? body.password : '';
  const result = await authenticateSharedAdmin(request, password);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.retryAfterSeconds ? 429 : 401, headers: result.retryAfterSeconds ? { 'Retry-After': String(result.retryAfterSeconds) } : {} },
    );
  }
  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, createAdminSessionCookie(result.session), ADMIN_SESSION_COOKIE_OPTIONS);
  return response;
}
