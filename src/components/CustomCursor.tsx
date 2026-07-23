'use client';

import { useEffect, useRef } from 'react';

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, y: 0 });
  const trailPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // 手機不顯示自訂游標
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;

    const cursor = cursorRef.current;
    const trail = trailRef.current;
    if (!cursor || !trail) return;

    // 顯示自訂游標
    document.documentElement.style.cursor = 'none';
    document.body.style.cursor = 'none';

    const handleMouseMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
      cursor.style.transform = `translate(${e.clientX - 16}px, ${e.clientY - 16}px)`;
    };

    // 拖尾用 requestAnimationFrame 追蹤
    let animId: number;
    const animateTrail = () => {
      const dx = pos.current.x - trailPos.current.x;
      const dy = pos.current.y - trailPos.current.y;
      // 緩動係數 — 數值越小拖尾越長
      trailPos.current.x += dx * 0.15;
      trailPos.current.y += dy * 0.15;
      trail.style.transform = `translate(${trailPos.current.x - 10}px, ${trailPos.current.y - 10}px)`;

      // 根據速度決定拖尾透明度和大小
      const speed = Math.sqrt(dx * dx + dy * dy);
      const scale = Math.min(1, speed / 50);
      const opacity = Math.min(0.6, speed / 80);
      trail.style.opacity = String(opacity);
      trail.style.width = `${20 + scale * 8}px`;
      trail.style.height = `${20 + scale * 8}px`;

      animId = requestAnimationFrame(animateTrail);
    };

    // 隱藏/顯示游標
    const handleMouseLeave = () => {
      cursor.style.opacity = '0';
      trail.style.opacity = '0';
    };
    const handleMouseEnter = () => {
      cursor.style.opacity = '1';
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    animId = requestAnimationFrame(animateTrail);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      cancelAnimationFrame(animId);
      document.documentElement.style.cursor = '';
      document.body.style.cursor = '';
    };
  }, []);

  return (
    <>
      {/* 主游標圓圈 — mix-blend-mode: difference 產生反相效果 */}
      <div
        ref={cursorRef}
        className="pointer-events-none fixed top-0 left-0 z-[99999] w-8 h-8 rounded-full bg-white mix-blend-difference transition-opacity duration-150"
        style={{ willChange: 'transform' }}
      />
      {/* 拖尾 — 較小的跟隨圓 */}
      <div
        ref={trailRef}
        className="pointer-events-none fixed top-0 left-0 z-[99998] w-5 h-5 rounded-full bg-white mix-blend-difference opacity-0"
        style={{ willChange: 'transform, opacity, width, height', transition: 'width 0.3s, height 0.3s' }}
      />
    </>
  );
}
