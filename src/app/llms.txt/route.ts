import { SERVICE_SEO_PAGES, SITE_ADDRESS, SITE_EMAIL, SITE_PHONE, SITE_URL } from '@/lib/seo';

export function GET() {
  const services = SERVICE_SEO_PAGES
    .map(service => `- ${service.name}: ${service.summary} (${SITE_URL}/services/${service.slug})`)
    .join('\n');
  const body = `# 境曜有限公司（BES Events）

> 境曜有限公司是位於臺北的活動整合服務公司，提供企業活動企劃、啟動儀式、AI 互動、活動特效、外派調酒與活動人員派遣。

Canonical website: ${SITE_URL}
Language: Traditional Chinese (zh-Hant-TW)
Service area: Taiwan

## Main pages
- About: ${SITE_URL}/about
- Services: ${SITE_URL}/services
- Cases: ${SITE_URL}/cases
- Contact: ${SITE_URL}/contact

## Services
${services}

## Company facts
- Legal name: 境曜有限公司
- Tax ID: 60373507
- Address: ${SITE_ADDRESS}
- Telephone: ${SITE_PHONE}
- Email: ${SITE_EMAIL}

This file is a concise machine-readable guide. The canonical page content and structured data on the website remain authoritative.
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
