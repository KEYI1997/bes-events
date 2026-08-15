import { getServiceClient } from '@/lib/supabase';

const LINE_ACCESS_TOKEN = (process.env.LINE_CHANNEL_ACCESS_TOKEN || '').replace(/[\uFEFF\u200B]/g, '').trim();
const DEFAULT_ADMIN_PHONE = '0911247541';

type AdminLineUser = {
  phone?: string;
  lineUserId?: string;
  line_user_id?: string;
};

export type AdminLinePushResult = {
  sent: number;
  failed: number;
  status: 'completed' | 'token_missing' | 'no_verified_admin' | 'settings_error';
};

function normalizePhone(phone: string) {
  let normalized = phone.replace(/[\s\-()]/g, '');
  if (normalized.startsWith('+886')) normalized = `0${normalized.slice(4)}`;
  if (normalized.startsWith('886')) normalized = `0${normalized.slice(3)}`;
  return normalized;
}

function parseAdminPhones(value?: string | null): string[] {
  if (!value) return [DEFAULT_ADMIN_PHONE];

  let rawPhones: string[];
  try {
    const parsed = JSON.parse(value);
    rawPhones = Array.isArray(parsed) ? parsed.map(String) : [value];
  } catch {
    rawPhones = value.split(/[,;\n]/);
  }

  return [...new Set(rawPhones.map(normalizePhone).filter(phone => /^09\d{8}$/.test(phone)))];
}

function parseAdminLineUsers(value?: string | null): AdminLineUser[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function pushLineMessage(userId: string, text: string) {
  const response = await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${LINE_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({ to: userId, messages: [{ type: 'text', text }] }),
  });

  if (!response.ok) {
    console.error('LINE push error:', response.status, await response.text());
  }
  return response.ok;
}

export async function pushAdminLineNotification(text: string): Promise<AdminLinePushResult> {
  if (!LINE_ACCESS_TOKEN) return { sent: 0, failed: 0, status: 'token_missing' };

  const supabase = getServiceClient();
  const { data: settings, error } = await supabase
    .from('site_content')
    .select('key,value')
    .in('key', ['admin_line_phone', 'admin_line_users', 'admin_line_user_id']);

  if (error) {
    console.error('LINE admin settings error:', error.message);
    return { sent: 0, failed: 0, status: 'settings_error' };
  }

  const getSetting = (key: string) => settings?.find(setting => setting.key === key)?.value;
  const adminPhones = parseAdminPhones(getSetting('admin_line_phone'));
  const adminLineUsers = parseAdminLineUsers(getSetting('admin_line_users'));
  const lineUserIds = adminLineUsers
    .filter(admin => admin.phone && adminPhones.includes(normalizePhone(admin.phone)))
    .map(admin => admin.lineUserId || admin.line_user_id || '')
    .filter(Boolean);

  const legacyLineUserId = getSetting('admin_line_user_id');
  if (adminLineUsers.length === 0 && adminPhones.length > 0 && legacyLineUserId) {
    lineUserIds.push(legacyLineUserId);
  }

  const recipients = [...new Set(lineUserIds)];
  if (recipients.length === 0) return { sent: 0, failed: 0, status: 'no_verified_admin' };

  const results = await Promise.all(recipients.map(userId => pushLineMessage(userId, text)));
  const sent = results.filter(Boolean).length;
  return { sent, failed: results.length - sent, status: 'completed' };
}
