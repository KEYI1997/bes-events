'use client';

import { useState } from 'react';
import { Plus, Trash2, Upload } from 'lucide-react';
import type { ProductOptionRow } from '@/lib/productOptions';

type EditorProps = {
  title: string;
  free?: boolean;
  rows: ProductOptionRow[];
  busy: boolean;
  onBusy: (busy: boolean) => void;
  onAdd: (group?: string, required?: boolean) => void;
  onUpdate: (id: string, key: keyof ProductOptionRow, value: string) => void;
  onRemove: (id: string) => void;
  onRenameGroup?: (previousGroup: string, nextGroup: string) => void;
  onSetGroupRequired?: (group: string, required: boolean) => void;
};

export default function ProductExtraEditor({ title, free = false, rows, busy, onBusy, onAdd, onUpdate, onRemove, onRenameGroup, onSetGroupRequired }: EditorProps) {
  const [error, setError] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const groups = rows.reduce<Record<string, ProductOptionRow[]>>((result, row) => {
    const group = row.group?.trim() || '未分組';
    (result[group] ||= []).push(row);
    return result;
  }, {});

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
      const response = await fetch('/api/upload', { method: 'POST', headers: {}, body });
      const result = await response.json();
      if (!response.ok || !result.url) throw new Error('圖片上傳失敗，請重試。');
      onUpdate(id, 'imageUrl', result.url);
    } catch { setError('圖片上傳失敗，請檢查連線後重試。原有圖片未變更。'); }
    finally { onBusy(false); }
  }

  const addGroup = () => {
    const group = newGroupName.trim();
    if (!group) {
      setError('請先輸入群組名稱。');
      return;
    }
    if (groups[group]) {
      setError('已有相同名稱的群組，請直接在該群組下新增商品。');
      return;
    }
    setError('');
    onAdd(group);
    setNewGroupName('');
  };

  const renderRow = (row: ProductOptionRow) => <div key={row.id} className="space-y-2 border-t border-gray-200 pt-4 first:border-t-0 first:pt-0">
    <div className="flex flex-wrap gap-2">
      <input aria-label={`${title}名稱`} required value={row.label} onChange={event => onUpdate(row.id!, 'label', event.target.value)} placeholder="商品名稱" className="min-w-0 flex-1 rounded-lg border px-3 py-2 text-base" />
      {!free && <input aria-label={`${title}加價金額`} required value={row.price} onChange={event => onUpdate(row.id!, 'price', event.target.value)} placeholder="有價格請輸入數字，例如：3000" className="min-w-0 flex-1 rounded-lg border px-3 py-2 text-base" />}
      <button type="button" onClick={() => onRemove(row.id!)} className="px-3 py-2 text-sm text-red-700" aria-label={`移除${row.label || title}`}>移除</button>
    </div>
    <div className="flex flex-wrap items-center gap-3">
      {row.imageUrl && <>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={row.imageUrl} alt={row.label || title} className="h-20 w-20 rounded-lg bg-gray-50 object-contain" />
        <button type="button" onClick={() => onUpdate(row.id!, 'imageUrl', '')} className="inline-flex h-12 items-center gap-2 rounded-lg border border-dashed border-red-300 bg-white px-4 text-sm font-medium text-red-700 transition-colors hover:border-red-500 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-300" aria-label={`移除${row.label || title}圖片`}><Trash2 className="h-5 w-5" aria-hidden="true" /><span>移除圖片</span></button>
      </>}
      <label className="inline-flex h-12 cursor-pointer items-center gap-2 rounded-lg border border-dashed border-gray-400 bg-white px-4 text-sm font-medium text-gray-700 transition-colors hover:border-[#AA7452] hover:bg-[#F9F7F0] hover:text-[#8F5F43] focus-within:ring-2 focus-within:ring-[#AA7452] disabled:cursor-not-allowed">
        <Upload className="h-5 w-5" aria-hidden="true" />
        <span>{row.imageUrl ? '更換圖片' : '選擇圖片'}</span>
        <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" aria-label={`${row.label || title}圖片`} className="sr-only" onChange={event => { const file = event.target.files?.[0]; if (file) void upload(file, row.id!); event.target.value = ''; }} />
      </label>
    </div>
  </div>;

  return <fieldset disabled={busy} className="rounded-xl border border-gray-200 p-4 disabled:opacity-70">
    <legend className="px-1 text-sm font-semibold">{title}</legend>
    <p className="mb-4 text-sm text-gray-600">{free ? '不增加費用；先建立群組，再在群組內新增商品。前臺同一群組限選一項。' : '每個勾選項目加價一次，前臺可複選。'} 每個項目可上傳一張圖片。</p>
    {free ? <div className="space-y-4">
      {Object.entries(groups).map(([group, groupRows]) => <section key={group} className="rounded-xl border border-[#e5ddd4] bg-[#fcfaf7] p-4">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <input value={group === '未分組' ? '' : group} onChange={event => onRenameGroup?.(group, event.target.value)} placeholder={group === '未分組' ? '未分組：請輸入群組名稱' : '群組名稱'} className="min-w-0 flex-1 rounded-lg border border-[#d7c5b5] bg-white px-3 py-2 text-base font-medium text-[#4A4947]" aria-label="選配群組名稱" />
          <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 whitespace-nowrap rounded-lg border border-[#d7c5b5] bg-white px-3 py-2 text-sm font-medium text-[#805e45]"><input type="checkbox" checked={groupRows.some(row => row.required)} onChange={event => onSetGroupRequired?.(group, event.target.checked)} className="h-4 w-4 accent-[#AA7452]" />選配必選</label>
          <span className="text-sm text-[#805e45]">同組限選一項</span>
          <button type="button" onClick={() => onAdd(group === '未分組' ? '' : group, groupRows.some(row => row.required))} className="inline-flex items-center gap-1 rounded-lg border border-[#aa7452] bg-white px-3 py-2 text-sm font-medium text-[#805e45] hover:bg-[#f9f1e8]"><Plus className="h-4 w-4" />新增商品</button>
        </div>
        <div className="space-y-4">{groupRows.map(renderRow)}</div>
      </section>)}
      {!rows.length && <p className="text-sm text-gray-600">尚未設定，請先建立選配群組。</p>}
      <div className="flex flex-wrap gap-2 border-t border-gray-200 pt-4">
        <input value={newGroupName} onChange={event => setNewGroupName(event.target.value)} placeholder="新群組名稱，例如：啟動方式" className="min-w-0 flex-1 rounded-lg border px-3 py-2 text-base" aria-label="新選配群組名稱" />
        <button type="button" onClick={addGroup} className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-50"><Plus className="h-4 w-4" />新增群組</button>
      </div>
    </div> : <div className="space-y-4">{rows.map(renderRow)}<button type="button" onClick={() => onAdd()} className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-50"><Plus className="h-4 w-4" />新增{title}</button></div>}
    {busy && <p role="status" className="mt-2 text-sm">圖片上傳中，完成後即可儲存。</p>}
    {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
  </fieldset>;
}
