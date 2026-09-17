import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/adminAuth';
import { getServiceClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  if (!await verifyAdminRequest(request)) {
    return NextResponse.json({ error: '未授權' }, { status: 401 });
  }

  const productId = request.nextUrl.searchParams.get('productId');
  const startDate = request.nextUrl.searchParams.get('startDate');
  const endDate = request.nextUrl.searchParams.get('endDate');
  const excludeOrderId = request.nextUrl.searchParams.get('excludeOrderId');
  if (!productId || !startDate || !endDate) {
    return NextResponse.json({ error: '缺少庫存查詢條件' }, { status: 400 });
  }

  const supabase = getServiceClient();
  let offset = 0;
  let used = 0;
  while (true) {
    let query = supabase
      .from('orders')
      .select('id,quantity')
      .eq('product_id', productId)
      .not('status', 'in', '(已歸還,已結案,已取消)')
      .lte('borrow_date', endDate)
      .gte('return_date', startDate)
      .range(offset, offset + 999);
    if (excludeOrderId) query = query.neq('id', excludeOrderId);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const rows = data || [];
    used += rows.reduce((total, order) => total + Number(order.quantity || 0), 0);
    if (rows.length < 1000) break;
    offset += 1000;
  }

  return NextResponse.json({ used });
}
