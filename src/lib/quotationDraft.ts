import { extractQuotationUnitPrice } from '@/lib/quotationWorkbook';
import type { QuotationLineItem } from '@/lib/types';

const STANDARD_LABELS = ['運費', '人員交通費', '搬運／樓層費', '其他加購'];

export function createDefaultQuotationItems(
  productName: string,
  productPriceNote: string | null | undefined,
  quantity: number,
  eventName?: string | null,
): QuotationLineItem[] {
  return [
    {
      id: 'product',
      label: productName,
      unitPrice: extractQuotationUnitPrice(productPriceNote),
      quantity,
      note: eventName || '',
    },
    ...STANDARD_LABELS.map((label, index) => ({
      id: `standard-${index + 1}`,
      label,
      unitPrice: null,
      quantity: null,
      note: '',
    })),
    ...Array.from({ length: 3 }, (_, index) => ({
      id: `blank-${index + 1}`,
      label: '',
      unitPrice: null,
      quantity: null,
      note: '',
    })),
  ];
}

function optionalNumber(value: unknown) {
  if (value === '' || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

export function normalizeQuotationItems(value: unknown): QuotationLineItem[] {
  if (!Array.isArray(value)) throw new Error('報價項目格式錯誤');
  if (value.length === 0 || value.length > 8) throw new Error('報價項目需為 1 至 8 筆');

  return value.map((raw, index) => {
    const item = raw && typeof raw === 'object' ? raw as Record<string, unknown> : {};
    const label = typeof item.label === 'string' ? item.label.trim().slice(0, 80) : '';
    const note = typeof item.note === 'string' ? item.note.trim().slice(0, 120) : '';
    const unitPrice = optionalNumber(item.unitPrice);
    const quantity = optionalNumber(item.quantity);
    if (quantity !== null && quantity <= 0) throw new Error(`第 ${index + 1} 筆數量必須大於 0`);
    return {
      id: typeof item.id === 'string' && item.id ? item.id.slice(0, 60) : `item-${index + 1}`,
      label,
      unitPrice,
      quantity,
      note,
    };
  });
}

export function calculateQuotationTotals(items: QuotationLineItem[]) {
  const activeItems = items.filter(item => item.label || item.unitPrice !== null || item.quantity !== null || item.note);
  const incomplete = activeItems.some(item =>
    (item.unitPrice === null) !== (item.quantity === null)
  );
  if (incomplete) return { subtotal: null, tax: null, total: null, incomplete: true };

  const subtotal = activeItems.reduce((sum, item) => {
    if (item.unitPrice === null || item.quantity === null) return sum;
    return sum + item.unitPrice * item.quantity;
  }, 0);
  const hasAmount = activeItems.some(item => item.unitPrice !== null && item.quantity !== null);
  if (!hasAmount) return { subtotal: null, tax: null, total: null, incomplete: false };
  const tax = Math.round(subtotal * 0.05);
  return { subtotal, tax, total: subtotal + tax, incomplete: false };
}
