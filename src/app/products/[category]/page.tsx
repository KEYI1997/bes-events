import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import AnimateOnScroll from '@/components/AnimateOnScroll';
import JsonLd from '@/components/JsonLd';
import { supabase } from '@/lib/supabase';
import { Product } from '@/lib/types';
import { breadcrumbJsonLd, createPageMetadata, itemListJsonLd, PRODUCT_CATEGORY_SEO_PAGES, webPageJsonLd } from '@/lib/seo';

const CATEGORY_MAP: Record<string, string> = {
  'opening-ceremony': '啟動儀式',
  'stage-lighting': '燈光音響舞台',
  'event-planning': '專案企劃',
  'bartending': '外派調酒',
};

const CATEGORY_DESC: Record<string, string> = {
  'opening-ceremony': '星辰運轉、全息投影、沙漏啟動等多種創意儀式，為活動開場製造震撼記憶點。',
  'stage-lighting': '專業燈光音響設備租賃與搭建，打造完美視聽體驗。',
  'event-planning': '從記者會、尾牙到企業家庭日，提供完整活動企劃與執行服務。',
  'bartending': '專業調酒師現場調製，為活動增添品味與儀式感。',
};

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ category: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const page = PRODUCT_CATEGORY_SEO_PAGES.find(item => item.slug === category);
  if (!page) return createPageMetadata({ title: '產品服務', description: '境曜有限公司活動產品與服務方案。', path: '/services' });
  return createPageMetadata({
    title: page.name,
    description: page.summary,
    path: `/products/${category}`,
    image: page.image,
    keywords: [CATEGORY_MAP[category], page.name, '境曜有限公司'],
  });
}

export default async function ProductCategoryPage({ params }: Props) {
  const { category } = await params;
  const categoryName = CATEGORY_MAP[category];
  const seoPage = PRODUCT_CATEGORY_SEO_PAGES.find(item => item.slug === category);

  if (!categoryName || !seoPage) {
    notFound();
  }

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('category', categoryName)
    .eq('visible', true)
    .order('sort_order', { ascending: true });

  return (
    <><JsonLd data={[
      webPageJsonLd({ path: `/products/${category}`, name: `${seoPage.name}｜境曜有限公司`, description: seoPage.summary, type: 'CollectionPage', image: seoPage.image }),
      breadcrumbJsonLd([
        { name: '首頁', path: '/' },
        { name: '服務項目', path: '/services' },
        { name: seoPage.name, path: `/products/${category}` },
      ]),
      itemListJsonLd(seoPage.name, ((products as Product[]) || []).map(product => ({
        name: product.name,
        path: `/products/detail/${product.id}`,
        description: product.description?.slice(0, 160),
      }))),
    ]} /><main className="bg-white min-h-screen">
      {/* Hero */}
      <section className="relative bg-primary h-[25vh] flex items-center justify-center pt-20">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/90 to-primary" />
        <div className="relative z-10 text-center px-4">
          <AnimateOnScroll>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {categoryName}
            </h1>
            <p className="text-white/80 text-lg max-w-2xl mx-auto">
              {CATEGORY_DESC[category]}
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Products Grid */}
      <section className="bg-white max-w-7xl mx-auto px-4 py-16 md:py-24">
        {products && products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {(products as Product[]).map((product, index) => (
              <AnimateOnScroll key={product.id} delay={index * 100}>
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm h-full flex flex-col transition-transform duration-300 hover:scale-105 hover:shadow-lg">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={product.image_urls?.[0] || product.image_url?.split(',')[0] || '/images/placeholder.jpg'}
                      alt={`${product.name}－${categoryName}活動方案`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-xl font-bold text-primary mb-2">
                      {product.name}
                    </h3>
                    <div className="flex-1"></div>
                    <div className="flex items-end justify-between">
                      {product.price_note && (
                        <p className="text-base font-bold leading-relaxed whitespace-pre-line" style={{ color: '#AA7452' }}>
                          {product.price_note.replace(/\s*[/／]\s*/g, '\n')}
                        </p>
                      )}
                      <Link
                        href={`/products/detail/${product.id}`}
                        className="squish-btn px-4 py-2 text-white text-sm font-medium rounded-lg inline-block flex-shrink-0 ml-3"
                        style={{ backgroundColor: '#AA7452' }}
                      >
                        查看詳情
                      </Link>
                    </div>
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-primary/60 text-lg">目前尚無產品資料，請洽詢我們取得最新資訊。</p>
          </div>
        )}
      </section>

    </main></>
  );
}
