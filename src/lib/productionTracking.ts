export const PRODUCTION_TRACKING_HOSTS = new Set([
  'besevent.com',
  'www.besevent.com',
]);

export function hostnameFromHeader(host?: string | null): string {
  const firstHost = (host || '').split(',')[0]?.trim().toLowerCase() || '';

  if (!firstHost) return '';
  if (firstHost.startsWith('[')) return firstHost.split(']')[0].slice(1);
  return firstHost.replace(/:\d+$/, '').replace(/\.$/, '');
}

/**
 * Formal Google measurement is deliberately limited to the Vercel Production
 * environment on the two public domains. Production deployment URLs on
 * vercel.app remain excluded by the hostname check.
 */
export function isProductionTrackingRequest(
  host?: string | null,
  vercelEnvironment = process.env.VERCEL_ENV,
): boolean {
  return vercelEnvironment === 'production'
    && PRODUCTION_TRACKING_HOSTS.has(hostnameFromHeader(host));
}
