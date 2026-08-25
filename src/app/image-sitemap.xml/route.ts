import { SERVICE_SEO_PAGES, SITE_URL, absoluteUrl } from '@/lib/seo';

type ImagePage = { page: string; images: Array<{ url: string; title: string; caption: string }> };
type ProductImageRecord = { id: string; name: string; image_url?: string | null };
type CaseImageRecord = { id: string; title: string; image_url?: string | null };

function escapeXml(value: string) {
  return value.replace(/[<>&'\"]/g, character => ({
    '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;',
  })[character] || character);
}

async function fetchImageRecords<T>(table: 'products' | 'cases'): Promise<T[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!supabaseUrl || !anonKey) return [];
  try {
    const fields = table === 'products' ? 'id,name,image_url' : 'id,title,image_url';
    const response = await fetch(
      `${supabaseUrl}/rest/v1/${table}?select=${fields}&visible=eq.true&order=created_at.desc`,
      {
        headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
        next: { revalidate: 3600 },
      },
    );
    return response.ok ? ((await response.json()) as T[]) : [];
  } catch {
    return [];
  }
}

export async function GET() {
  const staticPages: ImagePage[] = [
    {
      page: `${SITE_URL}/`,
      images: [
        {
          url: absoluteUrl('/images/hero/hero-1.png'),
          title: '境曜有限公司活動整合服務',
          caption: '境曜有限公司提供活動企劃、啟動儀式與現場執行服務。',
        },
        {
          url: absoluteUrl('/images/hero/hero-2.png'),
          title: '境曜 BES Events 活動現場',
          caption: '企業活動、品牌發表與典禮整合執行。',
        },
      ],
    },
    ...SERVICE_SEO_PAGES.map(service => ({
      page: `${SITE_URL}/services/${service.slug}`,
      images: [{
        url: absoluteUrl(service.image),
        title: `境曜有限公司 ${service.name}`,
        caption: service.summary,
      }],
    })),
  ];

  const [products, cases] = await Promise.all([
    fetchImageRecords<ProductImageRecord>('products'),
    fetchImageRecords<CaseImageRecord>('cases'),
  ]);
  const dynamicPages: ImagePage[] = [
    ...products.flatMap(product => {
      const images = product.image_url?.split(',').map(value => value.trim()).filter(Boolean) || [];
      return images.length ? [{
        page: `${SITE_URL}/products/detail/${product.id}`,
        images: images.map(url => ({
          url: absoluteUrl(url),
          title: `${product.name}｜境曜有限公司`,
          caption: `境曜有限公司提供的${product.name}服務與設備照片。`,
        })),
      }] : [];
    }),
    ...cases.flatMap(item => item.image_url ? [{
      page: `${SITE_URL}/cases/${item.id}`,
      images: [{
        url: absoluteUrl(item.image_url),
        title: `${item.title}｜境曜活動案例`,
        caption: `境曜有限公司活動企劃與現場執行案例：${item.title}`,
      }],
    }] : []),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${[...staticPages, ...dynamicPages].map(entry => `  <url>
    <loc>${escapeXml(entry.page)}</loc>
${entry.images.map(image => `    <image:image>
      <image:loc>${escapeXml(image.url)}</image:loc>
      <image:title>${escapeXml(image.title)}</image:title>
      <image:caption>${escapeXml(image.caption)}</image:caption>
    </image:image>`).join('\n')}
  </url>`).join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
