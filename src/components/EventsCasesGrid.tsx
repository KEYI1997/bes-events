'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Case } from '@/lib/types';

const CATEGORIES = ['全部', '開幕典禮', '記者會', '新品發表會', '展覽攤位', '政府活動', '春酒尾牙', '典禮節慶'] as const;
type Category = typeof CATEGORIES[number];

interface EventsCasesGridProps {
  cases: Case[];
  initialCategory?: string;
}

export default function EventsCasesGrid({ cases, initialCategory }: EventsCasesGridProps) {
  const validInitial = CATEGORIES.includes(initialCategory as Category) ? initialCategory as Category : '全部';
  const [active, setActive] = useState<Category>(validInitial);
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const updateUnderline = () => {
      const idx = CATEGORIES.indexOf(active);
      const activeTab = tabRefs.current[idx];
      const container = tabsContainerRef.current;
      if (activeTab && container) {
        const containerRect = container.getBoundingClientRect();
        const tabRect = activeTab.getBoundingClientRect();
        const underlineWidth = 28;
        setUnderlineStyle({
          left: tabRect.left - containerRect.left + (tabRect.width - underlineWidth) / 2,
          width: underlineWidth,
        });
      }
    };
    updateUnderline();
    window.addEventListener('resize', updateUnderline);
    return () => window.removeEventListener('resize', updateUnderline);
  }, [active]);

  // 已由 server 按 sort_order 排序傳入，這裡只做篩選
  const filtered = active === '全部' ? cases : cases.filter(c => c.category === active);

  return (
    <div className="w-full">
      {/* Tab 按鈕列 */}
      <div className="relative mb-10">
        <div
          ref={tabsContainerRef}
          className="relative flex justify-center gap-3 flex-wrap"
        >
          {CATEGORIES.map((cat, index) => (
            <button
              key={cat}
              ref={el => { tabRefs.current[index] = el; }}
              onClick={() => setActive(cat)}
              className={`px-6 py-2.5 rounded-full border-2 text-sm font-medium transition-all duration-300 ${
                active === cat
                  ? 'border-primary bg-primary text-white'
                  : 'border-primary/30 text-primary hover:border-primary/60'
              }`}
            >
              {cat}
            </button>
          ))}
          {/* 底部滑動線 */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-3 h-0.5 rounded-full bg-cta transition-[left,width] duration-500 ease-out"
            style={{ left: underlineStyle.left, width: underlineStyle.width }}
          />
        </div>
      </div>

      {/* 案例 Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 bg-white"
            >
              <div className="relative aspect-video overflow-hidden">
                {c.image_url ? (
                  <Image
                    src={c.image_url.split(',')[0]}
                    alt={c.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary/40 text-sm">暫無圖片</span>
                  </div>
                )}
                {/* 活動類型標籤 */}
                <span className="absolute top-3 left-3 px-3 py-1 bg-cta text-white text-xs font-medium rounded-full">
                  {c.category}
                </span>
                {/* 服務項目標籤 */}
                {c.service_type && (
                  <span className="absolute top-3 right-3 px-3 py-1 bg-primary/80 text-white text-xs font-medium rounded-full">
                    {c.service_type}
                  </span>
                )}
              </div>
              <div className="p-5">
                <h3 className="font-bold text-primary text-base mb-2 leading-snug">{c.title}</h3>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-primary/60">
                  {c.client_name && (
                    <span>主辦：{c.client_name}</span>
                  )}
                  {c.event_date && (
                    <span>{c.event_date}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-primary/50 text-lg">此分類目前尚無案例</p>
        </div>
      )}
    </div>
  );
}
