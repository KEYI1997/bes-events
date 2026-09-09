import { Info, ReceiptText } from 'lucide-react';
import { formatProductAmount, formatProductPrice, type ProductOptionRow } from '@/lib/productOptions';

type OrderPriceSummaryProps = {
  productItems: ProductOptionRow[];
  addOnItems?: ProductOptionRow[];
  total: number | null;
  emptyTotalMessage?: string;
};

const ESTIMATE_NOTE = '此為預估金額，實際費用將依活動內容、場地條件及服務需求調整，車馬費另計，最終費用以正式報價為準，詳情請參閱報價單。';

function SummaryRows({ items, emptyMessage }: { items: ProductOptionRow[]; emptyMessage: string }) {
  if (!items.length) return <p className="rounded-lg bg-white/70 px-3 py-2 text-sm text-[#7b746c]">{emptyMessage}</p>;

  return <div className="space-y-2">
    {items.map((item, index) => (
      <div key={`${item.id || item.label}-${index}`} className="flex items-start justify-between gap-3 rounded-lg bg-white/70 px-3 py-2">
        <span className="min-w-0 text-sm font-medium text-[#4A4947]">{item.label}</span>
        <span className="shrink-0 text-sm font-semibold text-[#8f5d3f]">{formatProductPrice(item.price) || '洽詢'}</span>
      </div>
    ))}
  </div>;
}

export default function OrderPriceSummary({ productItems, addOnItems = [], total, emptyTotalMessage = '請先選擇商品規格' }: OrderPriceSummaryProps) {
  return (
    <aside aria-live="polite" aria-label="價格總覽" className="rounded-2xl bg-[#F8F2EC] p-5 text-[#4A4947] shadow-[0_12px_30px_rgba(89,63,43,0.12)]">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-xl font-bold tracking-tight">價格總覽</h2>
        <div className="flex items-center gap-1.5 text-right text-xs leading-5 text-[#796d63]">
          <ReceiptText size={19} strokeWidth={1.7} className="shrink-0 text-[#9a6748]" aria-hidden="true" />
          <span>已選項目即時計算<br />讓您清楚掌握預算</span>
        </div>
      </div>

      <div className="my-4 border-t border-[#dfd2c6]" />

      <section>
        <h3 className="mb-2 text-sm font-bold">商品規格</h3>
        <SummaryRows items={productItems} emptyMessage="請先選擇商品規格" />
      </section>

      {addOnItems.length > 0 && <section className="mt-5">
        <h3 className="mb-2 text-sm font-bold">加購商品</h3>
        <SummaryRows items={addOnItems} emptyMessage="尚未選擇加購商品" />
      </section>}

      <section className="mt-5 rounded-xl bg-[#F0E4D8] p-4">
        <h3 className="text-base font-bold">預估總金額</h3>
        {total === null ? <p className="mt-2 text-sm font-medium text-[#796d63]">{emptyTotalMessage}</p> : <p className="mt-2 flex flex-wrap items-baseline gap-x-2 text-[#8f5d3f]"><span className="text-3xl font-bold tracking-tight tabular-nums">{formatProductAmount(total)}</span><strong className="text-sm font-bold">(未稅)</strong></p>}
        <div className="mt-4 border-t border-[#dac7b8] pt-3">
          <p className="flex gap-2 text-xs leading-5 text-[#6f665f]"><Info size={16} strokeWidth={2} className="mt-0.5 shrink-0 text-[#9a6748]" aria-hidden="true" /><span>{ESTIMATE_NOTE}</span></p>
        </div>
      </section>
    </aside>
  );
}
