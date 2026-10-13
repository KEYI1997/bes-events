import ActivityPathfinder from '@/components/ActivityPathfinder';
import ContactFormInline from '@/components/ContactFormInline';
import HomeChapterNav from '@/components/HomeChapterNav';
import { HomeMotionProvider, HomeReveal } from '@/components/HomeMotion';
import JsonLd from '@/components/JsonLd';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { createPageMetadata, itemListJsonLd, SERVICE_SEO_PAGES, SITE_ADDRESS, SITE_DESCRIPTION, SITE_EMAIL, SITE_PHONE, webPageJsonLd } from '@/lib/seo';
import { LINE_URL } from '@/lib/siteLinks';

const SERVICES = [
  { title: '活動策劃統包', summary: '整合策略企劃、視覺設計、流程控管與現場執行。', href: '/services/event-package', image: '/images/services/活動策劃統包.png', alt: '境曜活動策劃統包服務' },
  { title: '啟動儀式', summary: '為開幕、發表會與典禮規劃關鍵亮相畫面。', href: '/services/opening-ceremony', image: '/images/services/啟動儀式.png', alt: '境曜啟動儀式服務' },
  { title: '活動特效', summary: '依流程與場地條件安排低煙、泡泡、彩帶與冷焰火。', href: '/services/special-effects', image: '/images/services/活動特效.png', alt: '境曜活動特效服務' },
  { title: 'AI 互動道具', summary: '以影像、聲音與生成式 AI 打造可參與的品牌體驗。', href: '/services/ai-interactive-props', image: '/images/services/AI互動道具.png', alt: '境曜 AI 互動道具服務' },
  { title: '燈光音響舞台', summary: '從舞台、燈光、音響到視訊整理現場技術條件。', href: '/services/stage-lighting', image: '/images/services/燈光音響舞台.png', alt: '境曜燈光音響舞台服務' },
  { title: '外派調酒', summary: '行動吧台、專業調酒師與客製酒單的現場服務。', href: '/services/bartending', image: '/images/services/外派調酒.png', alt: '境曜外派調酒服務' },
  { title: 'SHOW GIRL', summary: '安排展場接待、品牌推廣、頒獎與現場協助人員。', href: '/services/showgirl', image: '/images/services/show girl.png', alt: '境曜 SHOW GIRL 活動人員服務' },
] as const;

const CASES = [
  { image: '/images/cases/case-1.jpg', alt: '企業品牌發表會舞台與燈光案例' },
  { image: '/images/cases/case-2.jpg', alt: '境曜有限公司企業活動執行案例' },
  { image: '/images/cases/case-3.webp', alt: '大型戶外活動企劃與現場執行案例' },
  { image: '/images/cases/case-4.jpg', alt: '品牌記者會活動整合案例' },
  { image: '/images/cases/case-5.jpg', alt: '企業典禮與啟動儀式案例' },
  { image: '/images/cases/case-6.jpg', alt: '展覽活動空間與流程規劃案例' },
  { image: '/images/cases/case-7.jpg', alt: '企業家庭日活動企劃案例' },
  { image: '/images/cases/case-8.jpg', alt: '尾牙春酒舞台活動案例' },
  { image: '/images/cases/case-9.jpg', alt: '商場品牌推廣活動案例' },
  { image: '/images/cases/case-10.jpg', alt: '活動特效與現場技術整合案例' },
] as const;

export const dynamic = 'force-dynamic';

export const metadata = createPageMetadata({
  title: '境曜有限公司｜台北活動企劃、啟動儀式與活動整合',
  description: SITE_DESCRIPTION,
  path: '/',
  keywords: ['境曜有限公司', 'BES Events', '台北活動企劃', '活動整合公司', '活動道具出租', '活動設備租借', '台北活動道具出租', '桃園活動道具出租', '新竹活動道具租借'],
});

