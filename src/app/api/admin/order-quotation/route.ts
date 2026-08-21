import fs from 'node:fs/promises';
import path from 'node:path';
import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { buildQuotationWorkbook } from '@/lib/quotationWorkbook';

export const runtime = 'nodejs';

async function getCurrentPassword() {
  try {
    const supabase = getServiceClient();
    const { data } = await supabase
      .from('site_content')
      .select('value')
      .eq('key', 'admin_password')
      .single();
    if (data?.value) return data.value;
  } catch {
    // fallback 到環境變數
  }
  return process.env.ADMIN_PASSWORD || '';
}

async function verifyAdmin(request: NextRequest) {
  const password = request.headers.get('x-admin-password');
  return password === await getCurrentPassword();
}

function getProductRecord(products: unknown) {
  if (Array.isArray(products)) return products[0] as { name?: string; price_note?: string } | undefined;
  return products as { name?: string; price_note?: string } | null;
}

function sanitizeFilenamePart(value: string) {
  return value.replace(/[\\/:*?"<>|\r\n]/g, '_').trim().slice(0, 40) || '客戶';
}

export async function GET(request: NextRequest) {
  if (!await verifyAdmin(request)) {
    return NextResponse.json({ error: '未授權' }, { status: 401 });
  }

  const orderId = request.nextUrl.searchParams.get('id');
  if (!orderId) {
    return NextResponse.json({ error: '缺少訂單 id' }, { status: 400 });
  }

  const supabase = getServiceClient();
  const { data: orderResult, error } = await supabase
    .from('orders')
    .select('id, order_code, customer_name, customer_phone, quantity, borrow_date, return_date, event_name, status, products(name, price_note)')
    .eq('id', orderId)
    .single();

  const order = Array.isArray(orderResult) ? orderResult[0] : orderResult;
  if (error || !order) {
    return NextResponse.json({ error: error?.message || '找不到訂單' }, { status: 404 });
  }
  if (order.status !== '已結案') {
    return NextResponse.json({ error: '訂單結案後才可輸出報價單' }, { status: 400 });
  }

  const product = getProductRecord(order.products);
  if (!product?.name) {
    return NextResponse.json({ error: '找不到訂單產品資料' }, { status: 400 });
  }

  try {
    const templatePath = path.join(process.cwd(), 'public', 'templates', 'quotation-template.xlsx');
    const template = await fs.readFile(templatePath);
    const workbook = await buildQuotationWorkbook(template, {
      orderCode: order.order_code,
      customerName: order.customer_name,
      customerPhone: order.customer_phone,
      quantity: order.quantity,
      borrowDate: order.borrow_date,
      returnDate: order.return_date,
      eventName: order.event_name,
      productName: product.name,
      productPriceNote: product.price_note,
    });

    const filename = `報價單-${sanitizeFilenamePart(order.customer_name)}-${sanitizeFilenamePart(product.name)}.xlsx`;
    return new NextResponse(new Uint8Array(workbook), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="quotation.xlsx"; filename*=UTF-8''${encodeURIComponent(filename)}`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (quotationError) {
    console.error('Generate quotation failed:', quotationError);
    return NextResponse.json({ error: '產生報價單失敗' }, { status: 500 });
  }
}
