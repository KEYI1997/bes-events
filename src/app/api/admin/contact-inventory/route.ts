import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/adminAuth';
import { contactRequestedQuantity } from '@/lib/contactQuotation';
import { getServiceClient } from '@/lib/supabase';

export const runtime = 'nodejs';

function requestedProductName(description?: string | null) {
  return description?.match(/【詢問商品】(.+)/)?.[1]?.trim() || '';
}

export async function GET(request: NextRequest) {
  if (!await verifyAdminRequest(request)) return NextResponse.json({ error: '未授權' }, { status: 401 });
  const contactId = request.nextUrl.searchParams.get('contactId');
  const productId = request.nextUrl.searchParams.get('productId');
  if (!contactId || !productId) return NextResponse.json({ error: '缺少諮詢或商品資料' }, { status: 400 });

  try {
    const supabase = getServiceClient();
    const [{ data: contact, error: contactError }, { data: product, error: productError }] = await Promise.all([
      supabase.from('contacts').select('id, event_date, event_end_date, description, status').eq('id', contactId).single(),
      supabase.from('products').select('id, name, stock').eq('id', productId).single(),
    ]);
    if (contactError || !contact) throw new Error(contactError?.message || '找不到諮詢紀錄');
    if (productError || !product) throw new Error(productError?.message || '找不到商品');

    const startDate = contact.event_date;
    const endDate = contact.event_end_date || contact.event_date;
    if (!startDate || !endDate) return NextResponse.json({ error: '請先確認活動日期，才能檢查庫存。' }, { status: 400 });

    const [ordersResult, contactsResult] = await Promise.all([
      supabase
        .from('orders')
        .select('id, customer_name, quantity, borrow_date, return_date')
        .eq('product_id', product.id)
        .neq('status', '已取消')
        .lte('borrow_date', endDate)
        .gte('return_date', startDate)
        .order('borrow_date', { ascending: true }),
      supabase
        .from('contacts')
        .select('id, name, description, event_date, event_end_date')
        .neq('id', contact.id)
        .or('status.is.null,status.eq.pending,status.eq.replied')
        .not('event_date', 'is', null)
        .lte('event_date', endDate)
        .or(`event_end_date.is.null,event_end_date.gte.${startDate}`)
        .order('event_date', { ascending: true }),
    ]);
    if (ordersResult.error) throw ordersResult.error;
    if (contactsResult.error) throw contactsResult.error;

    const confirmedOrders = (ordersResult.data || []).map(order => ({
      id: order.id,
      customerName: order.customer_name || '未具名客戶',
      quantity: Math.max(0, Number(order.quantity) || 0),
      startDate: order.borrow_date,
      endDate: order.return_date,
    }));
    const pendingInquiries = (contactsResult.data || [])
      .filter(inquiry => requestedProductName(inquiry.description) === product.name)
      .map(inquiry => ({
        id: inquiry.id,
        customerName: inquiry.name || '未具名客戶',
        quantity: contactRequestedQuantity(inquiry.description),
        startDate: inquiry.event_date,
        endDate: inquiry.event_end_date || inquiry.event_date,
      }));

    const totalStock = Math.max(0, Number(product.stock) || 0);
    const confirmedUsage = confirmedOrders.reduce((total, order) => total + order.quantity, 0);
    const remainingStock = Math.max(0, totalStock - confirmedUsage);
    const plannedUsage = contact.status === 'converted' ? 0 : contactRequestedQuantity(contact.description);
    const pendingUsage = pendingInquiries.reduce((total, inquiry) => total + inquiry.quantity, 0);
    const status = remainingStock < plannedUsage
      ? 'insufficient'
      : pendingUsage > 0
        ? 'pending'
        : 'enough';

    return NextResponse.json({
      product: { id: product.id, name: product.name },
      activity: { startDate, endDate },
      metrics: { totalStock, confirmedUsage, remainingStock, plannedUsage, pendingUsage },
      status,
      confirmedOrders,
      pendingInquiries,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : '載入庫存狀況失敗' }, { status: 500 });
  }
}
