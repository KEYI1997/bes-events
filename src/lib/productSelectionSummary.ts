import { formatProductAddOnPrice, formatProductAmount, formatProductPrice, isSinglePurchaseOnly, optionKey, parseProductOptionRows, productOptionTotals, productPriceAmount, type ProductOptionRow } from './productOptions';

export function productSelectionSummary(product: { name: string; description?: string | null; price_note?: string | null }, input: unknown) {
  if (!input || typeof input !== 'object') throw new Error('商品選擇格式錯誤');
  const selection = input as Record<string, unknown>;
  const description = product.description || '';
  const quantity = selection.quantity === undefined ? 1 : selection.quantity;
  if (!Number.isSafeInteger(quantity) || (quantity as number) < 1) throw new Error('商品數量格式錯誤');
  if (isSinglePurchaseOnly(description) && quantity !== 1) throw new Error('此商品限購 1 件，請重新整理頁面後再送出。');
  const specs = parseProductOptionRows(description, '價格選項');
  if (!specs.length && product.price_note) specs.push({ label: '價格', price: product.price_note });
  const addOns = parseProductOptionRows(description, '加購方案');
  const choices = parseProductOptionRows(description, '選配商品');
  function selectedRows(rows: ProductOptionRow[], value: unknown) {
    if (!Array.isArray(value) || value.length > rows.length || value.some(key => typeof key !== 'string') || new Set(value).size !== value.length) throw new Error('商品選擇格式錯誤');
    if (value.some(key => !rows.some((row, index) => optionKey(row, index) === key))) throw new Error('商品選項已更新，請重新整理頁面後選擇。');
    return rows.filter((row, index) => value.includes(optionKey(row, index)));
  }
  const selectedAddOns = selectedRows(addOns, selection.addOns);
  const rawAddOnQuantities = selection.addOnQuantities;
  if (rawAddOnQuantities !== undefined && (!rawAddOnQuantities || typeof rawAddOnQuantities !== 'object' || Array.isArray(rawAddOnQuantities))) throw new Error('加購商品數量格式錯誤');
  const addOnQuantities = rawAddOnQuantities as Record<string, unknown> | undefined;
  const selectedAddOnKeys = new Set(selectedAddOns.map(row => optionKey(row, addOns.indexOf(row))));
  if (addOnQuantities && Object.entries(addOnQuantities).some(([key, value]) => !selectedAddOnKeys.has(key) || !Number.isSafeInteger(value) || (value as number) < 1)) {
    throw new Error('加購商品數量格式錯誤');
  }
  const selectedAddOnRows = selectedAddOns.map(row => {
    const key = optionKey(row, addOns.indexOf(row));
    const quantity = addOnQuantities?.[key] === undefined ? 1 : addOnQuantities[key] as number;
    const amount = productPriceAmount(row.price.replace(/^\+\s*/, ''));
    return { row, quantity, amount };
  });
  const selectedChoices = selectedRows(choices, selection.choices);
  if (selectedChoices.length > 1) throw new Error('選配商品限選一項，請重新選擇。');
  const selectedSpecs = selection.priceKeys !== undefined
    ? selectedRows(specs, selection.priceKeys)
    : specs.filter((row, index) => optionKey(row, index) === selection.priceKey);
  const lockedSpecs = specs.filter(row => row.locked);
  const selectedSpecKeys = new Set(selectedSpecs.map(row => optionKey(row, specs.indexOf(row))));
  if (specs.length && selectedSpecs.length === 0) throw new Error('商品規格已更新，請重新整理頁面後選擇。');
  if (!lockedSpecs.every(row => selectedSpecKeys.has(optionKey(row, specs.indexOf(row))))) {
    throw new Error('此商品包含必選項目，請重新整理頁面後再送出。');
  }
  if (!lockedSpecs.length && specs.length && selectedSpecs.length !== 1) throw new Error('請選擇一個商品規格。');
  const specTotals = productOptionTotals(selectedSpecs);
  const addOnTotals = {
    knownSubtotal: Math.round(selectedAddOnRows.reduce((sum, item) => sum + (item.amount === null ? 0 : item.amount * item.quantity), 0) * 100) / 100,
    hasQuotedItem: selectedAddOnRows.some(item => item.amount === null),
  };
  const productSubtotal = specTotals.hasQuotedItem ? null : Math.round(specTotals.knownSubtotal * (quantity as number) * 100) / 100;
  const total = productSubtotal === null || addOnTotals.hasQuotedItem ? null : Math.round((productSubtotal + addOnTotals.knownSubtotal) * 100) / 100;
  return [
    `【詢問商品】${product.name}`,
    selectedSpecs.length ? `【選擇規格】\n${selectedSpecs.map(row => `${row.label}｜${formatProductPrice(row.price) || '洽詢'}`).join('\n')}` : '',
    `【數量】${quantity}`,
    selectedAddOnRows.length ? `【加購商品】\n${selectedAddOnRows.map(({ row, quantity: addOnQuantity, amount }) => `${row.label}｜${formatProductAddOnPrice(row.price)}｜數量 ${addOnQuantity}${amount === null ? '｜小計洽詢' : `｜小計 ${formatProductAmount(amount * addOnQuantity)}`}`).join('\n')}` : '',
    selectedChoices.length ? `【選配商品】\n${selectedChoices.map(row => `${row.label}｜不加價`).join('\n')}` : '',
    selectedSpecs.length ? `【預估金額】${productSubtotal === null ? '商品小計待報價確認' : `商品小計 ${formatProductAmount(productSubtotal)}`}；加購小計 ${formatProductAmount(addOnTotals.knownSubtotal)}${addOnTotals.hasQuotedItem ? '（另有洽詢項目）' : ''}；${total === null ? '完整金額待報價確認' : `合計 ${formatProductAmount(total)}`}。選配商品不加價，金額以正式報價為準。` : '',
  ].filter(Boolean).join('\n');
}
