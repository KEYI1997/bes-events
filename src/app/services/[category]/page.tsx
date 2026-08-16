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
