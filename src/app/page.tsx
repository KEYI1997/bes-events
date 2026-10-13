import ContactFormInline from "@/components/ContactFormInline";
import HomeDossierNav from "@/components/HomeDossierNav";
import JsonLd from "@/components/JsonLd";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { createPageMetadata, itemListJsonLd, SERVICE_SEO_PAGES, SITE_ADDRESS, SITE_DESCRIPTION, webPageJsonLd } from "@/lib/seo";
import { LINE_URL } from "@/lib/siteLinks";

const SERVICES = [
  { title: "活動策劃統包", summary: "整合企劃、視覺、設備、人員與現場流程。", href: "/services/event-package" },
  { title: "啟動儀式", summary: "為開幕、發表會與典禮打造關鍵亮相畫面。", href: "/services/opening-ceremony" },
  { title: "活動特效", summary: "依舞台節奏與安全規範安排視覺效果。", href: "/services/special-effects" },
  { title: "AI 互動道具", summary: "讓賓客的參與成為可以分享的品牌內容。", href: "/services/ai-interactive-props" },
  { title: "外派調酒", summary: "以吧台、酒單與現場服務豐富聚會體驗。", href: "/services/bartending" },
  { title: "SHOW GIRL", summary: "依品牌情境安排接待、引導與舞台互動人員。", href: "/services/showgirl" },
];

