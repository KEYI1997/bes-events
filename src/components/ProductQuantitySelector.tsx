'use client';

import { Minus, Plus } from 'lucide-react';

type ProductQuantitySelectorProps = {
  quantity: number;
  singlePurchaseOnly?: boolean;
  onChange: (quantity: number) => void;
  className?: string;
  label?: string;
  compact?: boolean;
};

export default function ProductQuantitySelector({ quantity, singlePurchaseOnly = false, onChange, className = '', label = '購買數量', compact = false }: ProductQuantitySelectorProps) {
  const updateQuantity = (nextQuantity: number) => {
    if (singlePurchaseOnly) {
      onChange(1);
      return;
    }
    if (Number.isSafeInteger(nextQuantity) && nextQuantity >= 1) onChange(nextQuantity);
  };

  return (
    <div className={className}>
      <div className={`${compact ? 'mb-2' : 'mb-3'} flex flex-wrap items-center gap-x-3 gap-y-1`}>
        <p className={`${compact ? 'text-xs' : 'text-sm'} font-semibold text-[#4a4947]`}>{label}</p>
        {singlePurchaseOnly && <p className="text-xs font-medium text-[#8f5d3f]">此商品限購 1 件</p>}
      </div>
      <div className="inline-flex items-center overflow-hidden rounded-lg border border-[#e4ded6] bg-white">
        <button
          type="button"
          aria-label={`減少${label}`}
          disabled={singlePurchaseOnly || quantity <= 1}
          onClick={() => updateQuantity(quantity - 1)}
          className={`flex ${compact ? 'h-10 w-10' : 'h-11 w-11'} items-center justify-center text-[#6f6961] transition-colors hover:bg-[#fcf8f4] hover:text-[#aa7452] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#aa7452] disabled:cursor-not-allowed disabled:opacity-35`}
        >
          <Minus size={16} aria-hidden="true" />
        </button>
        <input
          type="number"
          min={1}
          step={1}
          inputMode="numeric"
          aria-label={label}
          value={singlePurchaseOnly ? 1 : quantity}
          readOnly={singlePurchaseOnly}
          onChange={event => updateQuantity(event.currentTarget.valueAsNumber)}
          className={`${compact ? 'h-10 w-14 text-base' : 'h-11 w-20 text-base'} border-x border-[#eee8e1] bg-white px-2 text-center font-semibold tabular-nums text-[#4a4947] outline-none focus:ring-2 focus:ring-inset focus:ring-[#aa7452] read-only:bg-[#f7f3ee]`}
        />
        <button
          type="button"
          aria-label={`增加${label}`}
          disabled={singlePurchaseOnly || quantity >= Number.MAX_SAFE_INTEGER}
          onClick={() => updateQuantity(quantity + 1)}
          className={`flex ${compact ? 'h-9 w-9' : 'h-11 w-11'} items-center justify-center text-[#6f6961] transition-colors hover:bg-[#fcf8f4] hover:text-[#aa7452] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus:ring-[#aa7452] disabled:cursor-not-allowed disabled:opacity-35`}
        >
          <Plus size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
