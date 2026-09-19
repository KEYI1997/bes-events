'use client';

import { useState, useEffect, useMemo } from 'react';
import { Plus, X, ChevronLeft, ChevronRight, Calendar, List, Trash2, Pencil } from 'lucide-react';
import type { Contact, Product, Order } from '@/lib/types';
import Pagination from '@/components/admin/Pagination';
import { normalizeTaiwanPhone } from '@/lib/phone';

const STATUS_OPTIONS = ['已預約', '出借中', '已歸還', '已結案', '已取消'] as const;
const STATUS_COLORS: Record<string, string> = {
  '已預約': 'bg-blue-100 text-blue-700',
  '出借中': 'bg-orange-100 text-orange-700',
  '已歸還': 'bg-green-100 text-green-700',
  '已結案': 'bg-purple-100 text-purple-700',
  '已取消': 'bg-gray-100 text-gray-500',
};

const EMPTY_ORDER = {
  product_id: '',
  customer_name: '',
  customer_phone: '',
  customer_email: '',
  quantity: 1,
  borrow_date: '',
  return_date: '',
  event_name: '',
  note: '',
  status: '已預約' as Order['status'],
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [calendarInquiries, setCalendarInquiries] = useState<Pick<Contact, 'id' | 'name' | 'service_type' | 'event_date' | 'event_end_date'>[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Record<string, boolean>>({}); // phone -> LINE已綁定
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const pageSize = 50;
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Order | null>(null);
  const [form, setForm] = useState(EMPTY_ORDER);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [view, setView] = useState<'calendar' | 'list'>('list');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [stockError, setStockError] = useState('');
  const [availableStock, setAvailableStock] = useState<number | null>(null);
  const [sortField, setSortField] = useState<'borrow_date' | 'return_date' | 'customer_name' | 'created_at'>('borrow_date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterProduct, setFilterProduct] = useState<string>('all');
  const [searchText, setSearchText] = useState('');

  const getHeaders = () => ({});

  const fetchData = async () => {
    setLoading(true);
    const productsRequest = fetch('/api/admin?table=products', { headers: getHeaders() });

    if (view === 'calendar') {
      const monthStart = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-01`;
      const monthEnd = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()).padStart(2, '0')}`;
      const [ordersRes, productsRes] = await Promise.all([
        fetch(`/api/admin?table=orders&calendarStart=${monthStart}&calendarEnd=${monthEnd}`, { headers: getHeaders() }),
        productsRequest,
      ]);
      const ordersJson = await ordersRes.json();
      const productsJson = await productsRes.json();
      setOrders(ordersJson.data || []);
      setCalendarInquiries(ordersJson.inquiries || []);
      setProducts(productsJson.data || []);
      setLoading(false);
      return;
    }

    const params = new URLSearchParams({
      table: 'orders',
      page: String(page),
      pageSize: String(pageSize),
      status: filterStatus,
      productId: filterProduct,
      sort: sortField,
      direction: sortDir,
    });
    if (searchText.trim()) params.set('search', searchText.trim());
    const [ordersRes, productsRes] = await Promise.all([
      fetch(`/api/admin?${params.toString()}`, { headers: getHeaders() }),
      productsRequest,
    ]);
    const ordersJson = await ordersRes.json();
    const productsJson = await productsRes.json();
    setOrders(ordersJson.data || []);
    setTotalOrders(ordersJson.count || 0);
    setCustomers(ordersJson.customerBindings || {});
    setProducts(productsJson.data || []);
    setLoading(false);
  };

  // 列表、搜尋與行事曆皆由伺服器分批讀取，避免受單次 1,000 筆限制。
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { void fetchData(); }, [view, currentMonth, page, filterStatus, filterProduct, searchText, sortField, sortDir]);
  // 取得產品名稱 map
  const productMap = useMemo(() => {
    const map: Record<string, Product> = {};
    products.forEach(p => { map[p.id] = p; });
    return map;
  }, [products]);

  // 清單已由 API 依條件排序、篩選與分頁。
  const filteredOrders = orders;

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDir(direction => direction === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
    setPage(1);
  };
  // 驗證庫存：由伺服器彙總全部重疊訂單，不依賴目前清單頁面。
  const validateStock = async () => {
    if (!form.product_id || !form.borrow_date || !form.return_date) {
      setStockError('');
      setAvailableStock(null);
      return true;
    }
    const product = productMap[form.product_id];
    if (!product) { setAvailableStock(null); return false; }
    const params = new URLSearchParams({
      productId: form.product_id,
      startDate: form.borrow_date,
      endDate: form.return_date,
    });
    if (editing?.id) params.set('excludeOrderId', editing.id);
    const response = await fetch(`/api/admin/order-availability?${params.toString()}`, { headers: getHeaders() });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      setStockError(result.error || '無法確認庫存，請稍後再試。');
      setAvailableStock(null);
      return false;
    }
    const available = product.stock - Number(result.used || 0);
    setAvailableStock(available);
    if (form.quantity > available) {
      setStockError(`庫存不足！該日期區間可用數量為 ${available}，您欲預約 ${form.quantity} 個。`);
      return false;
    }
    setStockError('');
    return true;
  };
  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_ORDER);
    setStockError('');
    setAvailableStock(null);
    setShowModal(true);
  };

  const openEdit = (o: Order) => {
    setEditing(o);
    setForm({
      product_id: o.product_id,
      customer_name: o.customer_name,
      customer_phone: o.customer_phone || '',
      customer_email: o.customer_email || '',
      quantity: o.quantity,
      borrow_date: o.borrow_date,
      return_date: o.return_date,
      event_name: o.event_name || '',
      note: o.note || '',
      status: o.status,
    });
    setStockError('');
    setAvailableStock(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!await validateStock()) return;

    const headers = { ...getHeaders(), 'Content-Type': 'application/json' };
    const normalizedForm = {
      ...form,
      customer_phone: normalizeTaiwanPhone(form.customer_phone),
    };
    if (editing) {
      await fetch('/api/admin', { method: 'PUT', headers, body: JSON.stringify({ table: 'orders', id: editing.id, record: normalizedForm }) });
    } else {
      // 使用含毫秒的時間戳，避免分頁後無法從目前頁面推算當日流水號。
      const today = new Date();
      const dateStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
      const timeStr = `${String(today.getHours()).padStart(2, '0')}${String(today.getMinutes()).padStart(2, '0')}${String(today.getSeconds()).padStart(2, '0')}${String(today.getMilliseconds()).padStart(3, '0')}`;
      const order_code = `BES-${dateStr}-${timeStr}`;

      await fetch('/api/admin', { method: 'POST', headers, body: JSON.stringify({ table: 'orders', record: { ...normalizedForm, order_code } }) });
      // 新增訂單時發送 Email 通知（非阻塞，失敗不影響訂單建立）
      fetch('/api/notify-order', {
        method: 'POST',
        headers,
        body: JSON.stringify(normalizedForm),
      }).catch(err => console.error('notify-order failed:', err));
    }
    setShowModal(false);
    fetchData();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await fetch('/api/admin', { method: 'DELETE', headers: { ...getHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify({ table: 'orders', id: deleteId }) });
    setDeleteId(null);
    fetchData();
  };

  // ===== 行事曆相關 =====
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const calendarDays = useMemo(() => {
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDayOfWeek; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  }, [firstDayOfWeek, daysInMonth]);

  const getOrdersForDate = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return orders.filter(o =>
      o.status !== '已取消' &&
      o.borrow_date <= dateStr &&
      o.return_date >= dateStr
    );
  };

  const getInquiriesForDate = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return calendarInquiries.filter(inquiry =>
      inquiry.event_date <= dateStr &&
      (inquiry.event_end_date || inquiry.event_date) >= dateStr
    );
  };

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  // 即時檢查庫存（當表單改變時）
  useEffect(() => {
    if (showModal && form.product_id && form.borrow_date && form.return_date) {
      const timer = window.setTimeout(() => { void validateStock(); }, 0);
      return () => window.clearTimeout(timer);
    }
  }, [showModal, form.product_id, form.borrow_date, form.return_date, form.quantity]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: '#4A4947' }}>訂單管理 / 行事曆</h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white rounded-lg shadow-sm border overflow-hidden">
            <button
              onClick={() => setView('list')}
              className={`flex items-center gap-1 px-3 py-2 text-sm ${view === 'list' ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50'}`}
            >
              <List className="w-4 h-4" /> 列表
            </button>
            <button
              onClick={() => setView('calendar')}
              className={`flex items-center gap-1 px-3 py-2 text-sm ${view === 'calendar' ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50'}`}
            >
              <Calendar className="w-4 h-4" /> 行事曆
            </button>
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-medium hover:opacity-90 transition" style={{ backgroundColor: '#AA7452' }}>
            <Plus className="w-4 h-4" /> 新增訂單
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">載入中...</div>
      ) : view === 'calendar' ? (
        /* ===== 行事曆視圖 ===== */
        <div className="bg-white rounded-xl shadow-sm p-6">
          {/* 月份切換 */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-gray-100"><ChevronLeft className="w-5 h-5" /></button>
            <h2 className="text-lg font-bold" style={{ color: '#4A4947' }}>{year} 年 {month + 1} 月</h2>
            <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-gray-100"><ChevronRight className="w-5 h-5" /></button>
          </div>

          <div className="mb-4 flex flex-wrap items-center justify-end gap-4 text-xs text-stone-600">
            <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-gray-200" />客戶諮詢日期</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-green-100" />正式訂單日期</span>
          </div>

          {/* 星期標頭 */}
          <div className="grid grid-cols-7 border-b pb-2 mb-2">
            {['日', '一', '二', '三', '四', '五', '六'].map(d => (
              <div key={d} className="text-center text-sm font-medium text-gray-500">{d}</div>
            ))}
          </div>

          {/* 日期格子 */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, idx) => {
              if (day === null) return <div key={`empty-${idx}`} className="min-h-[80px]" />;
              const dayOrders = getOrdersForDate(day);
              const dayInquiries = getInquiriesForDate(day);
              const dayEntries = [
                ...dayOrders.map(order => ({ kind: 'order' as const, id: order.id, label: `${order.customer_name}(${productMap[order.product_id]?.name?.slice(0, 4) || '?'})`, title: `${order.customer_name}(${productMap[order.product_id]?.name || '未知產品'})`, order })),
                ...dayInquiries.map(inquiry => ({ kind: 'inquiry' as const, id: inquiry.id, label: `${inquiry.name}(${inquiry.service_type?.slice(0, 4) || '諮詢'})`, title: `${inquiry.name}（${inquiry.service_type || '活動諮詢'}）`, inquiry })),
              ];
              const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
              return (
                <div
                  key={day}
                  className={`min-h-[80px] p-1 border rounded-lg ${isToday ? 'border-2' : 'border-gray-100'}`}
                  style={isToday ? { borderColor: '#AA7452' } : {}}
                >
                  <div className={`text-xs font-medium mb-1 ${isToday ? 'text-white rounded-full w-5 h-5 flex items-center justify-center' : 'text-gray-600'}`}
                    style={isToday ? { backgroundColor: '#AA7452' } : {}}
                  >
                    {day}
                  </div>
                  {dayEntries.slice(0, 3).map(entry => {
                    let entryClass = 'bg-zinc-200 text-zinc-800';
                    if (entry.kind === 'order') entryClass = 'bg-green-100 text-green-800';
                    return <button
                      type="button"
                      key={`${entry.kind}-${entry.id}`}
                      className={`mb-0.5 block w-full truncate rounded px-1 py-0.5 text-left text-[10px] hover:brightness-95 ${entryClass}`}
                      onClick={() => entry.kind === 'order' ? openEdit(entry.order) : window.location.assign(`/admin/contacts?contact=${entry.inquiry.id}`)}
                      title={entry.title}
                    >
                      {entry.label}
                    </button>;
                  })}
                  {dayEntries.length > 3 && (
                    <div className="px-1 text-[10px] text-gray-400">+{dayEntries.length - 3} 筆</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ===== 列表視圖 ===== */
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* 篩選列 */}
          <div className="p-4 border-b flex flex-wrap items-center gap-3">
            <input
              type="text"
              value={searchText}
              onChange={e => { setSearchText(e.target.value); setPage(1); }}
              placeholder="搜尋客戶/活動/產品..."
              className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 w-48"
            />
            <select
              value={filterStatus}
              onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
              className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
            >
              <option value="all">所有狀態</option>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select
              value={filterProduct}
              onChange={e => { setFilterProduct(e.target.value); setPage(1); }}
              className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
            >
              <option value="all">所有產品</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <span className="text-xs text-gray-400 ml-auto">共 {totalOrders} 筆</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  <th className="px-4 py-3 text-left">產品</th>
                  <th className="px-4 py-3 text-left cursor-pointer select-none hover:bg-gray-50" onClick={() => toggleSort('customer_name')}>
                    客戶 {sortField === 'customer_name' && (sortDir === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-4 py-3 text-center">數量</th>
                  <th className="px-4 py-3 text-left cursor-pointer select-none hover:bg-gray-50" onClick={() => toggleSort('borrow_date')}>
                    出借日期 {sortField === 'borrow_date' && (sortDir === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-4 py-3 text-left cursor-pointer select-none hover:bg-gray-50" onClick={() => toggleSort('return_date')}>
                    歸還日期 {sortField === 'return_date' && (sortDir === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-4 py-3 text-left">活動名稱</th>
                  <th className="px-4 py-3 text-center">LINE</th>
                  <th className="px-4 py-3 text-center">狀態</th>
                  <th className="px-4 py-3 text-center">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(o => (
                  <tr key={o.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{productMap[o.product_id]?.name || '未知產品'}</td>
                    <td className="px-4 py-3">{o.customer_name}</td>
                    <td className="px-4 py-3 text-center">{o.quantity}</td>
                    <td className="px-4 py-3">{o.borrow_date}</td>
                    <td className="px-4 py-3">{o.return_date}</td>
                    <td className="px-4 py-3 text-gray-500">{o.event_name || '-'}</td>
                    <td className="px-4 py-3 text-center">
                      {customers[o.customer_phone]
                        ? <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">✓ 已綁定</span>
                        : <span className="text-gray-300 text-xs">未綁定</span>
                      }
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${STATUS_COLORS[o.status]}`}>{o.status}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openEdit(o)} className="p-1.5 rounded-lg hover:bg-gray-100"><Pencil className="w-4 h-4 text-gray-600" /></button>
                        <button onClick={() => setDeleteId(o.id)} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 className="w-4 h-4 text-red-500" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredOrders.length === 0 && <tr><td colSpan={9} className="px-4 py-12 text-center text-gray-400">尚無訂單資料</td></tr>}
              </tbody>
            </table>
          </div>
          <Pagination page={page} pageSize={pageSize} total={totalOrders} onPageChange={setPage} noun="筆訂單" />
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-bold" style={{ color: '#4A4947' }}>{editing ? '編輯訂單' : '新增訂單'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-gray-100"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">產品 *</label>
                <select
                  value={form.product_id}
                  onChange={e => setForm(f => ({ ...f, product_id: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                >
                  <option value="">選擇產品</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}（庫存：{p.stock}）</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">客戶名稱 *</label>
                  <input value={form.customer_name} onChange={e => setForm(f => ({ ...f, customer_name: e.target.value }))} required className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">客戶電話</label>
                  <input value={form.customer_phone} onChange={e => setForm(f => ({ ...f, customer_phone: e.target.value }))} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">客戶 Email</label>
                <input
                  type="email"
                  value={form.customer_email}
                  onChange={e => setForm(f => ({ ...f, customer_email: e.target.value }))}
                  placeholder="用於寄送 PDF 報價單"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">數量 *</label>
                <input type="number" min={1} value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: Number(e.target.value) }))} required className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">出借日期 *</label>
                  <input type="date" value={form.borrow_date} onChange={e => setForm(f => ({ ...f, borrow_date: e.target.value }))} required className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">歸還日期 *</label>
                  <input type="date" value={form.return_date} onChange={e => setForm(f => ({ ...f, return_date: e.target.value }))} required className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2" />
                </div>
              </div>

              {/* 庫存即時檢查提示 */}
              {stockError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                  ⚠️ {stockError}
                </div>
              )}
              {!stockError && availableStock !== null && form.product_id && form.borrow_date && form.return_date && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
                  ✓ 庫存充足，該日期區間可用數量：{availableStock}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">活動名稱</label>
                <input value={form.event_name} onChange={e => setForm(f => ({ ...f, event_name: e.target.value }))} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">備註</label>
                <textarea value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} rows={2} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2" />
              </div>

              {editing && (
                <div>
                  <label className="block text-sm font-medium mb-1">狀態</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as Order['status'] }))} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2">
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">取消</button>
                <button
                  type="submit"
                  disabled={!!stockError}
                  className="px-4 py-2 text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#AA7452' }}
                >
                  {editing ? '更新' : '新增'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold mb-2" style={{ color: '#4A4947' }}>確認刪除</h3>
            <p className="text-gray-600 text-sm mb-6">確定要刪除此訂單嗎？此操作無法復原。</p>
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
