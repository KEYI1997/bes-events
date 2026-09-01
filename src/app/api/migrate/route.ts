import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const PRODUCT_CATEGORY_MIGRATION = `
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_check;
ALTER TABLE products
  ADD CONSTRAINT products_category_check
  CHECK (category IN ('AI互動道具', '專案企劃', '啟動儀式', '活動特效', '燈光音響舞台', '外派調酒', 'Show Girl'));
`;

const CASE_ACTIVITY_DATE_MIGRATION = `
ALTER TABLE cases ADD COLUMN IF NOT EXISTS activity_date DATE;
COMMENT ON COLUMN cases.activity_date IS 'Actual event date entered manually by admins.';
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

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 舊版環境可能缺少 ai_file_url；與產品分類限制一起做成可重複執行的固定遷移。
  const { error } = await supabase.from('products').select('ai_file_url').limit(1);
  const sql = `${error?.code === '42703' ? 'ALTER TABLE products ADD COLUMN IF NOT EXISTS ai_file_url text;\n' : ''}${PRODUCT_CATEGORY_MIGRATION}${CASE_ACTIVITY_DATE_MIGRATION}`;
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
