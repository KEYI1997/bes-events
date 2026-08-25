export const GOOGLE_ADS_ID = 'AW-17830408669';
export const GOOGLE_ADS_LEAD_SEND_TO = `${GOOGLE_ADS_ID}/VwTlCNeG_NYbEN3jmbZC`;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackGoogleAdsLeadConversion() {
  if (typeof window === 'undefined') return;

  window.dataLayer = window.dataLayer || [];
  const gtag = window.gtag || function queuedGtag() {
    window.dataLayer?.push(arguments);
  };

  gtag('event', 'conversion', {
    send_to: GOOGLE_ADS_LEAD_SEND_TO,
    value: 1.0,
    currency: 'TWD',
  });
}
