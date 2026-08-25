'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const SERVICES = [
  {
    title: 'AI 互動道具',
    desc: '結合人工智慧技術的創新互動道具，打造沉浸式活動體驗。透過 AI 人臉辨識、手勢互動、即時生成等技術，讓每位賓客都能成為活動的主角。',
    image: '/images/services/AI互動道具.png',
    href: '/services/ai-interactive-props',
  },
  {
    title: '活動策劃統包',
    desc: '從企劃到執行，提供一站式活動統包服務，讓您省心省力。我們整合所有環節，包含場地規劃、流程設計、人員調度、設備安排，確保活動順利進行。',
    image: '/images/services/活動策劃統包.png',
    href: '/services/event-package',
  },
  {
    title: '啟動儀式',
    desc: '星辰運轉、全息投影、沙漏啟動等多種創意儀式，為活動開場製造震撼記憶點。專業設備搭配精準執行，讓每一次啟動都成為難忘時刻。',
    image: '/images/services/啟動儀式.png',
    href: '/services/opening-ceremony',
  },
  {
    title: '活動特效',
    desc: '專業活動特效服務，為現場營造震撼視覺效果。提供乾冰、泡泡、彩帶、煙火等多種特效選擇，讓活動氛圍更加精彩動人。',
    image: '/images/services/活動特效.png',
    href: '/services/special-effects',
  },
  {
    title: '外派調酒',
    desc: '專業調酒師現場調製，為活動增添品味與儀式感。提供客製化調酒菜單、特色飲品設計，讓賓客享受獨特的味覺體驗。',
    image: '/images/services/外派調酒.png',
    href: '/services/bartending',
  },
  {
    title: 'SHOW GIRL',
    desc: '專業活動人員派遣，提供展場接待、活動協助等服務。嚴選優質人員，專業培訓，展現品牌最佳形象。',
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
                了解更多
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            {/* 右側圖片 */}
            <div className="w-full lg:w-1/2 relative min-h-[300px] lg:min-h-[400px]">
              <Image
                src={activeService.image}
                alt={activeService.title}
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
