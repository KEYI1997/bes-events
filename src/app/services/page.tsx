import { Metadata } from 'next';
import Link from 'next/link';
import { CalendarCheck, Star, Sparkles, Music, Wine, Users, ArrowRight } from 'lucide-react';
import AnimateOnScroll from '@/components/AnimateOnScroll';

export const metadata: Metadata = {
  title: '服務項目 | 境曜有限公司 BES Events',
  description: '境曜有限公司提供活動策劃統包、啟動儀式、活動特效、燈光音響舞台、外派調酒、SHOW GIRL 等一站式活動服務。',
};

const SERVICES = [
  { icon: CalendarCheck, title: '活動策劃統包', desc: '從企劃到執行，提供一站式活動統包服務，讓您省心省力。', href: '/services/event-package' },
  { icon: Star, title: '啟動儀式', desc: '星辰運轉、全息投影、沙漏啟動等多種創意儀式，為活動開場製造震撼記憶點。', href: '/services/opening-ceremony' },
  { icon: Sparkles, title: '活動特效', desc: '專業活動特效服務，為現場營造震撼視覺效果。', href: '/services/special-effects' },
  { icon: Music, title: '燈光音響舞台', desc: '專業燈光音響設備租賃與搭建，打造完美視聽體驗。', href: '/services/stage-lighting' },
  { icon: Wine, title: '外派調酒', desc: '專業調酒師現場調製，為活動增添品味與儀式感。', href: '/services/bartending' },
  { icon: Users, title: 'SHOW GIRL', desc: '專業活動人員派遣，提供展場接待、活動協助等服務。', href: '/services/showgirl' },
];

export default function ServicesPage() {
  return (
    <main className="bg-bg min-h-screen">
      <section className="relative bg-primary h-[25vh] flex items-center justify-center pt-20">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/90 to-primary" />
        <div className="relative z-10 text-center px-4">
          <AnimateOnScroll>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">服務項目</h1>
            <p className="text-white/80 text-lg max-w-2xl mx-auto">一站式活動服務，協助品牌在每一個重要時刻精準傳遞價值</p>
          </AnimateOnScroll>
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-4 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SERVICES.map((service, i) => {
            const Icon = service.icon;
            return (
              <AnimateOnScroll key={service.title} delay={i * 100}>
                <Link href={service.href} className="block p-8 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 group h-full">
                  <Icon size={40} className="text-cta mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-bold text-primary mb-3">{service.title}</h3>
                  <p className="text-primary/70 text-sm leading-relaxed mb-4">{service.desc}</p>
                  <span className="inline-flex items-center gap-1 text-cta text-sm font-medium group-hover:gap-2 transition-all">了解更多 <ArrowRight size={14} /></span>
                </Link>
              </AnimateOnScroll>
            );
          })}
        </div>
      </section>
    </main>
  );
}
