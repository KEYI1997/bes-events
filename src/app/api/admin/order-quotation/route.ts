import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { pushCustomerQuotationLineMessage } from '@/lib/customerLineNotifications';
import { buildQuotationPdf } from '@/lib/quotationPdf';
import { getServiceClient } from '@/lib/supabase';

export const runtime = 'nodejs';

type ProductResult = { name?: string; price_note?: string } | Array<{ name?: string; price_note?: string }> | null;

type QuotationOrderRecord = {
  id: string;
  order_code?: string | null;
  customer_name: string;
  customer_phone?: string | null;
  customer_email?: string | null;
  quantity: number;
  borrow_date: string;
  return_date: string;
  event_name?: string | null;
  note?: string | null;
  status: string;
  quotation_token: string;
  products: ProductResult;
};

async function getCurrentPassword() {
  try {
    const supabase = getServiceClient();
    const { data } = await supabase.from('site_content').select('value').eq('key', 'admin_password').single();
    if (data?.value) return data.value;
  } catch {
    // fallback 到環境變數
  }
  return process.env.ADMIN_PASSWORD || '';
}

async function verifyAdmin(request: NextRequest) {
  return request.headers.get('x-admin-password') === await getCurrentPassword();
}

function getProductRecord(products: ProductResult) {
  return Array.isArray(products) ? products[0] : products;
}

function sanitizeFilenamePart(value: string) {
  return value.replace(/[\\/:*?"<>|\r\n]/g, '_').trim().slice(0, 40) || '客戶';
}

function normalizePhone(phone?: string | null) {
  let normalized = (phone || '').replace(/[\s\-()]/g, '');
  if (normalized.startsWith('+886')) normalized = `0${normalized.slice(4)}`;
  if (normalized.startsWith('886')) normalized = `0${normalized.slice(3)}`;
  return normalized;
}

async function loadOrder(orderId: string) {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from('orders')
    .select('id, order_code, customer_name, customer_phone, customer_email, quantity, borrow_date, return_date, event_name, note, status, quotation_token, products(name, price_note)')
    .eq('id', orderId)
    .single();
  return { order: data as unknown as QuotationOrderRecord | null, error };
}

async function generateOrderPdf(order: QuotationOrderRecord) {
  const product = getProductRecord(order.products);
  if (!product?.name) throw new Error('找不到訂單產品資料');
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
  return { pdf, product };
}

function quotationFilename(order: QuotationOrderRecord, productName: string) {
  return `報價單-${sanitizeFilenamePart(order.customer_name)}-${sanitizeFilenamePart(productName)}.pdf`;
}

export async function GET(request: NextRequest) {
  if (!await verifyAdmin(request)) return NextResponse.json({ error: '未授權' }, { status: 401 });
  const orderId = request.nextUrl.searchParams.get('id');
  if (!orderId) return NextResponse.json({ error: '缺少訂單 id' }, { status: 400 });

  const { order, error } = await loadOrder(orderId);
  if (error || !order) return NextResponse.json({ error: error?.message || '找不到訂單' }, { status: 404 });
  if (order.status === '已取消') return NextResponse.json({ error: '已取消的訂單不可輸出報價單' }, { status: 400 });

  try {
    const { pdf, product } = await generateOrderPdf(order);
    const filename = quotationFilename(order, product.name || '服務');
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="quotation.pdf"; filename*=UTF-8''${encodeURIComponent(filename)}`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (quotationError) {
    console.error('Generate quotation PDF failed:', quotationError);
    return NextResponse.json({ error: quotationError instanceof Error ? quotationError.message : '產生 PDF 報價單失敗' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!await verifyAdmin(request)) return NextResponse.json({ error: '未授權' }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const orderId = typeof body.id === 'string' ? body.id : '';
  if (!orderId) return NextResponse.json({ error: '缺少訂單 id' }, { status: 400 });

  const supabase = getServiceClient();
  const { order, error } = await loadOrder(orderId);
  if (error || !order) return NextResponse.json({ error: error?.message || '找不到訂單' }, { status: 404 });
  if (order.status === '已取消') return NextResponse.json({ error: '已取消的訂單不可傳送報價單' }, { status: 400 });

  try {
    const { pdf, product } = await generateOrderPdf(order);
    const filename = quotationFilename(order, product.name || '服務');
    const normalizedPhone = normalizePhone(order.customer_phone);
    let lineUserId = '';
    if (normalizedPhone) {
      const { data: customer } = await supabase.from('customers').select('line_user_id').eq('phone', normalizedPhone).maybeSingle();
      lineUserId = customer?.line_user_id || '';
    }

    const hasEmail = Boolean(order.customer_email?.trim());
    const hasLine = Boolean(lineUserId);
    if (!hasEmail && !hasLine) {
      return NextResponse.json({
        error: '此訂單沒有 Email，也沒有綁定官方 LINE；請使用「下載 PDF」後自行寄送。',
        code: 'no_delivery_channel',
      }, { status: 400 });
    }

    const emailResult: { available: boolean; sent: boolean; error?: string } = { available: hasEmail, sent: false };
    const lineResult: { available: boolean; sent: boolean; error?: string } = { available: hasLine, sent: false };
    const now = new Date().toISOString();

    if (hasEmail) {
      const resendKey = (process.env.RESEND_API_KEY || '').trim();
      if (!resendKey) emailResult.error = 'RESEND_API_KEY 未設定';
      else {
        const resend = new Resend(resendKey);
        const { error: emailError } = await resend.emails.send({
          from: '境曜活動通知 <noreply@besevent.com>',
          to: [order.customer_email!.trim()],
          subject: `境曜活動報價單｜${product.name}`,
          html: `<p>${order.customer_name} 您好：</p><p>您預約「${product.name}」的 PDF 報價單已附於本信，請查收。</p><p>若內容需要調整，歡迎回覆本信或透過官方 LINE 與我們聯繫。</p><p>境曜有限公司</p>`,
          attachments: [{ filename, content: pdf }],
        });
        if (emailError) emailResult.error = emailError.message;
        else emailResult.sent = true;
      }
    }

    if (hasLine) {
      const origin = (process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin).replace(/\/$/, '');
      const downloadUrl = `${origin}/api/quotation/${order.quotation_token}`;
      const result = await pushCustomerQuotationLineMessage(lineUserId, order.customer_name, product.name || '活動服務', downloadUrl);
      lineResult.sent = result.ok;
      if (!result.ok) lineResult.error = result.error;
    }

    const sentAny = emailResult.sent || lineResult.sent;
    const update: Record<string, string | boolean> = {};
    if (emailResult.sent) update.quotation_email_sent_at = now;
    if (lineResult.sent) update.quotation_line_sent_at = now;
    if (sentAny) {
      update.quotation_sent = true;
      update.quotation_sent_at = now;
    }
    if (Object.keys(update).length > 0) {
      const { error: updateError } = await supabase.from('orders').update(update).eq('id', order.id);
      if (updateError) console.error('Update quotation delivery status failed:', updateError.message);
    }

    return NextResponse.json({ sent: sentAny, email: emailResult, line: lineResult, quotation_sent_at: sentAny ? now : null }, { status: sentAny ? 200 : 502 });
  } catch (sendError) {
    console.error('Send quotation PDF failed:', sendError);
    return NextResponse.json({ error: sendError instanceof Error ? sendError.message : '傳送 PDF 報價單失敗' }, { status: 500 });
  }
}
