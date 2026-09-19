const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function getTaiwanToday(now = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const value = Object.fromEntries(parts.filter(part => part.type !== 'literal').map(part => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

export function getTaiwanDateMin(startDate?: string): string {
  const today = getTaiwanToday();
  return startDate && DATE_ONLY_PATTERN.test(startDate) && startDate > today ? startDate : today;
}

export function isDateBeforeTaiwanToday(value: unknown): boolean {
  return typeof value === 'string' && DATE_ONLY_PATTERN.test(value) && value < getTaiwanToday();
}
