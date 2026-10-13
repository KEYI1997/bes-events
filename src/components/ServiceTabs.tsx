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
      <div className="relative mb-7 border-y border-[#cfc5b8] py-2">
        <div 
          ref={tabsContainerRef}
          className="relative flex justify-start gap-x-6 gap-y-1 overflow-x-auto pb-1 md:justify-between"
        >
          {SERVICES.map((service, index) => (
            <button
              key={service.title}
              type="button"
              ref={(el) => { tabRefs.current[index] = el; }}
              onClick={() => setActiveIndex(index)}
              className={`shrink-0 px-1 py-3 text-sm font-semibold transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a96d3f] ${
                activeIndex === index
                  ? 'text-[#9a6037]'
                  : 'text-[#3d3934]/65 hover:text-[#3d3934]'
              }`}
            >
              {service.title}
            </button>
          ))}
          {/* 底部滑動線 */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 h-px bg-[#a96d3f] transition-[left,width] duration-500 ease-out"
            style={{
              left: underlineStyle.left,
              width: underlineStyle.width,
            }}
          />
        </div>
      </div>

      <div className="relative">
        <button
          onClick={handlePrev}
          className="absolute left-3 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center border border-white/70 bg-black/35 text-white transition-colors hover:bg-white hover:text-[#2b2824] lg:flex"
          aria-label="上一個"
        >
          <ChevronLeft className="w-5 h-5 text-primary" />
        </button>
        <button
          onClick={handleNext}
          className="absolute right-3 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center border border-white/70 bg-black/35 text-white transition-colors hover:bg-white hover:text-[#2b2824] lg:flex"
          aria-label="下一個"
        >
          <ChevronRight className="w-5 h-5 text-primary" />
        </button>

        <div className="overflow-hidden bg-[#28231e]">
          <div className="flex min-h-[440px] flex-col lg:min-h-[510px] lg:flex-row">
            <div className="flex w-full flex-col justify-between p-8 text-white sm:p-12 lg:w-[42%] lg:p-14">
              <div>
                <h3 className="text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
                {activeService.title}
              </h3>
                <p className="mt-6 max-w-sm text-base leading-8 text-white/72">
                {activeService.desc}
              </p>
              </div>
              <Link
                href={activeService.href}
                className="group mt-12 inline-flex w-fit items-center gap-3 border-b border-[#d8a36f] pb-2 text-sm font-bold text-[#f4d3ae] transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              >
                探索服務內容
                <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
            <div className="relative min-h-[320px] w-full overflow-hidden lg:w-[58%] lg:min-h-[510px]">
              <Image
                src={activeService.image}
                alt={`${activeService.title}活動服務與現場執行`}
                fill
                sizes="(min-width: 1024px) 58vw, 100vw"
                className="object-cover transition-transform duration-700 ease-out hover:scale-[1.025]"
              />
              <div className="absolute inset-0 bg-black/10" />
              <p className="absolute bottom-5 right-6 text-[10px] font-semibold tracking-[0.2em] text-white/70">BES EVENTS</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
