import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import AnimateOnScroll from '@/components/AnimateOnScroll';
import BartendingPlans from '@/components/BartendingPlans';
import ServiceProductGrid from '@/components/ServiceProductGrid';
import { supabase } from '@/lib/supabase';
import { Product } from '@/lib/types';

const CATEGORY_MAP: Record<string, string> = {
  'event-package': '活動策劃統包',
  'opening-ceremony': '啟動儀式',
  'special-effects': '活動特效',
  'stage-lighting': '燈光音響舞台',
  'bartending': '外派調酒',
  'showgirl': 'SHOW GIRL',
};

const CATEGORY_DESC: Record<string, string> = {
  'event-package': '從企劃到執行，提供一站式活動統包服務，讓您省心省力。',
  'opening-ceremony': '星辰運轉、全息投影、沙漏啟動等多種創意儀式，為活動開場製造震撼記憶點。',
  'special-effects': '專業活動特效服務，為現場營造震撼視覺效果。',
  'stage-lighting': '專業燈光音響與舞台設備租賃與搭建，打造完美視聽體驗。',
  'bartending': '專業調酒師現場調製，為活動增添品味與儀式感。',
  'showgirl': '專業活動人員派遣，提供展場接待、活動協助等服務。',
};

const DB_CATEGORY_MAP: Record<string, string> = {
  'event-package': '專案企劃',
  'opening-ceremony': '啟動儀式',
  'special-effects': '活動特效',
  'stage-lighting': '燈光音響舞台',
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

  // 外派調酒：由 BartendingPlans client 元件處理
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
        <BartendingPlans />
      </main>
    );
  }

  const dbCategory = DB_CATEGORY_MAP[category] || categoryName;
  const { data: products } = await supabase.from('products').select('*').eq('category', dbCategory).eq('visible', true).order('sort_order', { ascending: true });

  return (
    <main className="bg-white min-h-screen">
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
      {/* 分隔線 */}
      <div className="flex justify-center bg-white px-8">
        <div className="w-full h-[2px] bg-gray-300"></div>
      </div>
      <section className="bg-primary py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <AnimateOnScroll>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">想了解更多？</h2>
            <p className="text-white/80 mb-8">歡迎聯繫我們，取得客製化報價與專業建議</p>
            <Link href="/contact" className="inline-flex items-center gap-2 bg-cta text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-cta-hover transition-colors"><MessageCircle size={20} />立即諮詢</Link>
          </AnimateOnScroll>
        </div>
      </section>
    </main>
  );
}
