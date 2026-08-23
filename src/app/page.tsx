import Link from "next/link";
import {
  Sparkles,
  Bot,
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
import CoverflowCarousel from "@/components/CoverflowCarousel";
import ServiceTabs from "@/components/ServiceTabs";
import ScrollRevealSection from "@/components/ScrollRevealSection";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const SERVICES = [
  {
    icon: Bot,
    title: "AI 互動道具",
    desc: "結合 AI 技術的創新互動道具，打造沉浸式活動體驗。",
    href: "/services/ai-interactive-props",
  },
  {
    icon: CalendarCheck,
    title: "活動策劃統包",
    desc: "從企劃到執行，提供一站式活動統包服務，讓您省心省力。",
    href: "/services/event-package",
  },
  {
    icon: Star,
    title: "啟動儀式",
    desc: "星辰運轉、全息投影、沙漏啟動等多種創意儀式，為活動開場製造震撼記憶點。",
    href: "/services/opening-ceremony",
  },
  {
    icon: Sparkles,
    title: "活動特效",
    desc: "專業活動特效服務，為現場營造震撼視覺效果。",
    href: "/services/special-effects",
  },
  {
    icon: Wine,
    title: "外派調酒",
    desc: "專業調酒師現場調製，為活動增添品味與儀式感。",
    href: "/services/bartending",
  },
  {
    icon: Users,
    title: "SHOW GIRL",
    desc: "專業活動人員派遣，提供展場接待、活動協助等服務。",
    href: "/services/showgirl",
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
  const managedClients = (clients || []).filter(client => client.logo_url?.trim());

  return (
    <>
      {/* ── Section 1：Hero 樞紐區 ── */}
      <HeroCarousel />

      {/* ── Section 2：服務項目 ── */}
      <ScrollRevealSection>
      <section data-snap="true" className="py-20 bg-white border-b-2 border-gray-300">
        <div className="max-w-6xl mx-auto px-4 md:px-16">
          <AnimateOnScroll>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
                服務項目
              </h2>
              <p className="text-primary/70 text-lg">
                一站式活動服務，協助品牌在每一個重要時刻精準傳遞價值
              </p>
            </div>
          </AnimateOnScroll>
          <AnimateOnScroll delay={100}>
            <ServiceTabs />
          </AnimateOnScroll>
        </div>
      </section>
      </ScrollRevealSection>

      {/* ── Section 3：案例展示 + 客戶一覽（同一區塊） ── */}
      <ScrollRevealSection>
      <section data-snap="true" className="bg-white overflow-hidden border-b-2 border-gray-300">

        {/* 分隔線 */}
        <div className="flex justify-center px-8">
          <div className="w-full h-[2px] bg-gray-300"></div>
        </div>

        {/* 案例展示輪播 */}
        <div className="py-16 overflow-hidden">
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
        </div>

        {/* 分隔線 */}
        <div className="flex justify-center px-8">
          <div className="w-full h-[2px] bg-gray-300"></div>
        </div>

        {/* 客戶一覽 */}
        <div className="py-16 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 mb-10">
            <AnimateOnScroll>
              <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">客戶一覽</h2>
                <p className="text-primary/70">感謝以下企業與單位的信賴與合作</p>
              </div>
            </AnimateOnScroll>
          </div>
          {managedClients.length > 0 && (
            <div className="relative w-full overflow-hidden">
              <div className="flex items-center gap-12 w-max animate-scroll-clients">
                {[...managedClients, ...managedClients].map((client, i) => (
                  <div key={`${client.id}-${i}`} className="flex-shrink-0 w-[240px] h-[120px] flex items-center justify-center">
                    <img src={client.logo_url} alt={client.name} className="max-w-full max-h-full object-contain" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </section>
      </ScrollRevealSection>

      {/* ── Section 4：聯絡我們 ── */}
      <ScrollRevealSection>
      <section data-snap="true" className="py-20 bg-white border-b-2 border-gray-300">
        <div className="max-w-4xl mx-auto px-4">
          <AnimateOnScroll>
            <h2 className="text-3xl md:text-4xl font-bold text-primary text-center mb-10">聯絡我們</h2>
            <div className="bg-gray-50 rounded-2xl p-8 md:p-12 border border-gray-200">
              <ContactFormInline />
            </div>
          </AnimateOnScroll>
        </div>
      </section>
      </ScrollRevealSection>
    </>
  );
}
