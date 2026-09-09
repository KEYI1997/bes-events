'use client';

import ProductQuantitySelector from '@/components/ProductQuantitySelector';
import { formatProductAddOnPrice, formatProductAmount, optionKey, productExtraTotals, selectedAddOnQuantity, type ProductExtraSelection, type ProductOptionRow } from '@/lib/productOptions';

export default function ProductExtrasSelection({ addOns, choices, selection, onChange, basePrice = '', quantity = 1 }: {
  addOns: ProductOptionRow[];
  choices: ProductOptionRow[];
  selection: ProductExtraSelection;
  onChange: (value: ProductExtraSelection) => void;
  basePrice?: string;
  quantity?: number;
}) {
  if (!addOns.length && !choices.length) return null;
  const totals = productExtraTotals(basePrice, addOns, selection.addOns, quantity, selection.addOnQuantities);
  const toggleOption = (field: 'addOns' | 'choices', key: string, checked: boolean) => {
    const nextValues = checked ? [...selection[field], key] : selection[field].filter(value => value !== key);
    if (field !== 'addOns') {
      onChange({ ...selection, [field]: nextValues });
      return;
    }
    const addOnQuantities = { ...selection.addOnQuantities };
    if (checked) addOnQuantities[key] = selectedAddOnQuantity(selection, key);
    else delete addOnQuantities[key];
    onChange({ ...selection, addOns: nextValues, addOnQuantities });
  };
  const updateAddOnQuantity = (key: string, nextQuantity: number) => onChange({
    ...selection,
    addOnQuantities: { ...selection.addOnQuantities, [key]: nextQuantity },
  });
  return <div className="space-y-6">
    {([{ title: '加購商品', field: 'addOns', rows: addOns }, { title: '選配商品', field: 'choices', rows: choices }] as const).map(group => group.rows.length > 0 && (
      <fieldset key={group.field}>
        <legend className="mb-3 font-semibold text-[#4A4947]">{group.title}<span className="ml-2 text-sm font-normal">{group.field === 'choices' ? '不加價・可複選' : '另計費用・可複選'}</span></legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {group.rows.map((row, index) => {
            const key = optionKey(row, index);
            const checked = selection[group.field].includes(key);
            const addOnQuantity = selectedAddOnQuantity(selection, key);
            return <div key={key} className={`min-w-0 rounded-xl border p-3 transition-colors focus-within:ring-2 focus-within:ring-[#AA7452] ${checked ? 'border-[#AA7452] bg-[#F9F7F0]' : 'border-gray-200 bg-white hover:border-[#AA7452]'}`}>
              <div className="flex min-w-0 items-center gap-3">
                <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3">
                  <input type="checkbox" checked={checked} onChange={event => toggleOption(group.field, key, event.target.checked)} className="h-5 w-5 shrink-0 accent-[#AA7452]" />
                  {row.imageUrl && <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-[#F9F7F0]">
                    {/* Admin-uploaded optional images use the same public storage as product photos. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={row.imageUrl} alt={row.label} loading="lazy" className="h-full w-full object-contain" />
                  </div>}
                  <span className="min-w-0 break-words text-sm text-[#4A4947]"><span className="block font-medium">{row.label}</span><span className="mt-1 block">{group.field === 'choices' ? '不加價' : formatProductAddOnPrice(row.price)}</span></span>
                </label>
              </div>
              {group.field === 'addOns' && checked && <ProductQuantitySelector quantity={addOnQuantity} onChange={nextQuantity => updateAddOnQuantity(key, nextQuantity)} label={`${row.label} 加購數量`} compact className="mt-3 border-t border-[#eadfd5] pt-3" />}
            </div>;
          })}
        </div>
      </fieldset>
    ))}
    <div aria-live="polite" className="space-y-1 border-t border-gray-200 pt-4 text-sm text-[#4A4947]">
      {addOns.length > 0 && <p>加購小計：{formatProductAmount(totals.knownSubtotal)}{totals.hasQuotedAddOn ? '（另有需洽詢項目）' : ''}</p>}
      {totals.total !== null ? <p className="text-lg font-semibold">預估合計：{formatProductAmount(totals.total)}</p> : <p>商品價格或部分項目待確認，完整金額以報價為準。</p>}
      <p>免費選配不增加費用；加購商品可分別調整數量。</p>
    </div>
  </div>;
}
