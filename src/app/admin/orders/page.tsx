'use client';

import { useState, useEffect, useMemo } from 'react';
import { Plus, X, ChevronLeft, ChevronRight, Calendar, List, Trash2, Pencil } from 'lucide-react';
import type { Product, Order } from '@/lib/types';

const STATUS_OPTIONS = ['已預約', '出借中', '已歸還', '已取消'] as const;
const STATUS_COLORS: Record<string, string> = {
  '已預約': 'bg-blue-100 text-blue-700',
  '出借中': 'bg-orange-100 text-orange-700',
  '已歸還': 'bg-green-100 text-green-700',
  '已取消': 'bg-gray-100 text-gray-500',
};

const EMPTY_ORDER = {
  product_id: '',
  customer_name: '',
  customer_phone: '',
  quantity: 1,
  borrow_date: '',
  return_date: '',
  event_name: '',
  note: '',
  status: '已預約' as Order['status'],
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Order | null>(null);
  const [form, setForm] = useState(EMPTY_ORDER);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [stockError, setStockError] = useState('');
  const [sortField, setSortField] = useState<'borrow_date' | 'return_date' | 'customer_name' | 'created_at'>('borrow_date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterProduct, setFilterProduct] = useState<string>('all');
  const [searchText, setSearchText] = useState('');

  const getHeaders = () => ({ 'x-admin-password': localStorage.getItem('admin_password') || '' });

  const fetchData = async () => {
    const [ordersRes, productsRes] = await Promise.all([
      fetch('/api/admin?table=orders', { headers: getHeaders() }),
      fetch('/api/admin?table=products', { headers: getHeaders() }),
    ]);
    const ordersJson = await ordersRes.json();
    const productsJson = await productsRes.json();
    const fetchedOrders: Order[] = ordersJson.data || [];
    setProducts(productsJson.data || []);

    // 自動更新訂單狀態
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const updates: Promise<void>[] = [];

    for (const o of fetchedOrders) {
      let newStatus: string | null = null;

      if (o.status === '已預約' && o.borrow_date <= today && o.return_date >= today) {
        // 出借日當天或期間內 → 出借中
        newStatus = '出借中';
      } else if ((o.status === '已預約' || o.status === '出借中') && o.return_date < today) {
        // 已超過歸還日期 → 已歸還
        newStatus = '已歸還';
      }

      if (newStatus) {
        o.status = newStatus as Order['status'];
        updates.push(
          fetch('/api/admin', {
            method: 'PUT',
            headers: { ...getHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ table: 'orders', id: o.id, record: { status: newStatus } }),
          }).then(() => {})
        );
      }
    }

    if (updates.length > 0) await Promise.all(updates);
    setOrders(fetchedOrders);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  // 取得產品名稱 map
  const productMap = useMemo(() => {
    const map: Record<string, Product> = {};
    products.forEach(p => { map[p.id] = p; });
    return map;
  }, [products]);

  // 計算某日期區間內某產品的已佔用數量
  const getUsedStock = (productId: string, borrowDate: string, returnDate: string, excludeOrderId?: string) => {
    return orders
      .filter(o =>
        o.product_id === productId &&
        o.status !== '已歸還' &&
        o.status !== '已取消' &&
        o.id !== excludeOrderId &&
        // 日期重疊判斷
        o.borrow_date <= returnDate &&
        o.return_date >= borrowDate
      )
      .reduce((sum, o) => sum + o.quantity, 0);
  };

  // 計算可用庫存
  const getAvailableStock = (productId: string, borrowDate: string, returnDate: string, excludeOrderId?: string) => {
    const product = productMap[productId];
    if (!product) return 0;
    const used = getUsedStock(productId, borrowDate, returnDate, excludeOrderId);
    return product.stock - used;
  };

  // 篩選+排序後的訂單列表
  const filteredOrders = useMemo(() => {
    let result = [...orders];
    // 狀態篩選
    if (filterStatus !== 'all') {
      result = result.filter(o => o.status === filterStatus);
    }
    // 產品篩選
    if (filterProduct !== 'all') {
      result = result.filter(o => o.product_id === filterProduct);
    }
    // 搜尋（客戶名稱、活動名稱）
    if (searchText.trim()) {
      const keyword = searchText.trim().toLowerCase();
      result = result.filter(o =>
        o.customer_name.toLowerCase().includes(keyword) ||
        (o.event_name || '').toLowerCase().includes(keyword) ||
        (productMap[o.product_id]?.name || '').toLowerCase().includes(keyword)
      );
    }
    // 排序
    result.sort((a, b) => {
      const aVal = a[sortField] || '';
      const bVal = b[sortField] || '';
      if (sortDir === 'asc') return aVal > bVal ? 1 : -1;
      return aVal < bVal ? 1 : -1;
    });
    return result;
  }, [orders, filterStatus, filterProduct, searchText, sortField, sortDir, productMap]);

  // 排序切換
  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  // 驗證庫存
  const validateStock = () => {
    if (!form.product_id || !form.borrow_date || !form.return_date) {
      setStockError('');
      return true;
    }
    const available = getAvailableStock(form.product_id, form.borrow_date, form.return_date, editing?.id);
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
    setShowModal(true);
  };

  const openEdit = (o: Order) => {
    setEditing(o);
    setForm({
      product_id: o.product_id,
      customer_name: o.customer_name,
      customer_phone: o.customer_phone || '',
      quantity: o.quantity,
      borrow_date: o.borrow_date,
      return_date: o.return_date,
      event_name: o.event_name || '',
      note: o.note || '',
      status: o.status,
    });
    setStockError('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStock()) return;

    const headers = { ...getHeaders(), 'Content-Type': 'application/json' };
    if (editing) {
      await fetch('/api/admin', { method: 'PUT', headers, body: JSON.stringify({ table: 'orders', id: editing.id, record: form }) });
    } else {
      await fetch('/api/admin', { method: 'POST', headers, body: JSON.stringify({ table: 'orders', record: form }) });
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

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  // 即時檢查庫存（當表單改變時）
  useEffect(() => {
    if (showModal && form.product_id && form.borrow_date && form.return_date) {
      validateStock();
    }
  }, [form.product_id, form.borrow_date, form.return_date, form.quantity]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: '#4A4947' }}>訂單管理 / 行事曆</h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white rounded-lg shadow-sm border overflow-hidden">
            <button
              onClick={() => setView('calendar')}
              className={`flex items-center gap-1 px-3 py-2 text-sm ${view === 'calendar' ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50'}`}
            >
              <Calendar className="w-4 h-4" /> 行事曆
            </button>
            <button
              onClick={() => setView('list')}
              className={`flex items-center gap-1 px-3 py-2 text-sm ${view === 'list' ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50'}`}
            >
              <List className="w-4 h-4" /> 列表
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
                  {dayOrders.slice(0, 3).map(o => (
                    <div
                      key={o.id}
                      className="text-[10px] px-1 py-0.5 mb-0.5 rounded truncate cursor-pointer hover:opacity-80"
                      style={{ backgroundColor: '#AA745220', color: '#AA7452' }}
                      onClick={() => openEdit(o)}
                      title={`${o.customer_name}(${productMap[o.product_id]?.name || '未知產品'})`}
                    >
                      {o.customer_name}({productMap[o.product_id]?.name?.slice(0, 4) || '?'})
                    </div>
                  ))}
                  {dayOrders.length > 3 && (
                    <div className="text-[10px] text-gray-400 px-1">+{dayOrders.length - 3} 筆</div>
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
              onChange={e => setSearchText(e.target.value)}
              placeholder="搜尋客戶/活動/產品..."
              className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 w-48"
            />
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
            >
              <option value="all">所有狀態</option>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select
              value={filterProduct}
              onChange={e => setFilterProduct(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
            >
              <option value="all">所有產品</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <span className="text-xs text-gray-400 ml-auto">共 {filteredOrders.length} 筆</span>
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
                {filteredOrders.length === 0 && <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400">尚無訂單資料</td></tr>}
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
              {!stockError && form.product_id && form.borrow_date && form.return_date && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
                  ✓ 庫存充足，該日期區間可用數量：{getAvailableStock(form.product_id, form.borrow_date, form.return_date, editing?.id)}
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
