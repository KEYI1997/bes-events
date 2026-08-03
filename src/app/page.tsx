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
import CoverflowCarousel from "@/components/CoverflowCarousel";
import ServiceCard from "@/components/ServiceCard";
import { supabase } from "@/lib/supabase";

const SERVICES = [
  {
    icon: CalendarCheck,
    title: "活動計劃統包",
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
    icon: Music,
    title: "燈光音響舞台",
    desc: "專業燈光音響設備租賃與搭建，打造完美視聽體驗。",
    href: "/services/stage-lighting",
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
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <AnimateOnScroll>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
                服務項目
              </h2>
              <p className="text-primary/70 text-lg">
                一站式活動服務，協助品牌在每一個重要時刻精準傳遞價值
              </p>
            </div>
          </AnimateOnScroll>
          {/* 服務項目列表 */}
          <div className="space-y-0">
            {SERVICES.map((service, i) => (
              <AnimateOnScroll key={service.title} delay={i * 80}>
                <ServiceCard
                  title={service.title}
                  desc={service.desc}
                  href={service.href}
                />
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* 分隔線 */}
      <div className="flex justify-center bg-white px-8">
        <div className="w-full h-[2px] bg-gray-300"></div>
      </div>

      {/* 案例展示輪播 */}
      <section className="py-16 bg-white overflow-hidden">
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

      {/* 分隔線 */}
      <div className="flex justify-center bg-white px-8">
        <div className="w-full h-[2px] bg-gray-300"></div>
      </div>

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
              <div key={i} className="flex-shrink-0 w-[240px] h-[120px] flex items-center justify-center">
                <img src={`/images/clients/${client.file}`} alt={client.name} className="max-w-full max-h-full object-contain" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 分隔線 */}
      <div className="flex justify-center bg-white px-8">
        <div className="w-full h-[2px] bg-gray-300"></div>
      </div>

      {/* 案例預覽 */}
      {cases && cases.length > 0 && (
        <>
        <section className="py-20 bg-white">
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
                  <div className="bg-gray-50 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer group border border-gray-200">
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
        {/* 分隔線 */}
        <div className="flex justify-center bg-white px-8">
          <div className="w-full h-[2px] bg-gray-300"></div>
        </div>
        </>
      )}

      {/* 客戶 Logo 跑馬燈 */}
      {clients && clients.length > 0 && (
        <>
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
        {/* 分隔線 */}
        <div className="flex justify-center bg-white px-8">
          <div className="w-full h-[2px] bg-gray-300"></div>
        </div>
        </>
      )}

      {/* 聯絡表單區 */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <AnimateOnScroll>
            <h2 className="text-3xl md:text-4xl font-bold text-primary text-center mb-10">聯絡我們</h2>
            <div className="bg-gray-50 rounded-2xl p-8 md:p-12 border border-gray-200">
              <ContactFormInline />
            </div>
          </AnimateOnScroll>
        </div>
      </section>
    </>
  );
}
