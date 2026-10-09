'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const SERVICES = [
  {
    title: 'AI 互動道具',
    desc: '讓賓客的照片、文字或動作，成為可即時分享的品牌互動內容。',
    image: '/images/services/AI互動道具.png',
    href: '/services/ai-interactive-props',
  },
  {
    title: '活動策劃統包',
    desc: '把企劃、視覺、設備、人員與現場流程，整理成一套可執行的活動計畫。',
    image: '/images/services/活動策劃統包.png',
    href: '/services/event-package',
  },
  {
    title: '啟動儀式',
    desc: '為開幕、發表會與典禮，設計品牌亮相的關鍵畫面。',
    image: '/images/services/啟動儀式.png',
    href: '/services/opening-ceremony',
  },
  {
    title: '活動特效',
    desc: '依舞台流程、場地條件與安全規範，安排開場、亮相與高潮段落的特效效果。',
    image: '/images/services/活動特效.png',
    href: '/services/special-effects',
  },
  {
    title: '外派調酒',
    desc: '依賓客人數、服務時段與場地配置，安排調酒方案、吧台與飲品體驗。',
    image: '/images/services/外派調酒.png',
    href: '/services/bartending',
  },
  {
    title: 'SHOW GIRL',
    desc: '依接待、引導、產品展示或舞台互動需求，安排符合品牌形象的活動人員。',
    image: '/images/services/show girl.png',
    href: '/services/showgirl',
  },
];

export default function ServiceTabs() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const updateUnderline = () => {
      const underlineWidth = 28;
      const activeTab = tabRefs.current[activeIndex];
      const container = tabsContainerRef.current;
      if (activeTab && container) {
        const containerRect = container.getBoundingClientRect();
        const tabRect = activeTab.getBoundingClientRect();
        setUnderlineStyle({
          left: tabRect.left - containerRect.left + (tabRect.width - underlineWidth) / 2,
          width: underlineWidth,
        });
      }
    };
    
    updateUnderline();
    window.addEventListener('resize', updateUnderline);
    return () => window.removeEventListener('resize', updateUnderline);
  }, [activeIndex]);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + SERVICES.length) % SERVICES.length);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % SERVICES.length);
  };

  const activeService = SERVICES[activeIndex];

  return (
    <div className="w-full">
      {/* Tab 按鈕列 */}
      <div className="relative mb-8">
        <div 
          ref={tabsContainerRef}
          className="relative flex justify-center gap-3 flex-wrap"
        >
          {SERVICES.map((service, index) => (
            <button
              key={service.title}
              type="button"
              ref={(el) => { tabRefs.current[index] = el; }}
              onClick={() => setActiveIndex(index)}
              className={`px-6 py-2.5 rounded-full border-2 text-sm font-medium transition-all duration-300 ${
                activeIndex === index
                  ? 'border-primary bg-primary text-white'
                  : 'border-primary/30 text-primary hover:border-primary/60'
              }`}
            >
              {service.title}
            </button>
          ))}
          {/* 底部滑動線 */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-3 h-0.5 bg-cta rounded-full transition-[left,width] duration-500 ease-out"
            style={{
              left: underlineStyle.left,
              width: underlineStyle.width,
            }}
          />
        </div>
      </div>

      {/* 內容區域 */}
      <div className="relative">
        {/* 左右箭頭 */}
        <button
          onClick={handlePrev}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-14 w-10 h-10 rounded-full border-2 border-primary/30 bg-white hover:border-primary/60 flex items-center justify-center transition-all z-10"
          aria-label="上一個"
        >
          <ChevronLeft className="w-5 h-5 text-primary" />
        </button>
        <button
          onClick={handleNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-14 w-10 h-10 rounded-full border-2 border-primary/30 bg-white hover:border-primary/60 flex items-center justify-center transition-all z-10"
          aria-label="下一個"
        >
          <ChevronRight className="w-5 h-5 text-primary" />
        </button>

        {/* 內容框 */}
        <div className="border-2 border-primary/20 rounded-[32px] overflow-hidden bg-white">
          <div className="flex flex-col lg:flex-row min-h-[400px]">
            {/* 左側文字 */}
            <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
              <h3 className="text-2xl lg:text-3xl font-bold text-primary mb-4">
                {activeService.title}
              </h3>
              <p className="text-primary/70 leading-relaxed mb-6">
                {activeService.desc}
              </p>
              <Link
                href={activeService.href}
                className="inline-flex items-center gap-2 text-cta font-medium hover:underline"
              >
                查看服務內容
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            {/* 右側圖片 */}
            <div className="w-full lg:w-1/2 relative min-h-[300px] lg:min-h-[400px]">
              <Image
                src={activeService.image}
                alt={`${activeService.title}活動服務與現場執行`}
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
