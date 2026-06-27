export const DEFAULT_YEAR = '2026';

// Derive YYYY from a date value (string or Date). Returns 'unknown' when not parseable.
export function getYear(date: unknown): string {
  if (typeof date === 'string') {
    const y = date.slice(0, 4);
    return /^\d{4}$/.test(y) ? y : 'unknown';
  }
  const d = new Date(date as string | number | Date);
  if (Number.isNaN(d.getTime())) return 'unknown';
  return String(d.getFullYear());
}

// Years present in the data plus DEFAULT_YEAR (always), in descending order.
export function getAvailableYears(items: { date: unknown }[]): string[] {
  const set = new Set<string>();
  for (const item of items) {
    const y = getYear(item.date);
    if (y !== 'unknown') set.add(y);
  }
  set.add(DEFAULT_YEAR);
  return [...set].sort((a, b) => b.localeCompare(a));
}

// When year === 'all' return everything, otherwise only the matching year.
export function filterByYear<T extends { date: unknown }>(items: T[], year: string): T[] {
  if (year === 'all') return items;
  return items.filter((item) => getYear(item.date) === year);
}
