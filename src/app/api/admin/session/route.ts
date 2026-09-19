import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, ADMIN_SESSION_COOKIE_OPTIONS, verifyAdminRequest } from '@/lib/adminAuth';

export async function GET(request: NextRequest) {
  if (!await verifyAdminRequest(request)) return NextResponse.json({ authenticated: false }, { status: 401 });
  return NextResponse.json({ authenticated: true });
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, '', { ...ADMIN_SESSION_COOKIE_OPTIONS, maxAge: 0 });
  return response;
}
