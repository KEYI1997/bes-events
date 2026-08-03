'use client';

import { useState, useEffect } from 'react';
import { 
  Users, Eye, MousePointerClick, Clock, TrendingUp, TrendingDown,
  Monitor, Smartphone, Globe, ArrowUpRight, ArrowDownRight,
  BarChart3, PieChart, Activity, ShoppingCart, FileText,
  AlertCircle, MessageSquare, Package, Camera, Building2,
  CheckCircle, Clock3, FileQuestion, ClipboardList
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
  // 諮詢統計
  inquiries: {
    total: { value: 32, change: 18.2, trend: 'up' },
    pending: { value: 8, change: 5.0, trend: 'up' },
    resolved: { value: 24, change: 22.4, trend: 'up' },
  },
  // 訂單統計
  orders: {
    total: { value: 15, change: 25.0, trend: 'up' },
    processing: { value: 3, change: 10.0, trend: 'up' },
    completed: { value: 12, change: 30.0, trend: 'up' },
  },
  // 流量來源
  trafficSources: [
    { name: '自然搜尋', value: 35, color: '#4285F4' },
    { name: '付費廣告', value: 28, color: '#EA4335' },
    { name: '社群媒體', value: 20, color: '#FBBC04' },
    { name: '直接流量', value: 12, color: '#34A853' },
    { name: '推薦連結', value: 5, color: '#9333EA' },
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
  { table: 'products', label: '產品', icon: Package, color: '#AA7452' },
  { table: 'cases', label: '案例', icon: Camera, color: '#5B8C6A' },
  { table: 'contacts', label: '諮詢', icon: MessageSquare, color: '#C75B5B' },
  { table: 'clients', label: '客戶', icon: Building2, color: '#4A90A4' },
];

export default function AdminDashboard() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [unreadContacts, setUnreadContacts] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const password = localStorage.getItem('admin_password') || '';
    const headers = { 'x-admin-password': password };

    const fetchAll = async () => {
      try {
        const results = await Promise.all(
          TABLES.map(t =>
            fetch(`/api/admin?table=${t.table}`, { headers })
              .then(r => r.json())
              .then(d => ({ table: t.table, count: d.data?.length || 0, data: d.data || [] }))
          )
        );
        const countMap: Record<string, number> = {};
        results.forEach(r => { countMap[r.table] = r.count; });
        setCounts(countMap);

        const contactResult = results.find(r => r.table === 'contacts');
        if (contactResult) {
          const unread = contactResult.data.filter((c: { read: boolean }) => !c.read).length;
          setUnreadContacts(unread);
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
        <div className="text-sm text-gray-500 bg-yellow-50 px-3 py-1.5 rounded-lg border border-yellow-200">
          ⚠️ 流量為示範數據 - 串接 Google API 後顯示真實數據
        </div>
      </div>

      {/* 未讀諮詢提醒 */}
      {unreadContacts > 0 && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-red-700 font-medium">
            您有 {unreadContacts} 筆未讀諮詢紀錄
          </span>
        </div>
      )}

      {/* 諮詢單與訂單總覽 - 分成兩個區塊 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 諮詢單統計 */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: '#4A4947' }}>
            <FileQuestion className="w-5 h-5 text-orange-500" /> 客戶諮詢單
          </h2>
          <p className="text-sm text-gray-500 mb-4">客戶透過網站提交的諮詢，待處理後可轉為訂單</p>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-xl bg-orange-50">
              <p className="text-sm text-gray-500 mb-1">總諮詢數</p>
              <p className="text-3xl font-bold" style={{ color: '#AA7452' }}>
                {loading ? '—' : counts['contacts'] || MOCK_DATA.inquiries.total.value}
              </p>
              <div className="flex items-center justify-center gap-1 mt-2">
                <ArrowUpRight className="w-3 h-3 text-green-500" />
                <span className="text-xs text-green-500">+{MOCK_DATA.inquiries.total.change}%</span>
              </div>
            </div>
            <div className="text-center p-4 rounded-xl bg-yellow-50">
              <p className="text-sm text-gray-500 mb-1">待處理</p>
              <p className="text-3xl font-bold text-yellow-600">
                {unreadContacts || MOCK_DATA.inquiries.pending.value}
              </p>
              <div className="flex items-center justify-center gap-1 mt-2">
                <Clock3 className="w-3 h-3 text-yellow-600" />
                <span className="text-xs text-yellow-600">需處理</span>
              </div>
            </div>
            <div className="text-center p-4 rounded-xl bg-green-50">
              <p className="text-sm text-gray-500 mb-1">已解決</p>
              <p className="text-3xl font-bold text-green-600">
                {MOCK_DATA.inquiries.resolved.value}
              </p>
              <div className="flex items-center justify-center gap-1 mt-2">
                <CheckCircle className="w-3 h-3 text-green-500" />
                <span className="text-xs text-green-500">已完成</span>
              </div>
            </div>
          </div>
        </div>

        {/* 訂單統計 */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: '#4A4947' }}>
            <ClipboardList className="w-5 h-5 text-blue-500" /> 客戶訂單
          </h2>
          <p className="text-sm text-gray-500 mb-4">諮詢單確認後轉換的正式訂單</p>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-xl bg-blue-50">
              <p className="text-sm text-gray-500 mb-1">總訂單數</p>
              <p className="text-3xl font-bold text-blue-600">
                {MOCK_DATA.orders.total.value}
              </p>
              <div className="flex items-center justify-center gap-1 mt-2">
                <ArrowUpRight className="w-3 h-3 text-green-500" />
                <span className="text-xs text-green-500">+{MOCK_DATA.orders.total.change}%</span>
              </div>
            </div>
            <div className="text-center p-4 rounded-xl bg-purple-50">
              <p className="text-sm text-gray-500 mb-1">進行中</p>
              <p className="text-3xl font-bold text-purple-600">
                {MOCK_DATA.orders.processing.value}
              </p>
              <div className="flex items-center justify-center gap-1 mt-2">
                <Clock3 className="w-3 h-3 text-purple-600" />
                <span className="text-xs text-purple-600">執行中</span>
              </div>
            </div>
            <div className="text-center p-4 rounded-xl bg-green-50">
              <p className="text-sm text-gray-500 mb-1">已完成</p>
              <p className="text-3xl font-bold text-green-600">
                {MOCK_DATA.orders.completed.value}
              </p>
              <div className="flex items-center justify-center gap-1 mt-2">
                <CheckCircle className="w-3 h-3 text-green-500" />
                <span className="text-xs text-green-500">已結案</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 轉換流程說明 */}
      <div className="bg-gradient-to-r from-orange-50 to-blue-50 rounded-xl p-4 border border-orange-100">
        <div className="flex items-center justify-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <FileQuestion className="w-5 h-5 text-orange-500" />
            <span className="font-medium text-gray-700">客戶諮詢</span>
          </div>
          <div className="flex items-center gap-1 text-gray-400">
            <span>→</span>
            <span className="text-xs">管理員處理</span>
            <span>→</span>
          </div>
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-blue-500" />
            <span className="font-medium text-gray-700">正式訂單</span>
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
            color="#4285F4"
          />
          <StatCard 
            icon={Eye} 
            label="頁面瀏覽量" 
            value={MOCK_DATA.overview.pageViews.value.toLocaleString()} 
            change={MOCK_DATA.overview.pageViews.change}
            trend={MOCK_DATA.overview.pageViews.trend as 'up' | 'down'}
            color="#34A853"
          />
          <StatCard 
            icon={MousePointerClick} 
            label="跳出率" 
            value={`${MOCK_DATA.overview.bounceRate.value}%`} 
            change={MOCK_DATA.overview.bounceRate.change}
            trend={MOCK_DATA.overview.bounceRate.trend as 'up' | 'down'}
            color="#EA4335"
            invertTrend
          />
          <StatCard 
            icon={Clock} 
            label="平均停留時間" 
            value={MOCK_DATA.overview.avgSessionDuration.value} 
            change={MOCK_DATA.overview.avgSessionDuration.change}
            trend={MOCK_DATA.overview.avgSessionDuration.trend as 'up' | 'down'}
            color="#FBBC04"
          />
        </div>
      </div>

      {/* 中間區塊：熱門服務 + 流量來源 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 熱門服務 */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: '#4A4947' }}>
            <ShoppingCart className="w-5 h-5" /> 熱門服務項目
          </h3>
          <div className="space-y-4">
            {MOCK_DATA.popularServices.map((service, index) => (
              <div key={service.name}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-cta/10 flex items-center justify-center text-xs font-bold text-cta">
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium" style={{ color: '#4A4947' }}>{service.name}</span>
                  </div>
                  <span className="text-sm text-gray-500">{service.inquiries} 筆諮詢</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${service.percentage}%`, backgroundColor: '#AA7452' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 流量來源 */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: '#4A4947' }}>
            <PieChart className="w-5 h-5" /> 流量來源分佈
          </h3>
          <div className="space-y-3">
            {MOCK_DATA.trafficSources.map((source) => (
              <div key={source.name} className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: source.color }} />
                <span className="flex-1 text-sm text-gray-600">{source.name}</span>
                <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${source.value}%`, backgroundColor: source.color }}
                  />
                </div>
                <span className="text-sm font-medium w-12 text-right" style={{ color: '#4A4947' }}>{source.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 每日訪客趨勢 */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: '#4A4947' }}>
          <BarChart3 className="w-5 h-5" /> 每日訪客趨勢（近 7 天）
        </h3>
        <div className="flex items-end justify-between gap-2 h-40">
          {MOCK_DATA.dailyVisitors.map((day) => (
            <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex justify-center">
                <div 
                  className="w-12 rounded-t-lg transition-all duration-500 hover:opacity-80"
                  style={{ 
                    height: `${(day.visitors / maxVisitors) * 120}px`,
                    backgroundColor: '#AA7452'
                  }}
                />
              </div>
              <span className="text-xs text-gray-500">{day.day}</span>
              <span className="text-xs font-medium" style={{ color: '#4A4947' }}>{day.visitors}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 底部區塊：熱門頁面 + 裝置分佈 + 後台統計 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 熱門頁面 */}
        <div className="bg-white rounded-xl p-6 shadow-sm lg:col-span-2">
          <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: '#4A4947' }}>
            <Globe className="w-5 h-5" /> 熱門頁面
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b">
                  <th className="pb-3 font-medium">頁面</th>
                  <th className="pb-3 font-medium text-right">瀏覽量</th>
                  <th className="pb-3 font-medium text-right">平均停留</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_DATA.topPages.map((page, index) => (
                  <tr key={page.page} className="border-b last:border-0">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-500">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-medium text-sm" style={{ color: '#4A4947' }}>{page.name}</p>
                          <p className="text-xs text-gray-400">{page.page}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-right font-medium" style={{ color: '#4A4947' }}>{page.views.toLocaleString()}</td>
                    <td className="py-3 text-right text-gray-500">{page.avgTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 裝置分佈 + 後台統計 */}
        <div className="space-y-6">
          {/* 裝置分佈 */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
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
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: '#4A4947' }}>
              <Package className="w-5 h-5" /> 後台資料統計
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {TABLES.map(t => {
                const Icon = t.icon;
                return (
                  <div key={t.table} className="flex items-center gap-2 p-2 rounded-lg" style={{ backgroundColor: `${t.color}10` }}>
                    <Icon className="w-4 h-4" style={{ color: t.color }} />
                    <div>
                      <p className="text-xs text-gray-500">{t.label}</p>
                      <p className="font-bold" style={{ color: '#4A4947' }}>
                        {loading ? '—' : counts[t.table] ?? 0}
                      </p>
                    </div>
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
  color,
  invertTrend = false,
}: { 
  icon: React.ElementType;
  label: string;
  value: string;
  change: number;
  trend: 'up' | 'down';
  color: string;
  invertTrend?: boolean;
}) {
  const isPositive = invertTrend ? trend === 'down' : trend === 'up';
  const TrendIcon = trend === 'up' ? ArrowUpRight : ArrowDownRight;
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold mt-1" style={{ color: '#4A4947' }}>
            {value}
          </p>
        </div>
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
      </div>
      <div className="flex items-center gap-1 mt-3">
        <TrendIcon className={`w-4 h-4 ${isPositive ? 'text-green-500' : 'text-red-500'}`} />
        <span className={`text-xs font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {Math.abs(change)}%
        </span>
        <span className="text-xs text-gray-400">vs 上週</span>
      </div>
    </div>
  );
}
