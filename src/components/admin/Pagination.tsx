'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

type PaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  noun?: string;
};

export default function Pagination({ page, pageSize, total, onPageChange, noun = '筆資料' }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t bg-gray-50 px-4 py-3 text-sm">
      <p className="text-gray-500">顯示 {start}–{end} 筆，共 {total} {noun}</p>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => onPageChange(page - 1)} disabled={page <= 1} className="inline-flex h-8 items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-45">
          <ChevronLeft className="h-4 w-4" /> 上一頁
        </button>
        <span className="tabular-nums text-gray-500">第 {page}／{totalPages} 頁</span>
        <button type="button" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} className="inline-flex h-8 items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-45">
          下一頁 <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
