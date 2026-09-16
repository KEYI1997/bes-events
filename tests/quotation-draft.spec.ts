import { expect, test } from '@playwright/test';
import { calculateQuotationTotals, createDefaultQuotationItems, normalizeQuotationItems, quotationLineAmount } from '../src/lib/quotationDraft';

test('啟動儀式多日租用會分開顯示天數並套用 1.3 加成', () => {
  const items = createDefaultQuotationItems('啟動柱', '10000', 1, '', '', '2026-10-01', '2026-10-02', '啟動儀式');
  const product = items.find(item => item.id === 'product');

  expect(product).toMatchObject({ quantity: 1, activityDays: 2, dayMultiplier: 1.3 });
  expect(quotationLineAmount(product!)).toBe(26000);
  expect(items.find(item => item.id === 'launch-control-fee')).toBeUndefined();
});

test('啟動儀式單日商品未滿一萬會增加一次控制費，且不乘活動天數', () => {
  const items = createDefaultQuotationItems('七彩燈球柱', '9000', 1, '', '', '2026-10-01', '2026-10-02', '啟動儀式');
  const product = items.find(item => item.id === 'product');
  const controlFee = items.find(item => item.id === 'launch-control-fee');

  expect(quotationLineAmount(product!)).toBe(23400);
  expect(controlFee).toMatchObject({ label: '控制費', unitPrice: 3500, quantity: 1, activityDays: null, note: '' });
  expect(calculateQuotationTotals(items).subtotal).toBe(26900);
});

test('非啟動儀式商品維持單價乘數量乘活動天數的計算', () => {
  const items = createDefaultQuotationItems('舞台燈光', '10000', 2, '', '', '2026-10-01', '2026-10-02', '燈光音響舞台');
  const product = items.find(item => item.id === 'product');

  expect(product).toMatchObject({ quantity: 2, activityDays: 2, dayMultiplier: 1 });
  expect(quotationLineAmount(product!)).toBe(40000);
  expect(items.find(item => item.id === 'launch-control-fee')).toBeUndefined();
});
test('報價數量只接受正整數', () => {
  expect(() => normalizeQuotationItems([{ id: 'item-1', label: '運費', unitPrice: 1000, quantity: 1.5, note: '' }])).toThrow('數量必須為正整數');
  expect(normalizeQuotationItems([{ id: 'item-1', label: '運費', unitPrice: 1000, quantity: 2, note: '' }])[0].quantity).toBe(2);
});
test('自訂含稅總價會保留原始小計與稅額並列出專案優惠', () => {
  const totals = calculateQuotationTotals([
    { id: 'product', label: '活動服務', unitPrice: 50952, quantity: 1, activityDays: 1, dayMultiplier: 1, note: '' },
  ], 50000);

  expect(totals).toMatchObject({
    subtotal: 50952,
    tax: 2548,
    total: 50000,
    projectDiscount: 3500,
    customTotal: true,
  });
});