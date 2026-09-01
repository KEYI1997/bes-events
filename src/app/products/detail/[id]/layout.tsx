import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import { supabase } from '@/lib/supabase';
import {
  absoluteUrl,
  breadcrumbJsonLd,
  createPageMetadata,
  SITE_NAME,
  SITE_URL,
  webPageJsonLd,
} from '@/lib/seo';

type ProductSeoRecord = {
  id: string;
  name: string;
  category?: string | null;
  description?: string | null;
  image_url?: string | null;
  image_urls?: string[] | null;
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
};

export const dynamic = 'force-dynamic';

function summarizeProduct(product: ProductSeoRecord) {
  const summary = product.description
    ?.replace(/【[^】]+】/g, ' ')
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return (summary || `${SITE_NAME}提供${product.name}活動服務、適用場合與方案說明。`).slice(0, 180);
}

function productImages(product: ProductSeoRecord) {
  const legacyImages = product.image_url?.split(',').map(image => image.trim()).filter(Boolean) || [];
  return [...new Set([...(product.image_urls || []), ...legacyImages])].map(absoluteUrl);
}

async function getProduct(id: string): Promise<ProductSeoRecord | null> {
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .eq('visible', true)
    .maybeSingle();
  return data as ProductSeoRecord | null;
}

export async function generateMetadata({ params }: Omit<Props, 'children'>): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) {
    return createPageMetadata({
      title: '活動產品與方案',
      description: `${SITE_NAME}活動產品與服務方案。`,
      path: `/products/detail/${id}`,
      noIndex: true,
    });
  }
  return createPageMetadata({
    title: product.name,
    description: summarizeProduct(product),
    path: `/products/detail/${id}`,
    image: productImages(product)[0],
    keywords: [product.name, product.category || '活動服務', SITE_NAME],
  });
}

export default async function ProductDetailLayout({ children, params }: Props) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return children;

  const path = `/products/detail/${id}`;
  const url = absoluteUrl(path);
  const description = summarizeProduct(product);
  const images = productImages(product);
  const productId = `${url}#product`;
  const structuredData = [
    webPageJsonLd({
      path,
      name: `${product.name}｜${SITE_NAME}`,
      description,
      image: images[0],
      mainEntityId: productId,
    }),
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      '@id': productId,
      name: product.name,
      description,
      url,
      image: images,
      category: product.category,
      sku: product.id,
      brand: { '@id': `${SITE_URL}/#organization` },
    },
    breadcrumbJsonLd([
      { name: '首頁', path: '/' },
      { name: '服務項目', path: '/services' },
      { name: product.category || '活動產品', path: '/services' },
      { name: product.name, path },
    ]),
  ];

  return <><JsonLd data={structuredData} />{children}</>;
}
