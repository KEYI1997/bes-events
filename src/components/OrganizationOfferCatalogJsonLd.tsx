import JsonLd from '@/components/JsonLd';
import { SERVICE_SEO_PAGES, SITE_NAME, SITE_URL, absoluteUrl } from '@/lib/seo';

/**
 * Publishes the services already shown in the navigation as an OfferCatalog.
 * This is machine-readable context only; it does not change the visual UI.
 */
export default function OrganizationOfferCatalogJsonLd() {
  const catalogId = `${SITE_URL}/#service-catalog`;

  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'OfferCatalog',
        '@id': catalogId,
        name: `${SITE_NAME}活動整合服務`,
        url: SITE_URL,
        provider: { '@id': `${SITE_URL}/#organization` },
        itemListElement: SERVICE_SEO_PAGES.map((service) => {
          const serviceUrl = absoluteUrl(`/services/${service.slug}`);
          return {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              '@id': `${serviceUrl}#service`,
              name: service.name,
              description: service.summary,
              url: serviceUrl,
              areaServed: { '@type': 'Country', name: 'Taiwan' },
              provider: { '@id': `${SITE_URL}/#organization` },
            },
          };
        }),
      }}
    />
  );
}
