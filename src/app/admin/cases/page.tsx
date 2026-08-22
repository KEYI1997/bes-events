'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Upload, Eye, EyeOff, RefreshCw } from 'lucide-react';
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableTableRow } from '@/components/admin/SortableTableRow';
import type { Case } from '@/lib/types';

const CATEGORIES = ['開幕典禮', '記者會', '新品發表會', '展覽攤位', '政府活動', '春酒尾牙', '典禮節慶'] as const;
const SERVICE_TYPES = ['活動策劃統包', '啟動儀式', '活動特效', '燈光音響舞台', '外派調酒', 'SHOW GIRL', '其他'] as const;

const EMPTY_CASE = {
  title: '', category: '開幕典禮' as string, service_type: '',
  description: '', image_url: '', client_name: '', event_date: '', visible: true, sort_order: 0,
};

export default function CasesPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Case | null>(null);
  const [form, setForm] = useState(EMPTY_CASE);
  const [uploading, setUploading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);
  const [syncingFacebook, setSyncingFacebook] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const getHeaders = () => ({ 'x-admin-password': localStorage.getItem('admin_password') || '' });

  const fetchData = async () => {
    const res = await fetch('/api/admin?table=cases', { headers: getHeaders() });
    const json = await res.json();
    const sorted = (json.data || []).sort((a: Case, b: Case) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    setCases(sorted);
    setLoading(false);
  };

  // 管理員憑證只存在瀏覽器，頁面掛載後載入一次。
  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setEditing(null);
    const maxOrder = cases.length > 0 ? Math.max(...cases.map(c => c.sort_order ?? 0)) + 1 : 1;
    setForm({ ...EMPTY_CASE, sort_order: maxOrder });
    setShowModal(true);
  };

  const openEdit = (c: Case) => {
    setEditing(c);
    setForm({ title: c.title, category: c.category, service_type: c.service_type || '', description: c.description, image_url: c.image_url, client_name: c.client_name, event_date: c.event_date, visible: c.visible, sort_order: c.sort_order ?? 0 });
    setShowModal(true);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', 'cases');
    const res = await fetch('/api/upload', { method: 'POST', headers: getHeaders(), body: fd });
    const json = await res.json();
    if (json.url) setForm(f => ({ ...f, image_url: json.url }));
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const headers = { ...getHeaders(), 'Content-Type': 'application/json' };
    if (editing) {
      await fetch('/api/admin', { method: 'PUT', headers, body: JSON.stringify({ table: 'cases', id: editing.id, record: form }) });
    } else {
      await fetch('/api/admin', { method: 'POST', headers, body: JSON.stringify({ table: 'cases', record: form }) });
    }
    setShowModal(false);
    fetchData();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await fetch('/api/admin', { method: 'DELETE', headers: { ...getHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify({ table: 'cases', id: deleteId }) });
    setDeleteId(null);
    fetchData();
  };

  const handleFacebookSync = async () => {
    setSyncingFacebook(true);
    try {
      const response = await fetch('/api/admin/facebook-case-sync', {
        method: 'POST',
        headers: getHeaders(),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || 'Facebook 同步失敗');
      const failedMessage = json.failed?.length ? `\n${json.failed.length} 篇圖片或資料處理失敗，可稍後再試。` : '';
      alert(`Facebook 同步完成：新增 ${json.imported} 筆草稿、略過 ${json.skipped} 筆既有或無圖片貼文。${failedMessage}`);
      await fetchData();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Facebook 同步失敗');
    } finally {
      setSyncingFacebook(false);
    }
  };

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id || savingOrder) return;
    const from = cases.findIndex(item => item.id === active.id);
    const to = cases.findIndex(item => item.id === over.id);
    if (from < 0 || to < 0) return;

    const reordered = arrayMove(cases, from, to);
    const updated = reordered.map((c, i) => ({ ...c, sort_order: i + 1 }));
    setCases(updated);
    setSavingOrder(true);
    const headers = { ...getHeaders(), 'Content-Type': 'application/json' };

    try {
      const responses = await Promise.all(updated.map(c =>
        fetch('/api/admin', { method: 'PUT', headers, body: JSON.stringify({ table: 'cases', id: c.id, record: { sort_order: c.sort_order } }) })
      ));
      if (responses.some(response => !response.ok)) throw new Error('排序儲存失敗');
    } catch {
      alert('排序儲存失敗，已重新載入原順序。');
      await fetchData();
    } finally {
      setSavingOrder(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: '#4A4947' }}>案例管理</h1>
        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-gray-500 sm:inline">{savingOrder ? '正在儲存排列順序…' : '按住手掌即可拖曳排序'}</span>
          <button onClick={handleFacebookSync} disabled={syncingFacebook} className="flex items-center gap-2 rounded-lg border border-[#AA7452] px-4 py-2 text-sm font-medium text-[#AA7452] transition hover:bg-[#AA745210] disabled:cursor-not-allowed disabled:opacity-60">
            <RefreshCw className={`w-4 h-4 ${syncingFacebook ? 'animate-spin' : ''}`} />
            {syncingFacebook ? '同步中…' : '從 Facebook 同步'}
          </button>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-medium hover:opacity-90 transition" style={{ backgroundColor: '#AA7452' }}>
            <Plus className="w-4 h-4" /> 新增案例
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">載入中...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-4 py-3 w-10"></th>
                  <th className="px-4 py-3 text-left text-gray-500 font-medium">圖片</th>
                  <th className="px-4 py-3 text-left text-gray-500 font-medium">活動名稱</th>
                  <th className="px-4 py-3 text-left text-gray-500 font-medium">活動類型</th>
                  <th className="px-4 py-3 text-left text-gray-500 font-medium">服務項目</th>
                  <th className="px-4 py-3 text-left text-gray-500 font-medium">主辦方</th>
                  <th className="px-4 py-3 text-left text-gray-500 font-medium">活動日期</th>
                  <th className="px-4 py-3 text-center text-gray-500 font-medium">狀態</th>
                  <th className="px-4 py-3 text-center text-gray-500 font-medium">操作</th>
                </tr>
              </thead>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={cases.map(item => item.id)} strategy={verticalListSortingStrategy}>
                  <tbody>
                {cases.map(c => (
                  <SortableTableRow
                    key={c.id}
                    id={c.id}
                    disabled={savingOrder}
                    className="border-b last:border-0 hover:bg-gray-50"
                    handleCellClassName="px-4 py-3"
                    label={`拖曳調整 ${c.title} 的順序`}
                  >
                    <td className="px-4 py-3">
                      {c.image_url ? <img src={c.image_url} alt={c.title} className="w-12 h-12 rounded-lg object-cover" /> : <div className="w-12 h-12 rounded-lg bg-gray-100" />}
                    </td>
                    <td className="px-4 py-3 font-medium">{c.title}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded text-xs" style={{ backgroundColor: '#AA745220', color: '#AA7452' }}>{c.category}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{c.service_type || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{c.client_name || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{c.event_date || '—'}</td>
                    <td className="px-4 py-3 text-center">
                      {c.visible ? <Eye className="w-4 h-4 text-green-500 mx-auto" /> : <EyeOff className="w-4 h-4 text-gray-400 mx-auto" />}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-gray-100"><Pencil className="w-4 h-4 text-gray-600" /></button>
                        <button onClick={() => setDeleteId(c.id)} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 className="w-4 h-4 text-red-500" /></button>
                      </div>
                    </td>
                  </SortableTableRow>
                ))}
                {cases.length === 0 && <tr><td colSpan={9} className="px-4 py-12 text-center text-gray-400">尚無案例資料</td></tr>}
                  </tbody>
                </SortableContext>
              </DndContext>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-bold" style={{ color: '#4A4947' }}>{editing ? '編輯案例' : '新增案例'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-gray-100"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">活動名稱 *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2" placeholder="例：2025 品牌教育啟動典禮" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">主辦方</label>
                <input value={form.client_name} onChange={e => setForm(f => ({ ...f, client_name: e.target.value }))} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2" placeholder="例：教育部" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">活動類型 *</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">服務項目</label>
                <select value={form.service_type} onChange={e => setForm(f => ({ ...f, service_type: e.target.value }))} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2">
                  <option value="">請選擇</option>
                  {SERVICE_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">活動日期</label>
                <input type="date" value={form.event_date} onChange={e => setForm(f => ({ ...f, event_date: e.target.value }))} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">描述</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2" placeholder="活動簡介..." />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">圖片</label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-4 py-2 border border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                    <Upload className="w-4 h-4" />
                    <span className="text-sm">{uploading ? '上傳中...' : '選擇圖片'}</span>
                    <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
                  </label>
                  {form.image_url && <img src={form.image_url} alt="preview" className="w-12 h-12 rounded-lg object-cover" />}
                </div>
              </div>
              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.visible} onChange={e => setForm(f => ({ ...f, visible: e.target.checked }))} className="w-4 h-4 rounded" />
                  <span className="text-sm">顯示於前台</span>
                </label>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">取消</button>
                <button type="submit" className="px-4 py-2 text-white rounded-lg text-sm font-medium hover:opacity-90" style={{ backgroundColor: '#AA7452' }}>{editing ? '更新' : '新增'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold mb-2" style={{ color: '#4A4947' }}>確認刪除</h3>
            <p className="text-gray-600 text-sm mb-6">確定要刪除此案例嗎？此操作無法復原。</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">取消</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600">刪除</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
