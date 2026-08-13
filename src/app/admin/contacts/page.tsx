'use client';

import { useState, useEffect } from 'react';
import { Trash2, Eye, ArrowRightCircle, MessageSquare, CheckCircle, StickyNote, Filter } from 'lucide-react';
import type { Contact, Product } from '@/lib/types';
import { getServiceDefinition, SERVICE_DEFINITIONS } from '@/lib/services';

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [detail, setDetail] = useState<Contact | null>(null);
  const [convertContact, setConvertContact] = useState<Contact | null>(null);
  const [selectedServiceType, setSelectedServiceType] = useState('其他');
  const [staffNoteEdit, setStaffNoteEdit] = useState<{ id: string; note: string } | null>(null);
  
  // 篩選狀態
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'replied' | 'converted'>('all');
  const [filterServiceType, setFilterServiceType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'event_date_asc' | 'event_date_desc'>('newest');
  
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
  const [convertError, setConvertError] = useState('');

  const selectedService = getServiceDefinition(selectedServiceType);
  const availableProducts = products.filter(product =>
    product.visible && (
      selectedService.productCategories.length === 0 ||
      selectedService.productCategories.includes(product.category)
    )
  );

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

  // 管理員憑證只存在瀏覽器，頁面掛載後載入一次。
  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
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
    setConvertError('');
    const service = getServiceDefinition(contact.service_type);
    setSelectedServiceType(service.label);
    const productMatch = (contact.description || '').match(/【詢問商品】(.+)/);
    const matchedProduct = productMatch
      ? products.find(p => p.name === productMatch[1].trim())
      : null;
    const serviceProducts = products.filter(product =>
      product.visible && (
        service.productCategories.length === 0 ||
        service.productCategories.includes(product.category)
      )
    );
    const matchedServiceProduct = matchedProduct && serviceProducts.some(product => product.id === matchedProduct.id)
      ? matchedProduct
      : null;

    setOrderForm({
      product_id: matchedServiceProduct?.id || (serviceProducts.length === 1 ? serviceProducts[0].id : ''),
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
    setConvertError('');
    if (!orderForm.product_id || !orderForm.borrow_date || !orderForm.return_date) {
      setConvertError('請選擇服務方案並填寫完整日期。');
      return;
    }
    setConverting(true);
    try {
      const now = new Date();
      const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
      const timePart = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}${String(now.getMilliseconds()).padStart(3, '0')}`;
      const normalizedPhone = orderForm.customer_phone.replace(/[\s\-()]/g, '').replace(/^\+886/, '0').replace(/^886/, '0');
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { ...getHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: 'orders',
          record: {
            ...orderForm,
            customer_phone: normalizedPhone,
            order_code: `BES-${datePart}-${timePart}`,
          },
        }),
      });
      if (res.ok) {
        setConvertSuccess(true);
        if (convertContact) {
          await markAsConverted(convertContact.id);
        }
        fetchData();
      } else {
        const result = await res.json().catch(() => null);
        setConvertError(result?.error || '訂單建立失敗，請稍後再試。');
      }
    } catch (err) {
      console.error(err);
      setConvertError('網路連線失敗，請稍後再試。');
    }
    setConverting(false);
  };

  // 取得列的背景色
  const getRowBgColor = (contact: Contact) => {
    if (contact.status === 'converted') return 'bg-green-50';
    if (contact.status === 'replied') return 'bg-gray-100';
    if (!contact.read) return 'bg-amber-50/50';
    return '';
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

  // 篩選後的資料
  const filteredContacts = contacts
    .filter(c => {
      // 狀態篩選
      if (filterStatus !== 'all') {
        if (filterStatus === 'pending' && (c.status === 'replied' || c.status === 'converted')) return false;
        if (filterStatus === 'replied' && c.status !== 'replied') return false;
        if (filterStatus === 'converted' && c.status !== 'converted') return false;
      }
      // 服務類型篩選
      if (filterServiceType !== 'all' && c.service_type !== filterServiceType) return false;
      return true;
    })
    .sort((a, b) => {
      // 排序
      if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sortBy === 'event_date_asc') return new Date(a.event_date || '9999-12-31').getTime() - new Date(b.event_date || '9999-12-31').getTime();
      if (sortBy === 'event_date_desc') return new Date(b.event_date || '0000-01-01').getTime() - new Date(a.event_date || '0000-01-01').getTime();
      return 0;
    });

  // 取得所有服務類型（去重）
  const serviceTypes = [...new Set(contacts.map(c => c.service_type).filter(Boolean))];

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

      {/* 篩選區 */}
      <div className="mb-4 flex flex-wrap items-center gap-4">
        {/* 狀態篩選 */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-500">狀態：</span>
          <div className="flex gap-1">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 text-sm rounded-lg border transition ${
                filterStatus === 'all' 
                  ? 'bg-gray-800 text-white border-gray-800' 
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
              }`}
            >
              全部
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-3 py-1.5 text-sm rounded-lg border transition ${
                filterStatus === 'pending' 
                  ? 'bg-amber-500 text-white border-amber-500' 
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
              }`}
            >
              待處理
            </button>
            <button
              onClick={() => setFilterStatus('replied')}
              className={`px-3 py-1.5 text-sm rounded-lg border transition ${
                filterStatus === 'replied' 
                  ? 'bg-gray-500 text-white border-gray-500' 
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
              }`}
            >
              已回覆
            </button>
            <button
              onClick={() => setFilterStatus('converted')}
              className={`px-3 py-1.5 text-sm rounded-lg border transition ${
                filterStatus === 'converted' 
                  ? 'bg-green-500 text-white border-green-500' 
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
              }`}
            >
              已轉訂單
            </button>
          </div>
        </div>

        {/* 服務類型篩選 */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">服務類型：</span>
          <select
            value={filterServiceType}
            onChange={e => setFilterServiceType(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 bg-white"
          >
            <option value="all">全部</option>
            {serviceTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* 排序 */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">排序：</span>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as typeof sortBy)}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 bg-white"
          >
            <option value="newest">提交時間（新→舊）</option>
            <option value="oldest">提交時間（舊→新）</option>
            <option value="event_date_asc">活動日期（近→遠）</option>
            <option value="event_date_desc">活動日期（遠→近）</option>
          </select>
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
                {filteredContacts.map(c => (
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
                        <StickyNote className="w-3 h-3 inline-block ml-1 text-amber-500" />
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
                        <button onClick={() => setDeleteId(c.id)} className="p-1.5 rounded-lg hover:bg-red-50" title="刪除">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredContacts.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                      {contacts.length === 0 ? '尚無諮詢紀錄' : '沒有符合篩選條件的紀錄'}
                    </td>
                  </tr>
                )}
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
                    <MessageSquare className="w-4 h-4" /> 標記已回覆
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
                  <label className="block text-sm font-medium mb-1">服務大項 *</label>
                  <select
                    value={selectedServiceType}
                    onChange={e => {
                      const service = getServiceDefinition(e.target.value);
                      const nextProducts = products.filter(product =>
                        product.visible && (
                          service.productCategories.length === 0 ||
                          service.productCategories.includes(product.category)
                        )
                      );
                      setSelectedServiceType(service.label);
                      setOrderForm(form => ({
                        ...form,
                        product_id: nextProducts.length === 1 ? nextProducts[0].id : '',
                      }));
                      setConvertError('');
                    }}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  >
                    {SERVICE_DEFINITIONS.map(service => (
                      <option key={service.key} value={service.label}>{service.label}</option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">原諮詢大項：{convertContact.service_type || '未填寫'}，需要時可在此調整。</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">服務方案／產品 *</label>
                  <select
                    value={orderForm.product_id}
                    onChange={e => setOrderForm(f => ({ ...f, product_id: e.target.value }))}
                    required
                    disabled={availableProducts.length === 0}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    <option value="">{availableProducts.length === 0 ? '此大項尚未建立方案' : '請選擇服務方案'}</option>
                    {availableProducts.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name}（可用數量：{product.stock ?? 0}）
                      </option>
                    ))}
                  </select>
                  {availableProducts.length === 0 && (
                    <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                      目前「{selectedService.label}」沒有可用方案，系統不會改用啟動儀式代替。
                      <a href="/admin/products" className="ml-1 font-medium underline">前往產品管理新增</a>
                    </div>
                  )}
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
                    <label className="block text-sm font-medium mb-1">{selectedService.quantityLabel}</label>
                    <input
                      type="number"
                      min={1}
                      value={orderForm.quantity}
                      onChange={e => setOrderForm(f => ({ ...f, quantity: Number(e.target.value) }))}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">{selectedService.eventNameLabel}</label>
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
                    <label className="block text-sm font-medium mb-1">{selectedService.startDateLabel} *</label>
                    <input
                      type="date"
                      value={orderForm.borrow_date}
                      onChange={e => setOrderForm(f => ({ ...f, borrow_date: e.target.value }))}
                      required
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">{selectedService.endDateLabel} *</label>
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
                    placeholder={selectedService.notePlaceholder}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm"
                  />
                </div>

                {convertError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {convertError}
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setConvertContact(null)} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">取消</button>
                  <button
                    type="submit"
                    disabled={converting || availableProducts.length === 0 || !orderForm.product_id}
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
