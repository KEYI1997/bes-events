import { getServiceClient } from '@/lib/supabase';

const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_LOCK_MS = 15 * 60 * 1000;
const MAX_FAILED_ATTEMPTS = 5;

type LoginAttempt = {
  failedAttempts: number;
  windowStartedAt: number;
  lockedUntil: number;
  lastSeenAt: number;
};

const globalLoginAttempts = globalThis as typeof globalThis & {
  __besAdminLoginAttempts?: Map<string, LoginAttempt>;
};
const loginAttempts = globalLoginAttempts.__besAdminLoginAttempts ??= new Map<string, LoginAttempt>();

function getClientKey(request: Request) {
  const forwardedFor = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const realIp = request.headers.get('x-real-ip')?.trim();
  return forwardedFor || realIp || 'unknown';
}

function pruneLoginAttempts(now: number) {
  for (const [key, attempt] of loginAttempts) {
    if (attempt.lastSeenAt < now - LOGIN_WINDOW_MS - LOGIN_LOCK_MS) loginAttempts.delete(key);
  }
}

export type AdminRequestVerification =
  | { ok: true }
  | { ok: false; retryAfterSeconds?: number };

export async function getCurrentAdminPassword() {
  try {
    const supabase = getServiceClient();
    const { data } = await supabase
      .from('site_content')
      .select('value')
      .eq('key', 'admin_password')
      .single();

    if (data?.value) return data.value;
  } catch {
    // 資料庫暫時無法連線時，仍可使用部署環境設定的預設備援密碼。
  }

  return process.env.ADMIN_PASSWORD || '';
}

export async function verifyAdminPassword(password: string | null) {
  return Boolean(password) && password === await getCurrentAdminPassword();
}

export async function verifyAdminRequest(request: Request) {
  return (await verifyAdminRequestWithRateLimit(request)).ok;
}

export async function verifyAdminRequestWithRateLimit(request: Request): Promise<AdminRequestVerification> {
  const now = Date.now();
  pruneLoginAttempts(now);
  const clientKey = getClientKey(request);
  const attempt = loginAttempts.get(clientKey);

  if (attempt && attempt.lockedUntil > now) {
    attempt.lastSeenAt = now;
    return { ok: false, retryAfterSeconds: Math.ceil((attempt.lockedUntil - now) / 1000) };
  }

  const verified = await verifyAdminPassword(request.headers.get('x-admin-password'));
  if (verified) {
    loginAttempts.delete(clientKey);
    return { ok: true };
  }

  const activeAttempt = !attempt || now - attempt.windowStartedAt > LOGIN_WINDOW_MS
    ? { failedAttempts: 0, windowStartedAt: now, lockedUntil: 0, lastSeenAt: now }
    : attempt;
  activeAttempt.failedAttempts += 1;
  activeAttempt.lastSeenAt = now;
  if (activeAttempt.failedAttempts >= MAX_FAILED_ATTEMPTS) {
    activeAttempt.lockedUntil = now + LOGIN_LOCK_MS;
  }
  loginAttempts.set(clientKey, activeAttempt);

  return activeAttempt.lockedUntil > now
    ? { ok: false, retryAfterSeconds: Math.ceil((activeAttempt.lockedUntil - now) / 1000) }
    : { ok: false };
}
