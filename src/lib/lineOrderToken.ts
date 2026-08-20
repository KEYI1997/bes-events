import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';

const TOKEN_LIFETIME_MS = 30 * 60 * 1000;

function getKey() {
  const secret = (process.env.LINE_CHANNEL_SECRET || '').trim();
  return secret ? createHash('sha256').update(secret).digest() : null;
}

export function createLineOrderToken(lineUserId: string) {
  const key = getKey();
  if (!key || !lineUserId) return null;

  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const payload = JSON.stringify({ lineUserId, expiresAt: Date.now() + TOKEN_LIFETIME_MS });
  const encrypted = Buffer.concat([cipher.update(payload, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]).toString('base64url');
}

export function parseLineOrderToken(token?: string | null) {
  const key = getKey();
  if (!key || !token) return null;

  try {
    const data = Buffer.from(token, 'base64url');
    if (data.length <= 28) return null;
    const iv = data.subarray(0, 12);
    const authTag = data.subarray(12, 28);
    const encrypted = data.subarray(28);
    const decipher = createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    const payload = JSON.parse(Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8'));
    if (!payload.lineUserId || Number(payload.expiresAt) < Date.now()) return null;
    return String(payload.lineUserId);
  } catch {
    return null;
  }
}
