import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import AnimateOnScroll from '@/components/AnimateOnScroll';
import BartendingPlans from '@/components/BartendingPlans';
import JsonLd from '@/components/JsonLd';
import ServiceProductGrid from '@/components/ServiceProductGrid';
import { supabase } from '@/lib/supabase';
import { Product } from '@/lib/types';
import { breadcrumbJsonLd, createPageMetadata, serviceJsonLd, SERVICE_SEO_PAGES } from '@/lib/seo';

const CATEGORY_MAP: Record<string, string> = {
  'ai-interactive-props': 'AI 互動道具',
  'event-package': '活動策劃統包',
  'opening-ceremony': '啟動儀式',
  'special-effects': '活動特效',
  'bartending': '外派調酒',
  'showgirl': 'SHOW GIRL',
};

const CATEGORY_DESC: Record<string, string> = {
  'ai-interactive-props': '結合人工智慧技術的創新互動道具，打造沉浸式活動體驗，讓每位賓客成為活動的主角。',
  'event-package': '從企劃到執行，提供一站式活動統包服務，讓您省心省力。',
  'opening-ceremony': '星辰運轉、全息投影、沙漏啟動等多種創意儀式，為活動開場製造震撼記憶點。',
  'special-effects': '從夢幻泡泡、低煙雲霧到彩帶、火花與 CO₂ 氣柱，依活動節奏打造安全、精準且有記憶點的現場效果。',
  'bartending': '從 50 杯到 400 杯的行動酒吧方案，包含專業調酒、客製酒單、吧台器具與場地規劃。',
  'showgirl': '專業活動人員派遣，提供展場接待、活動協助等服務。',
};

const DB_CATEGORY_MAP: Record<string, string> = {
  'ai-interactive-props': 'AI互動道具',
  'event-package': '專案企劃',
  'opening-ceremony': '啟動儀式',
  'special-effects': '活動特效',
  'bartending': '外派調酒',
  'showgirl': 'Show Girl',
};

