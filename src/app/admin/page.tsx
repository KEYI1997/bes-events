'use client';

import { useState, useEffect } from 'react';
import { 
  Users, Eye, MousePointerClick, Clock, TrendingUp,
  Monitor, Smartphone, Globe, ArrowUpRight, ArrowDownRight,
  BarChart3, PieChart, Activity, ShoppingCart,
  AlertCircle, MessageSquare, Package, Camera, Building2,
  CheckCircle, Clock3, FileText, ClipboardList
} from 'lucide-react';

// 模擬數據 - 之後可以串接 Google Analytics API
const MOCK_DATA = {
  // 總覽數據
  overview: {
    visitors: { value: 2847, change: 12.5, trend: 'up' },
    pageViews: { value: 8934, change: 8.2, trend: 'up' },
    bounceRate: { value: 42.3, change: -3.1, trend: 'down' },
    avgSessionDuration: { value: '3:24', change: 15.7, trend: 'up' },
  },
  // 流量來源
  trafficSources: [
    { name: '自然搜尋', value: 35, color: '#4A4947' },
    { name: '付費廣告', value: 28, color: '#AA7452' },
    { name: '社群媒體', value: 20, color: '#6B7280' },
    { name: '直接流量', value: 12, color: '#9CA3AF' },
    { name: '推薦連結', value: 5, color: '#D1D5DB' },
  ],
  // 熱門頁面
  topPages: [
    { page: '/', name: '首頁', views: 3245, avgTime: '2:15' },
    { page: '/services/opening-ceremony', name: '啟動儀式', views: 1823, avgTime: '4:32' },
    { page: '/services/stage-lighting', name: '燈光音響舞台', views: 1456, avgTime: '3:48' },
    { page: '/contact', name: '聯絡我們', views: 987, avgTime: '2:05' },
    { page: '/services/bartending', name: '外派調酒', views: 756, avgTime: '3:12' },
  ],
  // 裝置分佈
  devices: [
    { name: '桌面裝置', value: 58, icon: Monitor },
    { name: '手機', value: 38, icon: Smartphone },
    { name: '平板', value: 4, icon: Monitor },
  ],
  // 每日訪客趨勢（最近 7 天）
  dailyVisitors: [
    { day: '週一', visitors: 385 },
    { day: '週二', visitors: 420 },
    { day: '週三', visitors: 398 },
    { day: '週四', visitors: 456 },
    { day: '週五', visitors: 512 },
    { day: '週六', visitors: 342 },
    { day: '週日', visitors: 334 },
  ],
  // 熱門服務
  popularServices: [
    { name: '啟動儀式', inquiries: 18, percentage: 38 },
    { name: '燈光音響舞台', inquiries: 12, percentage: 26 },
    { name: '活動策劃統包', inquiries: 8, percentage: 17 },
    { name: '外派調酒', inquiries: 5, percentage: 11 },
    { name: 'SHOW GIRL', inquiries: 4, percentage: 8 },
  ],
};

