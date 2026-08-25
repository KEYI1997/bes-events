import AnimateOnScroll from '@/components/AnimateOnScroll';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: '關於境曜',
  description: '境曜有限公司（Bright Events Services）專注於各類型活動整合與現場執行，提供一站式活動服務。',
  path: '/about',
  keywords: ['境曜有限公司', 'BES Events', '台北活動公司'],
});

export default function AboutPage() {
  return (
    <main className="bg-white min-h-screen">

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
      <section className="bg-white max-w-6xl mx-auto px-6 md:px-16 py-24 md:py-32">
        <AnimateOnScroll>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-start">
            {/* 左欄：大標題 */}
            <div className="md:sticky md:top-32">
              <p className="text-xs tracking-[0.3em] text-cta uppercase mb-4 font-medium">Our Story</p>
              <h2 className="text-4xl md:text-5xl font-bold text-primary leading-tight">
                我們的故事
              </h2>
            </div>
            {/* 右欄：段落 */}
            <div className="space-y-6 text-primary/75 leading-[1.9] text-[1.05rem]">
              <p>
                境曜有限公司（Bright Events Services）專注於各類型活動整合與現場執行，
                致力於為企業打造具有影響力的品牌活動。
              </p>
              <p>
                我們以「顧問式服務」為核心，從前期活動企劃、現場執行到後續成效追蹤，
                建立完整的服務循環。持續蒐集客戶回饋、優化執行流程，
                確保每一場活動都能精準傳遞品牌價值。
              </p>
              <p>
                無論是啟動儀式、燈光音響舞台、活動特效、外派調酒或 Show Girl 服務，
                境曜都能提供最專業的整合方案，讓企業的每一次投入都轉化為可感受的影響力。
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
      <section className="bg-white max-w-6xl mx-auto px-6 md:px-16 py-24 md:py-32">
        <AnimateOnScroll>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-start">
            {/* 左欄：大標題 */}
            <div className="md:sticky md:top-32">
              <p className="text-xs tracking-[0.3em] text-cta uppercase mb-4 font-medium">Our Values</p>
              <h2 className="text-4xl md:text-5xl font-bold text-primary leading-tight">
                我們的理念
              </h2>
            </div>
            {/* 右欄：三個理念條目 */}
            <div className="space-y-12">
              {[
                {
                  num: '01',
                  title: '精準執行',
                  desc: '每一個環節都經過精心規劃與專業執行，從企劃到現場，細節決定成敗。',
                },
                {
                  num: '02',
                  title: '顧問式服務',
                  desc: '深入了解客戶需求，以顧問角色協助規劃最適合的活動方案，降低溝通成本。',
                },
                {
                  num: '03',
                  title: '品牌影響力',
                  desc: '讓每一場活動都成為品牌的記憶點，將企業的每一次投入轉化為可感受的影響力。',
                },
              ].map((item) => (
                <AnimateOnScroll key={item.num}>
                  <div className="border-t border-primary/15 pt-8">
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

      {/* 理念與亮點分隔線 */}
      <div className="mx-auto max-w-6xl bg-white px-6 md:px-16">
        <div className="h-px w-full bg-gray-200" />
      </div>

      {/* ── 數字亮點 ── */}
      <section className="bg-white max-w-6xl mx-auto px-6 md:px-16 py-24 md:py-32">
        <AnimateOnScroll>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-6 text-center">
            {[
              { num: '7+', label: '年活動經驗' },
              { num: '100+', label: '場活動執行' },
              { num: '6', label: '項核心服務' },
              { num: '24H', label: '專人快速回覆' },
            ].map((stat) => (
              <div key={stat.label} className="border-t-2 border-cta pt-6">
                <p className="text-4xl md:text-5xl font-bold text-primary mb-2">{stat.num}</p>
                <p className="text-sm text-primary/55 tracking-wide">{stat.label}</p>
              </div>
            ))}
          </div>
        </AnimateOnScroll>
      </section>

    </main>
  );
}
