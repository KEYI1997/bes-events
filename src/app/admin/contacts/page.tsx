'use client';

import { useState, useEffect } from 'react';
import { Trash2, Mail, MailOpen, Eye } from 'lucide-react';
import type { Contact } from '@/lib/types';

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [detail, setDetail] = useState<Contact | null>(null);

  const getHeaders = () => ({ 'x-admin-password': localStorage.getItem('admin_password') || '' });

  const fetchData = async () => {
    const res = await fetch('/api/admin?table=contacts', { headers: getHeaders() });
    const json = await res.json();
    setContacts(json.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const markAsRead = async (id: string) => {
    await fetch('/api/admin', {
      method: 'PUT',
      headers: { ...getHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ table: 'contacts', id, record: { read: true } }),
    });
    fetchData();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await fetch('/api/admin', {
      method: 'DELETE',
      headers: { ...getHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ table: 'contacts', id: deleteId }),
    });
    setDeleteId(null);
    fetchData();
  };

  const unreadCount = contacts.filter(c => !c.read).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#4A4947' }}>諮詢紀錄</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-red-500 mt-1">🔴 {unreadCount} 筆未讀</p>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">載入中...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b" style={{ backgroundColor: '#FFFFFF' }}>
                <tr>
                  <th className="px-4 py-3 text-center">狀態</th>
                  <th className="px-4 py-3 text-left">姓名</th>
                  <th className="px-4 py-3 text-left">電話</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">服務類型</th>
                  <th className="px-4 py-3 text-left">活動日期</th>
                  <th className="px-4 py-3 text-left">提交時間</th>
                  <th className="px-4 py-3 text-center">操作</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map(c => (
                  <tr key={c.id} className={`border-b last:border-0 hover:bg-gray-50 ${!c.read ? 'bg-amber-50/50' : ''}`}>
                    <td className="px-4 py-3 text-center">
                      {c.read
                        ? <MailOpen className="w-4 h-4 text-gray-400 mx-auto" />
                        : <Mail className="w-4 h-4 text-red-500 mx-auto" />
                      }
                    </td>
                    <td className="px-4 py-3 font-medium">{c.name}</td>
                    <td className="px-4 py-3 text-gray-600">{c.phone}</td>
                    <td className="px-4 py-3 text-gray-600">{c.email}</td>
                    <td className="px-4 py-3"><span className="px-2 py-1 rounded text-xs" style={{ backgroundColor: '#AA745220', color: '#AA7452' }}>{c.service_type}</span></td>
                    <td className="px-4 py-3 text-gray-600">{c.event_date}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{new Date(c.created_at).toLocaleString('zh-TW')}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => { setDetail(c); if (!c.read) markAsRead(c.id); }} className="p-1.5 rounded-lg hover:bg-gray-100" title="檢視">
                          <Eye className="w-4 h-4 text-gray-600" />
                        </button>
                        {!c.read && (
                          <button onClick={() => markAsRead(c.id)} className="p-1.5 rounded-lg hover:bg-gray-100" title="標記已讀">
                            <MailOpen className="w-4 h-4 text-blue-500" />
                          </button>
                        )}
                        <button onClick={() => setDeleteId(c.id)} className="p-1.5 rounded-lg hover:bg-red-50" title="刪除">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {contacts.length === 0 && <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400">尚無諮詢紀錄</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detail && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-bold" style={{ color: '#4A4947' }}>諮詢詳情</h2>
              <button onClick={() => setDetail(null)} className="p-1 rounded-lg hover:bg-gray-100 text-xl">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-gray-500">姓名</p><p className="font-medium">{detail.name}</p></div>
                <div><p className="text-xs text-gray-500">電話</p><p className="font-medium">{detail.phone}</p></div>
                <div><p className="text-xs text-gray-500">Email</p><p className="font-medium">{detail.email}</p></div>
                <div><p className="text-xs text-gray-500">服務類型</p><p className="font-medium">{detail.service_type}</p></div>
                <div><p className="text-xs text-gray-500">預算</p><p className="font-medium">{detail.budget}</p></div>
                <div><p className="text-xs text-gray-500">活動日期</p><p className="font-medium">{detail.event_date}</p></div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">需求描述</p>
                <p className="text-sm bg-gray-50 rounded-lg p-3">{detail.description || '（無）'}</p>
              </div>
              <div className="text-xs text-gray-400">
                提交時間：{new Date(detail.created_at).toLocaleString('zh-TW')}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold mb-2" style={{ color: '#4A4947' }}>確認刪除</h3>
            <p className="text-gray-600 text-sm mb-6">確定要刪除此諮詢紀錄嗎？此操作無法復原。</p>
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
