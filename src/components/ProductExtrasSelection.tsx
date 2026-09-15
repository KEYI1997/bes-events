'use client';

import { useId } from 'react';
import ProductQuantitySelector from '@/components/ProductQuantitySelector';
import { formatProductAddOnPrice, formatProductAmount, optionKey, productExtraTotals, selectedAddOnQuantity, type ProductExtraSelection, type ProductOptionRow } from '@/lib/productOptions';

type ChoiceEntry = { row: ProductOptionRow; index: number; key: string };

export default function ProductExtrasSelection({ addOns, choices, selection, onChange, basePrice = '', quantity = 1 }: {
  addOns: ProductOptionRow[];
  choices: ProductOptionRow[];
  selection: ProductExtraSelection;
  onChange: (value: ProductExtraSelection) => void;
  basePrice?: string;
  quantity?: number;
}) {
  const choiceGroupId = useId();
  if (!addOns.length && !choices.length) return null;
  const totals = productExtraTotals(basePrice, addOns, selection.addOns, quantity, selection.addOnQuantities);
  const choiceGroups = choices.reduce<Record<string, ChoiceEntry[]>>((groups, row, index) => {
    const groupName = row.group?.trim() || '未命名群組';
    (groups[groupName] ||= []).push({ row, index, key: optionKey(row, index) });
    return groups;
  }, {});
  const toggleAddOn = (key: string, checked: boolean) => {
    const nextValues = checked ? [...selection.addOns, key] : selection.addOns.filter(value => value !== key);
    const addOnQuantities = { ...selection.addOnQuantities };
    if (checked) addOnQuantities[key] = selectedAddOnQuantity(selection, key);
    else delete addOnQuantities[key];
    onChange({ ...selection, addOns: nextValues, addOnQuantities });
  };
  const toggleChoice = (groupEntries: ChoiceEntry[], key: string, checked: boolean) => {
    const groupKeys = new Set(groupEntries.map(entry => entry.key));
    const withoutThisGroup = selection.choices.filter(value => !groupKeys.has(value));
    onChange({ ...selection, choices: checked ? [...withoutThisGroup, key] : withoutThisGroup });
  };
  const updateAddOnQuantity = (key: string, nextQuantity: number) => onChange({
    ...selection,
    addOnQuantities: { ...selection.addOnQuantities, [key]: nextQuantity },
  });
  return <div className="space-y-6">
    {addOns.length > 0 && <fieldset>
      <legend className="mb-3 font-semibold text-[#4A4947]">加購商品<span className="ml-2 text-sm font-normal">另計費用・可複選</span></legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {addOns.map((row, index) => {
          const key = optionKey(row, index);
          const checked = selection.addOns.includes(key);
          const addOnQuantity = selectedAddOnQuantity(selection, key);
          return <OptionCard key={key} row={row} checked={checked} inputType="checkbox" onChange={event => toggleAddOn(key, event.target.checked)} price={formatProductAddOnPrice(row.price)}>
            {checked && <ProductQuantitySelector quantity={addOnQuantity} onChange={nextQuantity => updateAddOnQuantity(key, nextQuantity)} label={`${row.label} 加購數量`} compact className="mt-3 border-t border-[#eadfd5] pt-3" />}
          </OptionCard>;
        })}
      </div>
    </fieldset>}
    {choices.length > 0 && <section className="rounded-2xl border-2 border-[#d8c3ae] bg-[#fcfaf7] p-4 shadow-[0_12px_28px_rgba(83,61,42,0.08)] sm:p-6">
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2 border-b border-[#e4d5c7] pb-4">
        <h2 className="text-xl font-bold text-[#4A4947]">選配商品</h2>
        <p className="text-sm font-medium text-[#805e45]">每個群組限選一項</p>
      </div>
      <div className="space-y-6">
        {Object.entries(choiceGroups).map(([groupName, entries], groupIndex) => <fieldset key={groupName} className="rounded-xl border border-[#eadfd5] bg-white p-4">
          <legend className="px-1 text-lg font-bold text-[#4A4947]">{groupName}<span className="ml-2 text-sm font-normal text-[#805e45]">不加價・限選一項</span></legend>
          {groupName === '未命名群組' && <p className="mb-3 text-sm text-[#9a5b36]">此群組尚未命名，請由管理者在後台設定名稱。</p>}
          <div className="grid gap-3 sm:grid-cols-2">
            {entries.map(({ row, key }) => <OptionCard key={key} row={row} checked={selection.choices.includes(key)} inputType="radio" name={`${choiceGroupId}-${groupIndex}`} onChange={event => toggleChoice(entries, key, event.target.checked)} price="不加價" />)}
          </div>
        </fieldset>)}
      </div>
    </section>}
    <div aria-live="polite" className="space-y-1 border-t border-gray-200 pt-4 text-sm text-[#4A4947]">
      {addOns.length > 0 && <p>加購小計：{formatProductAmount(totals.knownSubtotal)}{totals.hasQuotedAddOn ? '（另有需洽詢項目）' : ''}</p>}
      {totals.total !== null ? <p className="text-lg font-semibold">預估合計：{formatProductAmount(totals.total)}</p> : <p>商品價格或部分項目待確認，完整金額以報價為準。</p>}
      {choices.length > 0 && <p>免費選配不增加費用；同一群組限選一項，不同群組可各選一項。</p>}
    </div>
  </div>;
}

function OptionCard({ row, checked, inputType, name, onChange, price, children }: {
  row: ProductOptionRow;
  checked: boolean;
  inputType: 'checkbox' | 'radio';
  name?: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  price: string;
  children?: React.ReactNode;
}) {
  return <div className={`min-w-0 rounded-xl border p-3 transition-colors focus-within:ring-2 focus-within:ring-[#AA7452] ${checked ? 'border-[#AA7452] bg-[#F9F7F0]' : 'border-gray-200 bg-white hover:border-[#AA7452]'}`}>
    <label className="flex min-w-0 cursor-pointer items-center gap-3">
      <input type={inputType} name={name} checked={checked} onChange={onChange} className="h-5 w-5 shrink-0 accent-[#AA7452]" />
      {row.imageUrl && <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-[#F9F7F0]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={row.imageUrl} alt={row.label} loading="lazy" className="h-full w-full object-contain" />
      </div>}
      <span className="min-w-0 break-words text-sm text-[#4A4947]"><span className="block font-medium">{row.label}</span><span className="mt-1 block">{price}</span></span>
    </label>
    {children}
  </div>;
}

