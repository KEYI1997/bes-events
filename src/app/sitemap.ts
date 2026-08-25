import type { MetadataRoute } from 'next';
import { SERVICE_SEO_PAGES, SITE_URL } from '@/lib/seo';

type PublicRecord = { id: string; created_at?: string | null };

async function fetchPublicRecords(table: 'cases' | 'products'): Promise<PublicRecord[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!supabaseUrl || !anonKey) return [];

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/${table}?select=id,created_at&visible=eq.true&order=created_at.desc`,
      {
        headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
        next: { revalidate: 3600 },
      },
    );
    return response.ok ? ((await response.json()) as PublicRecord[]) : [];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/about`, changeFrequency: 'yearly', priority: 0.8 },
    { url: `${SITE_URL}/services`, changeFrequency: 'monthly', priority: 0.9 },
    ...SERVICE_SEO_PAGES.map(service => ({
      url: `${SITE_URL}/services/${service.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.85,
    })),
    { url: `${SITE_URL}/cases`, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${SITE_URL}/contact`, changeFrequency: 'yearly', priority: 0.75 },
    { url: `${SITE_URL}/privacy`, changeFrequency: 'yearly', priority: 0.2 },
  ];

  const [cases, products] = await Promise.all([
    fetchPublicRecords('cases'),
    fetchPublicRecords('products'),
  ]);
  const casePages: MetadataRoute.Sitemap = cases.map(item => ({
    url: `${SITE_URL}/cases/${item.id}`,
    lastModified: item.created_at || undefined,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));
  const productPages: MetadataRoute.Sitemap = products.map(item => ({
    url: `${SITE_URL}/products/detail/${item.id}`,
    lastModified: item.created_at || undefined,
    changeFrequency: 'monthly',
    priority: 0.65,
  }));

  return [...staticPages, ...casePages, ...productPages];
}
