import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdminRequest } from '@/lib/adminAuth';
import { getServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const PRODUCT_CATEGORY_MIGRATION = `
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_check;
ALTER TABLE products
  ADD CONSTRAINT products_category_check
  CHECK (category IN ('AI互動道具', '專案企劃', '啟動儀式', '活動特效', '燈光音響舞台', '外派調酒', 'Show Girl'));
`;

const PAGE_VIEW_MIGRATION = `
CREATE TABLE IF NOT EXISTS page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path text NOT NULL CHECK (char_length(path) <= 512),
  session_id text NOT NULL CHECK (char_length(session_id) <= 100),
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS page_views_created_at_idx ON page_views (created_at DESC);
CREATE INDEX IF NOT EXISTS page_views_path_created_at_idx ON page_views (path, created_at DESC);
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
CREATE OR REPLACE FUNCTION page_view_daily_counts(days integer DEFAULT 30)
RETURNS TABLE(day date, views bigint) LANGUAGE sql STABLE AS $$
  SELECT created_at::date, COUNT(*)::bigint FROM page_views
  WHERE created_at >= (CURRENT_DATE - GREATEST(days, 1)) GROUP BY created_at::date ORDER BY created_at::date ASC;
$$;
CREATE OR REPLACE FUNCTION page_view_monthly_counts(months integer DEFAULT 12)
RETURNS TABLE(month text, views bigint) LANGUAGE sql STABLE AS $$
  SELECT to_char(date_trunc('month', created_at), 'YYYY-MM'), COUNT(*)::bigint FROM page_views
  WHERE created_at >= (date_trunc('month', CURRENT_DATE) - ((GREATEST(months, 1) - 1) * INTERVAL '1 month'))
  GROUP BY date_trunc('month', created_at) ORDER BY date_trunc('month', created_at) ASC;
$$;
`;
const CASE_ACTIVITY_DATE_MIGRATION = `
ALTER TABLE cases ADD COLUMN IF NOT EXISTS activity_date DATE;
COMMENT ON COLUMN cases.activity_date IS 'Actual event date entered manually by admins.';
`;

const PUBLIC_CASE_MEDIA_MIGRATION = `
CREATE TABLE IF NOT EXISTS public_case_media (
  case_id uuid PRIMARY KEY REFERENCES cases(id) ON DELETE CASCADE,
  source_url text,
  image_urls text[] NOT NULL DEFAULT '{}',
  video_urls text[] NOT NULL DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public_case_media DROP COLUMN IF EXISTS facebook_video_ids;
CREATE INDEX IF NOT EXISTS public_case_media_updated_at_idx ON public_case_media (updated_at DESC);
ALTER TABLE public_case_media ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read visible case media" ON public_case_media;
CREATE POLICY "Public read visible case media" ON public_case_media FOR SELECT USING (EXISTS (
  SELECT 1 FROM cases WHERE cases.id = public_case_media.case_id AND cases.visible = true
));
`;

const CASE_CONTENT_COMPLETE_MIGRATION = `
ALTER TABLE cases
  ADD COLUMN IF NOT EXISTS venue_area TEXT,
  ADD COLUMN IF NOT EXISTS venue_type TEXT,
  ADD COLUMN IF NOT EXISTS guest_count TEXT,
  ADD COLUMN IF NOT EXISTS project_goal TEXT,
  ADD COLUMN IF NOT EXISTS project_challenge TEXT,
  ADD COLUMN IF NOT EXISTS solution TEXT,
  ADD COLUMN IF NOT EXISTS outcome TEXT;
ALTER TABLE public_case_media
  ADD COLUMN IF NOT EXISTS image_captions TEXT[] NOT NULL DEFAULT '{}';
`;

const PUBLIC_SITE_CONTENT_KEYS = ['hero_title', 'hero_subtitle', 'company_phone', 'company_email', 'company_line'] as const;

const PUBLIC_SITE_CONTENT_MIGRATION = `
CREATE TABLE IF NOT EXISTS public_site_content (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public_site_content ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read allowed site content" ON public_site_content;
CREATE POLICY "Public read allowed site content" ON public_site_content FOR SELECT USING (true);
`;

const LOCK_SITE_CONTENT_PUBLIC_READ = `
DROP POLICY IF EXISTS "Public read site_content" ON site_content;
`;

const BARTENDING_PLAN_DATA = [
  ['A', 50, '15 人以內', 'NT$13,500', 'NT$13,000', 'NT$260／杯'],
  ['B', 80, '30 人以內', 'NT$21,000', 'NT$20,000', 'NT$250／杯'],
  ['C', 100, '45 人以內', 'NT$26,000', 'NT$24,000', 'NT$240／杯'],
  ['D', 150, '65 人以內', 'NT$38,500', 'NT$35,000', 'NT$230／杯'],
  ['E', 200, '80 人以內', 'NT$51,000', 'NT$46,000', 'NT$220／杯'],
  ['F', 300, '150 人以內', 'NT$76,000', 'NT$67,000', 'NT$200／杯'],
  ['G', 400, '200 人以內', 'NT$101,000', 'NT$88,000', 'NT$190／杯'],
] as const;

const BARTENDING_NOTICES = [
  '未滿十八歲禁止飲酒，酒後不開車',
  '臺北市、新北市免車馬費；其他地區依距離另計往返車馬費',
  '延長服務每小時 NT$2,000',
  '指定酒款或升級酒款另行報價',
  '現場追加杯數依各方案標示估價',
  '活動規模較大時，額外人力另行報價',
  '最終報價依活動日期、地點、時數與需求確認為準',
];

const BARTENDING_SERVICES = [
  '專業調酒師現場服務與客製酒單設計',
  '行動吧台設備與基本器材',
  '精選酒款、調酒材料與耗材',
  '活動場地與流程配置建議',
];

function bartendingProducts() {
  return BARTENDING_PLAN_DATA.map(([code, cups, people, original, sale, extra], index) => ({
    name: `PLAN ${code}｜${cups} 杯方案`,
    slug: `bartending-plan-${code.toLowerCase()}-${cups}`,
    category: '外派調酒',
    description: [
      '【服務內容】',
      `方案杯數：${cups} 杯`,
      `建議人數：${people}`,
      `原價：${original}`,
      `優惠價：${sale}`,
      `現場加點估價：${extra}`,
      ...BARTENDING_SERVICES,
      '',
      '【注意事項】',
      ...BARTENDING_NOTICES,
    ].join('\n'),
    image_url: '/images/services/bartending-plans-2026.jpg',
    price_note: `優惠價：${sale}\n現場加點：${extra}`,
    visible: true,
    sort_order: index + 1,
    stock: 1,
  }));
}

async function runSql(sql: string) {
  return fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/run_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
    },
    body: JSON.stringify({ sql }),
  });
}

