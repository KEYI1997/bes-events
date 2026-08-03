'use client';

import { useState, useEffect } from 'react';
import { Trash2, Mail, MailOpen, Eye, ArrowRightCircle, MessageSquare, CheckCircle, StickyNote } from 'lucide-react';
import type { Contact, Product } from '@/lib/types';

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [detail, setDetail] = useState<Contact | null>(null);
  const [convertContact, setConvertContact] = useState<Contact | null>(null);
  const [staffNoteEdit, setStaffNoteEdit] = useState<{ id: string; note: string } | null>(null);
  const [orderForm, setOrderForm] = useState({
    product_id: '',
    customer_name: '',
    customer_phone: '',
    quantity: 1,
    borrow_date: '',
    return_date: '',
    event_name: '',
    note: '',
    status: '已預約' as const,
  });
  const [converting, setConverting] = useState(false);
  const [convertSuccess, setConvertSuccess] = useState(false);

  const getHeaders = () => ({ 'x-admin-password': localStorage.getItem('admin_password') || '' });

  const fetchData = async () => {
    const [contactsRes, productsRes] = await Promise.all([
      fetch('/api/admin?table=contacts', { headers: getHeaders() }),
      fetch('/api/admin?table=products', { headers: getHeaders() }),
    ]);
    const contactsJson = await contactsRes.json();
    const productsJson = await productsRes.json();
    setContacts(contactsJson.data || []);
    setProducts(productsJson.data || []);
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

  // 標記為已回覆
  const markAsReplied = async (id: string) => {
    await fetch('/api/admin', {
      method: 'PUT',
      headers: { ...getHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ table: 'contacts', id, record: { read: true, status: 'replied' } }),
    });
    fetchData();
  };

  // 標記為已轉訂單
  const markAsConverted = async (id: string) => {
    await fetch('/api/admin', {
      method: 'PUT',
      headers: { ...getHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ table: 'contacts', id, record: { read: true, status: 'converted' } }),
    });
    fetchData();
  };

  // 儲存工作人員備註
  const saveStaffNote = async () => {
    if (!staffNoteEdit) return;
    await fetch('/api/admin', {
      method: 'PUT',
      headers: { ...getHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ table: 'contacts', id: staffNoteEdit.id, record: { staff_note: staffNoteEdit.note } }),
    });
    setStaffNoteEdit(null);
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

  const openConvert = (contact: Contact) => {
    setDetail(null);
    setConvertContact(contact);
    setConvertSuccess(false);
    const productMatch = (contact.description || '').match(/【詢問商品】(.+)/);
    const matchedProduct = productMatch
      ? products.find(p => p.name === productMatch[1].trim())
      : null;

    setOrderForm({
      product_id: matchedProduct?.id || '',
      customer_name: contact.name,
      customer_phone: contact.phone,
      quantity: 1,
      borrow_date: contact.event_date || '',
      return_date: contact.event_end_date || '',
      event_name: '',
      note: contact.description || '',
      status: '已預約',
    });
  };

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderForm.product_id || !orderForm.borrow_date || !orderForm.return_date) return;
    setConverting(true);
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { ...getHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: 'orders', record: orderForm }),
      });
      if (res.ok) {
        setConvertSuccess(true);
        if (convertContact) {
          await markAsConverted(convertContact.id);
        }
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
    setConverting(false);
  };

  // 取得列的背景色
  const getRowBgColor = (contact: Contact) => {
    if (contact.status === 'converted') return 'bg-green-50'; // 已轉訂單 - 淺綠色
    if (contact.status === 'replied') return 'bg-gray-100'; // 已回覆 - 淺灰色
    if (!contact.read) return 'bg-amber-50/50'; // 未讀 - 淺黃色
    return ''; // 預設
  };

  // 取得狀態標籤
  const getStatusBadge = (contact: Contact) => {
    if (contact.status === 'converted') {
      return <span className="px-2 py-0.5 rounded text-xs bg-green-100 text-green-700">已轉訂單</span>;
    }
    if (contact.status === 'replied') {
      return <span className="px-2 py-0.5 rounded text-xs bg-gray-200 text-gray-600">已回覆</span>;
    }
    if (!contact.read) {
      return <span className="px-2 py-0.5 rounded text-xs bg-red-100 text-red-600">未讀</span>;
    }
    return <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-500">已讀</span>;
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
        <div className="flex gap-2 text-xs">
          <span className="px-2 py-1 rounded bg-green-50 text-green-700">淺綠 = 已轉訂單</span>
          <span className="px-2 py-1 rounded bg-gray-100 text-gray-600">淺灰 = 已回覆</span>
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
                  <th className="px-4 py-3 text-left">服務類型</th>
                  <th className="px-4 py-3 text-left">活動日期</th>
                  <th className="px-4 py-3 text-left">提交時間</th>
                  <th className="px-4 py-3 text-center">操作</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map(c => (
                  <tr 
                    key={c.id} 
                    onClick={() => { setDetail(c); if (!c.read) markAsRead(c.id); }} 
                    className={`border-b last:border-0 hover:opacity-80 cursor-pointer transition-colors ${getRowBgColor(c)}`}
                  >
                    <td className="px-4 py-3 text-center">
                      {getStatusBadge(c)}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {c.name}
                      {c.staff_note && (
                        <StickyNote className="w-3 h-3 inline-block ml-1 text-amber-500" title="有工作人員備註" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{c.phone}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded text-xs" style={{ backgroundColor: '#AA745220', color: '#AA7452' }}>
                        {c.service_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{c.event_date}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{new Date(c.created_at).toLocaleString('zh-TW')}</td>
                    <td className="px-4 py-3 text-center" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => { setDetail(c); if (!c.read) markAsRead(c.id); }} className="p-1.5 rounded-lg hover:bg-white/50" title="檢視">
                          <Eye className="w-4 h-4 text-gray-600" />
                        </button>
                        {c.status !== 'replied' && c.status !== 'converted' && (
                          <button onClick={() => markAsReplied(c.id)} className="p-1.5 rounded-lg hover:bg-white/50" title="標記已回覆">
                            <MessageSquare className="w-4 h-4 text-gray-500" />
                          </button>
                        )}
                        {c.status !== 'converted' && (
                          <button onClick={() => openConvert(c)} className="p-1.5 rounded-lg hover:bg-white/50" title="轉為訂單">
                            <ArrowRightCircle className="w-4 h-4 text-green-600" />
                          </button>
                        )}
                        <button onClick={() => setDeleteId(c.id)} className="p-1.5 rounded-lg hover:bg-red-50" title="刪除">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {contacts.length === 0 && <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400">尚無諮詢紀錄</td></tr>}
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
              <div>
                <h2 className="text-lg font-bold" style={{ color: '#4A4947' }}>諮詢詳情</h2>
                <div className="mt-1">{getStatusBadge(detail)}</div>
              </div>
              <button onClick={() => setDetail(null)} className="p-1 rounded-lg hover:bg-gray-100 text-xl">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-gray-500">姓名</p><p className="font-medium">{detail.name}</p></div>
                <div><p className="text-xs text-gray-500">電話</p><p className="font-medium">{detail.phone}</p></div>
                <div><p className="text-xs text-gray-500">Email</p><p className="font-medium">{detail.email}</p></div>
                <div><p className="text-xs text-gray-500">服務類型</p><p className="font-medium">{detail.service_type}</p></div>
                <div><p className="text-xs text-gray-500">活動起日</p><p className="font-medium">{detail.event_date}</p></div>
                <div><p className="text-xs text-gray-500">活動迄日</p><p className="font-medium">{detail.event_end_date}</p></div>
              </div>
              
              {/* 客戶需求描述 */}
              <div>
                <p className="text-xs text-gray-500 mb-1">客戶需求描述</p>
                <p className="text-sm bg-gray-50 rounded-lg p-3 whitespace-pre-wrap">{detail.description || '（無）'}</p>
              </div>

              {/* 工作人員備註 */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <StickyNote className="w-3 h-3" /> 工作人員備註（內部使用）
                  </p>
                  {!staffNoteEdit && (
                    <button 
                      onClick={() => setStaffNoteEdit({ id: detail.id, note: detail.staff_note || '' })}
                      className="text-xs text-blue-500 hover:underline"
                    >
                      編輯
                    </button>
                  )}
                </div>
                {staffNoteEdit && staffNoteEdit.id === detail.id ? (
                  <div>
                    <textarea
                      value={staffNoteEdit.note}
                      onChange={e => setStaffNoteEdit({ ...staffNoteEdit, note: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm"
                      placeholder="記錄後續追蹤、備註事項..."
                    />
                    <div className="flex justify-end gap-2 mt-2">
                      <button 
                        onClick={() => setStaffNoteEdit(null)} 
                        className="px-3 py-1.5 text-xs border rounded-lg hover:bg-gray-50"
                      >
                        取消
                      </button>
                      <button 
                        onClick={saveStaffNote}
                        className="px-3 py-1.5 text-xs text-white rounded-lg hover:opacity-90"
                        style={{ backgroundColor: '#4A4947' }}
                      >
                        儲存
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm bg-amber-50 rounded-lg p-3 whitespace-pre-wrap min-h-[60px]">
                    {detail.staff_note || '（尚無備註）'}
                  </p>
                )}
              </div>

              <div className="text-xs text-gray-400">
                提交時間：{new Date(detail.created_at).toLocaleString('zh-TW')}
              </div>
            </div>
            <div className="p-6 border-t flex justify-between">
              <div className="flex gap-2">
                {detail.status !== 'replied' && detail.status !== 'converted' && (
                  <button
                    onClick={() => { markAsReplied(detail.id); setDetail({ ...detail, status: 'replied' }); }}
                    className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50 transition"
                  >
                    <MessageSquare className="w-4 h-4" /> 已回覆
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                {detail.status !== 'converted' && (
                  <button
                    onClick={() => openConvert(detail)}
                    className="flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-medium hover:opacity-90 transition"
                    style={{ backgroundColor: '#22c55e' }}
                  >
                    <ArrowRightCircle className="w-4 h-4" /> 轉為訂單
                  </button>
                )}
                <button onClick={() => setDetail(null)} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">關閉</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Convert to Order Modal */}
      {convertContact && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-lg font-bold" style={{ color: '#4A4947' }}>轉為訂單</h2>
                <p className="text-sm text-gray-500 mt-0.5">客戶：{convertContact.name}</p>
              </div>
              <button onClick={() => setConvertContact(null)} className="p-1 rounded-lg hover:bg-gray-100 text-xl">✕</button>
            </div>

            {convertSuccess ? (
              <div className="p-6 text-center">
                <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center bg-green-100">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: '#4A4947' }}>訂單建立成功！</h3>
                <p className="text-sm text-gray-500 mb-6">已新增至「訂單 / 行事曆」</p>
                <button onClick={() => setConvertContact(null)} className="px-6 py-2 text-white rounded-lg text-sm font-medium hover:opacity-90" style={{ backgroundColor: '#22c55e' }}>
                  完成
                </button>
              </div>
            ) : (
              <form onSubmit={handleConvert} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">選擇產品 *</label>
                  <select
                    value={orderForm.product_id}
                    onChange={e => setOrderForm(f => ({ ...f, product_id: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  >
                    <option value="">請選擇產品</option>
                    {products.filter(p => p.visible).map(p => (
                      <option key={p.id} value={p.id}>{p.name}（庫存：{p.stock}）</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">客戶姓名</label>
                    <input
                      value={orderForm.customer_name}
                      onChange={e => setOrderForm(f => ({ ...f, customer_name: e.target.value }))}
                      required
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">客戶電話</label>
                    <input
                      value={orderForm.customer_phone}
                      onChange={e => setOrderForm(f => ({ ...f, customer_phone: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">數量</label>
                    <input
                      type="number"
                      min={1}
                      value={orderForm.quantity}
                      onChange={e => setOrderForm(f => ({ ...f, quantity: Number(e.target.value) }))}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">活動名稱</label>
                    <input
                      value={orderForm.event_name}
                      onChange={e => setOrderForm(f => ({ ...f, event_name: e.target.value }))}
                      placeholder="選填"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">借用日期 *</label>
                    <input
                      type="date"
                      value={orderForm.borrow_date}
                      onChange={e => setOrderForm(f => ({ ...f, borrow_date: e.target.value }))}
                      required
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">歸還日期 *</label>
                    <input
                      type="date"
                      value={orderForm.return_date}
                      onChange={e => setOrderForm(f => ({ ...f, return_date: e.target.value }))}
                      required
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">備註</label>
                  <textarea
                    value={orderForm.note}
                    onChange={e => setOrderForm(f => ({ ...f, note: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setConvertContact(null)} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">取消</button>
                  <button
                    type="submit"
                    disabled={converting}
                    className="flex items-center gap-2 px-5 py-2 text-white rounded-lg text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
                    style={{ backgroundColor: '#22c55e' }}
                  >
                    {converting ? '建立中...' : '確認建立訂單'}
                  </button>
                </div>
              </form>
            )}
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
