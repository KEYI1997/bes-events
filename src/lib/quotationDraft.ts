import { extractQuotationUnitPrice } from '@/lib/quotationWorkbook';
import { productPriceAmount } from '@/lib/productOptions';
import type { QuotationLineItem } from '@/lib/types';

const STANDARD_LABELS = ['運費', '人員交通費', '其他加購'];

export function extractSelectedQuotationUnitPrice(selectionDescription: string | null | undefined, fallbackPriceNote: string | null | undefined) {
  const section = selectionDescription?.match(/【選擇規格】\n?([\s\S]*?)(?=\n*【|$)/)?.[1]?.trim();
  if (!section) return extractQuotationUnitPrice(fallbackPriceNote);

  const amounts = section
    .split('\n')
    .map(line => productPriceAmount(line.split('｜').pop() || ''));
  if (!amounts.length || amounts.some(amount => amount === null)) return extractQuotationUnitPrice(fallbackPriceNote);
  return amounts.reduce<number>((sum, amount) => sum + (amount || 0), 0);
}

export function extractSelectedAddOnQuotationItems(selectionDescription: string | null | undefined): QuotationLineItem[] {
  const section = selectionDescription?.match(/【加購商品】\n?([\s\S]*?)(?=\n*【|$)/)?.[1]?.trim();
  if (!section) return [];

  return section.split('\n').flatMap((line, index) => {
    const [rawLabel = '', rawPrice = '', rawQuantity = ''] = line.split('｜');
    const label = rawLabel.trim().slice(0, 80);
    if (!label) return [];
    const quantityMatch = rawQuantity.match(/^數量\s*(\d+)$/);
    const quantity = quantityMatch ? Number(quantityMatch[1]) : 1;
    const unitPrice = productPriceAmount(rawPrice.replace(/^\+\s*/, ''));
    return [{
      id: `addon-${index + 1}`,
      label,
      unitPrice,
      quantity: unitPrice === null ? null : quantity,
      note: unitPrice === null ? `數量 ${quantity}；依需求報價` : '',
    }];
  });
}

export function createDefaultQuotationItems(
  productName: string,
  productPriceNote: string | null | undefined,
  quantity: number,
  eventName?: string | null,
  selectionDescription?: string | null,
): QuotationLineItem[] {
  const selectedAddOns = extractSelectedAddOnQuotationItems(selectionDescription);
  // The quotation template has room for eight rows. Preserve every explicitly selected
  // add-on first; the remaining rows stay available for the administrator to complete.
  const addOnRows = selectedAddOns.length <= 7 ? selectedAddOns : [
    ...selectedAddOns.slice(0, 6),
    {
      id: 'addon-overflow',
      label: `其他加購商品（${selectedAddOns.length - 6} 項）`,
      unitPrice: selectedAddOns.slice(6).every(item => item.unitPrice !== null)
        ? selectedAddOns.slice(6).reduce((sum, item) => sum + (item.unitPrice || 0) * (item.quantity || 0), 0)
        : null,
      quantity: selectedAddOns.slice(6).every(item => item.unitPrice !== null) ? 1 : null,
      note: selectedAddOns.slice(6).map(item => `${item.label} × ${item.quantity || 1}`).join('、').slice(0, 120),
    },
  ];
  const remainingRows = Math.max(0, 8 - 1 - addOnRows.length);
  const standardRows = STANDARD_LABELS.slice(0, remainingRows).map((label, index) => ({
    id: `standard-${index + 1}`,
    label,
    unitPrice: null,
    quantity: null,
    note: '',
  }));
  const blankRows = Array.from({ length: Math.min(3, remainingRows - standardRows.length) }, (_, index) => ({
    id: `blank-${index + 1}`,
    label: '',
    unitPrice: null,
    quantity: null,
    note: '',
  }));
  return [
    {
      id: 'product',
      label: productName,
      unitPrice: extractSelectedQuotationUnitPrice(selectionDescription, productPriceNote),
      quantity,
      note: eventName || '',
    },
    ...addOnRows,
    ...standardRows,
    ...blankRows,
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
