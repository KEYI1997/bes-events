'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const SLIDES = [
  { src: '/images/hero/hero-1.png', alt: '境曜活動 1' },
  { src: '/images/hero/hero-2.png', alt: '境曜活動 2' },
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

  // 觸控滑動
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

  return (
    <section
      className="relative h-screen w-full"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 內縮的圓角容器 */}
      <div className="relative w-full h-full overflow-hidden">
        {/* 背景圖片輪播 */}
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
              className="w-full h-full object-cover"
            />
          </div>
        ))}

        {/* 自然的暗色漸層覆蓋 — 從右到左漸淡 */}
        <div className="absolute inset-0 bg-gradient-to-l from-black/70 via-black/40 to-transparent" />
        {/* 底部微漸層 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

        {/* 文字內容 — 右側 */}
        <div className="absolute inset-0 flex items-center justify-end">
          <div className="w-full md:w-[45%] px-6 md:px-12 lg:pr-20">
            <div className="max-w-md">
              <h1 className="text-3xl md:text-5xl lg:text-[3.5rem] font-bold text-white leading-tight mb-5 tracking-tight">
                活動，不只是辦
                <br />
                <span className="text-accent">是打造影響力</span>
              </h1>
              <p className="text-base md:text-lg text-white/70 leading-relaxed mb-4">
                專注企業活動整合與現場執行，提供從啟動儀式、舞台燈光到到整體專案企劃與媒體曝光的一站式服務。
              </p>
              <p className="text-base md:text-lg text-white/70 leading-relaxed mb-8">
                讓品牌的重要時刻，被精準呈現，也被深刻記住。
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/contact"
                  className="group relative inline-flex items-center px-6 py-3 text-sm font-semibold rounded-lg border-2 border-cta transition-all duration-300 ease-in-out bg-cta text-white hover:bg-transparent hover:text-cta overflow-hidden"
                >
                  {/* 左箭頭 - 初始顯示，hover 隱藏 */}
                  <ArrowRight size={14} className="mr-2 transition-all duration-300 ease-in-out opacity-100 translate-x-0 group-hover:opacity-0 group-hover:-translate-x-4" />
                  <span>免費諮詢</span>
                  {/* 右箭頭 - 初始隱藏，hover 顯示，方向反轉 */}
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

        {/* 底部指示點 */}
        <div className="absolute bottom-8 right-6 md:right-12 lg:right-20 flex gap-2 z-20">
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
      </div>
    </section>
  );
}
