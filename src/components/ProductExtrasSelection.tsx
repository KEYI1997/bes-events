'use client';

import { formatProductAmount, optionKey, productExtraTotals, type ProductExtraSelection, type ProductOptionRow } from '@/lib/productOptions';

export default function ProductExtrasSelection({ addOns, choices, selection, onChange, basePrice = '' }: {
  addOns: ProductOptionRow[];
  choices: ProductOptionRow[];
  selection: ProductExtraSelection;
  onChange: (value: ProductExtraSelection) => void;
  basePrice?: string;
}) {
  if (!addOns.length && !choices.length) return null;
  const totals = productExtraTotals(basePrice, addOns, selection.addOns);
  return <div className="space-y-6">
    {([{ title: '加購商品', field: 'addOns', rows: addOns }, { title: '選購商品', field: 'choices', rows: choices }] as const).map(group => group.rows.length > 0 && (
      <fieldset key={group.field}>
        <legend className="mb-3 font-semibold text-[#4A4947]">{group.title}<span className="ml-2 text-sm font-normal">{group.field === 'choices' ? '不加價・可複選' : '另計費用・可複選'}</span></legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {group.rows.map((row, index) => {
            const key = optionKey(row, index);
            const checked = selection[group.field].includes(key);
            return <label key={key} className={`flex min-w-0 cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors focus-within:ring-2 focus-within:ring-[#AA7452] ${checked ? 'border-[#AA7452] bg-[#F9F7F0]' : 'border-gray-200 bg-white hover:border-[#AA7452]'}`}>
              <input type="checkbox" checked={checked} onChange={event => onChange({ ...selection, [group.field]: event.target.checked ? [...selection[group.field], key] : selection[group.field].filter(value => value !== key) })} className="h-5 w-5 shrink-0 accent-[#AA7452]" />
              {row.imageUrl && <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-[#F9F7F0]">
                {/* Admin-uploaded optional images use the same public storage as product photos. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={row.imageUrl} alt={row.label} loading="lazy" className="h-full w-full object-contain" />
              </div>}
              <span className="min-w-0 break-words text-sm text-[#4A4947]"><span className="block font-medium">{row.label}</span><span className="mt-1 block">{group.field === 'choices' ? '不加價' : `+ ${row.price || '洽詢'}`}</span></span>
            </label>;
          })}
        </div>
      </fieldset>
    ))}
    <div aria-live="polite" className="space-y-1 border-t border-gray-200 pt-4 text-sm text-[#4A4947]">
      {addOns.length > 0 && <p>加購小計：{formatProductAmount(totals.knownSubtotal)}{totals.hasQuotedAddOn ? '（另有需洽詢項目）' : ''}</p>}
      {totals.total !== null ? <p className="text-lg font-semibold">預估合計：{formatProductAmount(totals.total)}</p> : <p>商品價格或部分項目待確認，完整金額以報價為準。</p>}
      <p>免費選購不增加費用；每個勾選項目計一次。</p>
    </div>
  </div>;
}
