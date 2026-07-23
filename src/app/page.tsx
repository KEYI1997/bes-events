import Link from "next/link";
import {
  Sparkles,
  Music,
  CalendarCheck,
  Wine,
  Users,
  ArrowRight,
  Phone,
} from "lucide-react";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import ContactFormInline from "@/components/ContactFormInline";
import HeroCarousel from "@/components/HeroCarousel";
import CoverflowCarousel from "@/components/CoverflowCarousel";
import { supabase } from "@/lib/supabase";

const SERVICES = [
  {
    icon: Sparkles,
    title: "啟動儀式",
    desc: "星辰運轉、全息投影、沙漏啟動等多種創意儀式，為活動開場製造震撼記憶點。",
    href: "/products/opening-ceremony",
    hoverImage: "/images/services/opening-ceremony.png",
  },
  {
    icon: Music,
    title: "燈光音響舞台",
    desc: "專業燈光音響設備租賃與搭建，打造完美視聽體驗。",
    href: "/products/stage-lighting",
    hoverImage: "/images/services/stage-lighting.png",
  },
  {
    icon: CalendarCheck,
    title: "專案企劃",
    desc: "從記者會、尾牙到企業家庭日，提供完整活動企劃與執行服務。",
    href: "/products/event-planning",
    hoverImage: "/images/services/event-planning.png",
  },
  {
    icon: Wine,
    title: "外派調酒",
    desc: "專業調酒師現場調製，為活動增添品味與儀式感。",
    href: "/products/bartending",
    hoverImage: "/images/services/bartending.png",
  },
  {
    icon: Users,
    title: "Show Girl",
    desc: "專業活動人員派遣，提供展場接待、活動協助等服務。",
    href: "/showgirl",
    hoverImage: "/images/services/showgirl.png",
  },
];



