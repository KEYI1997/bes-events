'use client';

import { useEffect, useRef } from 'react';

const TRAIL_LENGTH = 12; // 拖尾節點數量
const EASE = 0.25; // 每個節點的跟隨速度（越小越滑）

export default function CustomCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const points = useRef<{ x: number; y: number }[]>([]);
  const mouse = useRef({ x: -100, y: -100 });
  const animId = useRef<number>(0);

  useEffect(() => {
    // 手機不顯示
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;

    const canvas = canvasRef.current;
    const cursor = cursorRef.current;
    if (!canvas || !cursor) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 設定 canvas 尺寸
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // 初始化拖尾點
    points.current = Array.from({ length: TRAIL_LENGTH }, () => ({ x: -100, y: -100 }));

    // 隱藏預設游標
    document.documentElement.style.cursor = 'none';

    const handleMouseMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseLeave = () => {
      mouse.current = { x: -100, y: -100 };
      cursor.style.opacity = '0';
    };

    const handleMouseEnter = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      // 立即把所有點拉到滑鼠位置（避免入場時從角落飛來）
      points.current.forEach(p => { p.x = e.clientX; p.y = e.clientY; });
      cursor.style.opacity = '1';
    };

    const animate = () => {
      // 更新主游標位置
      cursor.style.transform = `translate(${mouse.current.x - 16}px, ${mouse.current.y - 16}px)`;

      // 更新拖尾點 — 每個點跟隨前一個點（第一個跟隨滑鼠）
      const pts = points.current;
      pts[0].x += (mouse.current.x - pts[0].x) * EASE;
      pts[0].y += (mouse.current.y - pts[0].y) * EASE;

      for (let i = 1; i < TRAIL_LENGTH; i++) {
        pts[i].x += (pts[i - 1].x - pts[i].x) * (EASE * 0.85);
        pts[i].y += (pts[i - 1].y - pts[i].y) * (EASE * 0.85);
      }

      // 繪製拖尾
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (mouse.current.x < 0) {
        animId.current = requestAnimationFrame(animate);
        return;
      }

      // 畫一條連續的漸細線條
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);

      for (let i = 1; i < TRAIL_LENGTH - 1; i++) {
        const xc = (pts[i].x + pts[i + 1].x) / 2;
        const yc = (pts[i].y + pts[i + 1].y) / 2;
        ctx.quadraticCurveTo(pts[i].x, pts[i].y, xc, yc);
      }

      // 漸變線寬：從粗到細
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // 用多段不同粗細的線來模擬漸細效果
      for (let i = 0; i < TRAIL_LENGTH - 2; i++) {
        const t = i / (TRAIL_LENGTH - 2); // 0 → 1
        const lineWidth = 8 * (1 - t * t); // 從 8px 漸細到接近 0
        const alpha = 0.8 * (1 - t); // 從 0.8 漸淡到 0

        ctx.beginPath();
        ctx.moveTo(pts[i].x, pts[i].y);

        const xc = (pts[i].x + pts[i + 1].x) / 2;
        const yc = (pts[i].y + pts[i + 1].y) / 2;
        ctx.quadraticCurveTo(pts[i].x, pts[i].y, xc, yc);

        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.stroke();
      }

      animId.current = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    animId.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId.current);
      document.documentElement.style.cursor = '';
    };
  }, []);

  return (
    <>
      {/* 拖尾 canvas — mix-blend-difference 反相 */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 z-[99998] mix-blend-difference"
        style={{ willChange: 'transform' }}
      />
      {/* 主游標圓圈 — mix-blend-difference 反相 */}
      <div
        ref={cursorRef}
        className="pointer-events-none fixed top-0 left-0 z-[99999] w-8 h-8 rounded-full bg-white mix-blend-difference"
        style={{ willChange: 'transform' }}
      />
    </>
  );
}
