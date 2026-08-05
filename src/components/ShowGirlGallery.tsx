'use client';

import { useState, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ShowGirlGalleryProps {
  images: string[];
}

export default function ShowGirlGallery({ images }: ShowGirlGalleryProps) {
  const [current, setCurrent] = useState(0);

  const prev = useCallback(() => setCurrent(i => (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setCurrent(i => (i + 1) % images.length), [images.length]);

  // 自動輪播
  useEffect(() => {
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* 主圖 */}
      <div className="relative rounded-3xl overflow-hidden bg-primary/5 flex-1 min-h-[400px] lg:min-h-[500px]">
        {images.map((url, i) => (
          <img
            key={i}
            src={url}
            alt={`Show Girl ${i + 1}`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
              i === current ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}

        {/* 左右箭頭 */}
        <button
          onClick={prev}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white shadow flex items-center justify-center transition-all"
          aria-label="上一張"
        >
          <ChevronLeft className="w-5 h-5 text-primary" />
        </button>
        <button
          onClick={next}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white shadow flex items-center justify-center transition-all"
          aria-label="下一張"
        >
          <ChevronRight className="w-5 h-5 text-primary" />
        </button>

        {/* 指示點 */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`rounded-full transition-all duration-300 ${
                i === current ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`第 ${i + 1} 張`}
            />
          ))}
        </div>
      </div>

      {/* 縮圖列 */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {images.map((url, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
              i === current ? 'border-cta scale-105' : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            <img src={url} alt={`縮圖 ${i + 1}`} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
