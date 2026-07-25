'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Upload, Eye, EyeOff } from 'lucide-react';
import type { Client } from '@/lib/types';

const EMPTY_CLIENT = {
  name: '', logo_url: '', visible: true, sort_order: 0,
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [form, setForm] = useState(EMPTY_CLIENT);
  const [uploading, setUploading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const getHeaders = () => ({ 'x-admin-password': localStorage.getItem('admin_password') || '' });

  const fetchData = async () => {
    const res = await fetch('/api/admin?table=clients', { headers: getHeaders() });
    const json = await res.json();
    setClients(json.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY_CLIENT); setShowModal(true); };
  const openEdit = (c: Client) => {
    setEditing(c);
    setForm({ name: c.name, logo_url: c.logo_url, visible: c.visible, sort_order: c.sort_order });
    setShowModal(true);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', 'clients');
    const res = await fetch('/api/upload', { method: 'POST', headers: getHeaders(), body: fd });
    const json = await res.json();
    if (json.url) setForm(f => ({ ...f, logo_url: json.url }));
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const headers = { ...getHeaders(), 'Content-Type': 'application/json' };
    if (editing) {
      await fetch('/api/admin', { method: 'PUT', headers, body: JSON.stringify({ table: 'clients', id: editing.id, record: form }) });
    } else {
      await fetch('/api/admin', { method: 'POST', headers, body: JSON.stringify({ table: 'clients', record: form }) });
    }
    setShowModal(false);
    fetchData();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await fetch('/api/admin', { method: 'DELETE', headers: { ...getHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify({ table: 'clients', id: deleteId }) });
    setDeleteId(null);
    fetchData();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: '#4A4947' }}>客戶管理</h1>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-medium hover:opacity-90 transition" style={{ backgroundColor: '#AA7452' }}>
          <Plus className="w-4 h-4" /> 新增客戶
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
                  <th className="px-4 py-3 text-left">Logo</th>
                  <th className="px-4 py-3 text-left">客戶名稱</th>
                  <th className="px-4 py-3 text-center">排序</th>
                  <th className="px-4 py-3 text-center">狀態</th>
                  <th className="px-4 py-3 text-center">操作</th>
                </tr>
              </thead>
              <tbody>
                {clients.map(c => (
                  <tr key={c.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {c.logo_url ? <img src={c.logo_url} alt={c.name} className="w-16 h-10 rounded object-contain bg-gray-50 p-1" /> : <div className="w-16 h-10 rounded bg-gray-100" />}
                    </td>
                    <td className="px-4 py-3 font-medium">{c.name}</td>
                    <td className="px-4 py-3 text-center text-gray-500">{c.sort_order}</td>
                    <td className="px-4 py-3 text-center">{c.visible ? <Eye className="w-4 h-4 text-green-500 mx-auto" /> : <EyeOff className="w-4 h-4 text-gray-400 mx-auto" />}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-gray-100"><Pencil className="w-4 h-4 text-gray-600" /></button>
                        <button onClick={() => setDeleteId(c.id)} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 className="w-4 h-4 text-red-500" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {clients.length === 0 && <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-400">尚無客戶資料</td></tr>}
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
              <h2 className="text-lg font-bold" style={{ color: '#4A4947' }}>{editing ? '編輯客戶' : '新增客戶'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-gray-100"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">客戶名稱 *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Logo</label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-4 py-2 border border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                    <Upload className="w-4 h-4" />
                    <span className="text-sm">{uploading ? '上傳中...' : '選擇 Logo'}</span>
                    <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
                  </label>
                  {form.logo_url && <img src={form.logo_url} alt="preview" className="w-16 h-10 rounded object-contain bg-gray-50 p-1" />}
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
            <p className="text-gray-600 text-sm mb-6">確定要刪除此客戶嗎？此操作無法復原。</p>
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
