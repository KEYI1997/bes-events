import { NextRequest, NextResponse } from 'next/server';
import { changeSharedAdminPassword } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const currentPassword = typeof body.currentPassword === 'string' ? body.currentPassword : '';
    const newPassword = typeof body.newPassword === 'string' ? body.newPassword : '';
    const result = await changeSharedAdminPassword(request, currentPassword, newPassword);
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.error === '未授權' ? 401 : 400 });
    return NextResponse.json({ success: true, message: '密碼已成功變更' });
  } catch {
    return NextResponse.json({ error: '系統錯誤' }, { status: 500 });
  }
}
