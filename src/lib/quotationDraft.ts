import { extractQuotationUnitPrice } from '@/lib/quotationWorkbook';
import { productPriceAmount } from '@/lib/productOptions';
import type { QuotationLineItem } from '@/lib/types';

const STANDARD_LABELS = ['運費', '人員交通費', '其他加購'];
const LAUNCH_CEREMONY_CATEGORY = '啟動儀式';
const LAUNCH_CONTROL_FEE = 3500;
const LAUNCH_CONTROL_FEE_NOTE = '如單日商品價格低於一萬時，將另外收取控制費';
const LAUNCH_MULTIDAY_NOTE = '多日租用已含提前進場加成 ×1.3';

export function quotationActivityDays(borrowDate?: string | null, returnDate?: string | null) {
  if (!borrowDate || !returnDate) return 1;
  const start = new Date(`${borrowDate}T00:00:00Z`).getTime();
  const end = new Date(`${returnDate}T00:00:00Z`).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return 1;
  return Math.floor((end - start) / 86_400_000) + 1;
}

export function normalizeCustomQuotationTotal(value: unknown) {
  if (value === '' || value === null || value === undefined) return null;
  const total = Number(value);
  if (!Number.isFinite(total) || total < 0 || total > 1_000_000_000) throw new Error('自定含稅總價格式錯誤');
  return Math.round(total);
}

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

function positiveInteger(value: unknown, fallback = 1) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.max(1, Math.round(parsed)) : fallback;
}

function appendNote(note: string, addition: string) {
  const parts = note.split('；').map(value => value.trim()).filter(Boolean);
  return parts.includes(addition) ? parts.join('；') : [...parts, addition].join('；');
}

export function quotationLineAmount(item: QuotationLineItem) {
  if (item.unitPrice === null || item.quantity === null) return null;
  const activityDays = positiveInteger(item.activityDays, 1);
  const dayMultiplier = Number.isFinite(item.dayMultiplier) && (item.dayMultiplier || 0) > 0 ? item.dayMultiplier || 1 : 1;
  return Math.round(item.unitPrice * item.quantity * activityDays * dayMultiplier * 100) / 100;
}

export function applyQuotationPricingRules(
  items: QuotationLineItem[],
  productCategory: string | null | undefined,
  productQuantity: number,
  borrowDate?: string | null,
  returnDate?: string | null,
) {
  const productIndex = items.findIndex(item => item.id === 'product');
  if (productIndex < 0) return items.filter(item => item.id !== 'launch-control-fee');

  const activityDays = quotationActivityDays(borrowDate, returnDate);
  const isLaunchCeremony = productCategory === LAUNCH_CEREMONY_CATEGORY;
  const product = { ...items[productIndex] };
  if (product.activityDays === undefined || product.activityDays === null) product.quantity = positiveInteger(productQuantity, product.quantity || 1);
  product.activityDays = activityDays;
  product.dayMultiplier = isLaunchCeremony && activityDays > 1 ? 1.3 : 1;

  if (isLaunchCeremony) {
    product.note = appendNote(product.note, LAUNCH_CONTROL_FEE_NOTE);
    if (activityDays > 1) product.note = appendNote(product.note, LAUNCH_MULTIDAY_NOTE);
  }

  const rest = items.filter(item => item.id !== 'product' && item.id !== 'launch-control-fee');
  const singleDayProductAmount = product.unitPrice !== null && product.quantity !== null
    ? product.unitPrice * product.quantity
    : null;
  const needsControlFee = isLaunchCeremony && singleDayProductAmount !== null && singleDayProductAmount < 10_000;
  const controlFee: QuotationLineItem = {
    id: 'launch-control-fee',
    label: '控制費',
    unitPrice: LAUNCH_CONTROL_FEE,
    quantity: 1,
    activityDays: null,
    dayMultiplier: 1,
    note: '',
  };

  return needsControlFee ? [product, controlFee, ...rest] : [product, ...rest];
}

