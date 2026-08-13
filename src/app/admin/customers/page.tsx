'use client';

import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Link2, Phone, RefreshCw, Search, UserRound, UsersRound } from 'lucide-react';
import type { Customer } from '@/lib/types';

function formatDate(value?: string) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(value));
}

function maskLineUserId(value?: string) {
  if (!value) return '-';
  if (value.length <= 12) return value;
  return `${value.slice(0, 7)}••••${value.slice(-5)}`;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [error, setError] = useState('');

  const loadCustomers = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    setError('');

    try {
      const res = await fetch('/api/admin?table=customers', {
        headers: { 'x-admin-password': localStorage.getItem('admin_password') || '' },
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || '讀取 LINE 客戶資料失敗');
        return;
      }
      setCustomers(json.data || []);
    } catch (err) {
      console.error(err);
      setError('讀取失敗，請稍後再試');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch('/api/admin?table=customers', {
          headers: { 'x-admin-password': localStorage.getItem('admin_password') || '' },
        });
        const json = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError(json.error || '讀取 LINE 客戶資料失敗');
          return;
        }
        setCustomers(json.data || []);
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          setError('讀取失敗，請稍後再試');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => { cancelled = true; };
  }, []);

  const filteredCustomers = useMemo(() => {
    const keyword = searchText.trim().toLowerCase().replace(/[\s-]/g, '');
    if (!keyword) return customers;

    return customers.filter(customer => {
      const values = [
        customer.phone?.replace(/[\s-]/g, ''),
        customer.name,
        customer.line_display_name,
        customer.line_user_id,
      ];
      return values.some(value => value?.toLowerCase().includes(keyword));
    });
  }, [customers, searchText]);

  const boundCount = customers.filter(customer => customer.line_user_id).length;

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#4A4947' }}>LINE 客戶管理</h1>
          <p className="text-sm text-gray-500 mt-1">客戶傳送電話完成綁定後，LINE 資料會自動出現在此處</p>
        </div>
        <button
          type="button"
          onClick={() => void loadCustomers(true)}
          disabled={refreshing}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? '更新中...' : '重新整理'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-[#AA745215] flex items-center justify-center">
            <UsersRound className="w-5 h-5" style={{ color: '#AA7452' }} />
          </div>
          <div>
            <p className="text-sm text-gray-500">客戶總數</p>
            <p className="text-2xl font-bold" style={{ color: '#4A4947' }}>{customers.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">LINE 已綁定</p>
            <p className="text-2xl font-bold text-green-700">{boundCount}</p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
        <p className="text-sm font-semibold text-blue-800 mb-1">自動抓取流程</p>
        <p className="text-sm text-blue-700 leading-6">
          客戶加入 LINE 官方帳號並傳送手機號碼後，系統會比對訂單或諮詢紀錄；比對成功即自動保存 LINE 名稱、頭像、LINE User ID、手機號碼及綁定時間。基於 LINE 隱私限制，無法只在後臺輸入電話就反查 LINE 身分。
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="search"
              value={searchText}
              onChange={event => setSearchText(event.target.value)}
              placeholder="搜尋電話、客戶姓名或 LINE 名稱"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 text-sm bg-white"
              style={{ '--tw-ring-color': '#AA745240' } as React.CSSProperties}
            />
          </div>
        </div>

        {error && <div className="px-5 py-4 bg-red-50 text-red-600 text-sm">⚠️ {error}</div>}

        {loading ? (
          <div className="py-16 text-center text-gray-400">載入 LINE 客戶資料中...</div>
        ) : filteredCustomers.length === 0 ? (
          <div className="py-16 px-6 text-center">
            <UserRound className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">{searchText ? '找不到符合的客戶' : '尚無 LINE 綁定客戶'}</p>
            {!searchText && <p className="text-gray-400 text-sm mt-2">客戶完成電話綁定後會自動顯示，不需手動建立。</p>}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[980px]">
              <thead className="border-b bg-white">
                <tr>
                  <th className="px-5 py-3 text-left">LINE 客戶</th>
                  <th className="px-5 py-3 text-left">客戶姓名</th>
                  <th className="px-5 py-3 text-left">手機號碼</th>
                  <th className="px-5 py-3 text-left">LINE User ID</th>
                  <th className="px-5 py-3 text-center">狀態</th>
                  <th className="px-5 py-3 text-left">最近更新</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map(customer => (
                  <tr key={customer.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {customer.line_picture_url ? (
                          <img
                            src={customer.line_picture_url}
                            alt={customer.line_display_name || 'LINE 客戶'}
                            className="w-11 h-11 rounded-full object-cover bg-gray-100"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-full bg-green-50 flex items-center justify-center">
                            <UserRound className="w-5 h-5 text-green-600" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-800">{customer.line_display_name || '尚未取得名稱'}</p>
                          <p className="text-xs text-gray-400">LINE 顯示名稱</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-700">{customer.name || '-'}</td>
                    <td className="px-5 py-4">
                      <a href={`tel:${customer.phone}`} className="inline-flex items-center gap-1.5 text-gray-700 hover:text-[#AA7452]">
                        <Phone className="w-3.5 h-3.5" /> {customer.phone}
                      </a>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 font-mono text-xs text-gray-500" title={customer.line_user_id || undefined}>
                        <Link2 className="w-3.5 h-3.5" /> {maskLineUserId(customer.line_user_id)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      {customer.line_user_id ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" /> 已綁定
                        </span>
                      ) : (
                        <span className="inline-flex px-2.5 py-1 bg-gray-100 text-gray-500 rounded-full text-xs">未綁定</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-gray-500 whitespace-nowrap">{formatDate(customer.updated_at || customer.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filteredCustomers.length > 0 && (
          <div className="px-5 py-3 bg-gray-50 border-t text-xs text-gray-400">
            顯示 {filteredCustomers.length} 筆，共 {customers.length} 位客戶
          </div>
        )}
      </div>
    </div>
  );
}
