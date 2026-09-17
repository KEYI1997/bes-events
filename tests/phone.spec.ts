import { expect, test } from '@playwright/test';
import { getTaiwanPhoneVariants, normalizeTaiwanPhone } from '../src/lib/phone';

test('normalizes Taiwan mobile and landline numbers without a mobile-only rule', () => {
  expect(normalizeTaiwanPhone('+886 912-345-678')).toBe('0912345678');
  expect(normalizeTaiwanPhone('886 2 2345 6789')).toBe('0223456789');
  expect(normalizeTaiwanPhone('04-2234-5678')).toBe('0422345678');
  expect(normalizeTaiwanPhone('08-732-1234')).toBe('087321234');
  expect(normalizeTaiwanPhone('0836-12345')).toBe('083612345');
});

test('includes country-code and separator variants for legacy matching', () => {
  const taipei = getTaiwanPhoneVariants('02-2345-6789');
  expect(taipei).toEqual(expect.arrayContaining(['0223456789', '+886223456789', '886223456789', '02-2345-6789']));

  const mobile = getTaiwanPhoneVariants('0912345678');
  expect(mobile).toEqual(expect.arrayContaining(['+886912345678', '0912-345-678']));
});