// 後台資料表
const TABLES = [
  { table: 'products', label: '產品', icon: Package, color: '#4A4947' },
  { table: 'cases', label: '案例', icon: Camera, color: '#4A4947' },
  { table: 'contacts', label: '諮詢', icon: MessageSquare, color: '#4A4947' },
  { table: 'clients', label: '客戶', icon: Building2, color: '#4A4947' },
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
              o.status === '已歸還'
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

  const maxVisitors = Math.max(...MOCK_DATA.dailyVisitors.map(d => d.visitors));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold" style={{ color: '#4A4947' }}>數據分析儀表板</h1>
        <div className="text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
          流量為示範數據
        </div>
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

      {/* 網站流量總覽 */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: '#4A4947' }}>
          <Activity className="w-5 h-5" /> 網站流量總覽
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            icon={Users} 
            label="訪客人數" 
            value={MOCK_DATA.overview.visitors.value.toLocaleString()} 
            change={MOCK_DATA.overview.visitors.change}
            trend={MOCK_DATA.overview.visitors.trend as 'up' | 'down'}
          />
          <StatCard 
            icon={Eye} 
            label="頁面瀏覽量" 
            value={MOCK_DATA.overview.pageViews.value.toLocaleString()} 
            change={MOCK_DATA.overview.pageViews.change}
            trend={MOCK_DATA.overview.pageViews.trend as 'up' | 'down'}
          />
          <StatCard 
            icon={MousePointerClick} 
            label="跳出率" 
            value={`${MOCK_DATA.overview.bounceRate.value}%`} 
            change={MOCK_DATA.overview.bounceRate.change}
            trend={MOCK_DATA.overview.bounceRate.trend as 'up' | 'down'}
            invertTrend
          />
          <StatCard 
            icon={Clock} 
            label="平均停留時間" 
            value={MOCK_DATA.overview.avgSessionDuration.value} 
            change={MOCK_DATA.overview.avgSessionDuration.change}
            trend={MOCK_DATA.overview.avgSessionDuration.trend as 'up' | 'down'}
          />
        </div>
      </div>

      {/* 中間區塊：熱門服務 + 流量來源 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 熱門服務 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: '#4A4947' }}>
            <ShoppingCart className="w-5 h-5" /> 熱門服務項目
          </h3>
          <div className="space-y-4">
            {MOCK_DATA.popularServices.map((service, index) => (
              <div key={service.name}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400 w-4">{index + 1}.</span>
                    <span className="text-sm font-medium" style={{ color: '#4A4947' }}>{service.name}</span>
                  </div>
                  <span className="text-sm text-gray-500">{service.inquiries} 筆</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${service.percentage}%`, backgroundColor: '#4A4947' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 流量來源 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: '#4A4947' }}>
            <PieChart className="w-5 h-5" /> 流量來源分佈
          </h3>
          <div className="space-y-3">
            {MOCK_DATA.trafficSources.map((source) => (
              <div key={source.name} className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: source.color }} />
                <span className="flex-1 text-sm text-gray-600">{source.name}</span>
                <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${source.value}%`, backgroundColor: source.color }}
                  />
                </div>
                <span className="text-sm font-medium w-10 text-right" style={{ color: '#4A4947' }}>{source.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 每日訪客趨勢 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: '#4A4947' }}>
          <BarChart3 className="w-5 h-5" /> 每日訪客趨勢（近 7 天）
        </h3>
        <div className="flex items-end justify-between gap-3 h-36">
          {MOCK_DATA.dailyVisitors.map((day) => (
            <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
              <span className="text-xs font-medium" style={{ color: '#4A4947' }}>{day.visitors}</span>
              <div className="w-full flex justify-center">
                <div 
                  className="w-full max-w-[40px] rounded-t transition-all duration-500 hover:opacity-80"
                  style={{ 
                    height: `${(day.visitors / maxVisitors) * 100}px`,
                    backgroundColor: '#4A4947'
                  }}
                />
              </div>
              <span className="text-xs text-gray-500">{day.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 底部區塊：熱門頁面 + 其他統計 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 熱門頁面 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 lg:col-span-2">
          <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: '#4A4947' }}>
            <Globe className="w-5 h-5" /> 熱門頁面
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                  <th className="pb-3 font-medium">頁面</th>
                  <th className="pb-3 font-medium text-right">瀏覽量</th>
                  <th className="pb-3 font-medium text-right">停留時間</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_DATA.topPages.map((page, index) => (
                  <tr key={page.page} className="border-b border-gray-50 last:border-0">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 w-4">{index + 1}.</span>
                        <div>
                          <p className="font-medium text-sm" style={{ color: '#4A4947' }}>{page.name}</p>
                          <p className="text-xs text-gray-400">{page.page}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-right text-sm font-medium" style={{ color: '#4A4947' }}>{page.views.toLocaleString()}</td>
                    <td className="py-3 text-right text-sm text-gray-500">{page.avgTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 裝置分佈 + 後台統計 */}
        <div className="space-y-6">
          {/* 裝置分佈 */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: '#4A4947' }}>
              <Monitor className="w-5 h-5" /> 裝置分佈
            </h3>
            <div className="space-y-3">
              {MOCK_DATA.devices.map((device) => {
                const Icon = device.icon;
                return (
                  <div key={device.name} className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-gray-400" />
                    <span className="flex-1 text-sm text-gray-600">{device.name}</span>
                    <span className="text-sm font-medium" style={{ color: '#4A4947' }}>{device.value}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 後台資料統計 */}
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
      </div>
    </div>
  );
}

// 統計卡片元件
function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  change, 
  trend, 
  invertTrend = false,
}: { 
  icon: React.ElementType;
  label: string;
  value: string;
  change: number;
  trend: 'up' | 'down';
  invertTrend?: boolean;
}) {
  const isPositive = invertTrend ? trend === 'down' : trend === 'up';
  const TrendIcon = trend === 'up' ? ArrowUpRight : ArrowDownRight;
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500">{label}</p>
          <p className="text-2xl font-bold mt-1" style={{ color: '#4A4947' }}>
            {value}
          </p>
        </div>
        <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center">
          <Icon className="w-4 h-4" style={{ color: '#4A4947' }} />
        </div>
      </div>
      <div className="flex items-center gap-1 mt-3">
        <TrendIcon className={`w-3.5 h-3.5 ${isPositive ? 'text-gray-600' : 'text-gray-400'}`} />
        <span className={`text-xs font-medium ${isPositive ? 'text-gray-600' : 'text-gray-400'}`}>
          {Math.abs(change)}%
        </span>
        <span className="text-xs text-gray-400">vs 上週</span>
      </div>
    </div>
  );
}
