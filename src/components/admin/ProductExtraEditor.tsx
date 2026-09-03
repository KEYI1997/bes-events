'use client';

import { useState } from 'react';
import type { ProductOptionRow } from '@/lib/productOptions';

export default function ProductExtraEditor({ title, free = false, rows, busy, onBusy, onAdd, onUpdate, onRemove }: {
  title: string;
  free?: boolean;
  rows: ProductOptionRow[];
  busy: boolean;
  onBusy: (busy: boolean) => void;
  onAdd: () => void;
  onUpdate: (id: string, key: keyof ProductOptionRow, value: string) => void;
  onRemove: (id: string) => void;
}) {
  const [error, setError] = useState('');
  async function upload(file: File, id: string) {
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setError('請選擇 5 MB 以下的 JPG、PNG、WebP 或 GIF 圖片。');
      return;
    }
    onBusy(true);
    setError('');
    try {
      const body = new FormData();
      body.append('file', file);
      body.append('folder', 'products');
      const response = await fetch('/api/upload', { method: 'POST', headers: { 'x-admin-password': localStorage.getItem('admin_password') || '' }, body });
      const result = await response.json();
      if (!response.ok || !result.url) throw new Error('圖片上傳失敗，請重試。');
      onUpdate(id, 'imageUrl', result.url);
    } catch { setError('圖片上傳失敗，請檢查連線後重試。原有圖片未變更。'); }
    finally { onBusy(false); }
  }
  return <fieldset disabled={busy} className="rounded-xl border border-gray-200 p-4 disabled:opacity-70">
    <legend className="px-1 text-sm font-semibold">{title}</legend>
    <p className="mb-3 text-sm text-gray-600">{free ? '不增加費用，前臺可複選。' : '每個勾選項目加價一次，前臺可複選。'} 每個項目可上傳一張圖片。</p>
    <div className="space-y-4">
      {rows.map(row => <div key={row.id} className="space-y-2 border-b border-gray-200 pb-4">
        <div className="flex flex-wrap gap-2">
          <input aria-label={`${title}名稱`} required value={row.label} onChange={event => onUpdate(row.id!, 'label', event.target.value)} placeholder="商品名稱" className="min-w-0 flex-1 rounded-lg border px-3 py-2 text-base" />
          {!free && <input aria-label={`${title}加價金額`} required value={row.price} onChange={event => onUpdate(row.id!, 'price', event.target.value)} placeholder="例如：3000 或 NT$3,000" className="min-w-0 flex-1 rounded-lg border px-3 py-2 text-base" />}
          <button type="button" onClick={() => onRemove(row.id!)} className="px-3 py-2 text-sm text-red-700" aria-label={`移除${row.label || title}`}>移除</button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {row.imageUrl && <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={row.imageUrl} alt={row.label || title} className="h-20 w-20 rounded-lg bg-gray-50 object-contain" />
            <button type="button" onClick={() => onUpdate(row.id!, 'imageUrl', '')} className="text-sm text-red-700">移除圖片</button>
          </>}
          <label className="text-sm text-gray-700">{row.imageUrl ? '更換圖片' : '上傳圖片'}
            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" aria-label={`${row.label || title}圖片`} className="mt-1 block w-full max-w-60 text-sm" onChange={event => { const file = event.target.files?.[0]; if (file) void upload(file, row.id!); event.target.value = ''; }} />
          </label>
        </div>
      </div>)}
    </div>
    {!rows.length && <p className="mb-3 text-sm text-gray-600">尚未設定，前臺不顯示此區塊。</p>}
    <button type="button" onClick={onAdd} className="mt-2 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-50">新增{title}</button>
    {busy && <p role="status" className="mt-2 text-sm">圖片上傳中，完成後即可儲存。</p>}
    {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
  </fieldset>;
}
