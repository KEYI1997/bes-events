'use client';
import { useEffect, useRef } from 'react';

/**
 * HomeSnapScroll
 * 掛載後偵測頁面上所有 [data-snap] 元素，
 * 滾輪每次往下/往上滾一格，就平滑跳到下一個／上一個區塊。
 * 離開首頁（元件 unmount）後自動清除監聽。
 */
export default function HomeSnapScroll() {
  const cooldown = useRef(false);
  const currentIndex = useRef(0);

  useEffect(() => {
    const getSections = () =>
      Array.from(document.querySelectorAll<HTMLElement>('[data-snap]'));

    /** 找目前視窗最接近頂端的 section index */
    const getActiveIndex = (sections: HTMLElement[]) => {
      const midY = window.innerHeight / 2;
      let closest = 0;
      let minDist = Infinity;
      sections.forEach((el, i) => {
        const rect = el.getBoundingClientRect();
        const dist = Math.abs(rect.top + rect.height / 2 - midY);
        if (dist < minDist) { minDist = dist; closest = i; }
      });
      return closest;
    };

    const scrollTo = (index: number) => {
      const sections = getSections();
      if (index < 0 || index >= sections.length) return;
      currentIndex.current = index;
      sections[index].scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < 5) return; // 忽略微小滾動
      if (cooldown.current) return;

      const sections = getSections();
      if (sections.length === 0) return;

      // 更新目前位置
      const active = getActiveIndex(sections);
      const next = e.deltaY > 0 ? active + 1 : active - 1;

      // 已在第一個往上滾 or 最後一個往下滾 → 不攔截，讓正常捲動
      if (next < 0 || next >= sections.length) return;

      e.preventDefault();
      cooldown.current = true;
      scrollTo(next);

      setTimeout(() => { cooldown.current = false; }, 900);
    };

    // Touch 支援
    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };
    const handleTouchEnd = (e: TouchEvent) => {
      if (cooldown.current) return;
      const delta = touchStartY - e.changedTouches[0].clientY;
      if (Math.abs(delta) < 40) return; // 忽略短距離

      const sections = getSections();
      if (sections.length === 0) return;

      const active = getActiveIndex(sections);
      const next = delta > 0 ? active + 1 : active - 1;
      if (next < 0 || next >= sections.length) return;

      cooldown.current = true;
      scrollTo(next);
      setTimeout(() => { cooldown.current = false; }, 900);
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  return null; // 純邏輯元件，不渲染任何 DOM
}
