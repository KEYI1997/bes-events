'use client';

import { useState, useEffect } from 'react';
import { 
  AlertCircle, MessageSquare, Package, Camera, Building2,
  FileText, ClipboardList
} from 'lucide-react';

// 後台資料表
const TABLES = [
  { table: 'products', label: '產品', icon: Package, color: '#4A4947' },
  { table: 'cases', label: '案例', icon: Camera, color: '#4A4947' },
  { table: 'contacts', label: '諮詢', icon: MessageSquare, color: '#4A4947' },
  { table: 'clients', label: '合作客戶', icon: Building2, color: '#4A4947' },
];

export default function AdminDashboard() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [contactStats, setContactStats] = useState({ total: 0, unread: 0, read: 0 });
  const [orderStats, setOrderStats] = useState({ total: 0, processing: 0, completed: 0, cancelled: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const password = localStorage.getItem('admin_password') || '';
    const headers = { 'x-admin-password': password };

    const fetchAll = async () => {
      try {
        // 取得各資料表數量
        const tableResults = await Promise.all(
          TABLES.map(t =>
            fetch(`/api/admin?table=${t.table}`, { headers })
              .then(r => r.json())
              .then(d => ({ table: t.table, count: d.data?.length || 0, data: d.data || [] }))
          )
        );
        
        const countMap: Record<string, number> = {};
        tableResults.forEach(r => { countMap[r.table] = r.count; });
        setCounts(countMap);

        // 計算諮詢單統計
        const contactResult = tableResults.find(r => r.table === 'contacts');
        if (contactResult && contactResult.data) {
          const total = contactResult.data.length;
          const unread = contactResult.data.filter((c: { read: boolean }) => !c.read).length;
          const read = contactResult.data.filter((c: { read: boolean }) => c.read).length;
          setContactStats({ total, unread, read });
        }

        // 取得訂單統計（如果有 orders 表格的話）
        try {
          const orderRes = await fetch('/api/admin?table=orders', { headers });
          const orderData = await orderRes.json();
          if (orderData.data) {
            const total = orderData.data.length;
            const processing = orderData.data.filter((o: { status: string }) => 
              o.status === '已預約' || o.status === '出借中'
            ).length;
            const completed = orderData.data.filter((o: { status: string }) => 
              o.status === '已歸還' || o.status === '已結案'
            ).length;
            const cancelled = orderData.data.filter((o: { status: string }) => 
              o.status === '已取消'
            ).length;
            setOrderStats({ total, processing, completed, cancelled });
          }
        } catch {
          // 如果沒有 orders 表格，使用預設值
          setOrderStats({ total: 0, processing: 0, completed: 0, cancelled: 0 });
        }

      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold" style={{ color: '#4A4947' }}>數據分析儀表板</h1>
      </div>

      {/* 未讀諮詢提醒 */}
      {contactStats.unread > 0 && (
        <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-gray-600" />
          <span className="text-gray-700 font-medium">
            您有 {contactStats.unread} 筆未讀諮詢紀錄
          </span>
        </div>
      )}

      {/* 諮詢單與訂單總覽 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 諮詢單統計 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: '#4A4947' }}>
              <FileText className="w-5 h-5" /> 客戶諮詢單
            </h2>
            <span className="text-xs text-gray-400">客戶提交的諮詢</span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-2">總諮詢數</p>
              <p className="text-3xl font-bold" style={{ color: '#4A4947' }}>
                {loading ? '—' : contactStats.total}
              </p>
            </div>
            <div className="text-center border-x border-gray-100">
              <p className="text-xs text-gray-500 mb-2">待處理</p>
              <p className="text-3xl font-bold" style={{ color: '#4A4947' }}>
                {loading ? '—' : contactStats.unread}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-2">已處理</p>
              <p className="text-3xl font-bold" style={{ color: '#4A4947' }}>
                {loading ? '—' : contactStats.read}
              </p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">處理率</span>
              <span className="font-medium" style={{ color: '#4A4947' }}>
                {contactStats.total > 0 
                  ? `${Math.round((contactStats.read / contactStats.total) * 100)}%` 
                  : '0%'}
              </span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full mt-2 overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{ 
                  width: contactStats.total > 0 
                    ? `${(contactStats.read / contactStats.total) * 100}%` 
                    : '0%',
                  backgroundColor: '#4A4947'
                }}
              />
            </div>
          </div>
        </div>

        {/* 訂單統計 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: '#4A4947' }}>
              <ClipboardList className="w-5 h-5" /> 客戶訂單
            </h2>
            <span className="text-xs text-gray-400">確認後的正式訂單</span>
          </div>
          <div className="grid grid-cols-4 gap-3">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-2">總訂單</p>
              <p className="text-2xl font-bold" style={{ color: '#4A4947' }}>
                {loading ? '—' : orderStats.total}
              </p>
            </div>
            <div className="text-center border-x border-gray-100">
              <p className="text-xs text-gray-500 mb-2">進行中</p>
              <p className="text-2xl font-bold" style={{ color: '#4A4947' }}>
                {loading ? '—' : orderStats.processing}
              </p>
            </div>
            <div className="text-center border-r border-gray-100">
              <p className="text-xs text-gray-500 mb-2">已完成</p>
              <p className="text-2xl font-bold" style={{ color: '#4A4947' }}>
                {loading ? '—' : orderStats.completed}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-2">已取消</p>
              <p className="text-2xl font-bold" style={{ color: '#9CA3AF' }}>
                {loading ? '—' : orderStats.cancelled}
              </p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">完成率（不含取消）</span>
              <span className="font-medium" style={{ color: '#4A4947' }}>
                {(orderStats.total - orderStats.cancelled) > 0 
                  ? `${Math.round((orderStats.completed / (orderStats.total - orderStats.cancelled)) * 100)}%` 
                  : '0%'}
              </span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full mt-2 overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{ 
                  width: (orderStats.total - orderStats.cancelled) > 0 
                    ? `${(orderStats.completed / (orderStats.total - orderStats.cancelled)) * 100}%` 
                    : '0%',
                  backgroundColor: '#4A4947'
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 底部區塊：後台資料統計 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: '#4A4947' }}>
          <Package className="w-5 h-5" /> 後台資料
        </h3>
        <div className="space-y-3">
          {TABLES.map(t => {
            const Icon = t.icon;
            return (
              <div key={t.table} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{t.label}</span>
                </div>
                <span className="font-bold" style={{ color: '#4A4947' }}>
                  {loading ? '—' : counts[t.table] ?? 0}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
