import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const PRODUCT_CATEGORY_MIGRATION = `
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_check;
ALTER TABLE products
  ADD CONSTRAINT products_category_check
  CHECK (category IN ('AI互動道具', '專案企劃', '啟動儀式', '活動特效', '燈光音響舞台', '外派調酒', 'Show Girl'));
`;

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
  const sql = `${error?.code === '42703' ? 'ALTER TABLE products ADD COLUMN IF NOT EXISTS ai_file_url text;\n' : ''}${PRODUCT_CATEGORY_MIGRATION}`;
  const result = await runSql(sql);

  if (!result.ok) {
    return NextResponse.json({
      status: 'need_manual',
      message: '資料庫未提供 run_sql，請在 Supabase SQL Editor 執行專案內的 supabase-migration-product-categories.sql。',
      error: await result.text(),
    }, { status: 500 });
  }

  return NextResponse.json({
    status: 'success',
    message: '產品服務大項已同步完成。',
    aiFileColumnAdded: error?.code === '42703',
  });
}
