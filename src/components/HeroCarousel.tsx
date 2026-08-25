'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronDown } from 'lucide-react';

const SLIDES = [
  { src: '/images/hero/hero-1.png', alt: '境曜有限公司企業活動企劃與舞台現場執行' },
  { src: '/images/hero/hero-2.png', alt: '境曜有限公司品牌活動整合與啟動儀式' },
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % SLIDES.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  // 自動輪播
  useEffect(() => {
    const timer = setInterval(next, 20000);
    return () => clearInterval(timer);
  }, [next]);

  // 觸控左右滑動切換輪播圖（非上下捲動）
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 75) next();
    if (touchEnd - touchStart > 75) prev();
  };

  // 向下箭頭：跳到下一個 data-snap 區塊（服務項目）
  const scrollToNext = () => {
    const snaps = Array.from(document.querySelectorAll<HTMLElement>('[data-snap="true"]'));
    const second = snaps[1];
    if (second) second.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section
      data-snap="true"
      className="relative h-screen w-full border-b-2 border-gray-300"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 背景圖片輪播 */}
      <div className="relative w-full h-full overflow-hidden">
        {SLIDES.map((slide, index) => (
          <div
            key={slide.src}
            className={`absolute inset-0 transition-opacity duration-[1500ms] ease-in-out ${
              index === current ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={slide.src}
              alt={slide.alt}
              className="w-full h-full object-cover scale-x-[-1]"
            />
          </div>
        ))}

        {/* 暗色覆蓋層 */}
        <div className="absolute inset-0 bg-black/50" />

        {/* 文字內容 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-6 md:px-12">
            <div className="max-w-3xl mx-auto">
              <p className="mb-4 text-sm font-semibold tracking-[0.2em] text-white/85">
                境曜有限公司 BES EVENTS
              </p>
              <h1 className="text-3xl md:text-5xl lg:text-[3.5rem] font-bold text-white leading-tight mb-6 tracking-tight">
                每一場活動
                <br />
                成為品牌被記住的時刻
              </h1>
              <p className="text-lg md:text-xl text-white/80 leading-relaxed mb-8 max-w-2xl mx-auto">
                從企劃、設計到現場執行，境曜整合每一個環節，將品牌想法完整呈現
                <br />
                專注企業活動整合與現場執行
                <br />
                提供從啟動儀式、舞台燈光到整體專案企劃與媒體曝光的一站式服務
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link
                  href="/contact"
                  className="group relative inline-flex items-center px-6 py-3 text-sm font-semibold rounded-lg border-2 border-cta transition-all duration-300 ease-in-out bg-cta text-white hover:bg-white hover:text-cta overflow-hidden"
                >
                  <ArrowRight size={14} className="mr-2 transition-all duration-300 ease-in-out opacity-100 translate-x-0 group-hover:opacity-0 group-hover:-translate-x-4" />
                  <span>免費諮詢</span>
                  <ArrowRight size={14} className="ml-2 rotate-180 transition-all duration-300 ease-in-out opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0" />
                </Link>
                <Link
                  href="/cases"
                  className="inline-flex items-center gap-2 px-6 py-3 border border-white/60 text-white text-sm font-semibold rounded-lg hover:bg-white/10 transition-colors"
                >
                  查看案例
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* 底部輪播指示點 */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {SLIDES.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`h-1 rounded-full transition-all duration-300 ${
                index === current ? 'w-8 bg-white' : 'w-4 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`切換到第 ${index + 1} 張圖片`}
            />
          ))}
        </div>

        {/* 向下提示箭頭 */}
        <button
          onClick={scrollToNext}
          className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 text-white/70 hover:text-white transition-colors animate-bounce"
          aria-label="向下捲動至服務項目"
        >
          <ChevronDown size={36} strokeWidth={1.5} />
        </button>
      </div>
    </section>
  );
}
