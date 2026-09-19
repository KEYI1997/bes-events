import Script from 'next/script';
import { headers } from 'next/headers';
import { GOOGLE_ADS_ID } from '@/lib/googleAds';
import { isProductionTrackingRequest } from '@/lib/productionTracking';

export default async function GoogleAnalytics() {
  const requestHeaders = await headers();
  const host = requestHeaders.get('x-forwarded-host') || requestHeaders.get('host');

  if (!isProductionTrackingRequest(host)) return null;
  const measurementId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID?.trim();
  const tagId = measurementId || GOOGLE_ADS_ID;
  const analyticsConfig = measurementId
    ? `\ngtag('config', ${JSON.stringify(measurementId)}, { anonymize_ip: true });`
    : '';

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(tagId)}`} strategy="afterInteractive" />
      <Script id="google-tag" strategy="afterInteractive">
        {`window.__BES_GOOGLE_TAG_ENABLED__ = true;
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', ${JSON.stringify(GOOGLE_ADS_ID)});${analyticsConfig}`}
      </Script>
    </>
  );
}
