import { normalizeQuotationItems } from '@/lib/quotationDraft';
import type { QuotationLineItem } from '@/lib/types';

type SupabaseClient = ReturnType<typeof import('@/lib/supabase').getServiceClient>;

export type StoredQuotationDraft = {
  items: QuotationLineItem[];
  revision: number;
  updatedAt: string | null;
  publicItems?: QuotationLineItem[];
  publicRevision?: number;
  sentRevision?: number;
};

const quotationKey = (orderId: string) => `quotation_draft_${orderId}`;

export async function loadStoredQuotationDraft(supabase: SupabaseClient, orderId: string): Promise<StoredQuotationDraft | null> {
  const { data, error } = await supabase.from('site_content').select('value').eq('key', quotationKey(orderId)).maybeSingle();
  if (error) throw error;
  if (!data?.value) return null;
  try {
    const parsed = JSON.parse(data.value) as Partial<StoredQuotationDraft>;
    return {
      items: normalizeQuotationItems(parsed.items),
      revision: Math.max(1, Number(parsed.revision) || 1),
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : null,
      publicItems: parsed.publicItems ? normalizeQuotationItems(parsed.publicItems) : undefined,
      publicRevision: parsed.publicRevision ? Math.max(1, Number(parsed.publicRevision)) : undefined,
      sentRevision: parsed.sentRevision ? Math.max(1, Number(parsed.sentRevision)) : undefined,
    };
  } catch {
    return null;
  }
}

export async function saveStoredQuotationDraft(supabase: SupabaseClient, orderId: string, draft: StoredQuotationDraft) {
  const { error } = await supabase.from('site_content').upsert({
    key: quotationKey(orderId),
    value: JSON.stringify(draft),
    updated_at: new Date().toISOString(),
  }, { onConflict: 'key' });
  if (error) throw error;
}
