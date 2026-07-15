'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Eye, EyeOff, Star } from 'lucide-react';
import type { Review } from '@/lib/types';

const EMPTY_REVIEW = {
  text: '', rating: 5, author: '', company: '', visible: true,
};

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Review | null>(null);
  const [form, setForm] = useState(EMPTY_REVIEW);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const getHeaders = () => ({ 'x-admin-password': localStorage.getItem('admin_password') || '' });

  const fetchData = async () => {
    const res = await fetch('/api/admin?table=reviews', { headers: getHeaders() });
    const json = await res.json();
    setReviews(json.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY_REVIEW); setShowModal(true); };
  const openEdit = (r: Review) => {
    setEditing(r);
    setForm({ text: r.text, rating: r.rating, author: r.author, company: r.company, visible: r.visible });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const headers = { ...getHeaders(), 'Content-Type': 'application/json' };
    if (editing) {
      await fetch('/api/admin', { method: 'PUT', headers, body: JSON.stringify({ table: 'reviews', id: editing.id, record: form }) });
    } else {
      await fetch('/api/admin', { method: 'POST', headers, body: JSON.stringify({ table: 'reviews', record: form }) });
    }
    setShowModal(false);
    fetchData();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await fetch('/api/admin', { method: 'DELETE', headers: { ...getHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify({ table: 'reviews', id: deleteId }) });
    setDeleteId(null);
    fetchData();
  };

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`w-3.5 h-3.5 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
      ))}
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: '#4A4947' }}>評價管理</h1>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-medium hover:opacity-90 transition" style={{ backgroundColor: '#AA7452' }}>
          <Plus className="w-4 h-4" /> 新增評價
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
                  <th className="px-4 py-3 text-left">評價內容</th>
                  <th className="px-4 py-3 text-center">評分</th>
                  <th className="px-4 py-3 text-left">作者</th>
                  <th className="px-4 py-3 text-left">公司</th>
                  <th className="px-4 py-3 text-center">狀態</th>
                  <th className="px-4 py-3 text-center">操作</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map(r => (
                  <tr key={r.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3 max-w-xs truncate">{r.text}</td>
                    <td className="px-4 py-3">{renderStars(r.rating)}</td>
                    <td className="px-4 py-3 font-medium">{r.author}</td>
                    <td className="px-4 py-3 text-gray-600">{r.company}</td>
                    <td className="px-4 py-3 text-center">{r.visible ? <Eye className="w-4 h-4 text-green-500 mx-auto" /> : <EyeOff className="w-4 h-4 text-gray-400 mx-auto" />}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openEdit(r)} className="p-1.5 rounded-lg hover:bg-gray-100"><Pencil className="w-4 h-4 text-gray-600" /></button>
                        <button onClick={() => setDeleteId(r.id)} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 className="w-4 h-4 text-red-500" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {reviews.length === 0 && <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">尚無評價資料</td></tr>}
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
              <h2 className="text-lg font-bold" style={{ color: '#4A4947' }}>{editing ? '編輯評價' : '新增評價'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-gray-100"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">評價內容 *</label>
                <textarea value={form.text} onChange={e => setForm(f => ({ ...f, text: e.target.value }))} required rows={4} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">評分</label>
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, rating: i + 1 }))}
                      className="p-1"
                    >
                      <Star className={`w-6 h-6 ${i < form.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">作者 *</label>
                  <input value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))} required className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">公司</label>
                  <input value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2" />
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

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold mb-2" style={{ color: '#4A4947' }}>確認刪除</h3>
            <p className="text-gray-600 text-sm mb-6">確定要刪除此評價嗎？此操作無法復原。</p>
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