export function createDefaultQuotationItems(
  productName: string,
  productPriceNote: string | null | undefined,
  quantity: number,
  eventName?: string | null,
  selectionDescription?: string | null,
  borrowDate?: string | null,
  returnDate?: string | null,
  productCategory?: string | null,
): QuotationLineItem[] {
  const activityDays = quotationActivityDays(borrowDate, returnDate);
  const productQuantity = positiveInteger(quantity);
  const selectedAddOns = extractSelectedAddOnQuotationItems(selectionDescription);
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
  return applyQuotationPricingRules([
    {
      id: 'product',
      label: productName,
      unitPrice: extractSelectedQuotationUnitPrice(selectionDescription, productPriceNote),
      quantity: productQuantity,
      activityDays,
      dayMultiplier: 1,
      note: [eventName].filter(Boolean).join('；'),
    },
    ...addOnRows,
    ...standardRows,
    ...blankRows,
  ], productCategory, productQuantity, borrowDate, returnDate);
}

function optionalNumber(value: unknown) {
  if (value === '' || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

export function normalizeQuotationItems(value: unknown): QuotationLineItem[] {
  if (!Array.isArray(value)) throw new Error('報價項目格式錯誤');
  if (value.length === 0 || value.length > 9) throw new Error('報價項目需為 1 至 9 筆');

  return value.map((raw, index) => {
    const item = raw && typeof raw === 'object' ? raw as Record<string, unknown> : {};
    const label = typeof item.label === 'string' ? item.label.trim().slice(0, 80) : '';
    const note = typeof item.note === 'string' ? item.note.trim().slice(0, 120) : '';
    const unitPrice = optionalNumber(item.unitPrice);
    const quantity = optionalNumber(item.quantity);
    const activityDays = item.activityDays === null || item.activityDays === undefined ? null : positiveInteger(item.activityDays);
    const dayMultiplier = item.dayMultiplier === null || item.dayMultiplier === undefined
      ? null
      : Math.round(Number(item.dayMultiplier) * 100) / 100;
    if (quantity !== null && (!Number.isInteger(quantity) || quantity <= 0)) throw new Error(`第 ${index + 1} 筆數量必須為正整數`);
    if (dayMultiplier !== null && (!Number.isFinite(dayMultiplier) || dayMultiplier <= 0 || dayMultiplier > 10)) throw new Error(`第 ${index + 1} 筆日數加成格式錯誤`);
    return {
      id: typeof item.id === 'string' && item.id ? item.id.slice(0, 60) : `item-${index + 1}`,
      label,
      unitPrice,
      quantity,
      activityDays,
      dayMultiplier,
      note,
    };
  });
}

export function calculateQuotationTotals(items: QuotationLineItem[], customTotal: number | null = null) {
  const activeItems = items.filter(item => item.label || item.unitPrice !== null || item.quantity !== null || item.note);
  const incomplete = activeItems.some(item =>
    (item.unitPrice === null) !== (item.quantity === null)
  );
  const normalizedCustomTotal = normalizeCustomQuotationTotal(customTotal);
  const subtotal = activeItems.reduce((sum, item) => sum + (quotationLineAmount(item) || 0), 0);
  const hasAmount = activeItems.some(item => item.unitPrice !== null && item.quantity !== null);
  const calculatedSubtotal = incomplete || !hasAmount ? null : subtotal;
  const calculatedTax = calculatedSubtotal === null ? null : Math.round(calculatedSubtotal * 0.05);
  const calculatedTotal = calculatedSubtotal === null || calculatedTax === null ? null : calculatedSubtotal + calculatedTax;

  if (normalizedCustomTotal !== null) {
    return {
      subtotal: calculatedSubtotal,
      tax: calculatedTax,
      total: normalizedCustomTotal,
      projectDiscount: calculatedTotal === null ? null : calculatedTotal - normalizedCustomTotal,
      incomplete,
      customTotal: true,
    };
  }
  if (incomplete || !hasAmount) {
    return { subtotal: null, tax: null, total: null, projectDiscount: null, incomplete, customTotal: false };
  }
  return { subtotal: calculatedSubtotal, tax: calculatedTax, total: calculatedTotal, projectDiscount: null, incomplete: false, customTotal: false };
}