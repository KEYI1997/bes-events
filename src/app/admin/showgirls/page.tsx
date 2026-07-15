'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Upload, Eye, EyeOff } from 'lucide-react';
import type { ShowGirl } from '@/lib/types';

const EMPTY_SHOWGIRL = {
  name: '', image_url: '', height: 165, measurements: '', visible: true, sort_order: 0,
};

export default function ShowGirlsPage() {
  const [showgirls, setShowgirls] = useState<ShowGirl[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<ShowGirl | null>(null);
  const [form, setForm] = useState(EMPTY_SHOWGIRL);
  const [uploading, setUploading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const getHeaders = () => ({ 'x-admin-password': localStorage.getItem('admin_password') || '' });

  const fetchData = async () => {
    const res = await fetch('/api/admin?table=showgirls', { headers: getHeaders() });
    const json = await res.json();
    setShowgirls(json.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY_SHOWGIRL); setShowModal(true); };
  const openEdit = (s: ShowGirl) => {
    setEditing(s);
    setForm({ name: s.name, image_url: s.image_url, height: s.height, measurements: s.measurements, visible: s.visible, sort_order: s.sort_order });
    setShowModal(true);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', 'showgirls');
    const res = await fetch('/api/upload', { method: 'POST', headers: getHeaders(), body: fd });
    const json = await res.json();
    if (json.url) setForm(f => ({ ...f, image_url: json.url }));
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const headers = { ...getHeaders(), 'Content-Type': 'application/json' };
    if (editing) {
      await fetch('/api/admin', { method: 'PUT', headers, body: JSON.stringify({ table: 'showgirls', id: editing.id, record: form }) });
    } else {
      await fetch('/api/admin', { method: 'POST', headers, body: JSON.stringify({ table: 'showgirls', record: form }) });
    }
    setShowModal(false);
    fetchData();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await fetch('/api/admin', { method: 'DELETE', headers: { ...getHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify({ table: 'showgirls', id: deleteId }) });
    setDeleteId(null);
    fetchData();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: '#4A4947' }}>Show Girl 管理</h1>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-medium hover:opacity-90 transition" style={{ backgroundColor: '#AA7452' }}>
          <Plus className="w-4 h-4" /> 新增
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">載入中...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b" style={{ backgroundColor: '#FFFFFF' }}>
                <tr>
                  <th className="px-4 py-3 text-left">照片</th>
                  <th className="px-4 py-3 text-left">名稱</th>
                  <th className="px-4 py-3 text-center">身高</th>
                  <th className="px-4 py-3 text-center">三圍</th>
                  <th className="px-4 py-3 text-center">排序</th>
                  <th className="px-4 py-3 text-center">狀態</th>
                  <th className="px-4 py-3 text-center">操作</th>
                </tr>
              </thead>
              <tbody>
                {showgirls.map(s => (
                  <tr key={s.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {s.image_url ? <img src={s.image_url} alt={s.name} className="w-12 h-16 rounded-lg object-cover" /> : <div className="w-12 h-16 rounded-lg bg-gray-100" />}
                    </td>
                    <td className="px-4 py-3 font-medium">{s.name}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{s.height} cm</td>
                    <td className="px-4 py-3 text-center text-gray-600">{s.measurements}</td>
                    <td className="px-4 py-3 text-center text-gray-500">{s.sort_order}</td>
                    <td className="px-4 py-3 text-center">{s.visible ? <Eye className="w-4 h-4 text-green-500 mx-auto" /> : <EyeOff className="w-4 h-4 text-gray-400 mx-auto" />}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg hover:bg-gray-100"><Pencil className="w-4 h-4 text-gray-600" /></button>
                        <button onClick={() => setDeleteId(s.id)} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 className="w-4 h-4 text-red-500" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {showgirls.length === 0 && <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400">尚無 Show Girl 資料</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-bold" style={{ color: '#4A4947' }}>{editing ? '編輯 Show Girl' : '新增 Show Girl'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-gray-100"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">名稱 *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">照片</label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-4 py-2 border border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                    <Upload className="w-4 h-4" />
                    <span className="text-sm">{uploading ? '上傳中...' : '選擇照片'}</span>
                    <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
                  </label>
                  {form.image_url && <img src={form.image_url} alt="preview" className="w-12 h-16 rounded-lg object-cover" />}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">身高 (cm)</label>
                  <input type="number" value={form.height} onChange={e => setForm(f => ({ ...f, height: Number(e.target.value) }))} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">三圍</label>
                  <input value={form.measurements} onChange={e => setForm(f => ({ ...f, measurements: e.target.value }))} placeholder="34/24/35" className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">排序</label>
                  <input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2" />
                </div>
                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.visible} onChange={e => setForm(f => ({ ...f, visible: e.target.checked }))} className="w-4 h-4 rounded" />
                    <span className="text-sm">顯示於前台</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">取消</button>
                <button type="submit" className="px-4 py-2 text-white rounded-lg text-sm font-medium hover:opacity-90" style={{ backgroundColor: '#AA7452' }}>{editing ? '更新' : '新增'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold mb-2" style={{ color: '#4A4947' }}>確認刪除</h3>
            <p className="text-gray-600 text-sm mb-6">確定要刪除嗎？此操作無法復原。</p>
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
