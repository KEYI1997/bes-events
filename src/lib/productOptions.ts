export type ProductOptionRow = { label: string; price: string; id?: string; imageUrl?: string; locked?: boolean };
export type ProductExtraSelection = { addOns: string[]; choices: string[] };

const SINGLE_PURCHASE_SECTION = '購買數量限制';
const SINGLE_PURCHASE_VALUE = '單件限定';
const LEGACY_CHOICE_SECTION = '選購商品';
const CHOICE_SECTION = '選配商品';

export const optionKey = (row: ProductOptionRow, index: number) => row.id || `${index}:${row.label}:${row.price}`;

// Only exact amounts are calculable; ranges, per-day prices and quotes remain unknown.
export function productPriceAmount(price: string): number | null {
  const normalized = price.trim().replace(/^(?:NT\s*\$|\$\s*NT|NTD|TWD|\$)\s*/i, '').replace(/\s*元$/, '');
  if (!/^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{1,2})?$/.test(normalized)) return null;
  const amount = Number(normalized.replace(/,/g, ''));
  return Number.isFinite(amount) && amount <= 1e9 ? amount : null;
}

export const formatProductAmount = (amount: number) => `$NT${amount.toLocaleString('zh-TW', { maximumFractionDigits: 2 })}`;

export function formatProductPrice(price: string): string {
  const value = price.trim();
  if (!value) return '';
  const amount = productPriceAmount(value);
  return amount === null ? value : formatProductAmount(amount);
}

export function formatProductAddOnPrice(price: string): string {
  const value = price.trim();
  if (!value) return '洽詢';
  const amount = productPriceAmount(value.replace(/^\+\s*/, ''));
  return amount === null ? value : `+${formatProductAmount(amount)}`;
}

export function formatProductPriceText(text: string): string {
  return text.split('\n').map(line => {
    const value = line.trim();
    if (!value) return '';
    const directAmount = productPriceAmount(value);
    if (directAmount !== null) return formatProductAmount(directAmount);

    const labelledAmount = value.match(/^(.+?)(\s*[:：]\s*|\s+)((?:(?:NT\s*\$|\$\s*NT|NTD|TWD|\$)\s*)?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{1,2})?\s*元?)$/i);
    if (!labelledAmount) return value;
    return `${labelledAmount[1]}${labelledAmount[2]}${formatProductPrice(labelledAmount[3])}`;
  }).join('\n');
}

export function productOptionTotals(rows: ProductOptionRow[]) {
  const amounts = rows.map(row => productPriceAmount(row.price));
  const knownSubtotal = Math.round(amounts.reduce<number>((sum, amount) => sum + (amount ?? 0), 0) * 100) / 100;
  return { knownSubtotal, hasQuotedItem: amounts.includes(null) };
}

export function productExtraTotals(basePrice: string, addOns: ProductOptionRow[], selected: string[], quantity = 1) {
  const { knownSubtotal, hasQuotedItem: hasQuotedAddOn } = productOptionTotals(addOns.filter((row, index) => selected.includes(optionKey(row, index))));
  const base = productPriceAmount(basePrice);
  const safeQuantity = Number.isSafeInteger(quantity) && quantity >= 1 ? quantity : 1;
  const baseSubtotal = base === null ? null : Math.round(base * safeQuantity * 100) / 100;
  return {
    knownSubtotal,
    hasQuotedAddOn,
    baseSubtotal,
    total: baseSubtotal === null || hasQuotedAddOn ? null : Math.round((baseSubtotal + knownSubtotal) * 100) / 100,
  };
}

export function isSinglePurchaseOnly(description?: string | null) {
  if (!description) return false;
  const section = description.match(new RegExp(`【${SINGLE_PURCHASE_SECTION}】\\n?([\\s\\S]*?)(?=\\n*【|$)`))?.[1]?.trim();
  return section === SINGLE_PURCHASE_VALUE;
}

export function serializePurchaseLimit(singlePurchaseOnly: boolean) {
  return singlePurchaseOnly ? `【${SINGLE_PURCHASE_SECTION}】\n${SINGLE_PURCHASE_VALUE}` : '';
}

export function parseProductOptionRows(description: string, sectionTitle: string): ProductOptionRow[] {
  // Older product records used 「選購商品」. Read them under the new 「選配商品」 label
  // so existing catalog data stays available while all newly saved data uses the new wording.
  const sectionTitles = sectionTitle === CHOICE_SECTION ? [CHOICE_SECTION, LEGACY_CHOICE_SECTION] : [sectionTitle];
  const section = sectionTitles
    .map(title => description.match(new RegExp(`【${title}】\\n?([\\s\\S]*?)(?=\\n*【|$)`))?.[1])
    .find((value): value is string => value !== undefined) || '';
  if (section.trim().startsWith('[')) {
    try {
      const rows: unknown = JSON.parse(section.trim());
      if (!Array.isArray(rows)) return [];
      return rows.filter(row => row && typeof row.label === 'string' && row.label.trim()).map(row => ({
        label: row.label.trim(),
        price: typeof row.price === 'string' ? row.price.trim() : '',
        ...(typeof row.id === 'string' ? { id: row.id } : {}),
        ...(typeof row.imageUrl === 'string' && /^(https?:\/\/|\/(?!\/))/.test(row.imageUrl) ? { imageUrl: row.imageUrl } : {}),
        ...(row.locked === true ? { locked: true } : {}),
      }));
    } catch { return []; }
  }
  return section
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const [label, ...priceParts] = line.split(/[｜|]/);
      return { label: label.trim(), price: priceParts.join('｜').trim() };
    })
    .filter(row => row.label);
}

export function serializeProductOptionRows(rows: ProductOptionRow[]) {
  if (rows.some(row => row.id || row.imageUrl || row.locked)) {
    return JSON.stringify(rows.filter(row => row.label.trim()).map(row => ({ ...row, label: row.label.trim(), price: row.price.trim() }))).replace(/【/g, '\\u3010');
  }
  return rows
    .filter(row => row.label.trim() || row.price.trim())
    .map(row => `${row.label.trim()}｜${row.price.trim()}`)
    .join('\n');
}
