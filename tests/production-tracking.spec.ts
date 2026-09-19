import { expect, test } from '@playwright/test';
import { hostnameFromHeader, isProductionTrackingRequest } from '../src/lib/productionTracking';

test('only enables formal tracking for the Vercel Production public domains', () => {
  expect(isProductionTrackingRequest('besevent.com', 'production')).toBe(true);
  expect(isProductionTrackingRequest('www.besevent.com:443', 'production')).toBe(true);

  expect(isProductionTrackingRequest('bes-events-abc.vercel.app', 'production')).toBe(false);
  expect(isProductionTrackingRequest('localhost:3000', 'production')).toBe(false);
  expect(isProductionTrackingRequest('besevent.com', 'preview')).toBe(false);
  expect(isProductionTrackingRequest('besevent.com', 'development')).toBe(false);
  expect(isProductionTrackingRequest('besevent.com', undefined)).toBe(false);
});

test('normalizes forwarded host headers before comparing them', () => {
  expect(hostnameFromHeader('WWW.BESEVENT.COM:443, proxy.internal')).toBe('www.besevent.com');
  expect(hostnameFromHeader('besevent.com.')).toBe('besevent.com');
});
