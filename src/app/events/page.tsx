import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import AnimateOnScroll from '@/components/AnimateOnScroll';

export const metadata: Metadata = {
  title: '活動類型 | 境曜有限公司 BES Events',
  description: '境曜有限公司承辦各類活動：開幕典禮、記者會、新品發表會、展覽攤位、政府活動、春酒尾牙、典禮節慶。',
};

const EVENT_TYPES = [
  { title: '開幕典禮', desc: '為企業打造氣勢磅礴的開幕典禮，從啟動儀式到舞台規劃一手包辦。', href: '/events/grand-opening' },
  { title: '記者會', desc: '專業記者會場地規劃與現場執行，精準傳遞品牌訊息。', href: '/events/press-conference' },
  { title: '新品發表會', desc: '創新新品發表會企劃，打造令人印象深刻的產品亮相時刻。', href: '/events/product-launch' },
  { title: '展覽攤位', desc: '展覽攤位設計與搭建，吸引目光、提升品牌能見度。', href: '/events/exhibition' },
  { title: '政府活動', desc: '政府機關活動企劃與執行，符合規範又不失創意。', href: '/events/government' },
  { title: '春酒尾牙', desc: '春酒尾牙活動規劃，凝聚企業向心力的最佳場合。', href: '/events/banquet' },
  { title: '典禮節慶', desc: '各式典禮與節慶活動策劃，為重要時刻增添儀式感。', href: '/events/ceremony' },
];

export default function EventsPage() {
  return (
    <main className="bg-bg min-h-screen">
      <section className="relative bg-primary h-[25vh] flex items-center justify-center pt-20">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/90 to-primary" />
        <div className="relative z-10 text-center px-4">
          <AnimateOnScroll>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">活動類型</h1>
            <p className="text-white/80 text-lg max-w-2xl mx-auto">無論哪種活動類型，我們都能提供專業的企劃與執行服務</p>
          </AnimateOnScroll>
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-4 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {EVENT_TYPES.map((event, i) => (
            <AnimateOnScroll key={event.title} delay={i * 100}>
              <Link href={event.href} className="block p-8 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 group h-full">
                <h3 className="text-xl font-bold text-primary mb-3">{event.title}</h3>
                <p className="text-primary/70 text-sm leading-relaxed mb-4">{event.desc}</p>
                <span className="inline-flex items-center gap-1 text-cta text-sm font-medium group-hover:gap-2 transition-all">了解更多 <ArrowRight size={14} /></span>
              </Link>
            </AnimateOnScroll>
          ))}
        </div>
      </section>
    </main>
  );
}
