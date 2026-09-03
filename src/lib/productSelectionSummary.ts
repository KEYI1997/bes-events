import { formatProductAmount, optionKey, parseProductOptionRows, productExtraTotals, type ProductOptionRow } from './productOptions';

export function productSelectionSummary(product: { name: string; description?: string | null; price_note?: string | null }, input: unknown) {
  if (!input || typeof input !== 'object') throw new Error('商品選擇格式錯誤');
  const selection = input as Record<string, unknown>;
  const description = product.description || '';
  const specs = parseProductOptionRows(description, '價格選項');
  if (!specs.length && product.price_note) specs.push({ label: '價格', price: product.price_note });
  const addOns = parseProductOptionRows(description, '加購方案');
  const choices = parseProductOptionRows(description, '選購商品');
  function selectedRows(rows: ProductOptionRow[], value: unknown) {
    if (!Array.isArray(value) || value.length > rows.length || value.some(key => typeof key !== 'string') || new Set(value).size !== value.length) throw new Error('商品選擇格式錯誤');
    if (value.some(key => !rows.some((row, index) => optionKey(row, index) === key))) throw new Error('商品選項已更新，請重新整理頁面後選擇。');
    return rows.filter((row, index) => value.includes(optionKey(row, index)));
  }
  const selectedAddOns = selectedRows(addOns, selection.addOns);
  const selectedChoices = selectedRows(choices, selection.choices);
  const spec = specs.find((row, index) => optionKey(row, index) === selection.priceKey);
  if (specs.length && !spec) throw new Error('商品規格已更新，請重新整理頁面後選擇。');
  const totals = productExtraTotals(spec?.price || '', addOns, selection.addOns as string[]);
  return [
    `【詢問商品】${product.name}`,
    spec ? `【選擇規格】${spec.label}｜${spec.price}` : '',
    selectedAddOns.length ? `【加購商品】\n${selectedAddOns.map(row => `${row.label}｜${row.price || '洽詢'}`).join('\n')}` : '',
    selectedChoices.length ? `【選購商品】\n${selectedChoices.map(row => `${row.label}｜不加價`).join('\n')}` : '',
    addOns.length || choices.length ? `【預估金額】加購小計 ${formatProductAmount(totals.knownSubtotal)}${totals.hasQuotedAddOn ? '（另有洽詢項目）' : ''}；${totals.total === null ? '完整金額待報價確認' : `合計 ${formatProductAmount(totals.total)}`}。選購商品不加價，金額以正式報價為準。` : '',
  ].filter(Boolean).join('\n');
}