type Props = { params: Promise<{ category: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const service = SERVICE_SEO_PAGES.find(item => item.slug === category);
  if (!service) return createPageMetadata({ title: '服務項目', description: '境曜有限公司活動整合服務。', path: '/services' });
  return createPageMetadata({
    title: service.name,
    description: CATEGORY_DESC[category] || service.summary,
    path: `/services/${category}`,
    image: service.image,
    keywords: [service.name, ...service.intents.split('、'), '境曜有限公司'],
  });
}

export default async function ServiceCategoryPage({ params }: Props) {
  const { category } = await params;
  const categoryName = CATEGORY_MAP[category];
  if (!categoryName) notFound();
  const service = SERVICE_SEO_PAGES.find(item => item.slug === category);
  const structuredData = service
    ? [
        serviceJsonLd(service.slug, service.name, CATEGORY_DESC[category] || service.summary, service.image),
        breadcrumbJsonLd([
          { name: '首頁', path: '/' },
          { name: '服務項目', path: '/services' },
          { name: service.name, path: `/services/${service.slug}` },
        ]),
      ]
    : [];

  // showgirl 由獨立的靜態頁面處理
  if (category === 'showgirl') {
    redirect('/services/showgirl');
  }

  const dbCategory = DB_CATEGORY_MAP[category] || categoryName;
  const { data: products } = await supabase.from('products').select('*').eq('category', dbCategory).eq('visible', true).order('sort_order', { ascending: true });

  if (category === 'event-package') {
    return <><JsonLd data={structuredData} /><EventPackagePage /></>;
  }

  if (category === 'opening-ceremony') {
    return <><JsonLd data={structuredData} /><OpeningCeremonyPage products={(products || []) as Product[]} /></>;
  }

  if (category === 'special-effects') {
    return <><JsonLd data={structuredData} /><SpecialEffectsPage products={(products || []) as Product[]} /></>;
  }

  // 外派調酒：由 BartendingPlans 呈現後臺可維護的方案產品
  if (category === 'bartending') {
    return (
      <><JsonLd data={structuredData} /><BartendingPlans products={(products || []) as Product[]} /></>
    );
  }

  return (
    <><JsonLd data={structuredData} /><main className="bg-white min-h-screen">
      <section className="relative bg-primary h-[25vh] flex items-center justify-center pt-20">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/90 to-primary" />
        <div className="relative z-10 text-center px-4">
          <AnimateOnScroll><h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{categoryName}</h1><p className="text-white/80 text-lg max-w-2xl mx-auto">{CATEGORY_DESC[category]}</p></AnimateOnScroll>
        </div>
      </section>
      <section className="bg-white max-w-7xl mx-auto px-4 py-16 md:py-24">
        {products && products.length > 0 ? (
          <ServiceProductGrid products={products as Product[]} />
        ) : (
          <div className="text-center py-16"><p className="text-primary/60 text-lg">目前尚無產品資料，請洽詢我們取得最新資訊。</p></div>
        )}
      </section>
    </main></>
  );
}

function SpecialEffectsPage({ products }: { products: Product[] }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-white text-[#172039]">
      <SpecialEffectsAmbient />
      <section className="relative z-10 border-b border-[#e4e0d9] bg-[#fdfcfb]/90 pt-28">
        <div className="mx-auto max-w-7xl px-5 pb-10 sm:px-8 md:pb-12 lg:px-12">
          <AnimateOnScroll>
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-[#b58445]">SPECIAL EFFECTS</p>
            <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-baseline md:gap-6">
              <h1 className="text-3xl font-semibold tracking-tight text-[#172039] md:text-4xl">活動特效</h1>
              <p className="max-w-3xl text-base leading-7 text-[#4f535b] md:text-lg">{CATEGORY_DESC['special-effects']}</p>
            </div>
          </AnimateOnScroll>
        </div>
      </section>
      <section className="relative z-10 mx-auto max-w-7xl px-4 py-14 md:py-16">
        {products.length > 0 ? <ServiceProductGrid products={products} /> : <div className="py-16 text-center"><p className="text-lg text-[#5b5e65]">目前尚無產品資料，請洽詢我們取得最新資訊。</p></div>}
      </section>
    </main>
  );
}

function SpecialEffectsAmbient() {
  return (
    <svg aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 h-full w-full" viewBox="0 0 1200 1600" preserveAspectRatio="none" fill="none">
      <defs>
        <radialGradient id="effects-glow-outer" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#d6a34a" stopOpacity=".12" /><stop offset="45%" stopColor="#d8b067" stopOpacity=".045" /><stop offset="100%" stopColor="#d8b067" stopOpacity="0" /></radialGradient>
        <radialGradient id="effects-glow-inner" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#fffaf0" stopOpacity=".9" /><stop offset="18%" stopColor="#d6a34a" stopOpacity=".78" /><stop offset="68%" stopColor="#d8b067" stopOpacity=".14" /><stop offset="100%" stopColor="#d8b067" stopOpacity="0" /></radialGradient>
      </defs>
      <path id="effects-line-1" d="M-50 170 C200 85 385 250 595 154 C790 65 1000 190 1250 80" stroke="#c89b55" strokeWidth="1" opacity=".28" strokeDasharray="1800" strokeDashoffset="1800"><animate attributeName="stroke-dashoffset" from="1800" to="0" dur="1.8s" fill="freeze" /></path>
      <path id="effects-line-2" d="M-40 420 C190 510 360 360 555 435 C755 514 950 350 1240 470" stroke="#d0a565" strokeWidth=".75" opacity=".22" strokeDasharray="1800" strokeDashoffset="1800"><animate attributeName="stroke-dashoffset" from="1800" to="0" begin=".18s" dur="2s" fill="freeze" /></path>
      <path id="effects-line-3" d="M-45 920 C185 820 360 1010 570 900 C790 784 990 980 1245 850" stroke="#d8b67a" strokeWidth=".85" opacity=".25" strokeDasharray="1800" strokeDashoffset="1800"><animate attributeName="stroke-dashoffset" from="1800" to="0" begin=".35s" dur="2.1s" fill="freeze" /></path>
      <path d="M-35 270 C145 235 285 318 430 278 C630 225 805 306 1010 230 C1100 198 1165 208 1240 180" stroke="#d8b67a" strokeWidth=".42" opacity=".16" />
      <path d="M-20 665 C180 590 300 720 470 640 C670 545 845 704 1040 610 C1130 566 1180 574 1230 550" stroke="#c89b55" strokeWidth=".38" opacity=".14" />
      <path d="M90 1270 C260 1170 396 1330 565 1225 C724 1128 885 1290 1110 1174" stroke="#d0a565" strokeWidth=".48" opacity=".16" />
      <EffectsGlow pathId="effects-line-1" duration="15s" begin="1.9s" />
      <EffectsGlow pathId="effects-line-2" duration="18s" begin="2.1s" reverse large />
      <EffectsGlow pathId="effects-line-3" duration="20s" begin="2.3s" />
    </svg>
  );
}

function EffectsGlow({ pathId, duration, begin, reverse = false, large = false }: { pathId: string; duration: string; begin: string; reverse?: boolean; large?: boolean }) {
  const outerRadius = large ? 32 : 28;
  const innerRadius = large ? 8 : 7;
  return <g opacity="0"><animate attributeName="opacity" from="0" to="1" begin={begin} dur=".45s" fill="freeze" /><circle r={outerRadius} fill="url(#effects-glow-outer)" /><circle r={innerRadius} fill="url(#effects-glow-inner)" /><circle r="1.2" fill="#fffdf7" opacity=".88" /><animateMotion dur={duration} begin={`calc(${begin} + .3s)`} repeatCount="indefinite" {...(reverse ? { keyPoints: '1;0', keyTimes: '0;1', calcMode: 'linear' } : {})}><mpath href={`#${pathId}`} /></animateMotion></g>;
}

function OpeningCeremonyPage({ products }: { products: Product[] }) {
  return (
    <main className="min-h-screen bg-[#fdfcfb] text-[#172039]">
      <section className="relative overflow-hidden border-b border-[#e2ded8]">
        <div className="relative z-10 mx-auto max-w-[1400px] px-6 pb-16 pt-28 md:px-12 lg:px-20 lg:pb-20">
          <AnimateOnScroll>
            <p className="mb-5 text-sm uppercase tracking-[0.24em] text-[#b58445]">OPENING CEREMONY</p>
            <h1 className="text-5xl font-medium leading-tight tracking-tight md:text-6xl">啟動儀式</h1>
            <p className="mt-3 text-2xl text-[#303746] md:text-3xl">讓開場成為活動最具記憶點的一刻</p>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[#4f535b] md:text-lg">星辰運轉、全息投影、沙漏啟動等多種創意儀式，<br className="hidden md:block" />以精準節奏與現場執行，為品牌揭開精彩序幕。</p>
          </AnimateOnScroll>
        </div>
        <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 1200 620" preserveAspectRatio="none" fill="none">
          <defs>
            <filter id="ceremony-inner-glow" x="-300%" y="-300%" width="600%" height="600%"><feGaussianBlur stdDeviation="1.8" /></filter>
            <filter id="ceremony-mid-glow" x="-300%" y="-300%" width="600%" height="600%"><feGaussianBlur stdDeviation="7" /></filter>
            <filter id="ceremony-outer-glow" x="-300%" y="-300%" width="600%" height="600%"><feGaussianBlur stdDeviation="15" /></filter>
            <filter id="ceremony-core-soften" x="-300%" y="-300%" width="600%" height="600%"><feGaussianBlur stdDeviation="0.45" /></filter>
          </defs>
          <path id="ceremony-line-1" d="M-40 122 C155 78 305 190 520 104 C720 24 925 118 1240 42" stroke="#c89b55" strokeWidth="1.35" opacity=".38" strokeDasharray="1800" strokeDashoffset="1800"><animate attributeName="stroke-dashoffset" from="1800" to="0" dur="1.7s" fill="freeze" /></path>
          <path id="ceremony-line-2" d="M-30 332 C168 366 344 244 506 298 C716 372 906 238 1230 184" stroke="#d0a565" strokeWidth="1" opacity=".24" strokeDasharray="1800" strokeDashoffset="1800"><animate attributeName="stroke-dashoffset" from="1800" to="0" begin=".16s" dur="1.8s" fill="freeze" /></path>
          <path id="ceremony-line-3" d="M-20 508 C205 560 340 425 540 462 C754 502 900 570 1235 348" stroke="#d8b67a" strokeWidth=".8" opacity=".42" strokeDasharray="1800" strokeDashoffset="1800"><animate attributeName="stroke-dashoffset" from="1800" to="0" begin=".3s" dur="1.9s" fill="freeze" /></path>
          <path d="M-20 230 C130 196 238 264 376 214 C506 166 594 80 748 92 C910 104 1050 164 1230 96" stroke="#d8b67a" strokeWidth=".55" opacity=".2" strokeDasharray="1800" strokeDashoffset="1800"><animate attributeName="stroke-dashoffset" from="1800" to="0" begin=".42s" dur="2s" fill="freeze" /></path>
          <path d="M-20 412 C126 352 262 420 404 366 C548 312 658 394 810 338 C958 282 1068 338 1230 286" stroke="#c89b55" strokeWidth=".45" opacity=".18" strokeDasharray="1800" strokeDashoffset="1800"><animate attributeName="stroke-dashoffset" from="1800" to="0" begin=".55s" dur="2s" fill="freeze" /></path>
          <path d="M176 620 C286 520 394 582 472 496 C560 398 654 494 748 400 C846 304 970 402 1114 270" stroke="#d0a565" strokeWidth=".35" opacity=".16" strokeDasharray="1400" strokeDashoffset="1400"><animate attributeName="stroke-dashoffset" from="1400" to="0" begin=".7s" dur="2.1s" fill="freeze" /></path>
          <GoldenGlow pathId="ceremony-line-1" begin="1.95s" motionBegin="2.25s" duration="13s" />
          <GoldenGlow pathId="ceremony-line-2" begin="2.1s" motionBegin="2.4s" duration="16s" reverse soft />
          <GoldenGlow pathId="ceremony-line-3" begin="2.25s" motionBegin="2.55s" duration="18s" soft />
        </svg>
      </section>

      <section className="relative mx-auto max-w-[1400px] px-6 py-20 md:px-12 lg:px-20 lg:py-24">
        <CeremonyProductGlow />
        <SectionHeading title="啟動儀式方案" english="CEREMONY SOLUTIONS" />
        {products.length > 0 ? (
          <div className="relative z-10 mt-12"><ServiceProductGrid products={products} /></div>
        ) : (
          <div className="py-16 text-center"><p className="text-lg text-[#5b5e65]">目前尚無產品資料，請洽詢我們取得最新資訊。</p></div>
        )}
      </section>
    </main>
  );
}

function GoldenGlow({ pathId, begin, motionBegin, duration, reverse = false, soft = false }: { pathId: string; begin: string; motionBegin: string; duration: string; reverse?: boolean; soft?: boolean }) {
  return (
    <g opacity="0">
      <animate attributeName="opacity" from="0" to="1" begin={begin} dur=".45s" fill="freeze" />
      <circle r={soft ? 28 : 24} fill="#d6a34a" opacity={soft ? ".06" : ".09"} filter="url(#ceremony-outer-glow)" />
      <circle r={soft ? 17 : 15} fill="#d8b067" opacity={soft ? ".15" : ".22"} filter="url(#ceremony-mid-glow)" />
      <circle r={soft ? 6 : 5} fill="#d6a34a" opacity=".72" filter="url(#ceremony-inner-glow)" />
      <circle r="1.15" fill="#fffdf7" opacity=".9" filter="url(#ceremony-core-soften)" />
      <animateMotion dur={duration} begin={motionBegin} repeatCount="indefinite" {...(reverse ? { keyPoints: '1;0', keyTimes: '0;1', calcMode: 'linear' } : {})}><mpath href={`#${pathId}`} /></animateMotion>
    </g>
  );
}

function CeremonyProductGlow() {
  return (
    <svg aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-20 z-20 h-[calc(100%-5rem)] w-full" viewBox="0 0 1200 700" preserveAspectRatio="none" fill="none">
      <defs>
        <filter id="ceremony-grid-glow" x="-300%" y="-300%" width="600%" height="600%"><feGaussianBlur stdDeviation="9" /></filter>
        <filter id="ceremony-grid-core" x="-300%" y="-300%" width="600%" height="600%"><feGaussianBlur stdDeviation=".45" /></filter>
      </defs>
      <path id="ceremony-grid-line" d="M-40 180 C220 58 406 334 656 202 C850 100 996 254 1240 130" stroke="#d0a565" strokeWidth=".55" opacity=".15" />
      <path id="ceremony-grid-line-2" d="M-20 490 C174 596 366 350 570 466 C756 570 960 420 1230 520" stroke="#c89b55" strokeWidth=".4" opacity=".12" />
      <g opacity="0"><animate attributeName="opacity" from="0" to="1" begin=".5s" dur=".45s" fill="freeze" /><circle r="25" fill="#d6a34a" opacity=".08" filter="url(#ceremony-grid-glow)" /><circle r="14" fill="#d8b067" opacity=".2" filter="url(#ceremony-grid-glow)" /><circle r="1.15" fill="#fffdf7" opacity=".9" filter="url(#ceremony-grid-core)" /><animateMotion dur="15s" begin=".8s" repeatCount="indefinite"><mpath href="#ceremony-grid-line" /></animateMotion></g>
      <g opacity="0"><animate attributeName="opacity" from="0" to="1" begin=".8s" dur=".45s" fill="freeze" /><circle r="28" fill="#d6a34a" opacity=".06" filter="url(#ceremony-grid-glow)" /><circle r="15" fill="#d8b067" opacity=".16" filter="url(#ceremony-grid-glow)" /><circle r="1.05" fill="#fffdf7" opacity=".82" filter="url(#ceremony-grid-core)" /><animateMotion dur="19s" begin="1.1s" repeatCount="indefinite" keyPoints="1;0" keyTimes="0;1" calcMode="linear"><mpath href="#ceremony-grid-line-2" /></animateMotion></g>
    </svg>
  );
}

function EventPackagePage() {
  const services = [
    ['策略企劃', '深入了解需求，制定完整活動策略與創意主軸。'],
    ['視覺設計', '活動主視覺、KV延伸與場地動線整合設計，建立一致的品牌形象。'],
    ['舞台技術', '燈光、音響、視訊、特效整合規劃，提升活動現場的體驗與專業度。'],
    ['活動執行', '專案團隊現場控場與流程執行，確保活動順利進行、零失誤完成。'],
    ['影像紀錄', '專業拍攝與剪輯，完整記錄精彩時刻，延續活動價值與影響力。'],
    ['專案管理', '全程專人專案管理，控管時程與預算，讓您放心專注於核心目標。'],
  ];
  const processes = [
    ['需求溝通', '了解活動目標、預算與期望，提供專業建議與方向。'],
    ['企劃提案', '提出創意企劃與執行策略，確認活動主軸與亮點。'],
    ['設計規劃', '依據策略進行設計與流程規劃，細化各項執行內容。'],
    ['執行準備', '設備、場地、人員等全面準備，進行彩排與細節檢查。'],
    ['活動執行', '專案團隊現場控場，確保流程順暢、氣氛到位。'],
    ['檢討回饋', '活動結束後檢討成果與盤整，持續優化後續活動。'],
  ];
  const occasions = ['品牌發表會', '企業活動', '開幕典禮', '記者會', '展覽活動', '商場活動', '園區嘉年華', '春酒尾牙', '政府活動', '其他客製活動'];

  return (
    <main className="min-h-screen bg-[#fdfcfb] text-[#172039]">
      <section className="relative overflow-hidden border-b border-[#e2ded8]">
        <div className="relative z-10 mx-auto max-w-[1400px] px-6 pb-28 pt-32 md:px-12 lg:px-20 lg:pb-36">
          <AnimateOnScroll>
            <p className="mb-5 text-sm uppercase tracking-[0.24em] text-[#b58445]">EVENT SOLUTION</p>
            <h1 className="text-5xl font-medium leading-tight tracking-tight md:text-6xl">活動策畫統包</h1>
            <p className="mt-5 text-2xl text-[#303746] md:text-3xl">從概念到現場，一站到位</p>
            <p className="mt-8 max-w-2xl text-base leading-8 text-[#4f535b] md:text-lg">整合策略企劃、視覺設計、舞台技術與現場執行，<br className="hidden md:block" />為品牌打造專屬活動體驗，讓每一場活動都精彩且具價值。</p>
            <a href="/contact" className="mt-9 inline-flex rounded-md bg-[#b58445] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#996f39]">洽詢專案規劃 →</a>
          </AnimateOnScroll>
        </div>
        <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 1200 620" preserveAspectRatio="none" fill="none">
          <defs>
            <radialGradient id="gold-ambient" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#d6a34a" stopOpacity=".12" /><stop offset="42%" stopColor="#d8b067" stopOpacity=".055" /><stop offset="100%" stopColor="#d8b067" stopOpacity="0" /></radialGradient>
            <radialGradient id="gold-halo" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#d6a34a" stopOpacity=".3" /><stop offset="30%" stopColor="#d8b067" stopOpacity=".18" /><stop offset="72%" stopColor="#d8b067" stopOpacity=".04" /><stop offset="100%" stopColor="#d8b067" stopOpacity="0" /></radialGradient>
            <radialGradient id="gold-inner" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#fff8e7" stopOpacity=".9" /><stop offset="18%" stopColor="#d6a34a" stopOpacity=".84" /><stop offset="60%" stopColor="#d8b067" stopOpacity=".2" /><stop offset="100%" stopColor="#d8b067" stopOpacity="0" /></radialGradient>
          </defs>
          <path id="hero-main-line-1" d="M-40 170 C180 130 330 190 520 112 C730 25 940 120 1240 25" stroke="#c89b55" strokeWidth="1.35" opacity=".38" strokeDasharray="1800" strokeDashoffset="1800"><animate attributeName="stroke-dashoffset" from="1800" to="0" dur="1.7s" fill="freeze" /></path>
          <path id="hero-main-line-2" d="M-30 300 C180 340 330 250 500 285 C700 330 880 245 1230 150" stroke="#d0a565" strokeWidth="1" opacity=".24" strokeDasharray="1800" strokeDashoffset="1800"><animate attributeName="stroke-dashoffset" from="1800" to="0" begin=".16s" dur="1.8s" fill="freeze" /></path>
          <path id="hero-main-line-3" d="M-20 470 C210 540 300 420 520 430 C760 442 920 560 1235 365" stroke="#d8b67a" strokeWidth=".8" opacity=".42" strokeDasharray="1800" strokeDashoffset="1800"><animate attributeName="stroke-dashoffset" from="1800" to="0" begin=".3s" dur="1.9s" fill="freeze" /></path>
          <path d="M-20 220 C120 205 230 245 350 214 C490 180 600 84 740 78 C900 72 1050 140 1230 105" stroke="#d8b67a" strokeWidth=".55" opacity=".2" strokeDasharray="1800" strokeDashoffset="1800"><animate attributeName="stroke-dashoffset" from="1800" to="0" begin=".42s" dur="2s" fill="freeze" /></path>
          <path d="M-20 395 C120 350 245 400 385 360 C540 315 660 385 800 348 C960 305 1060 350 1230 300" stroke="#c89b55" strokeWidth=".45" opacity=".18" strokeDasharray="1800" strokeDashoffset="1800"><animate attributeName="stroke-dashoffset" from="1800" to="0" begin=".55s" dur="2s" fill="freeze" /></path>
          <path d="M190 620 C280 525 380 575 470 500 C570 420 640 480 735 410 C840 330 970 410 1100 285" stroke="#d0a565" strokeWidth=".35" opacity=".16" strokeDasharray="1400" strokeDashoffset="1400"><animate attributeName="stroke-dashoffset" from="1400" to="0" begin=".7s" dur="2.1s" fill="freeze" /></path>
          <path d="M70 40 C210 85 260 120 390 92 C510 65 580 18 700 32 C850 50 980 0 1160 58" stroke="#d8b67a" strokeWidth=".3" opacity=".15" strokeDasharray="1400" strokeDashoffset="1400"><animate attributeName="stroke-dashoffset" from="1400" to="0" begin=".82s" dur="2.1s" fill="freeze" /></path>
          <g opacity="0"><animate attributeName="opacity" from="0" to="1" begin="1.85s" dur=".45s" fill="freeze" /><animateMotion dur="13s" begin="2.3s" repeatCount="indefinite"><mpath href="#hero-main-line-1" /></animateMotion><circle r="30" fill="url(#gold-ambient)" /><circle r="17" fill="url(#gold-halo)" /><circle r="7" fill="url(#gold-inner)" /><circle r="1.35" fill="#fffdf7" opacity=".9" /></g>
          <g opacity="0"><animate attributeName="opacity" from="0" to="1" begin="2s" dur=".45s" fill="freeze" /><animateMotion dur="16s" begin="2.45s" repeatCount="indefinite" keyPoints="1;0" keyTimes="0;1" calcMode="linear"><mpath href="#hero-main-line-2" /></animateMotion><circle r="34" fill="url(#gold-ambient)" /><circle r="19" fill="url(#gold-halo)" /><circle r="8" fill="url(#gold-inner)" /><circle r="1.45" fill="#fffdf7" opacity=".88" /></g>
          <g opacity="0"><animate attributeName="opacity" from="0" to="1" begin="2.1s" dur=".45s" fill="freeze" /><animateMotion dur="18s" begin="2.55s" repeatCount="indefinite"><mpath href="#hero-main-line-3" /></animateMotion><circle r="27" fill="url(#gold-ambient)" /><circle r="15" fill="url(#gold-halo)" /><circle r="6" fill="url(#gold-inner)" /><circle r="1.2" fill="#fffdf7" opacity=".86" /></g>
        </svg>
      </section>

      <section className="mx-auto max-w-[1400px] px-6 py-24 md:px-12 lg:px-20 lg:py-32">
        <SectionHeading title="我們提供的服務" english="OUR SERVICES" />
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6">
          {services.map(([title, text], index) => <div key={title} className="border-b border-[#dedbd5] px-5 py-7 first:pl-0 md:border-b-0 md:border-r md:px-6 md:first:pl-0 md:last:border-r-0 lg:py-2"><p className="text-3xl font-light text-[#b58445]">{String(index + 1).padStart(2, '0')}</p><h2 className="mt-4 text-lg font-semibold">{title}</h2><p className="mt-3 text-sm leading-7 text-[#5b5e65]">{text}</p></div>)}
        </div>
      </section>

      <Divider />
      <section className="mx-auto max-w-[1100px] px-6 py-24 md:px-12 lg:py-32">
        <SectionHeading title="活動統包流程" english="OUR PROCESS" />
        <div className="relative mt-20 hidden min-h-[720px] md:block">
          <svg aria-hidden="true" className="absolute inset-0 h-full w-full" viewBox="0 0 900 720" fill="none" preserveAspectRatio="none"><path d="M324 52 C324 105 576 104 576 157 C576 210 324 209 324 262 C324 315 576 314 576 367 C576 420 324 419 324 472 C324 525 576 524 576 577" stroke="#cda774" strokeWidth="1.5" /></svg>
          {processes.map(([title, text], index) => { const left = index % 2 === 0; return <div key={title} className={`absolute flex w-[43%] items-center gap-6 ${left ? 'left-0 justify-end text-right' : 'right-0 flex-row-reverse justify-end text-left'}`} style={{ top: `${index * 105 + 12}px` }}><div className="max-w-[250px]"><h3 className="text-xl font-semibold">{title}</h3><p className="mt-3 text-[15px] leading-7 text-[#5b5e65]">{text}</p></div><div className="relative z-10 flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-[#cda774] bg-[#fdfcfb] text-2xl font-light text-[#b58445]">{String(index + 1).padStart(2, '0')}</div></div>; })}
        </div>
        <div className="mt-16 space-y-8 md:hidden">{processes.map(([title, text], index) => <div key={title} className="flex gap-5 border-b border-[#e1ddd6] pb-8"><div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-[#cda774] text-xl font-light text-[#b58445]">{String(index + 1).padStart(2, '0')}</div><div><h3 className="text-lg font-semibold">{title}</h3><p className="mt-2 text-sm leading-7 text-[#5b5e65]">{text}</p></div></div>)}</div>
      </section>

      <Divider />
      <section className="mx-auto grid max-w-[1400px] gap-14 px-6 py-24 md:px-12 lg:grid-cols-[1.1fr_0.9fr] lg:px-20 lg:py-32">
        <div><SectionHeading title="服務適用場合" english="SERVICE OCCASIONS" align="left" /><div className="mt-10 flex max-w-2xl flex-wrap gap-y-4 text-sm text-[#4f535b]">{occasions.map(occasion => <span key={occasion} className="border-r border-[#d8d4cd] px-4 first:pl-0 last:border-r-0">{occasion}</span>)}</div></div>
        <div className="rounded-2xl border border-[#e2d8c9] bg-[#fbf9f5] p-8 md:p-10"><h2 className="text-2xl font-semibold">正在規劃下一場活動？</h2><p className="mt-3 text-xs uppercase tracking-[0.2em] text-[#b58445]">LET&apos;S PLAN YOUR NEXT EVENT</p><p className="mt-7 text-base leading-8 text-[#5b5e65]">告訴我們活動日期、規模與需求，<br />由專人協助您規劃最合適的方案。</p><a href="/contact" className="mt-7 inline-flex rounded-md bg-[#b58445] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#996f39]">洽詢活動企劃 →</a></div>
      </section>
    </main>
  );
}

function SectionHeading({ title, english, align = 'center' }: { title: string; english: string; align?: 'center' | 'left' }) {
  return <div className={align === 'center' ? 'text-center' : 'text-left'}><h2 className="text-3xl font-medium md:text-4xl">{title}</h2><p className="mt-3 text-sm uppercase tracking-[0.24em] text-[#b58445]">{english}</p><div className={`mt-4 h-px w-8 bg-[#b58445] ${align === 'center' ? 'mx-auto' : ''}`} /></div>;
}

function Divider() {
  return <div className="mx-auto h-px w-[92%] max-w-[1400px] bg-[#dedbd5]" />;
}
