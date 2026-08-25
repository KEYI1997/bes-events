import Script from 'next/script';
import { GOOGLE_ADS_ID } from '@/lib/googleAds';

export default function GoogleAnalytics() {
  const measurementId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID?.trim();
  const tagId = measurementId || GOOGLE_ADS_ID;
  const analyticsConfig = measurementId
    ? `\ngtag('config', ${JSON.stringify(measurementId)}, { anonymize_ip: true });`
    : '';

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(tagId)}`} strategy="afterInteractive" />
      <Script id="google-tag" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', ${JSON.stringify(GOOGLE_ADS_ID)});${analyticsConfig}`}
      </Script>
    </>
  );
}
