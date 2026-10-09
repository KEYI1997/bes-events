import AnimateOnScroll from '@/components/AnimateOnScroll';
import JsonLd from '@/components/JsonLd';
import { createPageMetadata, webPageJsonLd } from '@/lib/seo';

const description = '認識境曜有限公司（BES Events）的活動整合理念、專業團隊與服務經驗，從策略企劃、舞台技術到現場執行，協助品牌完成重要活動。';

export const metadata = createPageMetadata({
  title: '境曜有限公司｜台北活動企劃、啟動儀式與現場整合',
  description: '境曜有限公司提供全台本島的活動企劃統包、啟動儀式、舞台技術、活動特效、AI 互動與外派調酒服務，從需求盤點到現場執行提供整合規劃。',
  path: '/about',
  keywords: ['境曜有限公司', 'BES Events', '台北活動企劃', '啟動儀式', '活動整合'],
});

export default function AboutPage() {
  return (
    <><JsonLd data={webPageJsonLd({ path: '/about', name: '關於境曜有限公司', description, type: 'AboutPage' })} /><main className="bg-white min-h-screen">

      {/* ── Hero Banner ── */}
      <section className="relative bg-primary h-[25vh] flex items-center justify-center pt-20">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/90 to-primary" />
        <div className="relative z-10 text-center px-4">
          <AnimateOnScroll>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">關於境曜</h1>
            <p className="text-white/80 text-lg">Bright Events Services</p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ── Our Story：左大標 × 右段落 ── */}
      <section className="bg-white max-w-6xl mx-auto px-6 md:px-16 py-14 md:py-20">
        <AnimateOnScroll>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-start">
            {/* 左欄：大標題 */}
            <div>
              <p className="text-xs tracking-[0.3em] text-cta uppercase mb-4 font-medium">Our Story</p>
              <h2 className="text-4xl md:text-5xl font-bold text-primary leading-tight">
                我們的故事
              </h2>
            </div>
            {/* 右欄：段落 */}
            <div className="space-y-4 text-primary/75 leading-[1.9] text-[1.05rem]">
              <p>
                境曜有限公司（Bright Events Services）提供企業活動所需的企劃、啟動儀式、舞台技術、特效、互動與人員安排。
              </p>
              <p>
                團隊從需求盤點、執行表確認到進撤場協調，協助客戶把活動確實落地。
              </p>
              <p>
                服務範圍涵蓋全台本島；活動地點、設備、人員與物流條件確認後，即可安排適合的執行方式。
              </p>
            </div>
          </div>
        </AnimateOnScroll>
      </section>

      {/* 故事與理念分隔線 */}
      <div className="mx-auto max-w-6xl bg-white px-6 md:px-16">
        <div className="h-px w-full bg-gray-200" />
      </div>

      {/* ── 我們的理念 ── */}
      <section className="bg-white max-w-6xl mx-auto px-6 md:px-16 py-14 md:py-20">
        <AnimateOnScroll>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-start">
            {/* 左欄：大標題 */}
            <div>
              <p className="text-xs tracking-[0.3em] text-cta uppercase mb-4 font-medium">Our Values</p>
              <h2 className="text-4xl md:text-5xl font-bold text-primary leading-tight">
                我們的理念
              </h2>
            </div>
            {/* 右欄：三個理念條目 */}
            <div className="space-y-8">
              {[
                {
                  num: '01',
                  title: '讓現場按照確認過的流程發生',
                  desc: '在提案、彩排與執行前逐步確認時程、動線、人員與設備條件。',
                },
                {
                  num: '02',
                  title: '把需求整理成可執行清單',
                  desc: '協助釐清活動目標、必備項目與可調整預算，讓決策更有效率。',
                },
                {
                  num: '03',
                  title: '讓品牌訊息出現在賓客看見的時刻',
                  desc: '從啟動、舞台到互動環節，安排品牌應被看見與被參與的位置。',
                },
              ].map((item) => (
                <AnimateOnScroll key={item.num}>
                  <div className="border-t border-primary/15 pt-6">
                    <span className="text-xs tracking-[0.2em] text-cta font-medium">{item.num}</span>
                    <h3 className="text-xl font-bold text-primary mt-2 mb-3">{item.title}</h3>
                    <p className="text-primary/65 leading-relaxed">{item.desc}</p>
                  </div>
                </AnimateOnScroll>
              ))}
            </div>
          </div>
        </AnimateOnScroll>
      </section>

    </main></>
  );
}
