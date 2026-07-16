import Link from "next/link";
import {
  Sparkles,
  Music,
  CalendarCheck,
  Wine,
  Users,
  Star,
  ArrowRight,
  Phone,
  CheckCircle,
} from "lucide-react";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import ContactFormInline from "@/components/ContactFormInline";
import HeroCarousel from "@/components/HeroCarousel";
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

const ADVANTAGES = [
  {
    icon: CheckCircle,
    title: "一站式服務",
    desc: "從企劃到執行全程包辦，省去多方溝通成本。",
  },
  {
    icon: Star,
    title: "豐富經驗",
    desc: "服務超過百場活動，累積各產業活動執行經驗。",
  },
  {
    icon: CalendarCheck,
    title: "彈性客製",
    desc: "依據預算與需求量身打造專屬活動方案。",
  },
  {
    icon: Users,
    title: "7 年以上活動經驗",
    desc: "經驗豐富的企劃、技術與執行團隊，確保活動完美呈現。",
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
      <section className="py-20 bg-bg">
        <div className="max-w-7xl mx-auto px-4">
          <AnimateOnScroll>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
                我們的服務
              </h2>
              <p className="text-primary/70 text-lg">
                一站式活動服務，協助品牌在每一個重要時刻精準傳遞價值
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

      {/* 核心優勢 */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <AnimateOnScroll>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
                為什麼選擇境曜？
              </h2>
            </div>
          </AnimateOnScroll>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {ADVANTAGES.map((adv, i) => (
              <AnimateOnScroll key={adv.title} delay={i * 100}>
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-cta/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <adv.icon size={28} className="text-cta" />
                  </div>
                  <h3 className="text-lg font-bold text-primary mb-2">
                    {adv.title}
                  </h3>
                  <p className="text-primary/70 text-sm">{adv.desc}</p>
                </div>
              </AnimateOnScroll>
            ))}
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
        <div className="relative w-full">
          <div className="flex gap-6 animate-scroll">
            {[1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6,7,8,9,10].map((n, i) => (
              <div key={i} className="flex-shrink-0 w-[400px] h-[260px] rounded-xl overflow-hidden">
                <img src={`/images/cases/case-${n}.${n === 3 ? 'webp' : 'jpg'}`} alt={`案例${n}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
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
        <div className="relative w-full">
          <div className="flex items-center gap-12 animate-scroll-slow">
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
