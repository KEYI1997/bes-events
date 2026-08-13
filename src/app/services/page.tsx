import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import AnimateOnScroll from '@/components/AnimateOnScroll';

export const metadata: Metadata = {
  title: '服務項目 | 境曜有限公司 BES Events',
  description: '境曜有限公司提供 AI 互動道具、活動策劃統包、啟動儀式、活動特效、外派調酒、SHOW GIRL 等一站式活動服務。',
};

const SERVICES = [
  {
    title: 'AI 互動道具',
    desc: '結合人工智慧技術的創新互動道具，打造沉浸式活動體驗。',
    image: '/images/services/AI互動道具.png',
    href: '/services/ai-interactive-props',
  },
  {
    title: '活動策劃統包',
    desc: '從企劃到執行，提供一站式活動統包服務，讓您省心省力。',
    image: '/images/services/活動策劃統包.png',
    href: '/services/event-package',
  },
  {
    title: '啟動儀式',
    desc: '星辰運轉、全息投影、沙漏啟動等多種創意儀式，為活動開場製造震撼記憶點。',
    image: '/images/services/啟動儀式.png',
    href: '/services/opening-ceremony',
  },
  {
    title: '活動特效',
    desc: '專業活動特效服務，為現場營造震撼視覺效果。',
    image: '/images/services/活動特效.png',
    href: '/services/special-effects',
  },
  {
    title: '外派調酒',
    desc: '專業調酒師現場調製，為活動增添品味與儀式感。',
    image: '/images/services/外派調酒.png',
    href: '/services/bartending',
  },
  {
    title: 'SHOW GIRL',
    desc: '專業活動人員派遣，提供展場接待、活動協助等服務。',
    image: '/images/services/show girl.png',
    href: '/services/showgirl',
  },
];

export default function ServicesPage() {
  return (
    <main className="bg-white min-h-screen">
      {/* Hero Banner */}
      <section className="relative bg-primary h-[25vh] flex items-center justify-center pt-20">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/90 to-primary" />
        <div className="relative z-10 text-center px-4">
          <AnimateOnScroll>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">服務項目</h1>
            <p className="text-white/80 text-lg max-w-2xl mx-auto">一站式活動服務，協助品牌在每一個重要時刻精準傳遞價值</p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* 服務卡片 Grid */}
      <section className="bg-white max-w-7xl mx-auto px-4 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map((service, i) => (
            <AnimateOnScroll key={service.title} delay={i * 80}>
              <Link href={service.href} className="group relative block rounded-2xl overflow-hidden aspect-[4/3] shadow-md hover:shadow-2xl transition-shadow duration-300">
                {/* 背景圖片 */}
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* 漸層遮罩 - 平時底部深，hover 整體加深 */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-all duration-300" />

                {/* 文字內容 */}
                <div className="absolute inset-0 flex flex-col justify-end p-6">
                  <h3 className="text-xl font-bold text-white mb-2 leading-snug">{service.title}</h3>
                  {/* desc：平時隱藏，hover 滑入 */}
                  <p className="text-white/80 text-sm leading-relaxed max-h-0 overflow-hidden group-hover:max-h-20 transition-all duration-500 ease-out">
                    {service.desc}
                  </p>
                  {/* 了解更多箭頭 */}
                  <span className="inline-flex items-center gap-1 text-cta text-sm font-semibold mt-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    了解更多 <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            </AnimateOnScroll>
          ))}
        </div>
      </section>

      {/* 分隔線 */}
      <div className="flex justify-center bg-white px-8">
        <div className="w-full h-[2px] bg-gray-300"></div>
      </div>

      {/* CTA */}
      <section className="bg-primary py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <AnimateOnScroll>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">找不到想要的服務？</h2>
            <p className="text-white/75 mb-8 text-lg">告訴我們您的需求，我們為您量身打造專屬方案</p>
            <Link
              href="/contact"
              className="group relative inline-flex items-center px-8 py-4 text-base font-semibold rounded-full border-2 border-cta bg-cta text-white hover:bg-white hover:text-cta transition-all duration-300"
            >
              <ArrowRight size={16} className="mr-2 transition-all duration-300 group-hover:opacity-0 group-hover:-translate-x-4" />
              立即諮詢
              <ArrowRight size={16} className="ml-2 rotate-180 opacity-0 translate-x-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" />
            </Link>
          </AnimateOnScroll>
        </div>
      </section>
    </main>
  );
}
