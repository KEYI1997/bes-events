'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import Image from 'next/image';
import { X, ZoomIn, ZoomOut } from 'lucide-react';

interface ImageLightboxProps {
  src: string;
  alt: string;
  onClose: () => void;
}

export default function ImageLightbox({ src, alt, onClose }: ImageLightboxProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const MIN_SCALE = 0.5;
  const MAX_SCALE = 5;

  // 關閉 lightbox
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  // ESC 鍵關閉
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleClose]);

  // 防止 body 捲動
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // 滑鼠滾輪縮放
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setScale(prev => {
      const delta = e.deltaY < 0 ? 0.15 : -0.15;
      return Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev + delta));
    });
  }, []);

  // 重置縮放
  const resetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // 拖曳移動（縮放後可平移）
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    e.preventDefault();
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, px: position.x, py: position.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !dragStart.current) return;
    setPosition({
      x: dragStart.current.px + (e.clientX - dragStart.current.x),
      y: dragStart.current.py + (e.clientY - dragStart.current.y),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    dragStart.current = null;
  };

  // 點遮罩關閉（點圖片本身不關閉）
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) handleClose();
  };

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
      aria-label={alt}
    >
      {/* 關閉按鈕 */}
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 z-10 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 transition-colors"
        aria-label="關閉"
      >
        <X size={24} />
      </button>

      {/* 縮放控制列 */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3 bg-black/60 rounded-full px-4 py-2">
        <button
          onClick={() => setScale(s => Math.max(MIN_SCALE, s - 0.25))}
          className="text-white hover:text-gray-300 transition-colors"
          aria-label="縮小"
        >
          <ZoomOut size={20} />
        </button>
        <button
          onClick={resetZoom}
          className="text-white text-sm font-medium hover:text-gray-300 transition-colors min-w-[44px] text-center"
          aria-label="重置縮放"
        >
          {Math.round(scale * 100)}%
        </button>
        <button
          onClick={() => setScale(s => Math.min(MAX_SCALE, s + 0.25))}
          className="text-white hover:text-gray-300 transition-colors"
          aria-label="放大"
        >
          <ZoomIn size={20} />
        </button>
      </div>

      {/* 圖片容器 */}
      <div
        ref={containerRef}
        className="relative max-w-[90vw] max-h-[85vh] select-none"
        style={{
          transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
          transformOrigin: 'center center',
          transition: isDragging ? 'none' : 'transform 0.15s ease',
          cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
        }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <Image
          src={src}
          alt={alt}
          width={1200}
          height={900}
          className="rounded-lg shadow-2xl object-contain max-w-[90vw] max-h-[85vh] w-auto h-auto"
          priority
          draggable={false}
        />
      </div>
    </div>
  );
}
