import { NextRequest, NextResponse } from 'next/server';
import { buildQuotationPdf } from '@/lib/quotationPdf';
import { getServiceClient } from '@/lib/supabase';

export const runtime = 'nodejs';

function getProduct(products: unknown) {
  if (Array.isArray(products)) return products[0] as { name?: string; price_note?: string } | undefined;
  return products as { name?: string; price_note?: string } | null;
}

function sanitize(value: string) {
  return value.replace(/[\\/:*?"<>|\r\n]/g, '_').trim().slice(0, 40) || '客戶';
}

export async function GET(_request: NextRequest, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params;
  if (!/^[0-9a-f-]{36}$/i.test(token)) return NextResponse.json({ error: '報價單連結無效' }, { status: 404 });

  const supabase = getServiceClient();
  const { data: orderResult, error } = await supabase
    .from('orders')
    .select('order_code, customer_name, customer_phone, customer_email, quantity, borrow_date, return_date, event_name, note, status, products(name, price_note)')
    .eq('quotation_token', token)
    .single();
  const order = Array.isArray(orderResult) ? orderResult[0] : orderResult;
  if (error || !order || order.status === '已取消') return NextResponse.json({ error: '找不到此報價單或訂單已取消' }, { status: 404 });

  const product = getProduct(order.products);
  if (!product?.name) return NextResponse.json({ error: '找不到產品資料' }, { status: 404 });

  try {
    const pdf = await buildQuotationPdf({
      orderCode: order.order_code,
      customerName: order.customer_name,
      customerPhone: order.customer_phone,
      customerEmail: order.customer_email,
      quantity: order.quantity,
      borrowDate: order.borrow_date,
      returnDate: order.return_date,
      eventName: order.event_name,
      note: order.note,
      productName: product.name,
      productPriceNote: product.price_note,
    });
    const filename = `報價單-${sanitize(order.customer_name)}-${sanitize(product.name)}.pdf`;
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="quotation.pdf"; filename*=UTF-8''${encodeURIComponent(filename)}`,
        'Cache-Control': 'private, no-store, max-age=0',
        'X-Robots-Tag': 'noindex, nofollow, noarchive',
      },
    });
  } catch (pdfError) {
    console.error('Public quotation PDF failed:', pdfError);
    return NextResponse.json({ error: '產生 PDF 報價單失敗' }, { status: 500 });
  }
}
