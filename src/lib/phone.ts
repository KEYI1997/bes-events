/**
 * Taiwan phone numbers are stored and compared in a local, digits-only form.
 * This supports both mobile and landline numbers; validation belongs to the
 * form that collects the number, not to cross-system matching.
 */
export function normalizeTaiwanPhone(phone?: string | null): string {
  let normalized = String(phone || '').trim().replace(/[\s\-().]/g, '');

  if (normalized.startsWith('+886')) normalized = `0${normalized.slice(4)}`;
  else if (normalized.startsWith('00886')) normalized = `0${normalized.slice(5)}`;
  else if (normalized.startsWith('886')) normalized = `0${normalized.slice(3)}`;

  return normalized;
}

/**
 * Return canonical and common historical representations for an equality
 * lookup. Legacy records may contain country codes or visual separators.
 */
export function getTaiwanPhoneVariants(phone?: string | null): string[] {
  const raw = String(phone || '').trim();
  const normalized = normalizeTaiwanPhone(raw);
  const variants = new Set<string>([raw, normalized]);

  if (!/^0\d{7,11}$/.test(normalized)) {
    return [...variants].filter(Boolean);
  }

  variants.add(`+886${normalized.slice(1)}`);
  variants.add(`886${normalized.slice(1)}`);
  variants.add(`00886${normalized.slice(1)}`);

  // Mobile: 0912-345-678 and 0912-345678 are common historical formats.
  if (/^09\d{8}$/.test(normalized)) {
    const prefix = normalized.slice(0, 4);
    const rest = normalized.slice(4);
    variants.add(`${prefix}-${rest}`);
    variants.add(`${prefix}-${rest.slice(0, 3)}-${rest.slice(3)}`);
    variants.add(`${prefix} ${rest.slice(0, 3)} ${rest.slice(3)}`);
  }

  // Landlines use a two-digit Taipei area code or three/four-digit codes
  // elsewhere (including outlying islands). Generate separator variants
  // only for matching legacy data; no mobile-only assumption is made here.
  const prefixLengths = normalized.startsWith('02') ? [2] : [3, 4];
  for (const prefixLength of prefixLengths) {
    if (normalized.length <= prefixLength + 4) continue;
    const prefix = normalized.slice(0, prefixLength);
    const rest = normalized.slice(prefixLength);
    variants.add(`${prefix}-${rest}`);
    for (const splitLength of [3, 4]) {
      if (rest.length > splitLength) {
        variants.add(`${prefix}-${rest.slice(0, splitLength)}-${rest.slice(splitLength)}`);
        variants.add(`${prefix} ${rest.slice(0, splitLength)} ${rest.slice(splitLength)}`);
      }
    }
  }

  return [...variants].filter(Boolean);
}
