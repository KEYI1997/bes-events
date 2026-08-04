import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { MessageCircle, UserRound } from 'lucide-react';
import AnimateOnScroll from '@/components/AnimateOnScroll';
import ServiceProductGrid from '@/components/ServiceProductGrid';
import { supabase } from '@/lib/supabase';
import { Product, ShowGirl } from '@/lib/types';

const CATEGORY_MAP: Record<string, string> = {
  'event-package': '活動策劃統包',
  'opening-ceremony': '啟動儀式',
  'special-effects': '活動特效',
  'stage-lighting': '燈光音響舞台',
  'bartending': '外派調酒',
  'showgirl': 'SHOW GIRL',
};

const CATEGORY_DESC: Record<string, string> = {
  'event-package': '從企劃到執行，提供一站式活動統包服務，讓您省心省力。',
  'opening-ceremony': '星辰運轉、全息投影、沙漏啟動等多種創意儀式，為活動開場製造震撼記憶點。',
  'special-effects': '專業活動特效服務，為現場營造震撼視覺效果。',
  'stage-lighting': '專業燈光音響與舞台設備租賃與搭建，打造完美視聽體驗。',
  'bartending': '專業調酒師現場調製，為活動增添品味與儀式感。',
  'showgirl': '專業活動人員派遣，提供展場接待、活動協助等服務。',
};

const DB_CATEGORY_MAP: Record<string, string> = {
  'event-package': '專案企劃',
  'opening-ceremony': '啟動儀式',
  'special-effects': '活動特效',
  'stage-lighting': '燈光音響舞台',
  'bartending': '外派調酒',
  'showgirl': 'Show Girl',
};

