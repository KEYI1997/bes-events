export const GOOGLE_ADS_ID = 'AW-17830408669';
export const GOOGLE_ADS_LEAD_SEND_TO = `${GOOGLE_ADS_ID}/VwTlCNeG_NYbEN3jmbZC`;

declare global {
  interface Window {
    __BES_GOOGLE_TAG_ENABLED__?: boolean;
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function isOfficialTrackingHost(hostname: string): boolean {
  return hostname === 'besevent.com' || hostname === 'www.besevent.com';
}

export function trackGoogleAdsLeadConversion() {
  if (typeof window === 'undefined') return;
  if (!window.__BES_GOOGLE_TAG_ENABLED__ || !isOfficialTrackingHost(window.location.hostname.toLowerCase())) return;

  const gtag = window.gtag;
  if (!gtag) return;

  gtag('event', 'conversion', {
    send_to: GOOGLE_ADS_LEAD_SEND_TO,
    value: 1.0,
    currency: 'TWD',
  });
}
