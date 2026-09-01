'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';

type CaseMedia = { type: 'image' | 'video'; url: string };

export default function CaseGallery({ images, videos = [], title }: { images: string[]; videos?: string[]; title: string }) {
  const media = useMemo<CaseMedia[]>(() => [
    ...images.map(url => ({ type: 'image' as const, url })),
    ...videos.map(url => ({ type: 'video' as const, url })),
  ], [images, videos]);
  const [active, setActive] = useState(0);
  const activeIndex = Math.min(active, Math.max(media.length - 1, 0));

  useEffect(() => {
    if (media.length < 2 || media[activeIndex]?.type !== 'image') return;
    const timer = window.setInterval(() => {
      setActive(current => {
        for (let offset = 1; offset <= media.length; offset += 1) {
          const next = (current + offset) % media.length;
          if (media[next]?.type === 'image') return next;
        }
        return current;
      });
    }, 3000);
    return () => window.clearInterval(timer);
  }, [activeIndex, media]);

  if (media.length === 0) return null;
  const activeMedia = media[activeIndex];

  return (
    <section aria-label="案例媒體" className="mx-auto mt-10 max-w-5xl">
      <div className="relative mx-auto aspect-[16/9] w-full max-w-4xl overflow-hidden rounded-[14px] bg-[#eeece8]">
        {activeMedia.type === 'image' ? (
          <Image
            src={activeMedia.url}
            alt={`${title} 活動照片 ${images.indexOf(activeMedia.url) + 1}`}
            fill
            sizes="(max-width: 768px) 100vw, 900px"
            className="object-cover"
            priority={activeIndex === 0}
          />
        ) : (
          <video src={activeMedia.url} controls preload="metadata" className="h-full w-full object-cover">此瀏覽器不支援影片播放。</video>
        )}
      </div>
      <div className="mt-5 flex gap-3 overflow-x-auto pb-2" role="tablist" aria-label="選擇案例媒體">
        {media.map((item, index) => (
          <button
            key={`${item.url}-thumb-${index}`}
            type="button"
            role="tab"
            aria-selected={index === activeIndex}
            aria-label={item.type === 'video' ? `播放第 ${index + 1 - images.length} 部影片` : `顯示第 ${index + 1} 張照片`}
            onClick={() => setActive(index)}
            className={`relative h-20 w-28 shrink-0 overflow-hidden rounded-md border-2 transition-colors sm:h-24 sm:w-36 ${index === activeIndex ? 'border-[#b89a67]' : 'border-[#e0ddd7]'}`}
          >
            {item.type === 'image' ? <Image src={item.url} alt="" fill sizes="144px" className="object-cover" /> : <video src={item.url} muted preload="metadata" className="h-full w-full object-cover" />}
            {item.type === 'video' && <span className="absolute inset-x-0 bottom-0 bg-black/60 px-2 py-1 text-xs font-medium text-white">影片</span>}
          </button>
        ))}
      </div>
    </section>
  );
}
