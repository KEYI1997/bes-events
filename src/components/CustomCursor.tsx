'use client';

import { useEffect, useRef } from 'react';

const TRAIL_LENGTH = 8;
const EASE = 0.35;

export default function CustomCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const points = useRef<{ x: number; y: number }[]>([]);
  const mouse = useRef({ x: -100, y: -100 });
  const animId = useRef<number>(0);
  const isOnButton = useRef(false);

  useEffect(() => {
    // 手機不顯示
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;

    const canvas = canvasRef.current;
    const cursor = cursorRef.current;
    if (!canvas || !cursor) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    points.current = Array.from({ length: TRAIL_LENGTH }, () => ({ x: -100, y: -100 }));

    document.documentElement.style.cursor = 'none';

    const checkIfButton = (e: MouseEvent) => {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      if (!el) { isOnButton.current = false; return; }
      const interactive = el.closest('a, button, [role="button"], input, select, textarea, [onclick]');
      isOnButton.current = !!interactive;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      checkIfButton(e);
    };

    const handleMouseLeave = () => {
      mouse.current = { x: -100, y: -100 };
      cursor.style.opacity = '0';
    };

    const handleMouseEnter = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      points.current.forEach(p => { p.x = e.clientX; p.y = e.clientY; });
      cursor.style.opacity = '1';
    };

    const animate = () => {
      const pts = points.current;

      // 更新節點位置
      pts[0].x += (mouse.current.x - pts[0].x) * EASE;
      pts[0].y += (mouse.current.y - pts[0].y) * EASE;
      for (let i = 1; i < TRAIL_LENGTH; i++) {
        pts[i].x += (pts[i - 1].x - pts[i].x) * (EASE * 0.75);
        pts[i].y += (pts[i - 1].y - pts[i].y) * (EASE * 0.75);
      }

      // 在按鈕上時不用 difference，維持白色
      if (isOnButton.current) {
        cursor.style.mixBlendMode = 'normal';
        canvas.style.mixBlendMode = 'normal';
      } else {
        cursor.style.mixBlendMode = 'difference';
        canvas.style.mixBlendMode = 'difference';
      }

      // 主游標
      cursor.style.transform = `translate(${mouse.current.x - 14}px, ${mouse.current.y - 14}px)`;

      // 繪製拖尾 — 用一整塊填充形狀（不是線條），產生「變形球體」的感覺
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (mouse.current.x < 0) {
        animId.current = requestAnimationFrame(animate);
        return;
      }

      // 計算速度
      const dx = mouse.current.x - pts[1].x;
      const dy = mouse.current.y - pts[1].y;
      const speed = Math.sqrt(dx * dx + dy * dy);

      // 只在有速度時畫尾巴
      if (speed > 2) {
        ctx.beginPath();

        // 從主游標中心開始，畫一個漸細的填充形狀
        const startRadius = 14; // 與主游標同寬

        // 使用 Catmull-Rom 或簡單的寬度遞減填充
        // 上邊界點 + 下邊界點形成封閉形狀
        const topPoints: { x: number; y: number }[] = [];
        const bottomPoints: { x: number; y: number }[] = [];

        for (let i = 0; i < TRAIL_LENGTH; i++) {
          const t = i / (TRAIL_LENGTH - 1); // 0 → 1
          const radius = startRadius * (1 - t * t); // 從 14 漸細到 0

          // 計算該點的切線方向（用前後點的差來算法線）
          let nx: number, ny: number;
          if (i === 0) {
            nx = pts[1].x - pts[0].x;
            ny = pts[1].y - pts[0].y;
          } else if (i === TRAIL_LENGTH - 1) {
            nx = pts[i].x - pts[i - 1].x;
            ny = pts[i].y - pts[i - 1].y;
          } else {
            nx = pts[i + 1].x - pts[i - 1].x;
            ny = pts[i + 1].y - pts[i - 1].y;
          }

          // 法線（垂直於切線）
          const len = Math.sqrt(nx * nx + ny * ny) || 1;
          const perpX = -ny / len;
          const perpY = nx / len;

          topPoints.push({
            x: pts[i].x + perpX * radius,
            y: pts[i].y + perpY * radius,
          });
          bottomPoints.push({
            x: pts[i].x - perpX * radius,
            y: pts[i].y - perpY * radius,
          });
        }

        // 畫封閉形狀：上邊界正序 + 下邊界倒序
        ctx.moveTo(topPoints[0].x, topPoints[0].y);
        for (let i = 1; i < topPoints.length; i++) {
          const prev = topPoints[i - 1];
          const curr = topPoints[i];
          const cpx = (prev.x + curr.x) / 2;
          const cpy = (prev.y + curr.y) / 2;
          ctx.quadraticCurveTo(prev.x, prev.y, cpx, cpy);
        }
        // 尾端
        const last = TRAIL_LENGTH - 1;
        ctx.lineTo(pts[last].x, pts[last].y);

        // 下邊界倒序回來
        for (let i = bottomPoints.length - 1; i >= 1; i--) {
          const prev = bottomPoints[i];
          const curr = bottomPoints[i - 1];
          const cpx = (prev.x + curr.x) / 2;
          const cpy = (prev.y + curr.y) / 2;
          ctx.quadraticCurveTo(prev.x, prev.y, cpx, cpy);
        }

        ctx.closePath();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.fill();
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
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 z-[99998] mix-blend-difference"
        style={{ willChange: 'transform' }}
      />
      <div
        ref={cursorRef}
        className="pointer-events-none fixed top-0 left-0 z-[99999] w-7 h-7 rounded-full bg-white mix-blend-difference"
        style={{ willChange: 'transform' }}
      />
    </>
  );
}