export default async function HomePage() {
  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .eq('visible', true)
    .order('sort_order', { ascending: true });
  const managedClients = (clients || []).filter((client) => client.logo_url?.trim());

  return (
    <>
      <JsonLd data={[
        webPageJsonLd({
          path: '/',
          name: '境曜有限公司｜台北活動企劃、啟動儀式與活動整合',
          description: SITE_DESCRIPTION,
        }),
        itemListJsonLd('境曜有限公司活動服務', SERVICE_SEO_PAGES.map((service) => ({
          name: service.name,
          path: `/services/${service.slug}`,
          description: service.summary,
        }))),
      ]} />
      <HomeMotionProvider>
        <div className="overflow-x-clip bg-[#111111] text-[#111111] selection:bg-[#de194b] selection:text-[#f4f5f0]">
          <a href="#home-content" className="sr-only fixed left-4 top-4 z-[60] bg-[#f4f5f0] px-4 py-3 text-sm font-bold text-[#111111] focus:not-sr-only focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#111111]">跳至主要內容</a>
          <HomeChapterNav />

          <main id="home-content">
            <section className="relative flex min-h-[100svh] items-end bg-[#ff8126] px-4 pb-8 pt-24 sm:px-7 sm:pb-10 lg:px-10">
              <div className="mx-auto flex w-full max-w-[1600px] flex-col justify-between gap-14">
                <h1 className="pt-8 text-[clamp(5.4rem,15.4vw,15rem)] font-bold leading-[0.73] tracking-[-0.09em] sm:pt-12">
                  <span className="home-hero-line text-[#f4f5f0]">境曜</span>
                  <span className="home-hero-line text-[#111111]">現場</span>
                </h1>
                <div className="ml-auto flex w-full max-w-xl flex-col items-start gap-6 sm:items-end sm:text-right">
                  <p className="max-w-[30ch] text-lg font-medium leading-8 sm:text-xl">從企劃到執行，把你要讓人記住的那一刻，安排到現場。</p>
                  <Link href="#needs" className="inline-flex min-h-12 items-center gap-2 bg-[#de194b] px-5 text-sm font-bold text-[#f4f5f0] transition-colors hover:bg-[#111111] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#111111]">
                    先整理活動方向 <ArrowUpRight size={18} />
                  </Link>
                </div>
              </div>
            </section>

            <section className="relative flex min-h-[90svh] items-center overflow-hidden bg-[#4db3ff] px-4 py-20 text-[#111111] sm:px-7 md:py-28 lg:px-10">
              <div className="mx-auto grid w-full max-w-[1600px] gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
                <HomeReveal>
                  <h2 className="max-w-5xl text-[clamp(3.4rem,8.8vw,9.4rem)] font-bold leading-[0.87] tracking-[-0.075em] text-balance">現場，<br />留下印象。</h2>
                </HomeReveal>
                <HomeReveal delay={90} className="grid gap-7 sm:grid-cols-[0.78fr_1.22fr] sm:items-end lg:pb-3">
                  <figure className="home-drift relative aspect-[4/5] overflow-hidden bg-[#111111] sm:aspect-[3/4]">
                    <Image src="/images/cases/case-4.jpg" alt="品牌記者會活動整合案例" fill sizes="(min-width: 1024px) 22vw, (min-width: 640px) 34vw, 90vw" className="object-cover" />
                  </figure>
                  <p className="max-w-lg text-lg font-medium leading-8">境曜從活動目的、場地條件與現場流程開始整理，把企劃、技術、人員與服務放到能真正執行的位置。</p>
                </HomeReveal>
              </div>
            </section>

            <ActivityPathfinder />

            <section id="cases" className="scroll-mt-20 bg-[#111111] px-4 py-20 text-[#f4f5f0] sm:px-7 md:min-h-[100svh] md:py-28 lg:px-10">
              <div className="mx-auto max-w-[1600px]">
                <HomeReveal className="flex flex-col gap-7 md:flex-row md:items-end md:justify-between">
                  <h2 className="max-w-4xl text-[clamp(3.5rem,8vw,8.8rem)] font-bold leading-[0.86] tracking-[-0.075em] text-balance">真實現場，<br />替我們說明。</h2>
                  <Link href="/cases" className="inline-flex min-h-12 items-center gap-2 bg-[#de194b] px-5 text-sm font-bold text-[#f4f5f0] transition-colors hover:bg-[#c5f53d] hover:text-[#111111] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f4f5f0]">
                    瀏覽全部案例 <ArrowUpRight size={18} />
                  </Link>
                </HomeReveal>
                <HomeReveal delay={80} className="mt-14">
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
                    {CASES.map((item, index) => (
                      <Link key={item.image} href="/cases" className={`group relative overflow-hidden bg-[#292929] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c5f53d] ${index === 0 || index === 6 ? 'col-span-2 aspect-[16/9]' : 'aspect-[4/3]'}`}>
                        <Image src={item.image} alt={item.alt} fill sizes={index === 0 || index === 6 ? '(min-width: 768px) 50vw, 100vw' : '(min-width: 768px) 25vw, 50vw'} className="object-cover transition duration-500 group-hover:scale-[1.04] group-hover:opacity-80" />
                      </Link>
                    ))}
                  </div>
                </HomeReveal>
              </div>
            </section>

            <section id="services" className="scroll-mt-20 bg-[#f4f5f0] px-4 py-20 text-[#111111] sm:px-7 md:py-28 lg:px-10">
              <div className="mx-auto max-w-[1600px]">
                <HomeReveal className="grid gap-9 md:grid-cols-[1.12fr_0.88fr] md:items-end">
                  <h2 className="max-w-5xl text-[clamp(3.4rem,8vw,8.8rem)] font-bold leading-[0.87] tracking-[-0.075em] text-balance">每個需求，<br />都能執行。</h2>
                  <p className="max-w-xl text-lg font-medium leading-8 md:justify-self-end">你不需要先決定所有細節。先從想完成的活動畫面開始，再一起整理需要的服務與現場條件。</p>
                </HomeReveal>
                <div className="mt-16 grid gap-x-12 gap-y-10 lg:grid-cols-2">
                  {SERVICES.map((service, index) => (
                    <HomeReveal key={service.href} delay={(index % 2) * 70}>
                      <Link href={service.href} className="group grid grid-cols-[88px_1fr] gap-5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#de194b] sm:grid-cols-[120px_1fr]">
                        <div className="relative aspect-square overflow-hidden bg-[#c5f53d]">
                          <Image src={service.image} alt={service.alt} fill sizes="120px" className="object-cover transition duration-500 group-hover:scale-[1.06]" />
                        </div>
                        <div className="flex min-h-full flex-col items-start justify-center">
                          <h3 className="text-2xl font-bold tracking-[-0.055em] sm:text-3xl">{service.title}</h3>
                          <p className="mt-2 max-w-md text-base leading-7">{service.summary}</p>
                        </div>
                      </Link>
                    </HomeReveal>
                  ))}
                </div>
              </div>
            </section>

            {managedClients.length > 0 && (
              <section className="bg-[#4db3ff] px-4 py-20 text-[#111111] sm:px-7 md:py-28 lg:px-10">
                <div className="mx-auto max-w-[1600px]">
                  <HomeReveal className="grid gap-8 md:grid-cols-[0.95fr_1.05fr] md:items-end">
                    <h2 className="max-w-3xl text-[clamp(3rem,7vw,7.4rem)] font-bold leading-[0.88] tracking-[-0.07em] text-balance">一起把想像，帶到現場。</h2>
                    <p className="max-w-xl text-lg font-medium leading-8 md:justify-self-end">以下品牌與單位曾選擇境曜作為活動現場的合作夥伴。</p>
                  </HomeReveal>
                  <HomeReveal delay={80} className="mt-16 grid grid-cols-2 gap-x-10 gap-y-12 sm:grid-cols-3 lg:grid-cols-6">
                    {managedClients.map((client) => (
                      <div key={client.id} className="flex h-20 items-center justify-center">
                        {/* CMS logo URLs may use several approved hosts, so Next image optimization is intentionally bypassed. */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={client.logo_url} alt={client.name} width={160} height={80} loading="lazy" className="max-h-full max-w-full object-contain grayscale transition duration-300 hover:grayscale-0" />
                      </div>
                    ))}
                  </HomeReveal>
                </div>
              </section>
            )}

            <section id="enquiry" className="scroll-mt-20 bg-[#de194b] px-4 py-20 text-[#f4f5f0] sm:px-7 md:py-28 lg:px-10">
              <div className="mx-auto grid max-w-[1600px] gap-14 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
                <HomeReveal>
                  <h2 className="max-w-4xl text-[clamp(3.6rem,8vw,8.4rem)] font-bold leading-[0.85] tracking-[-0.08em] text-balance">把想像，<br />交給現場。</h2>
                  <p className="mt-8 max-w-lg text-lg font-medium leading-8">填寫你已經確定的條件；還沒想好的部分，也可以直接寫進需求說明。我們會依序確認可行的服務方向與檔期。</p>
                  <a href={LINE_URL} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex min-h-12 items-center gap-2 bg-[#111111] px-5 text-sm font-bold text-[#f4f5f0] transition-colors hover:bg-[#c5f53d] hover:text-[#111111] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#111111]">
                    透過 LINE 聯絡 <ArrowUpRight size={18} />
                  </a>
                </HomeReveal>
                <HomeReveal delay={90}>
                  <div data-ui className="bg-[#f4f5f0] p-5 text-[#111111] sm:p-8 lg:p-10">
                    <ContactFormInline submitLabel="送出活動需求" />
                  </div>
                </HomeReveal>
              </div>
            </section>
          </main>

          <footer className="bg-[#c5f53d] px-4 py-8 text-[#111111] sm:px-7 lg:px-10">
            <div className="mx-auto max-w-[1600px]">
              <div className="grid grid-cols-2 gap-1 text-[clamp(5.4rem,17vw,16rem)] font-bold leading-[0.72] tracking-[-0.11em]">
                <span className="bg-[#111111] px-2 pb-5 pt-2 text-[#c5f53d]">境</span>
                <span className="bg-[#de194b] px-2 pb-5 pt-2 text-[#f4f5f0]">曜</span>
              </div>
              <div className="mt-10 grid gap-7 text-base font-medium sm:grid-cols-2 lg:grid-cols-4">
                <p>境曜有限公司<br />BES Events</p>
                <p>{SITE_ADDRESS}</p>
                <a href={`tel:${SITE_PHONE}`} className="w-fit transition-opacity hover:opacity-55 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#111111]">{SITE_PHONE}</a>
                <a href={`mailto:${SITE_EMAIL}`} className="w-fit break-all transition-opacity hover:opacity-55 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#111111]">{SITE_EMAIL}</a>
              </div>
            </div>
          </footer>
        </div>
      </HomeMotionProvider>
    </>
  );
}
