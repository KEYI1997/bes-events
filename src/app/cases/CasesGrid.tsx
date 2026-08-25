'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Case } from '@/lib/types';
import AnimateOnScroll from '@/components/AnimateOnScroll';

const CATEGORIES = [
  '全部',
  '開幕典禮',
  '記者會',
  '新品發表會',
  '展覽攤位',
  '政府活動',
  '春酒尾牙',
  '典禮節慶',
];

export default function CasesGrid({ cases }: { cases: Case[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category') ?? '';
  const activeCategory = CATEGORIES.includes(categoryParam) ? categoryParam : '全部';
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const updateUnderline = () => {
      const activeIndex = CATEGORIES.indexOf(activeCategory);
      const activeTab = tabRefs.current[activeIndex];
      const container = tabsContainerRef.current;

      if (!activeTab || !container) return;

      const underlineWidth = 28;
      const containerRect = container.getBoundingClientRect();
      const tabRect = activeTab.getBoundingClientRect();
      setUnderlineStyle({
        left: tabRect.left - containerRect.left + (tabRect.width - underlineWidth) / 2,
        width: underlineWidth,
      });
    };

    updateUnderline();
    window.addEventListener('resize', updateUnderline);
    return () => window.removeEventListener('resize', updateUnderline);
  }, [activeCategory]);

  const filteredCases = activeCategory === '全部'
    ? cases
    : cases.filter((c) => c.category.includes(activeCategory));

  return (
    <>
      {/* Filter Tabs */}
      <div className="relative mb-12">
        <div ref={tabsContainerRef} className="relative flex flex-wrap justify-center gap-3">
          {CATEGORIES.map((cat, index) => (
            <button
              key={cat}
              type="button"
              ref={(el) => { tabRefs.current[index] = el; }}
              onClick={() => router.replace(cat === '全部' ? '/cases' : `/cases?category=${encodeURIComponent(cat)}`, { scroll: false })}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 cursor-pointer ${
                activeCategory === cat
                  ? 'bg-cta text-white'
                  : 'bg-white text-primary hover:bg-cta/10'
              }`}
            >
              {cat}
            </button>
          ))}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-3 h-0.5 rounded-full bg-cta transition-[left,width] duration-500 ease-out"
            style={underlineStyle}
          />
        </div>
      </div>

      {/* Cases Grid */}
      {filteredCases.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCases.map((caseItem, index) => (
            <AnimateOnScroll key={caseItem.id} delay={index * 80}>
              <Link href={`/cases/${caseItem.id}`} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow h-full flex flex-col focus:outline-none focus:ring-2 focus:ring-cta">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={caseItem.image_url}
                    alt={caseItem.title}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs px-3 py-1 bg-cta/10 text-cta rounded-full font-medium">
                      {caseItem.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-primary mb-2">
                    {formatCaseTitle(caseItem)}
                  </h3>
                  {caseItem.client_name && (
                    <p className="text-primary/60 text-sm mt-auto">
                      {caseItem.client_name}
                    </p>
                  )}
                </div>
              </Link>
            </AnimateOnScroll>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-primary/60 text-lg">目前此分類尚無案例資料。</p>
        </div>
      )}
    </>
  );
}

function formatCaseTitle(caseItem: Case) {
  const titleMatch = caseItem.title.match(/【([^】]+)】/);
  const activityTitle = titleMatch?.[1]?.trim() || caseItem.title.replace(/^【|】$/g, '').trim();
  const products = caseItem.used_products?.filter(Boolean).join(' | ');
  return products ? `${products} | ${activityTitle}` : activityTitle;
}
