import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 嘗試讀取 ai_file_url 欄位，如果不存在就用 rpc 建立
  const { error } = await supabase.from('products').select('ai_file_url').limit(1);
  
  if (error && error.code === '42703') {
    // 欄位不存在，透過 rpc 執行 SQL（需要先建立 function）
    // 改用直接 fetch Supabase SQL API
    const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/run_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
      },
      body: JSON.stringify({ sql: 'ALTER TABLE products ADD COLUMN IF NOT EXISTS ai_file_url text' }),
    });

    if (!res.ok) {
      return NextResponse.json({ 
        status: 'need_manual',
        message: '請在 Supabase Dashboard SQL Editor 執行：ALTER TABLE products ADD COLUMN IF NOT EXISTS ai_file_url text;',
        error: await res.text()
      });
    }

    return NextResponse.json({ status: 'success', message: 'ai_file_url 欄位已新增' });
  }

  if (!error) {
    return NextResponse.json({ status: 'already_exists', message: 'ai_file_url 欄位已存在' });
  }

  return NextResponse.json({ status: 'error', error });
}
