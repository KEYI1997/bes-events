'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Case } from '@/lib/types';
import AnimateOnScroll from '@/components/AnimateOnScroll';

const CATEGORIES = [
  '全部',
  '記者會',
  '尾牙',
  '家庭日',
  '典禮',
  '市集',
  '展覽',
];

export default function CasesGrid({ cases }: { cases: Case[] }) {
  const [activeCategory, setActiveCategory] = useState('全部');

  const filteredCases = activeCategory === '全部'
    ? cases
    : cases.filter((c) => c.category.includes(activeCategory));

  return (
    <>
      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-3 mb-12 justify-center">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
              activeCategory === cat
                ? 'bg-cta text-white'
                : 'bg-white text-primary hover:bg-cta/10'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Cases Grid */}
      {filteredCases.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCases.map((caseItem, index) => (
            <AnimateOnScroll key={caseItem.id} delay={index * 80}>
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow h-full flex flex-col">
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
                    {caseItem.title}
                  </h3>
                  {caseItem.client_name && (
                    <p className="text-primary/60 text-sm mt-auto">
                      {caseItem.client_name}
                    </p>
                  )}
                </div>
              </div>
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
