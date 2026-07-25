import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import AnimateOnScroll from '@/components/AnimateOnScroll';

const EVENT_TYPE_MAP: Record<string, string> = {
  'grand-opening': '開幕典禮',
  'press-conference': '記者會',
  'product-launch': '新品發表會',
  'exhibition': '展覽攤位',
  'government': '政府活動',
  'banquet': '春酒尾牙',
  'ceremony': '典禮節慶',
};

const EVENT_TYPE_DESC: Record<string, string> = {
  'grand-opening': '為企業打造氣勢磅礴的開幕典禮，從啟動儀式到舞台規劃一手包辦。',
  'press-conference': '專業記者會場地規劃與現場執行，精準傳遞品牌訊息。',
  'product-launch': '創新新品發表會企劃，打造令人印象深刻的產品亮相時刻。',
  'exhibition': '展覽攤位設計與搭建，吸引目光、提升品牌能見度。',
  'government': '政府機關活動企劃與執行，符合規範又不失創意。',
  'banquet': '春酒尾牙活動規劃，凝聚企業向心力的最佳場合。',
  'ceremony': '各式典禮與節慶活動策劃，為重要時刻增添儀式感。',
};

type Props = { params: Promise<{ type: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type } = await params;
  const title = EVENT_TYPE_MAP[type];
  if (!title) return { title: '活動類型 | 境曜有限公司' };
  return { title: `${title} | 境曜有限公司 BES Events`, description: EVENT_TYPE_DESC[type] };
}

export default async function EventTypePage({ params }: Props) {
  const { type } = await params;
  const typeName = EVENT_TYPE_MAP[type];
  if (!typeName) notFound();

  return (
    <main className="bg-bg min-h-screen">
      <section className="relative bg-primary h-[25vh] flex items-center justify-center pt-20">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/90 to-primary" />
        <div className="relative z-10 text-center px-4">
          <AnimateOnScroll>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{typeName}</h1>
            <p className="text-white/80 text-lg max-w-2xl mx-auto">{EVENT_TYPE_DESC[type]}</p>
          </AnimateOnScroll>
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center py-16">
          <AnimateOnScroll>
            <p className="text-primary/60 text-lg mb-8">此活動類型的案例即將上線，歡迎直接聯繫了解更多。</p>
            <Link href="/contact" className="inline-flex items-center gap-2 bg-cta text-white px-8 py-4 rounded-full font-semibold hover:bg-cta-hover transition-colors"><MessageCircle size={20} />立即諮詢</Link>
          </AnimateOnScroll>
        </div>
      </section>
      <section className="bg-primary py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <AnimateOnScroll>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">需要{typeName}服務？</h2>
            <p className="text-white/80 mb-8">歡迎聯繫我們，取得客製化報價與專業建議</p>
            <Link href="/contact" className="inline-flex items-center gap-2 bg-cta text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-cta-hover transition-colors"><MessageCircle size={20} />立即諮詢</Link>
          </AnimateOnScroll>
        </div>
      </section>
    </main>
  );
}