function cleanStrings(value: unknown): string[] {
  return Array.isArray(value)
    ? [...new Set(value.filter((item): item is string => typeof item === 'string').map(item => item.trim()).filter(Boolean))]
    : [];
}

function cleanMediaUrls(value: unknown): string[] {
  return cleanStrings(value).filter(url => /^https:\/\//.test(url));
}

function normalisePublicMedia(value: Record<string, unknown>) {
  return {
    sourceUrl: typeof value.sourceUrl === 'string' ? value.sourceUrl : null,
    imageUrls: cleanMediaUrls(value.imageUrls),
    videoUrls: cleanMediaUrls(value.videoUrls),
  };
}

type MigrationSupabaseClient = ReturnType<typeof getServiceClient>;

async function backfillPublicCaseMedia(supabase: MigrationSupabaseClient) {
  const [{ data: sourceRows, error: sourceError }, { data: caseRows, error: caseError }] = await Promise.all([
    supabase.from('site_content').select('key,value').like('key', 'facebook_case_detail_%'),
    supabase.from('cases').select('id'),
  ]);
  if (sourceError) throw new Error(`讀取案例媒體來源失敗：${sourceError.message}`);
  if (caseError) throw new Error(`讀取案例清單失敗：${caseError.message}`);

  const caseIds = new Set((caseRows || []).map(row => row.id));
  const rows: Array<{
    case_id: string;
    source_url: string | null;
    image_urls: string[];
    video_urls: string[];
    updated_at: string;
  }> = [];

  for (const row of sourceRows || []) {
    const caseId = row.key.replace(/^facebook_case_detail_/, '');
    if (!caseIds.has(caseId)) continue;
    try {
      const parsed = JSON.parse(row.value || '{}') as Record<string, unknown>;
      rows.push({
        case_id: caseId,
        source_url: typeof parsed.sourceUrl === 'string' ? parsed.sourceUrl : null,
        image_urls: cleanMediaUrls(parsed.imageUrls),
        video_urls: cleanMediaUrls(parsed.videoUrls),
        updated_at: new Date().toISOString(),
      });
    } catch {
      // 損毀的舊資料保留在原表，不讓單筆錯誤中斷整體備份；由後臺人工處理。
    }
  }

  if (rows.length > 0) {
    const { error } = await supabase.from('public_case_media').upsert(rows, { onConflict: 'case_id' });
    if (error) throw new Error(`案例媒體回填失敗：${error.message}`);
  }
  return { sourceCount: (sourceRows || []).length, copiedCount: rows.length };
}

async function backfillPublicSiteContent(supabase: MigrationSupabaseClient) {
  const { data, error } = await supabase
    .from('site_content')
    .select('key,value')
    .in('key', [...PUBLIC_SITE_CONTENT_KEYS]);
  if (error) throw new Error(`讀取公開網站設定失敗：${error.message}`);
  const rows = (data || []).map(row => ({ key: row.key, value: row.value, updated_at: new Date().toISOString() }));
  if (rows.length > 0) {
    const { error: upsertError } = await supabase.from('public_site_content').upsert(rows, { onConflict: 'key' });
    if (upsertError) throw new Error(`公開網站設定回填失敗：${upsertError.message}`);
  }
  return { sourceCount: rows.length, copiedCount: rows.length };
}

async function lockSiteContentPublicRead(supabase: MigrationSupabaseClient) {
  const [{ data: sourceRows, error: sourceError }, { data: caseRows, error: caseError }, { data: copiedRows, error: copiedError }, { data: sourceSettings, error: settingsError }, { data: copiedSettings, error: copiedSettingsError }] = await Promise.all([
    supabase.from('site_content').select('key,value').like('key', 'facebook_case_detail_%'),
    supabase.from('cases').select('id'),
    supabase.from('public_case_media').select('case_id,source_url,image_urls,video_urls'),
    supabase.from('site_content').select('key,value').in('key', [...PUBLIC_SITE_CONTENT_KEYS]),
    supabase.from('public_site_content').select('key,value'),
  ]);
  if (sourceError) throw new Error(`檢查舊案例媒體失敗：${sourceError.message}`);
  if (caseError) throw new Error(`檢查案例清單失敗：${caseError.message}`);
  if (copiedError) throw new Error(`檢查新案例媒體失敗：${copiedError.message}`);
  if (settingsError) throw new Error(`檢查公開網站設定失敗：${settingsError.message}`);
  if (copiedSettingsError) throw new Error(`檢查新公開網站設定失敗：${copiedSettingsError.message}`);

  const caseIds = new Set((caseRows || []).map(row => row.id));
  const expectedMedia = new Map<string, ReturnType<typeof normalisePublicMedia>>();
  for (const row of sourceRows || []) {
    const caseId = row.key.replace(/^facebook_case_detail_/, '');
    if (!caseIds.has(caseId)) throw new Error(`案例媒體來源包含不存在的案例：${caseId}`);
    let parsed: Record<string, unknown>;
    try { parsed = JSON.parse(row.value || '{}') as Record<string, unknown>; }
    catch { throw new Error(`案例媒體資料格式錯誤，尚未鎖定 site_content：${row.key}`); }
    expectedMedia.set(caseId, normalisePublicMedia(parsed));
  }
  const actualMedia = new Map((copiedRows || []).map(row => [row.case_id, {
    sourceUrl: row.source_url || null,
    imageUrls: cleanMediaUrls(row.image_urls),
    videoUrls: cleanMediaUrls(row.video_urls),
  }]));
  if (expectedMedia.size !== actualMedia.size) {
    throw new Error(`尚未允許鎖定 site_content：案例媒體投影筆數不一致（來源 ${expectedMedia.size}，公開 ${actualMedia.size}）。`);
  }
  for (const [caseId, expected] of expectedMedia) {
    if (JSON.stringify(expected) !== JSON.stringify(actualMedia.get(caseId))) {
      throw new Error(`尚未允許鎖定 site_content：案例 ${caseId} 媒體內容尚未一致。`);
    }
  }

  const expectedSettings = new Map((sourceSettings || []).map(row => [row.key, row.value]));
  const actualSettings = new Map((copiedSettings || []).map(row => [row.key, row.value]));
  if (expectedSettings.size !== actualSettings.size) {
    throw new Error(`尚未允許鎖定 site_content：公開網站設定筆數不一致（來源 ${expectedSettings.size}，公開 ${actualSettings.size}）。`);
  }
  for (const [key, value] of expectedSettings) {
    if (actualSettings.get(key) !== value) throw new Error(`尚未允許鎖定 site_content：公開設定 ${key} 尚未一致。`);
  }
  const result = await runSql(LOCK_SITE_CONTENT_PUBLIC_READ);
  if (!result.ok) throw new Error(`移除 site_content 公開讀取政策失敗：${await result.text()}`);
  return { sourceCount: expectedMedia.size, copiedCount: actualMedia.size, publicSettingCount: expectedSettings.size };
}

export async function GET(request: NextRequest) {
  if (!await verifyAdminRequest(request)) {
    return NextResponse.json({ error: '未授權' }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const siteContentPhase = request.nextUrl.searchParams.get('siteContentPhase');
  if (siteContentPhase === 'prepare') {
    const result = await runSql(`${PUBLIC_CASE_MEDIA_MIGRATION}${PUBLIC_SITE_CONTENT_MIGRATION}`);
    if (!result.ok) {
      return NextResponse.json({ status: 'need_manual', error: await result.text() }, { status: 500 });
    }
    try {
      const backfill = await backfillPublicCaseMedia(supabase);
      const publicSettings = await backfillPublicSiteContent(supabase);
      return NextResponse.json({ status: 'success', phase: 'prepare', ...backfill, publicSettings, oldSiteContentPreserved: true });
    } catch (error) {
      return NextResponse.json({ status: 'need_manual', error: error instanceof Error ? error.message : '案例媒體回填失敗' }, { status: 500 });
    }
  }

  if (siteContentPhase === 'lock') {
    try {
      const locked = await lockSiteContentPublicRead(supabase);
      return NextResponse.json({ status: 'success', phase: 'lock', ...locked, oldSiteContentPreserved: true });
    } catch (error) {
      return NextResponse.json({ status: 'need_manual', error: error instanceof Error ? error.message : 'site_content 鎖定失敗' }, { status: 500 });
    }
  }

  // 舊版環境可能缺少 ai_file_url；與產品分類限制一起做成可重複執行的固定遷移。
  const { error } = await supabase.from('products').select('ai_file_url').limit(1);
  const sql = `${error?.code === '42703' ? 'ALTER TABLE products ADD COLUMN IF NOT EXISTS ai_file_url text;\n' : ''}${PRODUCT_CATEGORY_MIGRATION}${CASE_ACTIVITY_DATE_MIGRATION}${PUBLIC_CASE_MEDIA_MIGRATION}${CASE_CONTENT_COMPLETE_MIGRATION}${PAGE_VIEW_MIGRATION}`;
  const result = await runSql(sql);
  const migrationWarning = result.ok ? null : await result.text();

  // 只新增缺少的固定方案；已在後臺調整過的同 slug 方案不會被覆蓋。
  const { data: insertedPlans, error: bartendingError } = await supabase
    .from('products')
    .upsert(bartendingProducts(), { onConflict: 'slug', ignoreDuplicates: true })
    .select('id');

  if (bartendingError) {
    return NextResponse.json({
      status: 'need_manual',
      message: '外派調酒方案同步失敗，請在 Supabase SQL Editor 執行專案內的 supabase-seed-bartending-plans.sql。',
      error: bartendingError.message,
      migrationWarning,
    }, { status: 500 });
  }

  return NextResponse.json({
    status: 'success',
    message: '產品服務大項與外派調酒方案已同步完成。',
    aiFileColumnAdded: error?.code === '42703',
    bartendingPlansAdded: insertedPlans?.length || 0,
    migrationWarning,
  });
}