export default async function HomePage() {
  // 取得客戶 Logo
  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .eq("visible", true)
    .order("sort_order", { ascending: true });

  // 取得案例預覽
  const { data: cases } = await supabase
    .from("cases")
    .select("*")
    .eq("visible", true)
    .order("created_at", { ascending: false })
    .limit(6);

  return (
    <>
      {/* Hero Section - 輪播主圖 */}
      <HeroCarousel />

      {/* 服務項目 */}
      <section className="py-20 relative overflow-hidden" style={{ backgroundColor: '#23212C' }}>
        {/* Cosmic 光暈背景 */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: `
            radial-gradient(ellipse 600px 400px at 15% 80%, rgba(120, 60, 180, 0.15) 0%, transparent 70%),
            radial-gradient(ellipse 500px 350px at 85% 20%, rgba(60, 100, 200, 0.12) 0%, transparent 70%),
            radial-gradient(ellipse 400px 300px at 70% 75%, rgba(180, 50, 80, 0.10) 0%, transparent 70%),
            radial-gradient(ellipse 300px 250px at 30% 30%, rgba(80, 120, 220, 0.08) 0%, transparent 70%),
            radial-gradient(circle 2px at 20% 15%, rgba(255,255,255,0.4) 0%, transparent 100%),
            radial-gradient(circle 1.5px at 45% 25%, rgba(255,255,255,0.3) 0%, transparent 100%),
            radial-gradient(circle 1px at 75% 10%, rgba(255,255,255,0.35) 0%, transparent 100%),
            radial-gradient(circle 1.5px at 90% 45%, rgba(255,255,255,0.25) 0%, transparent 100%),
            radial-gradient(circle 1px at 10% 55%, rgba(255,255,255,0.3) 0%, transparent 100%),
            radial-gradient(circle 2px at 60% 85%, rgba(255,255,255,0.2) 0%, transparent 100%),
            radial-gradient(circle 1px at 35% 70%, rgba(255,255,255,0.25) 0%, transparent 100%),
            radial-gradient(circle 1.5px at 80% 65%, rgba(255,255,255,0.3) 0%, transparent 100%)
          `
        }} />
        {/* 玻璃霧面遮罩 */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backdropFilter: 'blur(0.5px)',
          background: 'linear-gradient(180deg, rgba(35,33,44,0.3) 0%, rgba(35,33,44,0.1) 50%, rgba(35,33,44,0.3) 100%)'
        }} />
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <AnimateOnScroll>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                我們的服務
              </h2>
              <p className="text-white/70 text-lg">
                一站式活動服務<br className="md:hidden" />協助品牌在每一個重要時刻精準傳遞價值
              </p>
            </div>
          </AnimateOnScroll>
          {/* 上排：1大 + 1小 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* 啟動儀式 - 大格佔2欄 */}
            <div className="md:col-span-2">
              <AnimateOnScroll delay={0}>
                <Link
                  href={SERVICES[0].href}
                  className="block p-8 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group h-full"
                >
                  {(() => { const Icon = SERVICES[0].icon; return <Icon size={40} className="text-cta mb-4 group-hover:scale-110 transition-transform" />; })()}
                  <h3 className="text-2xl font-bold text-primary mb-3">{SERVICES[0].title}</h3>
                  <p className="text-primary/70 text-sm leading-relaxed mb-4">{SERVICES[0].desc}</p>
                  <span className="inline-flex items-center gap-1 text-cta text-sm font-medium group-hover:gap-2 transition-all">
                    了解更多 <ArrowRight size={14} />
                  </span>
                </Link>
              </AnimateOnScroll>
            </div>
            {/* 燈光音響舞台 - 小格 */}
            <AnimateOnScroll delay={100}>
              <Link
                href={SERVICES[1].href}
                className="block p-8 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group h-full"
              >
                {(() => { const Icon = SERVICES[1].icon; return <Icon size={40} className="text-cta mb-4 group-hover:scale-110 transition-transform" />; })()}
                <h3 className="text-xl font-bold text-primary mb-3">{SERVICES[1].title}</h3>
                <p className="text-primary/70 text-sm leading-relaxed mb-4">{SERVICES[1].desc}</p>
                <span className="inline-flex items-center gap-1 text-cta text-sm font-medium group-hover:gap-2 transition-all">
                  了解更多 <ArrowRight size={14} />
                </span>
              </Link>
            </AnimateOnScroll>
          </div>
          {/* 下排：3小格 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SERVICES.slice(2).map((service, i) => (
              <AnimateOnScroll key={service.title} delay={(i + 2) * 100}>
                <Link
                  href={service.href}
                  className="block p-8 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group h-full"
                >
                  <service.icon size={40} className="text-cta mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-bold text-primary mb-3">{service.title}</h3>
                  <p className="text-primary/70 text-sm leading-relaxed mb-4">{service.desc}</p>
                  <span className="inline-flex items-center gap-1 text-cta text-sm font-medium group-hover:gap-2 transition-all">
                    了解更多 <ArrowRight size={14} />
                  </span>
                </Link>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* 核心優勢 — 循環圖 */}
      <section className="py-20 bg-white overflow-hidden">
        <div className="max-w-5xl mx-auto px-4">
          {/* 標題 */}
          <AnimateOnScroll>
            <h2 className="text-center text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-16 md:mb-20 tracking-wider" style={{ fontFamily: 'var(--font-heading)' }}>
              顧問式服務
            </h2>
          </AnimateOnScroll>

          {/* 左文字 + 右循環圖 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* 左側：標題 + 說明 */}
            <AnimateOnScroll direction="left">
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-primary mb-6 leading-snug">
                  全方位活動服務循環<br />打造品牌影響力
                </h3>
                <p className="text-primary/60 leading-relaxed text-sm md:text-base">
                  境曜以「顧問式服務」為核心，從前期活動企劃、現場執行到後續成效追蹤，建立完整的服務循環。我們持續蒐集客戶回饋、優化執行流程，確保每一場活動都能精準傳遞品牌價值，讓企業的每一次投入都轉化為可感受的影響力。
                </p>
              </div>
            </AnimateOnScroll>

            {/* 右側：循環圖 */}
            <AnimateOnScroll direction="right">
              <div className="flex justify-center">
                <div className="relative w-[320px] h-[320px] md:w-[420px] md:h-[420px]">
                  {/* 外層圓環（三個小圓定位在此圓上） */}
                  <div className="absolute inset-0 rounded-full border border-gray-200" />

                  {/* 中心文字 */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-primary text-sm md:text-base font-medium">一站式整合</p>
                      <p className="text-primary/50 text-xs md:text-sm mt-1">品牌活動夥伴</p>
                    </div>
                  </div>

                  {/* 旋轉的箭頭虛線圓環 */}
                  <svg className="absolute inset-[12%] w-[76%] h-[76%] animate-[spin_20s_linear_infinite]" viewBox="0 0 200 200" fill="none">
                    <circle cx="100" cy="100" r="90" stroke="rgba(59,130,246,0.3)" strokeWidth="1" strokeDasharray="6 4" fill="none" />
                  </svg>

                  {/* 頂部圓 — 顧問式活動企劃（12點鐘方向） */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90px] h-[90px] md:w-[110px] md:h-[110px] rounded-full flex items-center justify-center shadow-[0_0_24px_rgba(59,130,246,0.4)]" style={{ background: 'radial-gradient(circle at center, rgba(59,130,246,0.1) 0%, rgba(59,130,246,0.7) 60%, rgba(37,99,235,0.95) 100%)' }}>
                    <div className="text-center">
                      <p className="text-black text-xs md:text-sm font-medium">顧問式</p>
                      <p className="text-black text-xs md:text-sm font-medium">活動企劃</p>
                    </div>
                  </div>

                  {/* 右下圓 — 專業現場執行管理（5點鐘方向） */}
                  <div className="absolute bottom-[6%] right-[1%] translate-x-[15%] w-[90px] h-[90px] md:w-[110px] md:h-[110px] rounded-full flex items-center justify-center shadow-[0_0_24px_rgba(59,130,246,0.4)]" style={{ background: 'radial-gradient(circle at center, rgba(59,130,246,0.1) 0%, rgba(59,130,246,0.7) 60%, rgba(37,99,235,0.95) 100%)' }}>
                    <div className="text-center">
                      <p className="text-black text-xs md:text-sm font-medium">專業現場</p>
                      <p className="text-black text-xs md:text-sm font-medium">執行管理</p>
                    </div>
                  </div>

                  {/* 左下圓 — 成效回饋持續優化（7點鐘方向） */}
                  <div className="absolute bottom-[6%] left-[1%] -translate-x-[15%] w-[90px] h-[90px] md:w-[110px] md:h-[110px] rounded-full flex items-center justify-center shadow-[0_0_24px_rgba(59,130,246,0.4)]" style={{ background: 'radial-gradient(circle at center, rgba(59,130,246,0.1) 0%, rgba(59,130,246,0.7) 60%, rgba(37,99,235,0.95) 100%)' }}>
                    <div className="text-center">
                      <p className="text-black text-xs md:text-sm font-medium">成效回饋</p>
                      <p className="text-black text-xs md:text-sm font-medium">持續優化</p>
                    </div>
                  </div>
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* 案例展示輪播 */}
      <section className="py-16 bg-bg overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 mb-10">
          <AnimateOnScroll>
            <h2 className="text-3xl md:text-4xl font-bold text-primary text-center">案例展示</h2>
          </AnimateOnScroll>
        </div>
        <div className="relative w-full h-[460px]">
          <CoverflowCarousel
            images={[
              { src: "/images/cases/case-1.jpg", alt: "案例1" },
              { src: "/images/cases/case-2.jpg", alt: "案例2" },
              { src: "/images/cases/case-3.webp", alt: "案例3" },
              { src: "/images/cases/case-4.jpg", alt: "案例4" },
              { src: "/images/cases/case-5.jpg", alt: "案例5" },
              { src: "/images/cases/case-6.jpg", alt: "案例6" },
              { src: "/images/cases/case-7.jpg", alt: "案例7" },
              { src: "/images/cases/case-8.jpg", alt: "案例8" },
              { src: "/images/cases/case-9.jpg", alt: "案例9" },
              { src: "/images/cases/case-10.jpg", alt: "案例10" },
            ]}
            autoplay={true}
            autoplayDirection="rightToLeft"
            showArrows={true}
            activeWidth={600}
            activeHeight={400}
            restWidth={200}
            restHeight={270}
            gap={30}
            radius={4}
            transition={{ duration: 0.3, delay: 2 }}
          />
        </div>
      </section>

      {/* 客戶一覽 */}
      <section className="py-16 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 mb-10">
          <AnimateOnScroll>
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">客戶一覽</h2>
              <p className="text-primary/70">感謝以下企業與單位的信賴與合作</p>
            </div>
          </AnimateOnScroll>
        </div>
        <div className="relative w-full overflow-hidden">
          <div className="flex items-center gap-12 w-max animate-scroll-clients">
            {[
              { name: "今周刊", file: "今周刊.jpg" },
              { name: "燦坤", file: "燦坤.jpg" },
              { name: "嘉義縣文化基金會", file: "嘉義縣文化基金會.jpg" },
              { name: "新竹市文化局", file: "新竹市文化局.jpg" },
              { name: "新竹市政府", file: "新竹市政府.jpg" },
              { name: "台大PM校友會", file: "台大PM校友會.jpg" },
              { name: "星宇航空", file: "星宇航空.png" },
              { name: "今周刊", file: "今周刊.jpg" },
              { name: "燦坤", file: "燦坤.jpg" },
              { name: "嘉義縣文化基金會", file: "嘉義縣文化基金會.jpg" },
              { name: "新竹市文化局", file: "新竹市文化局.jpg" },
              { name: "新竹市政府", file: "新竹市政府.jpg" },
              { name: "台大PM校友會", file: "台大PM校友會.jpg" },
              { name: "星宇航空", file: "星宇航空.png" },
            ].map((client, i) => (
              <div key={i} className="flex-shrink-0 w-[240px] h-[120px] flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100">
                <img src={`/images/clients/${client.file}`} alt={client.name} className="max-w-full max-h-full object-contain" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 案例預覽 */}
      {cases && cases.length > 0 && (
        <section className="py-20 bg-bg">
          <div className="max-w-7xl mx-auto px-4">
            <AnimateOnScroll>
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
                  精選案例
                </h2>
                <p className="text-primary/70 text-lg">
                  每一場活動都是品牌與觀眾的深度對話
                </p>
              </div>
            </AnimateOnScroll>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cases.map((c, i) => (
                <AnimateOnScroll key={c.id} delay={i * 100}>
                  <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer group">
                    <div className="aspect-video bg-primary/10 relative overflow-hidden">
                      {c.image_url && (
                        <img
                          src={c.image_url}
                          alt={c.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      )}
                      <span className="absolute top-3 left-3 px-3 py-1 bg-cta text-white text-xs rounded-full">
                        {c.category}
                      </span>
                    </div>
                    <div className="p-6">
                      <h3 className="font-bold text-primary text-lg mb-2">
                        {c.title}
                      </h3>
                      {c.client_name && (
                        <p className="text-sm text-primary/60">
                          {c.client_name}
                        </p>
                      )}
                    </div>
                  </div>
                </AnimateOnScroll>
              ))}
            </div>
            <div className="text-center mt-12">
              <Link
                href="/cases"
                className="inline-flex items-center gap-2 px-8 py-3 bg-cta text-white font-semibold rounded-full hover:bg-cta-hover transition-colors"
              >
                查看所有案例 <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 客戶 Logo 跑馬燈 */}
      {clients && clients.length > 0 && (
        <section className="py-16 bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-4">
            <AnimateOnScroll>
              <h2 className="text-2xl md:text-3xl font-bold text-primary text-center mb-12">
                合作客戶
              </h2>
            </AnimateOnScroll>
          </div>
          <div className="relative">
            <div className="flex animate-marquee">
              {[...clients, ...clients].map((client, i) => (
                <div
                  key={`${client.id}-${i}`}
                  className="flex-shrink-0 mx-8 w-32 h-20 flex items-center justify-center grayscale hover:grayscale-0 transition-all"
                >
                  {client.logo_url && (
                    <img
                      src={client.logo_url}
                      alt={client.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA 標語區 */}
      <section className="relative py-20 overflow-hidden">
        {/* 背景圖片 */}
        <div
          className="absolute inset-0 bg-cover bg-no-repeat"
          style={{ backgroundImage: "url('/images/cta-bg.png')", backgroundPosition: "center calc(50% + 80px)" }}
        />
        {/* 黑色遮罩 */}
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative max-w-4xl mx-auto px-4">
          <AnimateOnScroll>
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                讓我們為您打造完美活動
              </h2>
              <p className="text-white/70 text-lg mb-6">
                無論規模大小，我們都能提供最專業的活動服務
              </p>
              <a
                href="tel:0912727596"
                className="inline-flex items-center gap-2 text-white text-xl font-bold"
              >
                <Phone size={24} className="text-white" /> 0912-727-596
              </a>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* 聯絡表單區 */}
      <section className="py-20" style={{ backgroundColor: '#FDFBF7' }}>
        <div className="max-w-4xl mx-auto px-4">
          <AnimateOnScroll>
            <h2 className="text-3xl md:text-4xl font-bold text-primary text-center mb-10">聯絡我們</h2>
            <div className="bg-white rounded-2xl p-8 md:p-12">
              <ContactFormInline />
            </div>
          </AnimateOnScroll>
        </div>
      </section>
    </>
  );
}
