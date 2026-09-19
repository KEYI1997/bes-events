import { normalizeCustomQuotationTotal, normalizeQuotationItems } from '@/lib/quotationDraft';
import type { QuotationLineItem } from '@/lib/types';

type SupabaseClient = ReturnType<typeof import('@/lib/supabase').getServiceClient>;

export type StoredContactQuotationDraft = {
  productId: string;
  items: QuotationLineItem[];
  revision: number;
  updatedAt: string | null;
  customTotal?: number | null;
  customerTaxId?: string;
  customerAddress?: string;
  token?: string;
  sentAt?: string | null;
  sentRevision?: number;
  publicProductId?: string;
  publicItems?: QuotationLineItem[];
  publicCustomTotal?: number | null;
  publicCustomerTaxId?: string;
  publicCustomerAddress?: string;
  publicRevision?: number;
};

const draftKey = (contactId: string) => `contact_quotation_draft_${contactId}`;
const tokenKey = (token: string) => `contact_quotation_token_${token}`;

function normalizeText(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.replace(/[\r\n]+/g, ' ').trim().slice(0, maxLength) : '';
}

function normalizeDraft(value: string): StoredContactQuotationDraft | null {
  try {
    const parsed = JSON.parse(value) as Partial<StoredContactQuotationDraft>;
    if (!parsed.productId || !parsed.items) return null;
    return {
      productId: normalizeText(parsed.productId, 80),
      items: normalizeQuotationItems(parsed.items),
      revision: Math.max(1, Number(parsed.revision) || 1),
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : null,
      customTotal: normalizeCustomQuotationTotal(parsed.customTotal),
      customerTaxId: normalizeText(parsed.customerTaxId, 8),
      customerAddress: normalizeText(parsed.customerAddress, 180),
      token: normalizeText(parsed.token, 80),
      sentAt: typeof parsed.sentAt === 'string' ? parsed.sentAt : null,
      sentRevision: parsed.sentRevision ? Math.max(1, Number(parsed.sentRevision)) : undefined,
      publicProductId: normalizeText(parsed.publicProductId, 80),
      publicItems: parsed.publicItems ? normalizeQuotationItems(parsed.publicItems) : undefined,
      publicCustomTotal: normalizeCustomQuotationTotal(parsed.publicCustomTotal),
      publicCustomerTaxId: normalizeText(parsed.publicCustomerTaxId, 8),
      publicCustomerAddress: normalizeText(parsed.publicCustomerAddress, 180),
      publicRevision: parsed.publicRevision ? Math.max(1, Number(parsed.publicRevision)) : undefined,
    };
  } catch {
    return null;
  }
}

export async function loadStoredContactQuotationDraft(supabase: SupabaseClient, contactId: string) {
  const { data, error } = await supabase.from('site_content').select('value').eq('key', draftKey(contactId)).maybeSingle();
  if (error) throw error;
  return data?.value ? normalizeDraft(data.value) : null;
}

export async function saveStoredContactQuotationDraft(supabase: SupabaseClient, contactId: string, draft: StoredContactQuotationDraft) {
  const { error } = await supabase.from('site_content').upsert({
    key: draftKey(contactId),
    value: JSON.stringify(draft),
    updated_at: new Date().toISOString(),
  }, { onConflict: 'key' });
  if (error) throw error;
}

export async function saveContactQuotationToken(supabase: SupabaseClient, token: string, contactId: string) {
  const { error } = await supabase.from('site_content').upsert({
    key: tokenKey(token),
    value: contactId,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'key' });
  if (error) throw error;
}

export async function loadContactIdByQuotationToken(supabase: SupabaseClient, token: string) {
  const { data, error } = await supabase.from('site_content').select('value').eq('key', tokenKey(token)).maybeSingle();
  if (error) throw error;
  return data?.value || null;
}
