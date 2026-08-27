import AnimateOnScroll from "@/components/AnimateOnScroll";
import ContactFormInline from "@/components/ContactFormInline";
import HeroCarousel from "@/components/HeroCarousel";
import CoverflowCarousel from "@/components/CoverflowCarousel";
import ServiceTabs from "@/components/ServiceTabs";
import ScrollRevealSection from "@/components/ScrollRevealSection";
import JsonLd from "@/components/JsonLd";
import { supabase } from "@/lib/supabase";
import { createPageMetadata, itemListJsonLd, SERVICE_SEO_PAGES, SITE_DESCRIPTION, webPageJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata({
  title: "境曜有限公司｜台北活動企劃、啟動儀式與活動整合",
  description: SITE_DESCRIPTION,
  path: "/",
  keywords: ["境曜有限公司", "BES Events", "台北活動企劃", "活動整合公司"],
});

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
      <JsonLd data={[
        webPageJsonLd({
          path: "/",
          name: "境曜有限公司｜台北活動企劃、啟動儀式與活動整合",
          description: SITE_DESCRIPTION,
        }),
        itemListJsonLd("境曜有限公司活動服務", SERVICE_SEO_PAGES.map(service => ({
          name: service.name,
          path: `/services/${service.slug}`,
          description: service.summary,
        }))),
      ]} />
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
                { src: "/images/cases/case-1.jpg", alt: "企業品牌發表會舞台與燈光案例" },
                { src: "/images/cases/case-2.jpg", alt: "境曜有限公司企業活動執行案例" },
                { src: "/images/cases/case-3.webp", alt: "大型戶外活動企劃與現場執行案例" },
                { src: "/images/cases/case-4.jpg", alt: "品牌記者會活動整合案例" },
                { src: "/images/cases/case-5.jpg", alt: "企業典禮與啟動儀式案例" },
                { src: "/images/cases/case-6.jpg", alt: "展覽活動空間與流程規劃案例" },
                { src: "/images/cases/case-7.jpg", alt: "企業家庭日活動企劃案例" },
                { src: "/images/cases/case-8.jpg", alt: "尾牙春酒舞台活動案例" },
                { src: "/images/cases/case-9.jpg", alt: "商場品牌推廣活動案例" },
                { src: "/images/cases/case-10.jpg", alt: "活動特效與現場技術整合案例" },
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
