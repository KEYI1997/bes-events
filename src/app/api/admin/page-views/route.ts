import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/adminAuth';
import { getServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 50;

export async function GET(request: NextRequest) {
  if (!await verifyAdminRequest(request)) return NextResponse.json({ error: '未授權' }, { status: 401 });
  const requestedPage = Number(request.nextUrl.searchParams.get('page') || '1');
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const from = (page - 1) * PAGE_SIZE;
  const supabase = getServiceClient();
  const [{ count, error: countError }, { data: visitors, error: visitorsError }, { data: daily, error: dailyError }, { data: monthly, error: monthlyError }] = await Promise.all([
    supabase.from('page_views').select('*', { count: 'exact', head: true }),
    supabase.from('page_views').select('id,path,session_id,created_at').order('created_at', { ascending: false }).range(from, from + PAGE_SIZE - 1),
    supabase.rpc('page_view_daily_counts', { days: 30 }),
    supabase.rpc('page_view_monthly_counts', { months: 12 }),
  ]);
  const error = countError || visitorsError || dailyError || monthlyError;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({
    total: count || 0,
    page,
    pageSize: PAGE_SIZE,
    visitors: visitors || [],
    daily: daily || [],
    monthly: monthly || [],
  });
}
