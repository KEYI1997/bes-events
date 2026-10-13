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
  keywords: ["境曜有限公司", "BES Events", "台北活動企劃", "活動整合公司", "活動道具出租", "活動設備租借", "台北活動道具出租", "桃園活動道具出租", "新竹活動道具租借"],
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

      <ScrollRevealSection>
      <section data-snap="true" className="border-b border-[#d9d0c5] bg-[#f4f0e9] py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 md:px-12">
          <AnimateOnScroll>
            <div className="mb-12 grid gap-8 border-b border-[#cfc5b8] pb-10 md:mb-14 md:grid-cols-[1.2fr_0.8fr] md:items-end">
              <h2 className="max-w-2xl text-4xl font-semibold leading-[1.12] tracking-[-0.045em] text-[#24211e] sm:text-5xl md:text-6xl">
                把每一個想法，
                <br />落實成現場。
              </h2>
              <p className="max-w-md text-base leading-8 text-[#544e47] md:justify-self-end">
                從目標與預算出發，將企劃、道具、技術與人員整合成能被妥善執行的活動方案。
              </p>
            </div>
          </AnimateOnScroll>
          <AnimateOnScroll delay={100}>
            <ServiceTabs />
          </AnimateOnScroll>
        </div>
      </section>
      </ScrollRevealSection>

      <ScrollRevealSection>
      <section data-snap="true" className="overflow-hidden border-b border-[#433c35] bg-[#1f1b17] py-20 text-white md:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 md:px-12">
          <div className="mb-12 grid gap-7 md:mb-14 md:grid-cols-[1.2fr_0.8fr] md:items-end">
            <AnimateOnScroll>
              <h2 className="max-w-xl text-4xl font-semibold leading-[1.12] tracking-[-0.045em] sm:text-5xl md:text-6xl">讓品牌被看見的，不只是一場活動。</h2>
            </AnimateOnScroll>
            <AnimateOnScroll delay={100}>
              <p className="max-w-md text-base leading-8 text-white/65 md:justify-self-end">從啟動儀式、企業典禮到大型戶外活動，現場的畫面與節奏，是每一次合作留下的證明。</p>
            </AnimateOnScroll>
          </div>
        </div>
        <div className="home-case-carousel relative h-[320px] w-full sm:h-[440px] lg:h-[500px]">
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
              activeWidth={680}
              activeHeight={440}
              restWidth={220}
              restHeight={300}
              gap={28}
              radius={2}
              arrowColor="#26211c"
              arrowBackground="#f7f2ea"
              transition={{ duration: 0.45, delay: 3 }}
            />
        </div>
      </section>
      </ScrollRevealSection>

      <ScrollRevealSection>
      <section data-snap="true" className="overflow-hidden border-b border-[#d9d0c5] bg-[#fffdf9] py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 md:px-12">
          <div className="mb-10 flex flex-col gap-3 border-b border-[#d9d0c5] pb-6 sm:flex-row sm:items-end sm:justify-between">
            <AnimateOnScroll>
              <h2 className="text-3xl font-semibold tracking-[-0.035em] text-[#24211e] sm:text-4xl">被信任的現場夥伴</h2>
            </AnimateOnScroll>
            <p className="text-sm tracking-[0.08em] text-[#625b53]">與品牌及單位，共同完成重要時刻</p>
          </div>
          {managedClients.length > 0 && (
            <div className="relative -mx-5 w-[calc(100%+2.5rem)] overflow-hidden sm:-mx-8 sm:w-[calc(100%+4rem)] md:-mx-12 md:w-[calc(100%+6rem)]">
              <div className="flex w-max items-center gap-12 animate-scroll-clients md:gap-16">
                {[...managedClients, ...managedClients].map((client, i) => (
                  <div key={`${client.id}-${i}`} className="flex h-20 w-44 shrink-0 items-center justify-center sm:h-24 sm:w-52">
                    <img src={client.logo_url} alt={client.name} className="max-h-full max-w-full object-contain opacity-80 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
      </ScrollRevealSection>

      <ScrollRevealSection>
      <section data-snap="true" className="border-b border-[#d9d0c5] bg-[#e9dfd1] py-20 md:py-28">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 md:grid-cols-[0.82fr_1.18fr] md:px-12">
          <AnimateOnScroll>
            <div className="md:sticky md:top-28">
              <h2 className="max-w-md text-4xl font-semibold leading-[1.12] tracking-[-0.045em] text-[#29241f] sm:text-5xl">一個需求，<br />可以從這裡開始。</h2>
              <p className="mt-7 max-w-sm text-base leading-8 text-[#5e554d]">留下活動日期、地點與初步需求，我們會協助您釐清適合的服務與執行方向。</p>
            </div>
          </AnimateOnScroll>
          <AnimateOnScroll delay={100}>
            <div className="bg-[#fffdf9] p-6 shadow-[0_20px_55px_rgba(62,45,31,0.12)] sm:p-9 md:p-11">
              <ContactFormInline />
            </div>
          </AnimateOnScroll>
        </div>
      </section>
      </ScrollRevealSection>
    </>
  );
}
