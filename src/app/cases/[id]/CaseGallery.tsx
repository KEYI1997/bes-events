'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function CaseGallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (images.length < 2) return;
    const timer = window.setInterval(() => setActive(current => (current + 1) % images.length), 3000);
    return () => window.clearInterval(timer);
  }, [images.length]);

  return (
    <section aria-label="案例照片" className="mx-auto mt-10 max-w-5xl">
      <div className="relative mx-auto aspect-[16/9] w-full max-w-4xl overflow-hidden rounded-[14px] bg-[#eeece8]">
        {images.map((image, index) => (
          <Image
            key={`${image}-${index}`}
            src={image}
            alt={`${title} 活動照片 ${index + 1}`}
            fill
            sizes="(max-width: 768px) 100vw, 900px"
            className={`object-cover transition-opacity duration-500 ${index === active ? 'opacity-100' : 'opacity-0'}`}
            priority={index === 0}
          />
        ))}
      </div>
      <div className="mt-5 flex gap-3 overflow-x-auto pb-2" role="tablist" aria-label="選擇案例照片">
        {images.map((image, index) => (
          <button
            key={`${image}-thumb-${index}`}
            type="button"
            role="tab"
            aria-selected={index === active}
            aria-label={`顯示第 ${index + 1} 張照片`}
            onClick={() => setActive(index)}
            className={`relative h-20 w-28 shrink-0 overflow-hidden rounded-md border-2 transition-colors sm:h-24 sm:w-36 ${index === active ? 'border-[#b89a67]' : 'border-[#e0ddd7]'}`}
          >
            <Image src={image} alt="" fill sizes="144px" className="object-cover" />
          </button>
        ))}
      </div>
    </section>
  );
}
