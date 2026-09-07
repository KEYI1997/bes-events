'use client';

import { useState, useEffect } from 'react';
import { 
  AlertCircle, MessageSquare, Package, Camera, Building2,
  FileText, ClipboardList, BarChart3
} from 'lucide-react';

// 後台資料表
const TABLES = [
  { table: 'products', label: '產品', icon: Package, color: '#4A4947' },
  { table: 'cases', label: '案例', icon: Camera, color: '#4A4947' },
  { table: 'contacts', label: '諮詢', icon: MessageSquare, color: '#4A4947' },
  { table: 'clients', label: '合作客戶', icon: Building2, color: '#4A4947' },
];

type AnalyticsData = {
  configured: boolean;
  period: string;
  overview: { pageViews: number; activeUsers: number; sessions: number };
  sources: { google: number; yahoo: number; youtube: number };
  monthly: Array<{ label: string; pageViews: number }>;
  topPages: Array<{ path: string; pageViews: number }>;
  updatedAt: string;
};

function formatNumber(value: number) {
  return new Intl.NumberFormat('zh-TW').format(value);
}

export default function AdminDashboard() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [contactStats, setContactStats] = useState({ total: 0, unread: 0, read: 0 });
  const [orderStats, setOrderStats] = useState({ total: 0, processing: 0, completed: 0, cancelled: 0 });
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
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

        // 取得 GA4 網站流量資料。此端點受後台密碼保護，GA4 金鑰不會傳到瀏覽器。
        try {
          const analyticsRes = await fetch('/api/admin/analytics', { headers });
          const analyticsData = await analyticsRes.json();
          if (analyticsRes.ok && analyticsData.configured) {
            setAnalytics(analyticsData);
            setAnalyticsError(null);
          } else {
            setAnalytics(null);
            setAnalyticsError(analyticsData.error || 'GA4 資料暫時無法讀取');
          }
        } catch {
          setAnalytics(null);
          setAnalyticsError('GA4 資料暫時無法讀取');
        } finally {
          setAnalyticsLoading(false);
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

      {/* GA4 網站流量 */}
      <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold" style={{ color: '#4A4947' }}>
              <BarChart3 className="h-5 w-5" /> 網站流量（GA4）
            </h2>
            <p className="mt-1 text-sm text-gray-500">{analytics?.period || 'Google Analytics 4 網站資料'}</p>
          </div>
          {analytics?.updatedAt && (
            <span className="text-xs text-gray-400">更新於 {new Date(analytics.updatedAt).toLocaleString('zh-TW')}</span>
          )}
        </div>

        {analyticsLoading ? (
          <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="正在讀取 GA4 資料">
            {[0, 1, 2, 3].map(index => <div key={index} className="h-24 animate-pulse rounded-lg bg-gray-100" />)}
          </div>
        ) : analytics ? (
          <>
            <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <AnalyticsMetric label="總瀏覽量" value={analytics.overview.pageViews} />
              <AnalyticsMetric label="來自 Yahoo" value={analytics.sources.yahoo} />
              <AnalyticsMetric label="來自 Google" value={analytics.sources.google} />
              <AnalyticsMetric label="來自 YouTube" value={analytics.sources.youtube} />
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(17rem,0.8fr)]">
              <div className="min-w-0 rounded-lg border border-gray-100 p-4 sm:p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-semibold" style={{ color: '#4A4947' }}>近 12 個月瀏覽趨勢</p>
                  <p className="text-sm text-gray-500">近 30 天：{formatNumber(analytics.overview.activeUsers)} 位活躍使用者／{formatNumber(analytics.overview.sessions)} 次工作階段</p>
                </div>
                <AnalyticsLineChart data={analytics.monthly} />
              </div>

              <div className="min-w-0 rounded-lg border border-gray-100 p-4 sm:p-5">
                <p className="font-semibold" style={{ color: '#4A4947' }}>熱門頁面</p>
                {analytics.topPages.length > 0 ? (
                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full min-w-[15rem] text-left text-sm">
                      <thead className="border-b border-gray-100 text-xs text-gray-500"><tr><th className="pb-2 font-medium">頁面</th><th className="pb-2 text-right font-medium">瀏覽量</th></tr></thead>
                      <tbody>
                        {analytics.topPages.map(page => <tr key={page.path} className="border-b border-gray-50 last:border-0"><td className="max-w-[13rem] truncate py-2.5 text-gray-700" title={page.path}>{page.path}</td><td className="py-2.5 text-right font-medium" style={{ color: '#4A4947' }}>{formatNumber(page.pageViews)}</td></tr>)}
                      </tbody>
                    </table>
                  </div>
                ) : <p className="mt-4 text-sm text-gray-500">這段期間尚無頁面瀏覽資料。</p>}
              </div>
            </div>
          </>
        ) : (
          <div className="mt-5 rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-5 text-sm text-gray-600">
            <p className="font-medium" style={{ color: '#4A4947' }}>GA4 尚未連接</p>
            <p className="mt-1">{analyticsError || '請完成 GA4 Data API 設定後，即可在此查看網站流量。'}</p>
          </div>
        )}
      </section>

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

function AnalyticsMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-gray-100 bg-[#F9F7F0] px-4 py-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-2 text-3xl font-bold" style={{ color: '#4A4947' }}>{formatNumber(value)}</p>
    </div>
  );
}

function AnalyticsLineChart({ data }: { data: Array<{ label: string; pageViews: number }> }) {
  const width = 720;
  const height = 220;
  const padding = { top: 18, right: 12, bottom: 34, left: 38 };
  const max = Math.max(...data.map(item => item.pageViews), 1);
  const point = (item: { pageViews: number }, index: number) => {
    const x = padding.left + (index * (width - padding.left - padding.right)) / Math.max(data.length - 1, 1);
    const y = padding.top + (height - padding.top - padding.bottom) * (1 - item.pageViews / max);
    return [x, y] as const;
  };
  const points = data.map(point);
  const linePath = points.map(([x, y], index) => `${index === 0 ? 'M' : 'L'}${x} ${y}`).join(' ');
  const areaPath = `${linePath} L${points[points.length - 1]?.[0] || padding.left} ${height - padding.bottom} L${points[0]?.[0] || padding.left} ${height - padding.bottom} Z`;

  return (
    <div className="mt-5 overflow-x-auto">
      <svg className="h-auto min-w-[34rem] w-full" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="近十二個月網站瀏覽量趨勢">
        {[0, 0.5, 1].map((ratio, index) => {
          const y = padding.top + (height - padding.top - padding.bottom) * ratio;
          return <line key={index} x1={padding.left} x2={width - padding.right} y1={y} y2={y} stroke="#E5E7EB" strokeWidth="1" />;
        })}
        <path d={areaPath} fill="#AA7452" fillOpacity="0.1" />
        <path d={linePath} fill="none" stroke="#AA7452" strokeWidth="2" vectorEffect="non-scaling-stroke" />
        {points.map(([x, y], index) => <circle key={data[index]?.label || index} cx={x} cy={y} r="3" fill="#AA7452" />)}
        {data.map((item, index) => <text key={item.label} x={points[index]?.[0] || 0} y={height - 10} textAnchor="middle" fill="#6B7280" fontSize="11">{item.label}</text>)}
      </svg>
    </div>
  );
}
