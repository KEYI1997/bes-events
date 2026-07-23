'use client';

import { useEffect, useRef } from 'react';

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const animId = useRef<number>(0);
  const isHovering = useRef(false);

  useEffect(() => {
    // 手機不顯示
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    document.documentElement.style.cursor = 'none';

    const handleMouseMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      // 小點直接跟隨，無延遲
      dot.style.transform = `translate(${e.clientX - 4}px, ${e.clientY - 4}px)`;
    };

    // 大圈用 RAF 緩動跟隨
    const animate = () => {
      const dx = mouse.current.x - ringPos.current.x;
      const dy = mouse.current.y - ringPos.current.y;
      ringPos.current.x += dx * 0.15;
      ringPos.current.y += dy * 0.15;

      const size = isHovering.current ? 56 : 40;
      const offset = size / 2;
      ring.style.transform = `translate(${ringPos.current.x - offset}px, ${ringPos.current.y - offset}px)`;

      animId.current = requestAnimationFrame(animate);
    };

    // 偵測互動元素 hover
    const handleMouseOver = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      const interactive = el.closest('a, button, [role="button"], input, select, textarea');
      if (interactive) {
        isHovering.current = true;
        ring.style.width = '56px';
        ring.style.height = '56px';
        ring.style.borderColor = 'rgba(255,255,255,0.6)';
        ring.style.backgroundColor = 'rgba(255,255,255,0.08)';
        dot.style.transform = `translate(${mouse.current.x - 4}px, ${mouse.current.y - 4}px) scale(0.5)`;
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      const interactive = el.closest('a, button, [role="button"], input, select, textarea');
      if (interactive) {
        isHovering.current = false;
        ring.style.width = '40px';
        ring.style.height = '40px';
        ring.style.borderColor = 'rgba(255,255,255,0.5)';
        ring.style.backgroundColor = 'transparent';
        dot.style.transform = `translate(${mouse.current.x - 4}px, ${mouse.current.y - 4}px) scale(1)`;
      }
    };

    const handleMouseLeave = () => {
      dot.style.opacity = '0';
      ring.style.opacity = '0';
    };

    const handleMouseEnter = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      ringPos.current = { x: e.clientX, y: e.clientY };
      dot.style.opacity = '1';
      ring.style.opacity = '1';
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    animId.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      cancelAnimationFrame(animId.current);
      document.documentElement.style.cursor = '';
    };
  }, []);

  return (
    <>
      {/* 小點 — 直接跟隨滑鼠 */}
      <div
        ref={dotRef}
        className="pointer-events-none fixed top-0 left-0 z-[99999] w-2 h-2 rounded-full bg-white mix-blend-difference"
        style={{ willChange: 'transform', transition: 'opacity 0.2s' }}
      />
      {/* 大圈 — 延遲跟隨，空心 */}
      <div
        ref={ringRef}
        className="pointer-events-none fixed top-0 left-0 z-[99998] w-10 h-10 rounded-full border border-white/50 mix-blend-difference"
        style={{
          willChange: 'transform, width, height',
          transition: 'width 0.3s ease, height 0.3s ease, border-color 0.3s ease, background-color 0.3s ease, opacity 0.2s',
        }}
      />
    </>
  );
}
