'use client';

import { useEffect, useState } from 'react';
import { BarChart3, ChevronLeft, ChevronRight } from 'lucide-react';

type ViewRow = { id: string; path: string; session_id: string; created_at: string };
type Data = { total: number; page: number; pageSize: number; visitors: ViewRow[]; daily: Array<{ day: string; views: number }>; monthly: Array<{ month: string; views: number }> };

const number = (value: number) => new Intl.NumberFormat('zh-TW').format(value);



export default function LocalPageViewDashboard() {
  const [data, setData] = useState<Data | null>(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/admin/page-views?page=${page}`, { headers: {}, cache: 'no-store' });
        const json = await response.json();
        if (!response.ok) throw new Error(json.error || '瀏覽資料暫時無法讀取');
        setData(json);
        setError('');
      } catch (err) { setError(err instanceof Error ? err.message : '瀏覽資料暫時無法讀取'); }
      finally { setLoading(false); }
    };
    void load();
  }, [page]);

  const max = Math.max(...(data?.daily || []).map(item => Number(item.views)), 1);
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;
  return <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><h2 className="flex items-center gap-2 text-lg font-semibold text-[#4A4947]"><BarChart3 className="h-5 w-5" />本地瀏覽紀錄</h2><p className="mt-1 text-sm text-gray-500">每次頁面瀏覽皆獨立寫入；統計由資料庫端計算。</p></div>
      <div className="rounded-lg bg-[#fcf8f4] px-4 py-2 text-right"><p className="text-xs text-[#805e45]">總瀏覽人次</p><p className="text-2xl font-bold text-[#4A4947]">{loading ? '—' : number(data?.total || 0)}</p></div>
    </div>
    {error ? <p className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : <>
      <div className="mt-5 rounded-lg border border-gray-100 p-4"><p className="mb-4 font-semibold text-[#4A4947]">近 30 天瀏覽趨勢</p><div className="flex h-32 items-end gap-1" aria-label="近 30 天瀏覽趨勢圖">{(data?.daily || []).map(item => <div key={item.day} title={`${item.day}：${number(Number(item.views))} 次`} className="min-w-0 flex-1 rounded-t bg-[#b98762]" style={{ height: `${Math.max(4, (Number(item.views) / max) * 100)}%` }} />)}</div></div>
      <div className="mt-5 overflow-x-auto"><div className="mb-3 flex items-center justify-between gap-3"><p className="font-semibold text-[#4A4947]">訪客明細</p><div className="flex items-center gap-2 text-sm text-gray-600"><button type="button" onClick={() => setPage(current => Math.max(1, current - 1))} disabled={page === 1} className="rounded border p-1 disabled:opacity-40" aria-label="上一頁"><ChevronLeft className="h-4 w-4" /></button><span>{page} / {totalPages}</span><button type="button" onClick={() => setPage(current => Math.min(totalPages, current + 1))} disabled={page === totalPages} className="rounded border p-1 disabled:opacity-40" aria-label="下一頁"><ChevronRight className="h-4 w-4" /></button></div></div><table className="w-full min-w-[32rem] text-left text-sm"><thead className="border-b border-gray-100 text-xs text-gray-500"><tr><th className="pb-2">時間</th><th className="pb-2">頁面</th><th className="pb-2" title="同一位訪客在同一個瀏覽器開啟期間使用的識別碼">工作階段 ID</th></tr></thead><tbody>{(data?.visitors || []).map(row => <tr key={row.id} className="border-b border-gray-50"><td className="py-2.5 text-gray-600">{new Date(row.created_at).toLocaleString('zh-TW')}</td><td className="py-2.5 text-gray-700">{row.path}</td><td className="py-2.5 text-gray-500" title="相同編號代表同一瀏覽器開啟期間的連續瀏覽">{row.session_id.slice(0, 8)}</td></tr>)}</tbody></table></div>
    </>}
  </section>;
}
