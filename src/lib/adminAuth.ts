import { createHmac, timingSafeEqual } from 'crypto';
import { getServiceClient } from '@/lib/supabase';

const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_LOCK_MS = 15 * 60 * 1000;
const MAX_FAILED_ATTEMPTS = 5;
const SESSION_MAX_AGE_SECONDS = 12 * 60 * 60;

export const ADMIN_SESSION_COOKIE = 'bes_admin_session';
export const ADMIN_SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'strict' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: SESSION_MAX_AGE_SECONDS,
};

type LoginAttempt = { failedAttempts: number; windowStartedAt: number; lockedUntil: number; lastSeenAt: number };
export type AdminSession = { userId: string; email: string; expiresAt: number };
export type AdminRequestVerification = { ok: true; session: AdminSession } | { ok: false; retryAfterSeconds?: number };
export type AdminLoginResult = { ok: true; session: AdminSession } | { ok: false; error: string; retryAfterSeconds?: number };

const globalLoginAttempts = globalThis as typeof globalThis & { __besAdminLoginAttempts?: Map<string, LoginAttempt> };
const loginAttempts = globalLoginAttempts.__besAdminLoginAttempts ??= new Map<string, LoginAttempt>();

function getClientKey(request: Request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip')?.trim() || 'unknown';
}
function pruneLoginAttempts(now: number) {
  for (const [key, attempt] of loginAttempts) if (attempt.lastSeenAt < now - LOGIN_WINDOW_MS - LOGIN_LOCK_MS) loginAttempts.delete(key);
}
function getSharedAdminEmail() { return (process.env.ADMIN_AUTH_EMAIL || '').trim().toLowerCase(); }
function getSessionSecret() { return (process.env.ADMIN_SESSION_SECRET || '').trim(); }
function safelyMatches(left: string, right: string) {
  const a = Buffer.from(left); const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}
function recordFailedAttempt(request: Request, now: number) {
  const key = getClientKey(request); const prior = loginAttempts.get(key);
  const attempt = !prior || now - prior.windowStartedAt > LOGIN_WINDOW_MS ? { failedAttempts: 0, windowStartedAt: now, lockedUntil: 0, lastSeenAt: now } : prior;
  attempt.failedAttempts += 1; attempt.lastSeenAt = now;
  if (attempt.failedAttempts >= MAX_FAILED_ATTEMPTS) attempt.lockedUntil = now + LOGIN_LOCK_MS;
  loginAttempts.set(key, attempt);
  return attempt.lockedUntil > now ? Math.ceil((attempt.lockedUntil - now) / 1000) : undefined;
}

async function getLegacyAdminPassword() {
  try {
    const { data } = await getServiceClient().from('site_content').select('value').eq('key', 'admin_password').single();
    if (data?.value) return data.value;
  } catch { /* first migration can use server-only fallback */ }
  return process.env.ADMIN_PASSWORD || '';
}
async function findSharedAdminUser() {
  const email = getSharedAdminEmail();
  if (!email) return null;
  const { data, error } = await getServiceClient().auth.admin.listUsers({ page: 1, perPage: 100 });
  if (error) throw error;
  return data.users.find(user => user.email?.toLowerCase() === email) || null;
}
function createSession(userId: string, email: string): AdminSession {
  return { userId, email, expiresAt: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS };
}
export function createAdminSessionCookie(session: AdminSession) {
  const secret = getSessionSecret(); if (!secret) throw new Error('ADMIN_SESSION_SECRET is not set');
  const payload = Buffer.from(JSON.stringify(session)).toString('base64url');
  return `${payload}.${createHmac('sha256', secret).update(payload).digest('base64url')}`;
}
function readAdminSession(request: Request): AdminSession | null {
  const secret = getSessionSecret();
  const cookie = (request.headers.get('cookie') || '').split(';').map(value => value.trim()).find(value => value.startsWith(`${ADMIN_SESSION_COOKIE}=`))?.slice(ADMIN_SESSION_COOKIE.length + 1);
  if (!secret || !cookie) return null;
  const [payload, signature] = cookie.split('.'); if (!payload || !signature) return null;
  const expected = createHmac('sha256', secret).update(payload).digest('base64url');
  if (!safelyMatches(signature, expected)) return null;
  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as AdminSession;
    return session.userId && session.email && Number.isSafeInteger(session.expiresAt) && session.expiresAt > Math.floor(Date.now() / 1000) ? session : null;
  } catch { return null; }
}
export async function verifyAdminRequest(request: Request) { return Boolean(readAdminSession(request)); }
export async function getAuthenticatedAdmin(request: Request) { return readAdminSession(request); }

export async function authenticateSharedAdmin(request: Request, password: string): Promise<AdminLoginResult> {
  const now = Date.now(); pruneLoginAttempts(now);
  const currentAttempt = loginAttempts.get(getClientKey(request));
  if (currentAttempt && currentAttempt.lockedUntil > now) return { ok: false, error: '嘗試次數過多，請稍後再試。', retryAfterSeconds: Math.ceil((currentAttempt.lockedUntil - now) / 1000) };
  const email = getSharedAdminEmail();
  if (!email || !getSessionSecret()) return { ok: false, error: '後台登入設定尚未完成。' };
  if (!password) return { ok: false, error: '請輸入管理密碼。' };
  try {
    const supabase = getServiceClient(); const user = await findSharedAdminUser();
    if (user) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data.user || data.user.id !== user.id) {
        const retryAfterSeconds = recordFailedAttempt(request, now);
        return { ok: false, error: retryAfterSeconds ? '嘗試次數過多，請稍後再試。' : '密碼錯誤', retryAfterSeconds };
      }
      loginAttempts.delete(getClientKey(request));
      return { ok: true, session: createSession(data.user.id, email) };
    }
    const legacy = await getLegacyAdminPassword();
    if (!legacy || !safelyMatches(password, legacy)) {
      const retryAfterSeconds = recordFailedAttempt(request, now);
      return { ok: false, error: retryAfterSeconds ? '嘗試次數過多，請稍後再試。' : '密碼錯誤', retryAfterSeconds };
    }
    const { data, error } = await supabase.auth.admin.createUser({ email, password, email_confirm: true });
    if (error || !data.user) return { ok: false, error: '無法完成安全登入設定，請稍後再試。' };
    await supabase.from('site_content').delete().eq('key', 'admin_password');
    loginAttempts.delete(getClientKey(request));
    return { ok: true, session: createSession(data.user.id, email) };
  } catch { return { ok: false, error: '暫時無法驗證登入，請稍後再試。' }; }
}
export async function changeSharedAdminPassword(request: Request, currentPassword: string, newPassword: string) {
  const session = readAdminSession(request); const email = getSharedAdminEmail();
  if (!session || !email || session.email !== email) return { ok: false, error: '未授權' } as const;
  if (newPassword.length < 12) return { ok: false, error: '新密碼至少需要 12 個字元' } as const;
  const supabase = getServiceClient(); const { data, error } = await supabase.auth.signInWithPassword({ email, password: currentPassword });
  if (error || !data.user || data.user.id !== session.userId) return { ok: false, error: '目前密碼不正確' } as const;
  const { error: updateError } = await supabase.auth.admin.updateUserById(session.userId, { password: newPassword });
  return updateError ? { ok: false, error: '密碼更新失敗' } as const : { ok: true } as const;
}