const CASES = [
  { image: "/images/cases/case-1.jpg", alt: "企業品牌發表會舞台與燈光案例" },
  { image: "/images/cases/case-4.jpg", alt: "品牌記者會活動整合案例" },
  { image: "/images/cases/case-7.jpg", alt: "企業家庭日活動企劃案例" },
  { image: "/images/cases/case-10.jpg", alt: "活動特效與現場技術整合案例" },
];

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
      <div className="overflow-x-clip bg-[#f7f3ec] text-[#25211d] selection:bg-[#bf8a5d] selection:text-white">
        <HomeDossierNav />

        <div>
          <section className="mx-auto grid max-w-[1440px] gap-8 px-5 pb-20 pt-28 sm:px-8 md:grid-cols-[0.92fr_1.08fr] md:gap-10 md:pb-28 md:pt-36 lg:px-12">
            <div className="flex flex-col justify-between pb-2 md:py-8">
              <div>
                <h1 className="max-w-xl text-[clamp(3rem,6.4vw,6rem)] font-semibold leading-[1.02] tracking-[-0.045em] text-balance">
                  品牌的重要時刻，<br />需要精準安排的現場。
                </h1>
                <p className="mt-7 max-w-md text-base leading-8 text-[#5b5147] sm:text-lg">
                  境曜協助企業把活動目標，轉化成清楚的企劃、適合的設備與穩定的現場執行。
                </p>
                <div className="mt-9 flex flex-wrap gap-3">
                  <Link href="#enquiry" className="inline-flex min-h-12 items-center gap-2 bg-[#a66d42] px-5 text-sm font-bold text-white transition-colors hover:bg-[#25211d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#a66d42]">
                    取得初步規劃建議 <ArrowUpRight size={17} />
                  </Link>
                  <Link href="#cases" className="inline-flex min-h-12 items-center gap-2 border border-[#25211d] px-5 text-sm font-bold transition-colors hover:bg-[#25211d] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#a66d42]">
                    瀏覽執行案例 <ArrowUpRight size={17} />
                  </Link>
                </div>
              </div>
              <p className="mt-14 border-t border-[#cec5b8] pt-4 text-sm leading-7 text-[#6d6257] md:mt-0">
                活動策劃統包／啟動儀式／活動特效／AI 互動道具／外派調酒／活動人員
              </p>
            </div>

            <div className="grid min-h-[520px] grid-rows-[1.08fr_0.92fr] gap-3 sm:min-h-[640px]">
              <figure className="relative overflow-hidden bg-[#d8cdbf]">
                <Image src="/images/cases/case-4.jpg" alt="品牌記者會活動整合案例" fill priority sizes="(min-width: 768px) 52vw, 100vw" className="object-cover transition-transform duration-700 hover:scale-[1.025]" />
                <figcaption className="absolute bottom-0 left-0 bg-[#f7f3ec] px-4 py-2 text-xs font-semibold tracking-[0.08em] text-[#51473d]">EVENT PRODUCTION</figcaption>
              </figure>
              <div className="grid grid-cols-[0.78fr_1.22fr] gap-3">
                <div className="flex flex-col justify-end bg-[#28231f] p-5 text-white sm:p-7">
                  <p className="text-xl font-semibold leading-snug">規劃、整合、執行，讓每個環節有依據。</p>
                  <Link href="/services/event-package" className="mt-7 inline-flex w-fit items-center gap-2 border-b border-[#d7a574] pb-2 text-sm font-bold text-[#f1cfaa] transition-colors hover:text-white">活動策劃統包 <ArrowUpRight size={16} /></Link>
                </div>
                <figure className="relative overflow-hidden bg-[#d8cdbf]">
                  <Image src="/images/cases/case-10.jpg" alt="活動特效與現場技術整合案例" fill sizes="(min-width: 768px) 34vw, 60vw" className="object-cover" />
                </figure>
              </div>
            </div>
          </section>

          <section id="services" className="border-y border-[#cec5b8] bg-[#ebe5db]">
            <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
              <div className="grid gap-6 py-12 md:grid-cols-[0.8fr_1.2fr] md:py-16">
                <h2 className="max-w-sm text-3xl font-semibold leading-[1.13] tracking-[-0.035em] sm:text-4xl">從需求開始，找到合適的執行方式。</h2>
                <p className="max-w-xl text-base leading-8 text-[#5b5147] md:justify-self-end">依照活動目的、場地條件、參與人數與預算範圍，選擇需要的服務組合。</p>
              </div>
              <div className="border-t border-[#cec5b8]">
                {SERVICES.map((service) => (
                  <Link key={service.href} href={service.href} className="group grid gap-3 border-b border-[#cec5b8] py-5 transition-colors hover:bg-[#f7f3ec] sm:grid-cols-[minmax(0,0.65fr)_minmax(0,1fr)_auto] sm:items-center sm:px-4">
                    <h3 className="text-xl font-semibold tracking-[-0.025em]">{service.title}</h3>
                    <p className="text-sm leading-7 text-[#665b50]">{service.summary}</p>
                    <ArrowUpRight size={22} className="text-[#a66d42] transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </Link>
                ))}
              </div>
            </div>
          </section>

          <section id="cases" className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 md:py-28 lg:px-12">
            <div className="grid gap-8 border-b border-[#cec5b8] pb-10 md:grid-cols-[1.05fr_0.95fr] md:items-end">
              <h2 className="max-w-2xl text-4xl font-semibold leading-[1.08] tracking-[-0.045em] sm:text-5xl">現場留下的畫面，來自事前每一個決定。</h2>
              <p className="max-w-md text-base leading-8 text-[#5b5147] md:justify-self-end">這些照片記錄的是實際合作案例，也是我們與客戶共同完成的現場。</p>
            </div>
            <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {CASES.map((item, index) => (
                <Link key={item.image} href="/cases" className={`group relative overflow-hidden bg-[#d8cdbf] ${index === 0 ? "sm:col-span-2 sm:row-span-2" : ""}`}>
                  <div className={`relative ${index === 0 ? "aspect-[4/3] sm:h-full" : "aspect-[4/3]"}`}>
                    <Image src={item.image} alt={item.alt} fill sizes={index === 0 ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 25vw, 50vw"} className="object-cover transition-transform duration-500 group-hover:scale-[1.035]" />
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <Link href="/cases" className="inline-flex items-center gap-2 border-b border-[#a66d42] pb-2 text-sm font-bold text-[#7e4f2f] transition-colors hover:text-[#25211d]">查看所有活動案例 <ArrowUpRight size={17} /></Link>
            </div>
          </section>

          {managedClients.length > 0 && (
            <section className="border-y border-[#cec5b8] bg-[#ebe5db] py-12 md:py-16">
              <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
                <p className="mb-8 text-sm font-semibold tracking-[0.08em] text-[#5b5147]">合作品牌與單位</p>
                <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:grid-cols-6">
                  {managedClients.map((client) => (
                    <div key={client.id} className="flex h-16 items-center justify-center">
                      {/* Dynamic CMS image URLs may use several approved hosts, so Next image optimization is intentionally bypassed. */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={client.logo_url} alt={client.name} className="max-h-full max-w-full object-contain grayscale transition duration-300 hover:grayscale-0" />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          <section id="enquiry" className="bg-[#28231f] py-20 text-white md:py-28">
            <div className="mx-auto grid max-w-[1440px] gap-10 px-5 sm:px-8 md:grid-cols-[0.8fr_1.2fr] lg:px-12">
              <div>
                <h2 className="max-w-md text-4xl font-semibold leading-[1.1] tracking-[-0.045em] sm:text-5xl">把活動需求交給我們，從清楚的第一步開始。</h2>
                <p className="mt-7 max-w-sm text-base leading-8 text-white/70">填寫日期、地點與初步想法，我們會依序確認可行的服務方向與檔期。</p>
                <a href={LINE_URL} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex items-center gap-2 border-b border-[#d7a574] pb-2 text-sm font-bold text-[#f1cfaa] transition-colors hover:text-white">透過 LINE 聯絡 <ArrowUpRight size={17} /></a>
              </div>
              <div className="bg-[#f7f3ec] p-5 text-[#25211d] sm:p-8 md:p-10">
                <ContactFormInline submitLabel="送出初步活動需求" />
              </div>
            </div>
          </section>
        </div>

        <footer className="border-t border-white/15 bg-[#28231f] px-5 pb-8 text-white sm:px-8 lg:px-12">
          <div className="mx-auto flex max-w-[1440px] flex-col gap-6 border-t border-white/15 pt-7 text-sm text-white/65 md:flex-row md:items-end md:justify-between">
            <div><p className="font-semibold text-white">境曜有限公司 BES Events</p><p className="mt-2">{SITE_ADDRESS}</p></div>
            <div className="flex flex-wrap gap-x-5 gap-y-2"><a href="tel:0912727596" className="hover:text-white">0912-727-596</a><a href="mailto:Jingyaoactivities@gmail.com" className="hover:text-white">Jingyaoactivities@gmail.com</a><Link href="/privacy" className="hover:text-white">隱私權政策</Link></div>
          </div>
        </footer>
      </div>
    </>
  );
}
