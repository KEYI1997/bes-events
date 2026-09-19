'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowRightCircle, FileDown, FilePenLine, Plus, Send, Trash2, X } from 'lucide-react';
import type { Contact, Product, QuotationLineItem } from '@/lib/types';
import { calculateQuotationTotals, quotationLineAmount } from '@/lib/quotationDraft';
import { getServiceDefinition } from '@/lib/services';

type QuotationMeta = {
  productId: string;
  revision: number;
  updatedAt: string | null;
  sentAt: string | null;
  sentRevision: number | null;
};

type Props = {
  contact: Contact;
  products: Product[];
  getHeaders: () => Record<string, string>;
  onConvert: (productId: string) => void;
  onProductChange?: (productId: string) => void;
};

function inferredProductId(contact: Contact, products: Product[]) {
  const service = getServiceDefinition(contact.service_type);
  const eligible = products.filter(product => product.visible && (
    service.productCategories.length === 0 || service.productCategories.includes(product.category)
  ));
  const requestedName = contact.description?.match(/【詢問商品】(.+)/)?.[1]?.trim();
  return eligible.find(product => product.name === requestedName)?.id || (eligible.length === 1 ? eligible[0].id : '');
}

export default function ContactQuotationPanel({ contact, products, getHeaders, onConvert, onProductChange }: Props) {
  const service = getServiceDefinition(contact.service_type);
  const eligibleProducts = products.filter(product => product.visible && (
    service.productCategories.length === 0 || service.productCategories.includes(product.category)
  ));
  const [meta, setMeta] = useState<QuotationMeta>({ productId: '', revision: 1, updatedAt: null, sentAt: null, sentRevision: null });
  const [productId, setProductId] = useState('');
  const [items, setItems] = useState<QuotationLineItem[]>([]);
  const [customTotal, setCustomTotal] = useState<number | null>(null);
  const [customerTaxId, setCustomerTaxId] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [editorOpen, setEditorOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');
  const totals = useMemo(() => calculateQuotationTotals(items, customTotal), [items, customTotal]);
  const isConverted = contact.status === 'converted';
  const hasSavedDraft = Boolean(meta.updatedAt && meta.productId === productId);
  const quotationStatusClass = meta.sentRevision === meta.revision && meta.sentAt
    ? 'bg-emerald-100 text-emerald-700'
    : hasSavedDraft
      ? 'bg-amber-100 text-amber-700'
      : 'bg-zinc-200 text-zinc-700';

  useEffect(() => {
    let active = true;
    const loadMeta = async () => {
      setLoading(true);
      const response = await fetch(`/api/admin/contact-quotation-draft?id=${encodeURIComponent(contact.id)}`, { headers: getHeaders() });
      const result = await response.json().catch(() => ({}));
      if (!active) return;
      const nextProductId = result.productId || inferredProductId(contact, products);
      setMeta({
        productId: result.productId || '',
        revision: result.revision || 1,
        updatedAt: result.updatedAt || null,
        sentAt: result.sentAt || null,
        sentRevision: result.sentRevision || null,
      });
      setProductId(nextProductId);
      onProductChange?.(nextProductId);
      setLoading(false);
    };
    void loadMeta();
    return () => { active = false; };
  // Props are stable for the open contact detail.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contact.id]);

  const openEditor = async () => {
    if (!productId) {
      setError('請先選擇服務方案／產品。');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/contact-quotation-draft?id=${encodeURIComponent(contact.id)}&productId=${encodeURIComponent(productId)}`, { headers: getHeaders() });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || '載入報價單失敗');
      setItems(result.items || []);
      setCustomTotal(result.customTotal ?? null);
      setCustomerTaxId(result.customerTaxId || '');
      setCustomerAddress(result.customerAddress || '');
      setMeta({ productId: result.productId || productId, revision: result.revision || 1, updatedAt: result.updatedAt || null, sentAt: result.sentAt || null, sentRevision: result.sentRevision || null });
      setEditorOpen(true);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : '載入報價單失敗');
    } finally {
      setLoading(false);
    }
  };

  const updateItem = (id: string, field: keyof QuotationLineItem, value: string) => {
    setItems(current => current.map(item => {
      if (item.id !== id) return item;
      if (field === 'unitPrice' || field === 'quantity') {
        const parsed = value === '' ? null : Number(value);
        const normalized = parsed === null ? null : field === 'quantity' ? Math.max(1, Math.round(parsed)) : parsed;
        const next = { ...item, [field]: Number.isFinite(normalized) ? normalized : null };
        if (field === 'unitPrice' && normalized !== null && next.quantity === null) next.quantity = 1;
        return next;
      }
      return { ...item, [field]: value };
    }));
  };

  const saveDraft = async () => {
    if (!productId || saving) return false;
    setSaving(true);
    try {
      const response = await fetch('/api/admin/contact-quotation-draft', {
        method: 'PUT',
        headers: { ...getHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: contact.id, productId, items, customTotal, customerTaxId, customerAddress }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || '儲存報價單失敗');
      setItems(result.items || items);
      setCustomTotal(result.customTotal ?? customTotal);
      setMeta({ productId, revision: result.revision || meta.revision, updatedAt: result.updatedAt || new Date().toISOString(), sentAt: result.sentAt || meta.sentAt, sentRevision: result.sentRevision || null });
      return true;
    } catch (saveError) {
      window.alert(saveError instanceof Error ? saveError.message : '儲存報價單失敗');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const download = async (saveFirst = false) => {
    if (saveFirst && !await saveDraft()) return;
    setDownloading(true);
    try {
      const response = await fetch(`/api/admin/contact-quotation?id=${encodeURIComponent(contact.id)}`, { headers: getHeaders() });
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || '下載報價單失敗');
      }
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement('a');
      link.href = url;
      link.download = `報價單-${contact.name}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (downloadError) {
      window.alert(downloadError instanceof Error ? downloadError.message : '下載報價單失敗');
    } finally {
      setDownloading(false);
    }
  };

  const sendQuotation = async () => {
    if (!hasSavedDraft || sending) return;
    setSending(true);
    try {
      const response = await fetch('/api/admin/contact-quotation', {
        method: 'POST',
        headers: { ...getHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: contact.id }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || '寄送報價單失敗');
      const sentAt = result.sentAt || new Date().toISOString();
      setMeta(current => ({ ...current, sentAt, sentRevision: current.revision }));
      const channels = [result.email?.sent ? 'Email' : '', result.line?.sent ? 'LINE' : ''].filter(Boolean).join('、');
      window.alert(`報價單已透過${channels || '可用管道'}送出。`);
    } catch (sendError) {
      window.alert(sendError instanceof Error ? sendError.message : '寄送報價單失敗');
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <aside className="h-full bg-stone-50 p-5 lg:border-l lg:border-stone-200">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold text-[#4A4947]">報價與訂單</h3>
            <p className="mt-1 text-xs leading-5 text-stone-500">報價簽回前維持諮詢狀態，不占用正式訂單庫存。</p>
          </div>
          <span className={`shrink-0 rounded px-2 py-1 text-xs font-medium ${quotationStatusClass}`}>
            {meta.sentRevision === meta.revision && meta.sentAt ? '已寄出' : hasSavedDraft ? '草稿' : '未建立'}
          </span>
        </div>

        <div className="mt-5">
          <label className="text-xs font-medium text-stone-600" htmlFor={`quotation-product-${contact.id}`}>服務方案／產品</label>
          <select
            id={`quotation-product-${contact.id}`}
            value={productId}
            disabled={isConverted || loading}
            onChange={event => {
              const nextProductId = event.target.value;
              setProductId(nextProductId);
              onProductChange?.(nextProductId);
              setError('');
            }}
            className="mt-1.5 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#8E5F43] disabled:bg-stone-100"
          >
            <option value="">請選擇服務方案</option>
            {eligibleProducts.map(product => <option key={product.id} value={product.id}>{product.name}</option>)}
          </select>
          {eligibleProducts.length === 0 && <p className="mt-2 text-xs text-amber-700">此服務大項目前沒有可用商品，請先至產品管理新增。</p>}
        </div>

        <div className="mt-5 grid gap-2">
          <button type="button" onClick={() => void openEditor()} disabled={isConverted || loading || !productId} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#4A4947] px-4 py-2 text-sm font-medium text-white hover:bg-[#363533] disabled:cursor-not-allowed disabled:opacity-40">
            <FilePenLine className="h-4 w-4" /> {hasSavedDraft ? '編輯報價單' : '建立報價單'}
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => void download()} disabled={!hasSavedDraft || downloading} className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-700 hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40">
              <FileDown className="h-4 w-4" /> {downloading ? '下載中' : '下載 PDF'}
            </button>
            <button type="button" onClick={() => void sendQuotation()} disabled={isConverted || !hasSavedDraft || sending} className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg border border-[#AA7452] bg-white px-3 py-2 text-sm font-medium text-[#8E5F43] hover:bg-[#fff8f3] disabled:cursor-not-allowed disabled:opacity-40">
              <Send className="h-4 w-4" /> {sending ? '寄送中' : '寄送報價'}
            </button>
          </div>
        </div>

        {meta.updatedAt && <p className="mt-3 text-xs leading-5 text-stone-500">版本 v{meta.revision}，最後儲存 {new Date(meta.updatedAt).toLocaleString('zh-TW')}</p>}
        {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}

        <div className="mt-6 border-t border-stone-200 pt-5">
          <p className="text-xs leading-5 text-stone-500">收到客戶簽回後，再轉為正式訂單；活動才會在行事曆由淺灰色改為淺綠色。</p>
          <button type="button" onClick={() => onConvert(productId)} disabled={isConverted || !productId} className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40">
            <ArrowRightCircle className="h-4 w-4" /> {isConverted ? '已轉為正式訂單' : '簽回後轉正式訂單'}
          </button>
        </div>
      </aside>

      {editorOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/55 p-4">
          <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white">
            <div className="sticky top-0 z-10 flex items-start justify-between border-b bg-white p-6">
              <div><h2 className="text-lg font-bold text-[#4A4947]">編輯報價單</h2><p className="mt-1 text-sm text-stone-500">{contact.name}｜版本 v{meta.revision}</p></div>
              <button type="button" onClick={() => setEditorOpen(false)} className="rounded-lg p-2 hover:bg-stone-100" aria-label="關閉報價單編輯器"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6">
              <section className="mb-5 rounded-xl border border-stone-200 bg-stone-50/70 p-4">
                <h3 className="text-sm font-semibold text-[#4A4947]">客戶開立資訊</h3>
                <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
                  <label className="text-sm text-stone-600">客戶統編<input type="text" inputMode="numeric" maxLength={8} value={customerTaxId} onChange={event => setCustomerTaxId(event.target.value.replace(/\D/g, '').slice(0, 8))} placeholder="8 位數字（選填）" className="mt-1.5 w-full rounded-lg border bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-[#8E5F43]" /></label>
                  <label className="text-sm text-stone-600">客戶地址<input type="text" maxLength={180} value={customerAddress} onChange={event => setCustomerAddress(event.target.value)} placeholder="客戶地址（選填）" className="mt-1.5 w-full rounded-lg border bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-[#8E5F43]" /></label>
                </div>
              </section>
              <div className="overflow-x-auto rounded-xl border">
                <table className="w-full min-w-[820px] text-sm">
                  <thead className="bg-stone-50 text-stone-600"><tr><th className="w-[27%] px-3 py-3 text-left">項目／服務內容</th><th className="w-[14%] px-3 py-3 text-right">單價</th><th className="w-[10%] px-3 py-3 text-center">數量</th><th className="w-[12%] px-3 py-3 text-center">活動天數</th><th className="w-[14%] px-3 py-3 text-right">金額</th><th className="px-3 py-3 text-left">備註</th><th className="w-10" /></tr></thead>
                  <tbody>{items.map((item, index) => <tr key={item.id} className="border-t">
                    <td className="p-2"><input value={item.label} onChange={event => updateItem(item.id, 'label', event.target.value)} placeholder={index === 0 ? '產品／服務名稱' : '自訂項目'} className="w-full rounded-lg border px-3 py-2" /></td>
                    <td className="p-2"><input type="number" min={0} step={1} value={item.unitPrice ?? ''} onChange={event => updateItem(item.id, 'unitPrice', event.target.value)} placeholder="留空" className="w-full rounded-lg border px-3 py-2 text-right" /></td>
                    <td className="p-2"><input type="number" min={1} step={1} inputMode="numeric" value={item.quantity ?? ''} onChange={event => updateItem(item.id, 'quantity', event.target.value)} placeholder="—" className="w-full rounded-lg border px-3 py-2 text-center" /></td>
                    <td className="p-2 text-center text-stone-700">{item.activityDays ? `${item.activityDays} 日${item.dayMultiplier && item.dayMultiplier > 1 ? ` × ${item.dayMultiplier}` : ''}` : '—'}</td>
                    <td className="p-2 text-right font-medium text-stone-700">{quotationLineAmount(item) === null ? '—' : `NT$ ${quotationLineAmount(item)!.toLocaleString('zh-TW')}`}</td>
                    <td className="p-2"><input value={item.note} onChange={event => updateItem(item.id, 'note', event.target.value)} placeholder="選填" className="w-full rounded-lg border px-3 py-2" /></td>
                    <td className="p-2">{index > 0 && <button type="button" onClick={() => setItems(current => current.filter(row => row.id !== item.id))} className="rounded p-1 text-stone-300 hover:text-red-500" aria-label="移除此項"><Trash2 className="h-4 w-4" /></button>}</td>
                  </tr>)}</tbody>
                </table>
              </div>
              <div className="mt-5 flex flex-wrap items-start justify-between gap-5">
                <div>
                  <button type="button" disabled={items.length >= 9} onClick={() => setItems(current => [...current, { id: `custom-${Date.now()}`, label: '', unitPrice: null, quantity: null, note: '' }])} className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm hover:bg-stone-50 disabled:opacity-40"><Plus className="h-4 w-4" />新增項目</button>
                  <label className="mt-4 flex items-center gap-2 text-sm font-semibold text-[#4A4947]"><input type="checkbox" checked={customTotal !== null} onChange={event => setCustomTotal(event.target.checked ? totals.total ?? 0 : null)} className="h-4 w-4 accent-[#8E5F43]" />自定含稅總價</label>
                  {customTotal !== null && <input type="number" min={0} step={1} value={customTotal} onChange={event => setCustomTotal(Math.max(0, Math.round(Number(event.target.value) || 0)))} className="mt-2 w-56 rounded-lg border px-3 py-2 font-semibold" />}
                </div>
                <div className="w-full space-y-2 rounded-xl border bg-stone-50 p-4 text-sm sm:w-72">
                  <div className="flex justify-between"><span className="text-stone-500">未稅小計</span><span>{totals.subtotal === null ? '—' : `NT$ ${totals.subtotal.toLocaleString('zh-TW')}`}</span></div>
                  <div className="flex justify-between"><span className="text-stone-500">營業稅 5%</span><span>{totals.tax === null ? '—' : `NT$ ${totals.tax.toLocaleString('zh-TW')}`}</span></div>
                  <div className="flex justify-between border-t pt-2 text-base font-bold text-[#8E5F43]"><span>含稅總計</span><span>{totals.total === null ? '—' : `NT$ ${totals.total.toLocaleString('zh-TW')}`}</span></div>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap justify-end gap-3 border-t pt-5">
                <button type="button" onClick={() => setEditorOpen(false)} className="rounded-lg border px-4 py-2 text-sm hover:bg-stone-50">關閉</button>
                <button type="button" onClick={() => void saveDraft()} disabled={saving} className="rounded-lg border border-[#AA7452] px-4 py-2 text-sm font-medium text-[#8E5F43] disabled:opacity-40">{saving ? '儲存中' : '暫存報價單'}</button>
                <button type="button" onClick={() => void download(true)} disabled={saving || downloading} className="inline-flex items-center gap-2 rounded-lg bg-[#AA7452] px-5 py-2 text-sm font-medium text-white disabled:opacity-40"><FileDown className="h-4 w-4" />儲存並下載 PDF</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
