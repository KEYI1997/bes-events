import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { ShieldCheck, SlidersHorizontal, Sparkles } from 'lucide-react';
import AnimateOnScroll from '@/components/AnimateOnScroll';
import BartendingPlans from '@/components/BartendingPlans';
import ServiceProductGrid from '@/components/ServiceProductGrid';
import { supabase } from '@/lib/supabase';
import { Product } from '@/lib/types';

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
  const title = CATEGORY_MAP[category];
  if (!title) return { title: '服務項目 | 境曜有限公司' };
  return { title: `${title} | 境曜有限公司 BES Events`, description: CATEGORY_DESC[category] };
}

export default async function ServiceCategoryPage({ params }: Props) {
  const { category } = await params;
  const categoryName = CATEGORY_MAP[category];
  if (!categoryName) notFound();

  // showgirl 由獨立的靜態頁面處理
  if (category === 'showgirl') {
    redirect('/services/showgirl');
  }

  const dbCategory = DB_CATEGORY_MAP[category] || categoryName;
  const { data: products } = await supabase.from('products').select('*').eq('category', dbCategory).eq('visible', true).order('sort_order', { ascending: true });

  if (category === 'event-package') {
    return <EventPackagePage />;
  }

  // 外派調酒：由 BartendingPlans 呈現後臺可維護的方案產品
  if (category === 'bartending') {
    return (
      <main className="bg-white min-h-screen">
        <section className="relative bg-primary h-[25vh] flex items-center justify-center pt-20">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/90 to-primary" />
          <div className="relative z-10 text-center px-4">
            <AnimateOnScroll>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">外派調酒</h1>
              <p className="text-white/80 text-lg max-w-2xl mx-auto">{CATEGORY_DESC['bartending']}</p>
            </AnimateOnScroll>
          </div>
        </section>
        <BartendingPlans products={(products || []) as Product[]} />
      </main>
    );
  }

  return (
    <main className="bg-white min-h-screen">
      <section className="relative bg-primary h-[25vh] flex items-center justify-center pt-20">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/90 to-primary" />
        <div className="relative z-10 text-center px-4">
          <AnimateOnScroll><h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{categoryName}</h1><p className="text-white/80 text-lg max-w-2xl mx-auto">{CATEGORY_DESC[category]}</p></AnimateOnScroll>
        </div>
      </section>
      {category === 'special-effects' && (
        <section className="bg-[#F9F7F0] border-b border-primary/10">
          <div className="max-w-6xl mx-auto px-4 py-10 md:py-14 grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { icon: Sparkles, title: '效果精準設計', text: '依流程、音樂節點與場地條件規劃施放時機，讓活動高潮更有張力。' },
              { icon: ShieldCheck, title: '安全專業操作', text: '進場前評估電力、淨空與安全距離，必要設備由專業人員現場控施。' },
              { icon: SlidersHorizontal, title: '彈性組合配置', text: '可依場地大小與預算搭配泡泡、煙霧、彩帶、火花及 CO₂ 系列設備。' },
            ].map(item => (
              <AnimateOnScroll key={item.title}>
                <div className="h-full bg-white rounded-2xl p-6 shadow-sm border border-primary/10">
                  <item.icon className="w-8 h-8 text-cta mb-4" />
                  <h2 className="text-lg font-bold text-primary mb-2">{item.title}</h2>
                  <p className="text-sm text-primary/70 leading-relaxed">{item.text}</p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </section>
      )}
      <section className="bg-white max-w-7xl mx-auto px-4 py-16 md:py-24">
        {products && products.length > 0 ? (
          <ServiceProductGrid products={products as Product[]} />
        ) : (
          <div className="text-center py-16"><p className="text-primary/60 text-lg">目前尚無產品資料，請洽詢我們取得最新資訊。</p></div>
        )}
      </section>
    </main>
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
        <div className="mx-auto max-w-[1400px] px-6 pb-28 pt-32 md:px-12 lg:px-20 lg:pb-36">
          <AnimateOnScroll>
            <p className="mb-5 text-sm uppercase tracking-[0.24em] text-[#b58445]">EVENT SOLUTION</p>
            <h1 className="text-5xl font-medium leading-tight tracking-tight md:text-6xl">活動策畫統包</h1>
            <p className="mt-5 text-2xl text-[#303746] md:text-3xl">從概念到現場，一站到位</p>
            <p className="mt-8 max-w-2xl text-base leading-8 text-[#4f535b] md:text-lg">整合策略企劃、視覺設計、舞台技術與現場執行，<br className="hidden md:block" />為品牌打造專屬活動體驗，讓每一場活動都精彩且具價值。</p>
            <a href="/contact" className="mt-9 inline-flex rounded-md bg-[#b58445] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#996f39]">洽詢專案規劃 →</a>
          </AnimateOnScroll>
        </div>
        <svg aria-hidden="true" className="pointer-events-none absolute bottom-0 left-0 h-32 w-full" viewBox="0 0 1200 140" preserveAspectRatio="none" fill="none">
          <defs><filter id="gold-glow" x="-300%" y="-300%" width="600%" height="600%"><feGaussianBlur stdDeviation="4" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs>
          <path id="hero-line-1" d="M0 92C180 125 350 104 520 91C720 76 890 90 1010 58C1100 34 1150 12 1200 4" stroke="#cda774" strokeWidth="1" opacity=".8" />
          <circle r="4.5" fill="#b58445" filter="url(#gold-glow)"><animateMotion dur="8s" repeatCount="indefinite" path="M0 92C180 125 350 104 520 91C720 76 890 90 1010 58C1100 34 1150 12 1200 4" /></circle>
        </svg>
      </section>

      <div aria-hidden="true" className="pointer-events-none relative h-24 overflow-hidden md:h-32">
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1200 140" preserveAspectRatio="none" fill="none">
          <path d="M0 92C170 120 315 128 470 105C630 80 760 66 900 83C1030 98 1120 86 1200 58" stroke="#d0a565" strokeWidth="1" opacity=".5" />
          <circle r="4" fill="#c89b55" filter="url(#gold-glow)"><animateMotion dur="10s" begin="-2s" repeatCount="indefinite" path="M1200 58C1120 86 1030 98 900 83C760 66 630 80 470 105C315 128 170 120 0 92" /></circle>
        </svg>
      </div>

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
      <section className="relative mx-auto grid max-w-[1400px] gap-14 overflow-hidden px-6 py-24 md:px-12 lg:grid-cols-[1.1fr_0.9fr] lg:px-20 lg:py-32">
        <div><SectionHeading title="服務適用場合" english="SERVICE OCCASIONS" align="left" /><div className="mt-10 flex max-w-2xl flex-wrap gap-y-4 text-sm text-[#4f535b]">{occasions.map(occasion => <span key={occasion} className="border-r border-[#d8d4cd] px-4 first:pl-0 last:border-r-0">{occasion}</span>)}</div></div>
        <div className="rounded-2xl border border-[#e2d8c9] bg-[#fbf9f5] p-8 md:p-10"><h2 className="text-2xl font-semibold">正在規劃下一場活動？</h2><p className="mt-3 text-xs uppercase tracking-[0.2em] text-[#b58445]">LET&apos;S PLAN YOUR NEXT EVENT</p><p className="mt-7 text-base leading-8 text-[#5b5e65]">告訴我們活動日期、規模與需求，<br />由專人協助您規劃最合適的方案。</p><a href="/contact" className="mt-7 inline-flex rounded-md bg-[#b58445] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#996f39]">洽詢活動企劃 →</a></div>
        <svg aria-hidden="true" className="pointer-events-none absolute bottom-0 left-0 h-28 w-full" viewBox="0 0 1200 140" preserveAspectRatio="none" fill="none"><path d="M0 108C180 48 350 38 520 72C700 108 850 124 1000 79C1090 53 1150 42 1200 55" stroke="#d8b67a" strokeWidth="1.1" opacity=".45" /><circle r="4" fill="#c89b55" filter="url(#gold-glow)"><animateMotion dur="11s" begin="-5s" repeatCount="indefinite" path="M1200 55C1150 42 1090 53 1000 79C850 124 700 108 520 72C350 38 180 48 0 108" /></circle></svg>
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
