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
      className="relative min-h-[740px] h-[100svh] w-full overflow-hidden bg-[#181512]"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative h-full w-full overflow-hidden">
        {SLIDES.map((slide, index) => (
          <div
            key={slide.src}
            className={`absolute inset-0 transition-opacity duration-[1400ms] ease-in-out motion-reduce:transition-none ${
              index === current ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={slide.src}
              alt={slide.alt}
              className="h-full w-full object-cover object-center scale-x-[-1]"
            />
          </div>
        ))}

        <div className="absolute inset-0 bg-[#171411]/[0.68]" />
        <div className="absolute inset-x-0 top-0 h-px bg-white/40" />

        <div className="absolute inset-0 mx-auto flex w-full max-w-[1600px] items-end px-6 pb-28 pt-32 sm:px-10 md:items-center md:px-16 lg:px-24">
          <div className="max-w-4xl text-white">
            <h1 className="max-w-3xl text-[clamp(3.2rem,7vw,6.5rem)] font-semibold leading-[0.98] tracking-[-0.045em] text-balance">
              讓品牌的重要時刻<br className="hidden sm:block" />
              在現場成真
            </h1>
            <div className="mt-8 flex max-w-xl flex-col gap-6 border-l border-[#d8a36f] pl-5 sm:mt-10 sm:flex-row sm:items-end sm:justify-between sm:pl-7">
              <p className="max-w-md text-base leading-8 text-white/80 sm:text-lg">
                從企劃、設備整合到現場執行，為品牌打造值得被記住的每一個關鍵畫面。
              </p>
              <span className="shrink-0 text-xs tracking-[0.18em] text-white/60">TAIWAN</span>
            </div>
            <div className="mt-10 flex flex-wrap gap-3 sm:mt-12">
              <Link
                href="/contact"
                className="group inline-flex min-h-12 items-center gap-3 bg-[#c18a52] px-6 py-3 text-sm font-bold text-white transition-colors duration-300 hover:bg-white hover:text-[#8f5f43] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              >
                開始規劃活動
                <ArrowRight size={17} className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                href="/cases"
                className="group inline-flex min-h-12 items-center gap-3 border border-white/55 px-6 py-3 text-sm font-bold text-white transition-colors duration-300 hover:border-white hover:bg-white hover:text-[#2a2520] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              >
                查看活動案例
                <ArrowRight size={17} className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 hidden border-t border-white/20 bg-black/15 md:block">
          <div className="mx-auto grid max-w-[1600px] grid-cols-3 divide-x divide-white/20 px-16 lg:px-24">
            {['活動企劃與統籌', '儀式、設備與特效', '現場技術與執行'].map((item) => (
              <span key={item} className="py-5 text-center text-sm tracking-[0.13em] text-white/80">
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* 底部輪播指示點 */}
        <div className="absolute right-6 top-1/2 z-20 hidden -translate-y-1/2 flex-col gap-3 md:flex">
          {SLIDES.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`w-8 border-t transition-colors duration-300 ${
                index === current ? 'border-[#e6b478]' : 'border-white/35 hover:border-white'
              }`}
              aria-label={`切換到第 ${index + 1} 張圖片`}
            />
          ))}
        </div>

        {/* 向下提示箭頭 */}
        <button
          onClick={scrollToNext}
          className="absolute bottom-7 left-6 z-20 text-white/70 transition-colors hover:text-white md:bottom-8 md:left-10 lg:left-16"
          aria-label="向下捲動至服務項目"
        >
          <ChevronDown size={30} strokeWidth={1.4} />
        </button>
      </div>
    </section>
  );
}
