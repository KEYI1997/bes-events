'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, CalendarDays, CheckCircle2, CircleHelp, PackageCheck } from 'lucide-react';
import type { Contact } from '@/lib/types';

type InventoryRecord = {
  id: string;
  customerName: string;
  quantity: number;
  startDate: string;
  endDate: string;
};

type InventoryStatus = {
  product: { id: string; name: string };
  activity: { startDate: string; endDate: string };
  metrics: {
    totalStock: number;
    confirmedUsage: number;
    remainingStock: number;
    plannedUsage: number;
    pendingUsage: number;
  };
  status: 'enough' | 'insufficient' | 'pending';
  confirmedOrders: InventoryRecord[];
  pendingInquiries: InventoryRecord[];
};

type Props = {
  contact: Contact;
  productId: string;
  getHeaders: () => Record<string, string>;
};

function dateRange(startDate: string, endDate: string) {
  if (!startDate) return '日期未確認';
  if (!endDate || startDate === endDate) return startDate;
  return `${startDate} ～ ${endDate}`;
}

function SummaryRows({ records, emptyText }: { records: InventoryRecord[]; emptyText: string }) {
  if (records.length === 0) return <p className="py-1 text-xs text-stone-500">{emptyText}</p>;
  return (
    <ul className="space-y-1.5">
      {records.slice(0, 2).map(record => (
        <li key={record.id} className="flex items-start justify-between gap-3 text-xs text-stone-600">
          <span className="min-w-0 truncate">{record.customerName}・{dateRange(record.startDate, record.endDate)}</span>
          <span className="shrink-0 font-medium tabular-nums text-stone-800">{record.quantity} 件</span>
        </li>
      ))}
      {records.length > 2 && <li className="text-xs text-stone-500">另有 {records.length - 2} 筆同期間紀錄</li>}
    </ul>
  );
}

export default function ContactInventoryStatus({ contact, productId, getHeaders }: Props) {
  const [data, setData] = useState<InventoryStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!productId) return;
    let active = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`/api/admin/contact-inventory?contactId=${encodeURIComponent(contact.id)}&productId=${encodeURIComponent(productId)}`, { headers: getHeaders() });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.error || '載入庫存狀況失敗');
        if (active) setData(result);
      } catch (loadError) {
        if (active) {
          setData(null);
          setError(loadError instanceof Error ? loadError.message : '載入庫存狀況失敗');
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => { active = false; };
  // getHeaders is stable for the open admin detail record.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contact.id, productId]);

  const badge = data?.status === 'insufficient'
    ? { label: '庫存不足', icon: AlertTriangle, className: 'bg-red-100 text-red-800', message: '正式訂單已使用的數量，已使本筆預計使用量無法保留。' }
    : data?.status === 'pending'
      ? { label: '庫存待確認', icon: CircleHelp, className: 'bg-amber-100 text-amber-800', message: '同期間有未成立的諮詢；它們不會先扣庫存，但成立順序可能影響可用量。' }
      : { label: '庫存足夠', icon: CheckCircle2, className: 'bg-emerald-100 text-emerald-800', message: '目前沒有其他同期間諮詢需要優先確認。' };
  const BadgeIcon = badge.icon;

  return (
    <section className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm shadow-stone-200/40">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="inline-flex items-center gap-2 text-sm font-semibold text-[#4A4947]"><PackageCheck className="h-4 w-4 text-[#8E5F43]" />庫存狀況</h3>
          <p className="mt-1 text-xs leading-5 text-stone-500">正式訂單會扣除可用庫存；同期間諮詢只列為待確認。</p>
        </div>
        {data && <span className={`inline-flex shrink-0 items-center gap-1 rounded px-2 py-1 text-xs font-semibold ${badge.className}`}><BadgeIcon className="h-3.5 w-3.5" />{badge.label}</span>}
      </div>

      {!productId && (
        <div className="mt-4 flex items-start gap-2 rounded-lg bg-stone-50 px-3 py-3 text-xs leading-5 text-stone-600">
          <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-stone-500" />
          請先在右側選擇服務方案／產品，即可檢查活動日期內的庫存狀況。
        </div>
      )}

      {loading && <div className="mt-4 py-3 text-xs text-stone-500">正在檢查同期間庫存…</div>}
      {productId && error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-xs leading-5 text-red-700">{error}</p>}

      {data && !loading && (
        <>
          <div className="mt-4 flex items-center justify-between gap-3 border-y border-stone-100 py-3 text-xs">
            <span className="font-medium text-[#4A4947]">{data.product.name}</span>
            <span className="inline-flex shrink-0 items-center gap-1 text-stone-500"><CalendarDays className="h-3.5 w-3.5" />{dateRange(data.activity.startDate, data.activity.endDate)}</span>
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-x-5 gap-y-3 text-sm sm:grid-cols-3">
            <div><dt className="text-xs text-stone-500">總庫存</dt><dd className="mt-0.5 font-semibold tabular-nums text-[#4A4947]">{data.metrics.totalStock} 件</dd></div>
            <div><dt className="text-xs text-stone-500">正式訂單已使用</dt><dd className="mt-0.5 font-semibold tabular-nums text-[#4A4947]">{data.metrics.confirmedUsage} 件</dd></div>
            <div><dt className="text-xs text-stone-500">正式訂單後剩餘</dt><dd className="mt-0.5 font-semibold tabular-nums text-[#4A4947]">{data.metrics.remainingStock} 件</dd></div>
            <div><dt className="text-xs text-stone-500">本筆預計使用</dt><dd className="mt-0.5 font-semibold tabular-nums text-[#4A4947]">{data.metrics.plannedUsage} 件</dd></div>
            <div><dt className="text-xs text-stone-500">同期諮詢預計使用</dt><dd className="mt-0.5 font-semibold tabular-nums text-[#4A4947]">{data.metrics.pendingUsage} 件</dd></div>
          </dl>

          <p className={`mt-4 rounded-lg px-3 py-2 text-xs leading-5 ${data.status === 'insufficient' ? 'bg-red-50 text-red-800' : data.status === 'pending' ? 'bg-amber-50 text-amber-800' : 'bg-emerald-50 text-emerald-800'}`}>
            {badge.message}
          </p>

          <div className="mt-4 space-y-3 border-t border-stone-100 pt-4">
            <div>
              <p className="mb-1.5 text-xs font-medium text-stone-700">正式訂單（會扣庫存）</p>
              <SummaryRows records={data.confirmedOrders} emptyText="這段日期內沒有同商品的正式訂單。" />
            </div>
            <div>
              <p className="mb-1.5 text-xs font-medium text-stone-700">同期諮詢（不先扣庫存）</p>
              <SummaryRows records={data.pendingInquiries} emptyText="這段日期內沒有其他同商品諮詢。" />
            </div>
          </div>
        </>
      )}
    </section>
  );
}
