import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/adminAuth';
import { contactQuotationItems, contactRequestedQuantity, loadContactQuotationSource } from '@/lib/contactQuotation';
import { applyQuotationPricingRules, calculateQuotationTotals, normalizeCustomQuotationTotal, normalizeQuotationItems } from '@/lib/quotationDraft';
import { saveStoredContactQuotationDraft } from '@/lib/contactQuotationStorage';

export const runtime = 'nodejs';

function normalizeTaxId(value: unknown) {
  const taxId = typeof value === 'string' ? value.trim() : '';
  if (taxId && !/^\d{8}$/.test(taxId)) throw new Error('客戶統編需為 8 位數字。');
  return taxId;
}

function normalizeAddress(value: unknown) {
  return typeof value === 'string' ? value.replace(/[\r\n]+/g, ' ').trim().slice(0, 180) : '';
}

export async function GET(request: NextRequest) {
  if (!await verifyAdminRequest(request)) return NextResponse.json({ error: '未授權' }, { status: 401 });
  const id = request.nextUrl.searchParams.get('id');
  const productId = request.nextUrl.searchParams.get('productId');
  if (!id) return NextResponse.json({ error: '缺少諮詢 id' }, { status: 400 });

  try {
    const { contact, product, stored } = await loadContactQuotationSource(id, productId);
    if (!product) {
      return NextResponse.json({
        productId: stored?.productId || '',
        revision: stored?.revision || 1,
        updatedAt: stored?.updatedAt || null,
        sentAt: stored?.sentAt || null,
        sentRevision: stored?.sentRevision || null,
      });
    }
    const isStoredProduct = stored?.productId === product.id;
    const items = contactQuotationItems(contact, product, isStoredProduct ? stored : null);
    return NextResponse.json({
      productId: product.id,
      items,
      revision: stored?.revision || 1,
      updatedAt: stored?.updatedAt || null,
      customTotal: isStoredProduct ? stored?.customTotal ?? null : null,
      customerTaxId: stored?.customerTaxId || '',
      customerAddress: stored?.customerAddress || '',
      sentAt: isStoredProduct ? stored?.sentAt || null : null,
      sentRevision: isStoredProduct ? stored?.sentRevision || null : null,
      totals: calculateQuotationTotals(items, isStoredProduct ? stored?.customTotal ?? null : null),
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : '載入報價單失敗' }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  if (!await verifyAdminRequest(request)) return NextResponse.json({ error: '未授權' }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const id = typeof body.id === 'string' ? body.id : '';
  const productId = typeof body.productId === 'string' ? body.productId : '';
  if (!id || !productId) return NextResponse.json({ error: '缺少諮詢或商品資料' }, { status: 400 });

  try {
    const customTotal = normalizeCustomQuotationTotal(body.customTotal);
    const customerTaxId = normalizeTaxId(body.customerTaxId);
    const customerAddress = normalizeAddress(body.customerAddress);
    const { contact, product, stored, supabase } = await loadContactQuotationSource(id, productId);
    if (!product) throw new Error('請選擇報價商品');
    if (contact.status === 'converted') throw new Error('此諮詢已轉為正式訂單，不可再修改報價');
    const quantity = contactRequestedQuantity(contact.description);
    const items = applyQuotationPricingRules(
      normalizeQuotationItems(body.items),
      product.category,
      quantity,
      contact.event_date,
      contact.event_end_date || contact.event_date,
    );
    const revision = stored ? stored.revision + 1 : 1;
    const updatedAt = new Date().toISOString();
    await saveStoredContactQuotationDraft(supabase, id, {
      ...stored,
      productId,
      items,
      revision,
      updatedAt,
      customTotal,
      customerTaxId,
      customerAddress,
      sentRevision: undefined,
    });
    return NextResponse.json({
      productId,
      items,
      revision,
      updatedAt,
      customTotal,
      customerTaxId,
      customerAddress,
      sentAt: stored?.sentAt || null,
      sentRevision: null,
      totals: calculateQuotationTotals(items, customTotal),
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : '儲存報價單失敗' }, { status: 400 });
  }
}
