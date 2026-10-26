const STORAGE_KEY = 'bes_lead_source_v1';
const MAX_AGE = 30 * 24 * 60 * 60 * 1000;
const PARAMS = ['gclid', 'gbraid', 'wbraid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;

type LeadSource = { landing_url: string; referrer: string; captured_at: string; params: Record<string, string> };
let memorySource: LeadSource | undefined;

function text(value: unknown, limit = 300): string {
  return typeof value === 'string' ? value.replace(/[\u0000-\u001f\u007f]/g, '').slice(0, limit) : '';
}

function safeUrl(value: unknown, officialOnly = false): string {
  try {
    const url = new URL(text(value, 3000));
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) return '';
    if (officialOnly && !['besevent.com', 'www.besevent.com', 'localhost', '127.0.0.1'].includes(url.hostname)) return '';
    return (url.origin + url.pathname).slice(0, 1000);
  } catch { return ''; }
}

function normalize(value: unknown): LeadSource | undefined {
  if (!value || typeof value !== 'object') return;
  const item = value as Partial<LeadSource>;
  const landing_url = safeUrl(item.landing_url, true);
  const timestamp = Date.parse(text(item.captured_at));
  if (!landing_url || !Number.isFinite(timestamp) || Date.now() - timestamp > MAX_AGE || timestamp > Date.now() + 60000) return;
  const params: Record<string, string> = {};
  for (const key of PARAMS) {
    const val = text(item.params?.[key], key.includes('clid') || key.endsWith('braid') ? 1000 : 300);
    if (val) params[key] = val;
  }
  return { landing_url, referrer: safeUrl(item.referrer), captured_at: new Date(timestamp).toISOString(), params };
}

/** Keep the most recent campaign entry across navigation, without storing unrelated URL parameters. */
export function captureLeadAttribution(): LeadSource | undefined {
  if (typeof window === 'undefined') return;
  const current = new URL(window.location.href);
  const params: Record<string, string> = {};
  for (const key of PARAMS) {
    const val = text(current.searchParams.get(key), key.includes('clid') || key.endsWith('braid') ? 1000 : 300);
    if (val) params[key] = val;
  }
  let stored = normalize(memorySource);
  try { stored = normalize(JSON.parse(window.localStorage.getItem(STORAGE_KEY) || 'null')) || stored; } catch { /* Storage may be unavailable. */ }
  const hasNewCampaign = Object.keys(params).length > 0 && JSON.stringify(params) !== JSON.stringify(stored?.params);
  const source = !stored || hasNewCampaign
    ? normalize({ landing_url: current.href, referrer: document.referrer, captured_at: new Date().toISOString(), params })
    : stored;
  memorySource = source;
  if (source) { try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(source)); } catch { /* Memory still preserves this page visit. */ } }
  return source;
}

export function getLeadAttribution() {
  if (typeof window === 'undefined') return undefined;
  return { ...captureLeadAttribution(), form_url: safeUrl(window.location.href, true) };
}

/** Persist in the existing private enquiry notes, so no database migration is required. */
export function formatLeadAttribution(value: unknown): string {
  const source = normalize(value);
  if (!source) return '';
  const formUrl = safeUrl((value as { form_url?: unknown }).form_url, true);
  return [
    '【來源追蹤紀錄（來源參數未經廣告平台驗證）】',
    `進站時間：${source.captured_at}`,
    `進站頁面：${source.landing_url}`,
    formUrl ? `提交頁面：${formUrl}` : '',
    source.referrer ? `參照頁面：${source.referrer}` : '參照頁面：未提供（不代表一定為直接流量）',
    ...Object.entries(source.params).map(([key, val]) => `${key}：${val}`),
  ].filter(Boolean).join('\n');
}
