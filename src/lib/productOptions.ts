export type ProductOptionRow = { label: string; price: string; id?: string; imageUrl?: string };
export type ProductExtraSelection = { addOns: string[]; choices: string[] };

export const optionKey = (row: ProductOptionRow, index: number) => row.id || `${index}:${row.label}:${row.price}`;

// Only exact amounts are calculable; ranges, per-day prices and quotes remain unknown.
export function productPriceAmount(price: string): number | null {
  const normalized = price.trim().replace(/^(?:NT\$|NTD|TWD|\$)\s*/i, '').replace(/\s*元$/, '');
  if (!/^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{1,2})?$/.test(normalized)) return null;
  const amount = Number(normalized.replace(/,/g, ''));
  return Number.isFinite(amount) && amount <= 1e9 ? amount : null;
}

export const formatProductAmount = (amount: number) => `NT$${amount.toLocaleString('zh-TW', { maximumFractionDigits: 2 })}`;

export function productExtraTotals(basePrice: string, addOns: ProductOptionRow[], selected: string[]) {
  const amounts = addOns.filter((row, index) => selected.includes(optionKey(row, index))).map(row => productPriceAmount(row.price));
  const knownSubtotal = Math.round(amounts.reduce<number>((sum, amount) => sum + (amount ?? 0), 0) * 100) / 100;
  const hasQuotedAddOn = amounts.includes(null);
  const base = productPriceAmount(basePrice);
  return { knownSubtotal, hasQuotedAddOn, total: base === null || hasQuotedAddOn ? null : Math.round((base + knownSubtotal) * 100) / 100 };
}

export function parseProductOptionRows(description: string, sectionTitle: string): ProductOptionRow[] {
  const section = description.match(new RegExp(`【${sectionTitle}】\\n?([\\s\\S]*?)(?=\\n*【|$)`))?.[1] || '';
  if (section.trim().startsWith('[')) {
    try {
      const rows: unknown = JSON.parse(section.trim());
      if (!Array.isArray(rows)) return [];
      return rows.filter(row => row && typeof row.label === 'string' && row.label.trim()).map(row => ({
        label: row.label.trim(),
        price: typeof row.price === 'string' ? row.price.trim() : '',
        ...(typeof row.id === 'string' ? { id: row.id } : {}),
        ...(typeof row.imageUrl === 'string' && /^(https?:\/\/|\/(?!\/))/.test(row.imageUrl) ? { imageUrl: row.imageUrl } : {}),
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
  if (rows.some(row => row.id || row.imageUrl)) {
    return JSON.stringify(rows.filter(row => row.label.trim()).map(row => ({ ...row, label: row.label.trim(), price: row.price.trim() }))).replace(/【/g, '\\u3010');
  }
  return rows
    .filter(row => row.label.trim() || row.price.trim())
    .map(row => `${row.label.trim()}｜${row.price.trim()}`)
    .join('\n');
}
