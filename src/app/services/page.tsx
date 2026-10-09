import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import AnimateOnScroll from '@/components/AnimateOnScroll';
import JsonLd from '@/components/JsonLd';
import { createPageMetadata, itemListJsonLd, SERVICE_SEO_PAGES, webPageJsonLd } from '@/lib/seo';

const description = '境曜有限公司提供 AI 互動道具、活動企劃統包、啟動儀式、活動特效、外派調酒與 SHOW GIRL 活動人員服務，依活動目標、場地條件與預算範圍安排執行內容。';

export const metadata = createPageMetadata({
  title: '活動企劃與整合服務',
  description,
  path: '/services',
  keywords: ['活動企劃服務', '活動統包', '啟動儀式', 'AI 互動道具'],
});

const SERVICES = [
  {
    title: 'AI 互動道具',
    desc: '讓賓客的照片、文字或動作，成為可即時分享的品牌互動內容。',
    image: '/images/services/AI互動道具.png',
    href: '/services/ai-interactive-props',
  },
  {
    title: '活動策劃統包',
    desc: '把企劃、視覺、設備、人員與現場流程，整理成一套可執行的活動計畫。',
    image: '/images/services/活動策劃統包.png',
    href: '/services/event-package',
  },
  {
    title: '啟動儀式',
    desc: '為開幕、發表會與典禮，設計品牌亮相的關鍵畫面。',
    image: '/images/services/啟動儀式.png',
    href: '/services/opening-ceremony',
  },
  {
    title: '活動特效',
    desc: '依舞台流程、場地條件與安全規範，安排開場、亮相與高潮段落的特效效果。',
    image: '/images/services/活動特效.png',
    href: '/services/special-effects',
  },
  {
    title: '外派調酒',
    desc: '依賓客人數、服務時段與場地配置，安排調酒方案、吧台與飲品體驗。',
    image: '/images/services/外派調酒.png',
    href: '/services/bartending',
  },
  {
    title: 'SHOW GIRL',
    desc: '依接待、引導、產品展示或舞台互動需求，安排符合品牌形象的活動人員。',
    image: '/images/services/show girl.png',
    href: '/services/showgirl',
  },
];

export default function ServicesPage() {
  return (
    <><JsonLd data={[
      webPageJsonLd({ path: '/services', name: '境曜有限公司活動企劃與整合服務', description, type: 'CollectionPage' }),
      itemListJsonLd('活動服務項目', SERVICE_SEO_PAGES.map(service => ({ name: service.name, path: `/services/${service.slug}`, description: service.summary }))),
    ]} /><main className="bg-white min-h-screen">
      {/* Hero Banner */}
      <section className="relative bg-primary h-[25vh] flex items-center justify-center pt-20">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/90 to-primary" />
        <div className="relative z-10 text-center px-4">
          <AnimateOnScroll>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">服務項目</h1>
            <p className="text-white/80 text-lg max-w-2xl mx-auto">依活動目標、場地條件與預算範圍，安排企劃、設備與現場執行</p>
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
                  alt={`${service.title}活動服務與現場執行`}
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
                    查看服務內容 <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            </AnimateOnScroll>
          ))}
        </div>
      </section>

    </main></>
  );
}
