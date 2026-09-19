'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Link2, Phone, RefreshCw, Search, UserRound, UsersRound } from 'lucide-react';
import type { Customer } from '@/lib/types';
import Pagination from '@/components/admin/Pagination';

function formatDate(value?: string) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('zh-TW', {
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false,
  }).format(new Date(value));
}

function maskLineUserId(value?: string) {
  if (!value) return '-';
  return value.length <= 12 ? value : `${value.slice(0, 7)}••••${value.slice(-5)}`;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [boundCount, setBoundCount] = useState(0);
  const pageSize = 50;

  const loadCustomers = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ table: 'customers', page: String(page), pageSize: String(pageSize) });
      if (searchText.trim()) params.set('search', searchText.trim());
      const response = await fetch(`/api/admin?${params.toString()}`, {
        headers: {},
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || '讀取 LINE 客戶資料失敗');
      setCustomers(result.data || []);
      setTotalCustomers(result.count || 0);
      setBoundCount(result.boundCount || 0);
    } catch (loadError) {
      console.error(loadError);
      setError(loadError instanceof Error ? loadError.message : '讀取失敗，請稍後再試');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 搜尋與清單皆由資料庫分頁，避免超過 1,000 位客戶時遺漏。
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { void loadCustomers(); }, [page, searchText]);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#4A4947' }}>LINE 客戶管理</h1>
          <p className="mt-1 text-sm text-gray-500">客戶傳送電話完成綁定後，LINE 資料會自動出現在此處</p>
        </div>
        <button type="button" onClick={() => void loadCustomers(true)} disabled={refreshing} className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600 transition hover:bg-gray-50 disabled:opacity-50">
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? '更新中...' : '重新整理'}
        </button>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#AA745215]"><UsersRound className="h-5 w-5" style={{ color: '#AA7452' }} /></div><div><p className="text-sm text-gray-500">客戶總數</p><p className="text-2xl font-bold" style={{ color: '#4A4947' }}>{totalCustomers}</p></div></div>
        <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50"><CheckCircle2 className="h-5 w-5 text-green-600" /></div><div><p className="text-sm text-gray-500">LINE 已綁定</p><p className="text-2xl font-bold text-green-700">{boundCount}</p></div></div>
      </div>

      <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50 p-4"><p className="mb-1 text-sm font-semibold text-blue-800">自動抓取流程</p><p className="text-sm leading-6 text-blue-700">客戶加入 LINE 官方帳號並傳送手機號碼後，系統會比對訂單或諮詢紀錄；比對成功即自動保存 LINE 名稱、頭像、LINE User ID、手機號碼及綁定時間。基於 LINE 隱私限制，無法只在後臺輸入電話就反查 LINE 身分。</p></div>

      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="border-b bg-gray-50 p-4"><div className="relative max-w-md"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /><input type="search" value={searchText} onChange={event => { setSearchText(event.target.value); setPage(1); }} placeholder="搜尋電話、客戶姓名或 LINE 名稱" className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2" style={{ '--tw-ring-color': '#AA745240' } as React.CSSProperties} /></div></div>
        {error && <div className="bg-red-50 px-5 py-4 text-sm text-red-600">⚠️ {error}</div>}
        {loading ? <div className="py-16 text-center text-gray-400">載入 LINE 客戶資料中...</div> : customers.length === 0 ? <div className="px-6 py-16 text-center"><UserRound className="mx-auto mb-3 h-12 w-12 text-gray-200" /><p className="font-medium text-gray-500">{searchText ? '找不到符合的客戶' : '尚無 LINE 綁定客戶'}</p>{!searchText && <p className="mt-2 text-sm text-gray-400">客戶完成電話綁定後會自動顯示，不需手動建立。</p>}</div> : <><div className="overflow-x-auto"><table className="w-full min-w-[980px] text-sm"><thead className="border-b bg-white"><tr><th className="px-5 py-3 text-left">LINE 客戶</th><th className="px-5 py-3 text-left">客戶姓名</th><th className="px-5 py-3 text-left">聯絡電話</th><th className="px-5 py-3 text-left">LINE User ID</th><th className="px-5 py-3 text-center">狀態</th><th className="px-5 py-3 text-left">最近更新</th></tr></thead><tbody>{customers.map(customer => <tr key={customer.id} className="border-b last:border-0 hover:bg-gray-50"><td className="px-5 py-4"><div className="flex items-center gap-3">{customer.line_picture_url ? <img src={customer.line_picture_url} alt={customer.line_display_name || 'LINE 客戶'} className="h-11 w-11 rounded-full bg-gray-100 object-cover" /> : <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-50"><UserRound className="h-5 w-5 text-green-600" /></div>}<div><p className="font-semibold text-gray-800">{customer.line_display_name || '尚未取得名稱'}</p><p className="text-xs text-gray-400">LINE 顯示名稱</p></div></div></td><td className="px-5 py-4 text-gray-700">{customer.name || '-'}</td><td className="px-5 py-4"><a href={`tel:${customer.phone}`} className="inline-flex items-center gap-1.5 text-gray-700 hover:text-[#AA7452]"><Phone className="h-3.5 w-3.5" /> {customer.phone}</a></td><td className="px-5 py-4"><span className="inline-flex items-center gap-1.5 font-mono text-xs text-gray-500" title={customer.line_user_id || undefined}><Link2 className="h-3.5 w-3.5" /> {maskLineUserId(customer.line_user_id)}</span></td><td className="px-5 py-4 text-center">{customer.line_user_id ? <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700"><CheckCircle2 className="h-3.5 w-3.5" /> 已綁定</span> : <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-500">未綁定</span>}</td><td className="whitespace-nowrap px-5 py-4 text-gray-500">{formatDate(customer.updated_at || customer.created_at)}</td></tr>)}</tbody></table></div><Pagination page={page} pageSize={pageSize} total={totalCustomers} onPageChange={setPage} noun="位客戶" /></>}
      </div>
    </div>
  );
}
