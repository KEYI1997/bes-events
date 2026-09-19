import { buildQuotationPdf } from '@/lib/quotationPdf';
import { applyQuotationPricingRules, createDefaultQuotationItems, normalizeQuotationItems } from '@/lib/quotationDraft';
import { loadStoredContactQuotationDraft, type StoredContactQuotationDraft } from '@/lib/contactQuotationStorage';
import { getServiceClient } from '@/lib/supabase';

export type ContactQuotationRecord = {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  service_type?: string | null;
  description?: string | null;
  event_date?: string | null;
  event_end_date?: string | null;
  event_location?: string | null;
  status?: string | null;
};

export type ContactQuotationProduct = {
  id: string;
  name: string;
  price_note?: string | null;
  category?: string | null;
};

export function contactRequestedQuantity(description?: string | null) {
  const value = Number(description?.match(/【數量】\s*([0-9]+)/)?.[1] || 1);
  return Number.isSafeInteger(value) && value >= 1 ? value : 1;
}

export async function loadContactQuotationSource(contactId: string, productId?: string | null) {
  const supabase = getServiceClient();
  const [{ data: contact, error: contactError }, stored] = await Promise.all([
    supabase.from('contacts').select('id, name, phone, email, service_type, description, event_date, event_end_date, event_location, status').eq('id', contactId).single(),
    loadStoredContactQuotationDraft(supabase, contactId),
  ]);
  if (contactError || !contact) throw new Error(contactError?.message || '找不到諮詢紀錄');
  const resolvedProductId = productId || stored?.productId;
  if (!resolvedProductId) return { supabase, contact: contact as ContactQuotationRecord, product: null, stored };
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('id, name, price_note, category')
    .eq('id', resolvedProductId)
    .single();
  if (productError || !product) throw new Error(productError?.message || '找不到報價商品');
  return { supabase, contact: contact as ContactQuotationRecord, product: product as ContactQuotationProduct, stored };
}

export function contactQuotationItems(contact: ContactQuotationRecord, product: ContactQuotationProduct, stored: StoredContactQuotationDraft | null) {
  const quantity = contactRequestedQuantity(contact.description);
  const endDate = contact.event_end_date || contact.event_date || '';
  const baseItems = stored?.productId === product.id
    ? normalizeQuotationItems(stored.items)
    : createDefaultQuotationItems(product.name, product.price_note, quantity, contact.service_type, contact.description, contact.event_date, endDate, product.category);
  return applyQuotationPricingRules(baseItems, product.category, quantity, contact.event_date, endDate);
}

export async function buildContactQuotationPdf(
  contact: ContactQuotationRecord,
  product: ContactQuotationProduct,
  stored: StoredContactQuotationDraft | null,
  usePublicSnapshot = false,
) {
  const quantity = contactRequestedQuantity(contact.description);
  const publicReady = usePublicSnapshot && stored?.publicItems && stored.publicProductId === product.id;
  const items = publicReady ? stored.publicItems! : contactQuotationItems(contact, product, stored);
  return buildQuotationPdf({
    orderCode: `Q-${contact.id.slice(0, 8).toUpperCase()}`,
    customerName: contact.name,
    customerPhone: contact.phone,
    customerEmail: contact.email,
    customerTaxId: publicReady ? stored?.publicCustomerTaxId || '' : stored?.customerTaxId || '',
    customerAddress: publicReady ? stored?.publicCustomerAddress || '' : stored?.customerAddress || '',
    quantity,
    borrowDate: contact.event_date || '',
    returnDate: contact.event_end_date || contact.event_date || '',
    eventName: contact.service_type,
    note: contact.description,
    productName: product.name,
    productPriceNote: product.price_note,
    productCategory: product.category,
    quotationItems: items,
    customTotal: publicReady ? stored?.publicCustomTotal ?? null : stored?.customTotal ?? null,
    quotationRevision: publicReady ? stored?.publicRevision || stored?.revision || 1 : stored?.revision || 1,
  });
}