type Props = { params: Promise<{ category: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const title = CATEGORY_MAP[category];
  if (!title) return { title: '服務項目 | 境曜有限公司' };
  return { title: `${title} | 境曜有限公司 BES Events`, description: CATEGORY_DESC[category] };
}

export default async function ServiceCategoryPage({ params }: Props) {
  const { category } = await params;
  const categoryName = CATEGORY_MAP[category];
  if (!categoryName) notFound();

  if (category === 'showgirl') {
    const { data: showgirls } = await supabase.from('showgirls').select('*').eq('visible', true).order('sort_order', { ascending: true });
    return (
      <main className="bg-bg min-h-screen">
        <section className="relative bg-primary h-[25vh] flex items-center justify-center pt-20">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/90 to-primary" />
          <div className="relative z-10 text-center px-4">
            <AnimateOnScroll><h1 className="text-4xl md:text-5xl font-bold text-white mb-4">SHOW GIRL</h1><p className="text-white/80 text-lg max-w-2xl mx-auto">{CATEGORY_DESC['showgirl']}</p></AnimateOnScroll>
          </div>
        </section>
        <section className="max-w-7xl mx-auto px-4 py-16 md:py-24">
          {showgirls && showgirls.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(showgirls as ShowGirl[]).map((girl, index) => (
                <AnimateOnScroll key={girl.id} delay={index * 100}>
                  <div className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
                    <div className="relative aspect-[3/4]">
                      <Image src={girl.image_url} alt={girl.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all">
                        <h3 className="text-xl font-bold">{girl.name}</h3>
                        {girl.height && <p className="text-white/80 text-sm mt-1">身高 {girl.height} cm</p>}
                      </div>
                    </div>
                  </div>
                </AnimateOnScroll>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <AnimateOnScroll>
                <UserRound size={64} className="mx-auto text-cta/50 mb-6" />
                <h2 className="text-2xl font-bold text-primary mb-4">即將上線，請洽詢</h2>
                <Link href="/contact" className="inline-flex items-center gap-2 bg-cta text-white px-8 py-4 rounded-full font-semibold hover:bg-cta-hover transition-colors"><MessageCircle size={20} />立即諮詢</Link>
              </AnimateOnScroll>
            </div>
          )}
        </section>
      </main>
    );
  }

  // 外派調酒：靜態方案卡片
  if (category === 'bartending') {
    const plans = [
      {
        name: '小型聚會方案',
        badge: '輕鬆入門',
        desc: '適合私人小聚、家庭派對、節日慶祝等小規模場合。讓專業調酒師到府服務，不用出門也能享受精品調酒體驗，輕鬆辦一場難忘的家庭聚會。',
        highlights: [
          '建議人數：10 ~ 30 人',
          '服務時長：最少 2 小時',
          '計費方式：以時數計費',
          '單人調酒師服務',
          '附基本吧台器具，場地免佈置',
        ],
      },
      {
        name: '迎賓雞尾酒方案',
        badge: '入門首選',
        desc: '適合婚宴、發表會、企業晚宴等需要優雅開場的場合。調酒師現場調製精選迎賓雞尾酒，以色香味俱全的飲品化解賓客入場的拘謹氛圍。',
        highlights: [
          '建議人數：50 ~ 200 人',
          '服務時長：依場地時程安排',
          '計費方式：以杯數計費',
          '提供精選迎賓雞尾酒酒單',
          '可依活動主題客製化酒款顏色',
        ],
      },
      {
        name: '派對暢飲方案',
        badge: '人氣熱門',
        desc: '適合生日派對、同學會、公司尾牙、私人聚會等歡樂場合。專業調酒師進駐現場，無限供應派對調酒，讓整晚嗨到停不下來。',
        highlights: [
          '建議人數：20 ~ 100 人',
          '服務時長：最少 2 小時，以小時計費',
          '計費方式：無限暢飲，以時數計費',
          '雙人調酒師搭配，供酒流暢不斷線',
          '超過 100 人建議加派人手',
        ],
      },
      {
        name: '主題客製化方案',
        badge: '品牌首選',
        desc: '適合品牌發表、展覽、記者會、廠商招待會等需要凸顯品牌形象的場合。依活動主題量身打造專屬酒單，調酒師現場互動表演，為活動帶來獨特亮點。',
        highlights: [
          '建議人數：不限',
          '服務時長：依活動需求規劃',
          '計費方式：杯數或時數，依需求報價',
          '全客製化主題酒單設計',
          '可搭配花式調酒表演，炒熱現場氣氛',
        ],
      },
    ];

    return (
      <main className="bg-bg min-h-screen">
        {/* Hero */}
        <section className="relative bg-primary h-[25vh] flex items-center justify-center pt-20">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/90 to-primary" />
          <div className="relative z-10 text-center px-4">
            <AnimateOnScroll>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">外派調酒</h1>
              <p className="text-white/80 text-lg max-w-2xl mx-auto">{CATEGORY_DESC['bartending']}</p>
            </AnimateOnScroll>
          </div>
        </section>

        {/* 方案標題 */}
        <section className="max-w-7xl mx-auto px-4 pt-16 pb-8 md:pt-24 md:pb-10">
          <AnimateOnScroll>
            <h2 className="text-2xl md:text-3xl font-bold text-primary text-center mb-3">服務方案</h2>
            <p className="text-primary/60 text-center">依照您的活動規模與需求，選擇最適合的調酒方案</p>
          </AnimateOnScroll>
        </section>

        {/* Banner 包裝容器：左右留白 px-6 md:px-16 */}
        <div className="px-6 md:px-16 space-y-0">

          {/* Banner 方案：方案一（文字左） */}
          <AnimateOnScroll delay={0}>
            <div className="relative w-full h-[280px] md:h-[340px] overflow-hidden border-t-2 border-white">
              <Image
                src="/images/services/bartending.png"
                alt="迎賓雞尾酒方案"
                fill
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-center px-10 md:px-16 max-w-2xl">
                <h3 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow">{plans[0].name}</h3>
                {/* <div className="bg-cta px-5 py-2 text-white font-semibold text-lg mb-4 inline-block">NT$ —</div> */}
                <div className="bg-black/50 px-5 py-4 space-y-2">
                  {plans[0].highlights.map((item, i) => (
                    <p key={item} className="text-white/90 text-base">{i + 1}.{item}</p>
                  ))}
                </div>
              </div>
            </div>
          </AnimateOnScroll>

          {/* Banner 方案：方案二（文字右） */}
          <AnimateOnScroll delay={100}>
            <div className="relative w-full h-[280px] md:h-[340px] overflow-hidden border-t-2 border-white">
              <Image
                src="/images/services/bartending.png"
                alt="派對暢飲方案"
                fill
                className="object-cover object-center scale-x-[-1]"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-black/75 via-black/40 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-center items-end px-10 md:px-16">
                <div className="max-w-2xl text-right">
                  <h3 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow">{plans[1].name}</h3>
                  <div className="bg-black/50 px-5 py-4 space-y-2">
                    {plans[1].highlights.map((item, i) => (
                      <p key={item} className="text-white/90 text-base">{i + 1}.{item}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </AnimateOnScroll>

          {/* Banner 方案：方案三（文字左） */}
          <AnimateOnScroll delay={200}>
            <div className="relative w-full h-[280px] md:h-[340px] overflow-hidden border-t-2 border-white">
              <Image
                src="/images/services/bartending.png"
                alt="主題客製化方案"
                fill
                className="object-cover object-bottom"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-center px-10 md:px-16 max-w-2xl">
                <h3 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow">{plans[2].name}</h3>
                <div className="bg-black/50 px-5 py-4 space-y-2">
                  {plans[2].highlights.map((item, i) => (
                    <p key={item} className="text-white/90 text-base">{i + 1}.{item}</p>
                  ))}
                </div>
              </div>
            </div>
          </AnimateOnScroll>

          {/* Banner 方案：方案四（文字右） */}
          <AnimateOnScroll delay={300}>
            <div className="relative w-full h-[280px] md:h-[340px] overflow-hidden border-t-2 border-white border-b-2">
              <Image
                src="/images/services/bartending.png"
                alt="小型聚會方案"
                fill
                className="object-cover object-top scale-x-[-1]"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-black/75 via-black/40 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-center items-end px-10 md:px-16">
                <div className="max-w-2xl text-right">
                  <h3 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow">{plans[3].name}</h3>
                  <div className="bg-black/50 px-5 py-4 space-y-2">
                    {plans[3].highlights.map((item, i) => (
                      <p key={item} className="text-white/90 text-base">{i + 1}.{item}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </AnimateOnScroll>

        </div>

        <div className="pb-16 md:pb-24" />

        {/* CTA */}
        <section className="bg-primary py-16">
          <div className="max-w-4xl mx-auto text-center px-4">
            <AnimateOnScroll>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">想了解更多？</h2>
              <p className="text-white/80 mb-8">歡迎聯繫我們，取得客製化報價與專業建議</p>
              <Link href="/contact" className="inline-flex items-center gap-2 bg-cta text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-cta-hover transition-colors">
                <MessageCircle size={20} />立即諮詢
              </Link>
            </AnimateOnScroll>
          </div>
        </section>
      </main>
    );
  }

  const dbCategory = DB_CATEGORY_MAP[category] || categoryName;
  const { data: products } = await supabase.from('products').select('*').eq('category', dbCategory).eq('visible', true).order('sort_order', { ascending: true });

  return (
    <main className="bg-bg min-h-screen">
      <section className="relative bg-primary h-[25vh] flex items-center justify-center pt-20">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/90 to-primary" />
        <div className="relative z-10 text-center px-4">
          <AnimateOnScroll><h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{categoryName}</h1><p className="text-white/80 text-lg max-w-2xl mx-auto">{CATEGORY_DESC[category]}</p></AnimateOnScroll>
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-4 py-16 md:py-24">
        {products && products.length > 0 ? (
          <ServiceProductGrid products={products as Product[]} />
        ) : (
          <div className="text-center py-16"><p className="text-primary/60 text-lg">目前尚無產品資料，請洽詢我們取得最新資訊。</p></div>
        )}
      </section>
      <section className="bg-primary py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <AnimateOnScroll>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">想了解更多？</h2>
            <p className="text-white/80 mb-8">歡迎聯繫我們，取得客製化報價與專業建議</p>
            <Link href="/contact" className="inline-flex items-center gap-2 bg-cta text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-cta-hover transition-colors"><MessageCircle size={20} />立即諮詢</Link>
          </AnimateOnScroll>
        </div>
      </section>
    </main>
  );
}
