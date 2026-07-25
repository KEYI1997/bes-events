import { Metadata } from 'next';
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import AnimateOnScroll from '@/components/AnimateOnScroll';

export const metadata: Metadata = {
  title: '關於境曜 | 境曜有限公司 BES Events',
  description: '境曜有限公司（Bright Events Services）專注於各類型活動整合與現場執行，提供一站式活動服務。',
};

export default function AboutPage() {
  return (
    <main className="bg-bg min-h-screen">
      <section className="relative bg-primary h-[25vh] flex items-center justify-center pt-20">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/90 to-primary" />
        <div className="relative z-10 text-center px-4">
          <AnimateOnScroll>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">關於境曜</h1>
            <p className="text-white/80 text-lg max-w-2xl mx-auto">Bright Events Services — 活動整合服務專家</p>
          </AnimateOnScroll>
        </div>
      </section>
      <section className="max-w-4xl mx-auto px-4 py-16 md:py-24">
        <AnimateOnScroll>
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm">
            <h2 className="text-2xl font-bold text-primary mb-6">我們的故事</h2>
            <div className="space-y-4 text-primary/80 leading-relaxed">
              <p>境曜有限公司（Bright Events Services）專注於各類型活動整合與現場執行，致力於為企業打造具有影響力的品牌活動。</p>
              <p>我們以「顧問式服務」為核心，從前期活動企劃、現場執行到後續成效追蹤，建立完整的服務循環。持續蒐集客戶回饋、優化執行流程，確保每一場活動都能精準傳遞品牌價值。</p>
              <p>無論是啟動儀式、燈光音響舞台、專案企劃、外派調酒或 Show Girl 服務，境曜都能提供最專業的整合方案，讓企業的每一次投入都轉化為可感受的影響力。</p>
            </div>
            <h2 className="text-2xl font-bold text-primary mt-12 mb-6">我們的理念</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-bg rounded-xl">
                <div className="text-3xl mb-3">🎯</div>
                <h3 className="font-bold text-primary mb-2">精準執行</h3>
                <p className="text-sm text-primary/70">每一個環節都經過精心規劃與專業執行</p>
              </div>
              <div className="text-center p-6 bg-bg rounded-xl">
                <div className="text-3xl mb-3">🤝</div>
                <h3 className="font-bold text-primary mb-2">顧問式服務</h3>
                <p className="text-sm text-primary/70">深入了解需求，提供最適合的活動方案</p>
              </div>
              <div className="text-center p-6 bg-bg rounded-xl">
                <div className="text-3xl mb-3">✨</div>
                <h3 className="font-bold text-primary mb-2">品牌影響力</h3>
                <p className="text-sm text-primary/70">讓每一場活動都成為品牌的記憶點</p>
              </div>
            </div>
          </div>
        </AnimateOnScroll>
      </section>
      <section className="bg-primary py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <AnimateOnScroll>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">讓我們為您打造完美活動</h2>
            <p className="text-white/80 mb-8">無論規模大小，我們都能提供最專業的活動服務</p>
            <Link href="/contact" className="inline-flex items-center gap-2 bg-cta text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-cta-hover transition-colors">
              <MessageCircle size={20} />
              立即諮詢
            </Link>
          </AnimateOnScroll>
        </div>
      </section>
    </main>
  );
}
