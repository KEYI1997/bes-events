import AnimateOnScroll from '@/components/AnimateOnScroll';
import JsonLd from '@/components/JsonLd';
import ShowGirlGallery from '@/components/ShowGirlGallery';
import ShowGirlInquiryForm from '@/components/ShowGirlInquiryForm';
import { breadcrumbJsonLd, createPageMetadata, serviceJsonLd } from '@/lib/seo';

const description = '專業活動人員派遣，提供展場接待、品牌推廣、頒獎與活動現場協助。';

export const metadata = createPageMetadata({
  title: 'SHOW GIRL 活動人員派遣',
  description,
  path: '/services/showgirl',
  image: '/images/services/show girl.png',
  keywords: ['Show Girl', '活動人員派遣', '展場接待', '境曜有限公司'],
});

const structuredData = [
  serviceJsonLd('showgirl', 'SHOW GIRL 活動人員派遣', description, '/images/services/show girl.png'),
  breadcrumbJsonLd([
    { name: '首頁', path: '/' },
    { name: '服務項目', path: '/services' },
    { name: 'SHOW GIRL 活動人員', path: '/services/showgirl' },
  ]),
];

// 已上傳的壓縮圖片 URL（21 張，1200px / 75% 品質）
const SHOWGIRL_IMAGES = [
  'https://urswpmgnkiirqcrbnuie.supabase.co/storage/v1/object/public/images/showgirls/1785815904093-h66q13th374.jpg',
  'https://urswpmgnkiirqcrbnuie.supabase.co/storage/v1/object/public/images/showgirls/1785815906790-9g4ph508wyv.jpg',
  'https://urswpmgnkiirqcrbnuie.supabase.co/storage/v1/object/public/images/showgirls/1785815908952-p3d7savd62.jpg',
  'https://urswpmgnkiirqcrbnuie.supabase.co/storage/v1/object/public/images/showgirls/1785815911320-75dodbo9b15.jpg',
  'https://urswpmgnkiirqcrbnuie.supabase.co/storage/v1/object/public/images/showgirls/1785815913963-eu6f2tbw364.jpg',
  'https://urswpmgnkiirqcrbnuie.supabase.co/storage/v1/object/public/images/showgirls/1785815916142-76agtyv9vq.jpg',
  'https://urswpmgnkiirqcrbnuie.supabase.co/storage/v1/object/public/images/showgirls/1785815919601-4h71a0fcqgq.jpg',
  'https://urswpmgnkiirqcrbnuie.supabase.co/storage/v1/object/public/images/showgirls/1785815922254-d3as789bp3t.jpg',
  'https://urswpmgnkiirqcrbnuie.supabase.co/storage/v1/object/public/images/showgirls/1785815924407-cbqq1pj1ro.jpg',
  'https://urswpmgnkiirqcrbnuie.supabase.co/storage/v1/object/public/images/showgirls/1785815927464-pjj1un8b1us.jpg',
  'https://urswpmgnkiirqcrbnuie.supabase.co/storage/v1/object/public/images/showgirls/1785815929711-rgvnwdjxb7q.jpg',
  'https://urswpmgnkiirqcrbnuie.supabase.co/storage/v1/object/public/images/showgirls/1785815932821-tmem4h117d.jpg',
  'https://urswpmgnkiirqcrbnuie.supabase.co/storage/v1/object/public/images/showgirls/1785815936546-7vdjukeze9k.jpg',
  'https://urswpmgnkiirqcrbnuie.supabase.co/storage/v1/object/public/images/showgirls/1785815938471-imosfuvesl.jpg',
  'https://urswpmgnkiirqcrbnuie.supabase.co/storage/v1/object/public/images/showgirls/1785815941036-qd8lc2ogfni.jpg',
  'https://urswpmgnkiirqcrbnuie.supabase.co/storage/v1/object/public/images/showgirls/1785815942850-mtpr8xf4gg.jpg',
  'https://urswpmgnkiirqcrbnuie.supabase.co/storage/v1/object/public/images/showgirls/1785815948141-y87d4qsftf.jpg',
  'https://urswpmgnkiirqcrbnuie.supabase.co/storage/v1/object/public/images/showgirls/1785815951332-juyhg297lpo.jpg',
  'https://urswpmgnkiirqcrbnuie.supabase.co/storage/v1/object/public/images/showgirls/1785815955110-lbk2ccjr57.jpg',
  'https://urswpmgnkiirqcrbnuie.supabase.co/storage/v1/object/public/images/showgirls/1785815957493-it358ptm5sd.jpg',
  'https://urswpmgnkiirqcrbnuie.supabase.co/storage/v1/object/public/images/showgirls/1785815965272-6i4anyy3lkr.jpg',
];

export default function ShowGirlPage() {
  return (
    <><JsonLd data={structuredData} /><main className="bg-white min-h-screen">
      {/* Hero */}
      <section className="relative bg-primary h-[25vh] flex items-center justify-center pt-20">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/90 to-primary" />
        <div className="relative z-10 text-center px-4">
          <AnimateOnScroll>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">SHOW GIRL</h1>
            <p className="text-white/80 text-lg max-w-2xl mx-auto">專業活動人員派遣，提供展場接待、活動協助等服務</p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* 主體：左圖 + 右表單 */}
      <section className="bg-white max-w-7xl mx-auto px-4 py-16 md:py-20">
        <div className="flex flex-col lg:flex-row gap-10 items-stretch">

          {/* 左側：圖片輪播 */}
          <div className="w-full lg:w-[55%]">
            <ShowGirlGallery images={SHOWGIRL_IMAGES} />
          </div>

          {/* 右側：詢問表單 */}
          <div className="w-full lg:w-[45%]">
            <div className="bg-white rounded-3xl shadow-sm p-8 h-full">
              <h2 className="text-2xl font-bold text-primary mb-2">需求詢問</h2>
              <p className="text-primary/50 text-sm mb-6">填寫您的需求，我們將為您推薦最合適的人選</p>
              <ShowGirlInquiryForm />
            </div>
          </div>
        </div>
      </section>

      {/* 分隔線 */}
      <div className="flex justify-center bg-white px-8">
        <div className="w-full h-[2px] bg-gray-300"></div>
      </div>

      {/* 案例照片 Grid */}
      <section className="bg-white max-w-7xl mx-auto px-4 py-16 md:py-24">
        <AnimateOnScroll>
          <h2 className="text-2xl font-bold text-primary mb-8 text-center">活動案例</h2>
        </AnimateOnScroll>
        <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
          {SHOWGIRL_IMAGES.map((url, i) => (
            <AnimateOnScroll key={i} delay={i * 40}>
              <div className="break-inside-avoid rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <img
                  src={url}
                  alt={`Show Girl 案例 ${i + 1}`}
                  className="w-full object-cover"
                  loading="lazy"
                />
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </section>

    </main></>
  );
}
