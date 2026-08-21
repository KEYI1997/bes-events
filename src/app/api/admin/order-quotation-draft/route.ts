import { NextRequest, NextResponse } from 'next/server';
import { calculateQuotationTotals, createDefaultQuotationItems, normalizeQuotationItems } from '@/lib/quotationDraft';
import { getServiceClient } from '@/lib/supabase';
import { loadStoredQuotationDraft, saveStoredQuotationDraft } from '@/lib/quotationStorage';

export const runtime = 'nodejs';

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

function getProduct(products: unknown) {
  if (Array.isArray(products)) return products[0] as { name?: string; price_note?: string } | undefined;
  return products as { name?: string; price_note?: string } | null;
}

async function loadDraftOrder(id: string) {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from('orders')
    .select('id, status, quantity, event_name, products(name, price_note)')
    .eq('id', id)
    .single();
  return { supabase, order: Array.isArray(data) ? data[0] : data, error };
}

export async function GET(request: NextRequest) {
  if (!await verifyAdmin(request)) return NextResponse.json({ error: '未授權' }, { status: 401 });
  const id = request.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: '缺少訂單 id' }, { status: 400 });

  const { order, error } = await loadDraftOrder(id);
  if (error || !order) return NextResponse.json({ error: error?.message || '找不到訂單' }, { status: 404 });
  if (order.status === '已取消') return NextResponse.json({ error: '已取消的訂單不可編輯報價單' }, { status: 400 });
  const product = getProduct(order.products);
  if (!product?.name) return NextResponse.json({ error: '找不到產品資料' }, { status: 404 });

  const stored = await loadStoredQuotationDraft(getServiceClient(), id);
  const items = stored
    ? stored.items
    : createDefaultQuotationItems(product.name, product.price_note, order.quantity, order.event_name);
  return NextResponse.json({
    items,
    revision: stored?.revision || 1,
    updatedAt: stored?.updatedAt || null,
    totals: calculateQuotationTotals(items),
  });
}

export async function PUT(request: NextRequest) {
  if (!await verifyAdmin(request)) return NextResponse.json({ error: '未授權' }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const id = typeof body.id === 'string' ? body.id : '';
  if (!id) return NextResponse.json({ error: '缺少訂單 id' }, { status: 400 });

  try {
    const items = normalizeQuotationItems(body.items);
    const { supabase, order, error } = await loadDraftOrder(id);
    if (error || !order) return NextResponse.json({ error: error?.message || '找不到訂單' }, { status: 404 });
    if (order.status === '已取消') return NextResponse.json({ error: '已取消的訂單不可編輯報價單' }, { status: 400 });

    const stored = await loadStoredQuotationDraft(supabase, id);
    const revision = (stored?.revision || 1) + 1;
    const updatedAt = new Date().toISOString();
    await saveStoredQuotationDraft(supabase, id, {
      ...stored,
      items,
      revision,
      updatedAt,
      sentRevision: undefined,
    });
    const { error: updateError } = await supabase.from('orders').update({
      quotation_sent: false,
      quotation_sent_at: null,
    }).eq('id', id);
    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

    return NextResponse.json({
      items,
      revision,
      updatedAt,
      totals: calculateQuotationTotals(items),
    });
  } catch (draftError) {
    return NextResponse.json({ error: draftError instanceof Error ? draftError.message : '儲存報價單失敗' }, { status: 400 });
  }
}
