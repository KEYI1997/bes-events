'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { useState } from 'react';

const paths = [
  {
    id: 'moment',
    label: '我要安排重要登場',
    title: '開場，被記得。',
    description: '從舞台流程、啟動形式到活動效果，先把重要畫面安排到正確的位置。',
    image: '/images/services/啟動儀式.png',
    imageAlt: '境曜啟動儀式服務案例',
    services: [
      { label: '啟動儀式', href: '/services/opening-ceremony' },
      { label: '活動特效', href: '/services/special-effects' },
      { label: '活動策劃統包', href: '/services/event-package' },
    ],
  },
  {
    id: 'interaction',
    label: '我要讓賓客參與',
    title: '讓賓客，走進情境。',
    description: '透過互動道具、現場引導與可分享的體驗，把活動主題留在參與者手上。',
    image: '/images/services/AI互動道具.png',
    imageAlt: '境曜 AI 互動道具服務案例',
    services: [
      { label: 'AI 互動道具', href: '/services/ai-interactive-props' },
      { label: 'SHOW GIRL', href: '/services/showgirl' },
      { label: '活動策劃統包', href: '/services/event-package' },
    ],
  },
  {
    id: 'hospitality',
    label: '我要完善招待氛圍',
    title: '招待，從進場開始。',
    description: '從空間節奏、吧台服務到舞台技術，依活動規模整理現場接待與氛圍。',
    image: '/images/services/外派調酒.png',
    imageAlt: '境曜外派調酒服務案例',
    services: [
      { label: '外派調酒', href: '/services/bartending' },
      { label: '燈光音響舞台', href: '/services/stage-lighting' },
      { label: 'SHOW GIRL', href: '/services/showgirl' },
    ],
  },
] as const;

export default function ActivityPathfinder() {
  const [activeId, setActiveId] = useState<(typeof paths)[number]['id']>('moment');
  const active = paths.find((path) => path.id === activeId) ?? paths[0];

  return (
    <section id="needs" className="scroll-mt-20 bg-[#c5f53d] px-4 py-20 text-[#111111] sm:px-7 md:min-h-[100svh] md:py-28 lg:px-10">
      <div className="mx-auto max-w-[1600px]">
        <div className="grid gap-10 md:grid-cols-[0.88fr_1.12fr] md:items-end">
          <h2 className="max-w-3xl text-[clamp(3.1rem,7.6vw,8.2rem)] font-bold leading-[0.88] tracking-[-0.065em] text-balance">先定義，<br />那一刻。</h2>
          <p className="max-w-xl text-lg font-medium leading-8 md:justify-self-end">先選擇最接近的活動目標。我們會帶你看到通常需要一起考量的服務方向。</p>
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:items-start">
          <div className="flex flex-col items-start gap-3" aria-label="活動需求選擇">
            {paths.map((path) => (
              <button
                key={path.id}
                type="button"
                onClick={() => setActiveId(path.id)}
                aria-pressed={activeId === path.id}
                className={`w-full px-5 py-4 text-left text-xl font-bold tracking-[-0.04em] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#111111] ${activeId === path.id ? 'bg-[#111111] text-[#f4f5f0]' : 'bg-[#e8ff9c] hover:bg-[#f4f5f0]'}`}
              >
                {path.label}
              </button>
            ))}
          </div>

          <div className="grid gap-6 sm:grid-cols-[0.84fr_1.16fr] sm:items-end">
            <div className="relative aspect-[4/5] overflow-hidden bg-[#111111]">
              <Image key={active.image} src={active.image} alt={active.imageAlt} fill sizes="(min-width: 1024px) 32vw, (min-width: 640px) 42vw, 92vw" className="object-cover" />
            </div>
            <div className="pb-1">
              <h3 className="max-w-2xl text-[clamp(2.25rem,4.4vw,4rem)] font-bold leading-[0.9] tracking-[-0.06em] text-balance">{active.title}</h3>
              <p className="mt-6 max-w-xl text-base leading-8 sm:text-lg">{active.description}</p>
              <div className="mt-9 flex flex-wrap gap-3">
                {active.services.map((service) => (
                  <Link key={service.href} href={service.href} className="inline-flex min-h-11 items-center gap-2 bg-[#de194b] px-4 text-sm font-bold text-[#f4f5f0] transition-colors hover:bg-[#111111] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#111111]">
                    {service.label}<ArrowUpRight size={16} />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
