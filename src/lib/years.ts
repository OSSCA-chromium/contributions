export const DEFAULT_YEAR = '2026';

// KST (UTC+9) offset in milliseconds. Frontmatter date-only values are parsed
// as UTC midnight by gray-matter; we classify dates in Seoul time so that
// e.g. 2026-01-01 stays in 2026 regardless of the runtime timezone.
export const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

// Derive YYYY from a date value (string or Date). Returns 'unknown' when not parseable.
export function getYear(date: unknown): string {
  if (typeof date === 'string') {
    const y = date.slice(0, 4);
    return /^\d{4}$/.test(y) ? y : 'unknown';
  }
  const d = new Date(date as string | number | Date);
  if (Number.isNaN(d.getTime())) return 'unknown';
  const kst = new Date(d.getTime() + KST_OFFSET_MS);
  return String(kst.getUTCFullYear());
}

// Years actually present in the data, in descending order (DEFAULT_YEAR not forced).
export function getDataYears(items: { date: unknown }[]): string[] {
  const set = new Set<string>();
  for (const item of items) {
    const y = getYear(item.date);
    if (y !== 'unknown') set.add(y);
  }
  return [...set].sort((a, b) => b.localeCompare(a));
}

// Years present in the data plus DEFAULT_YEAR (always), in descending order.
export function getAvailableYears(items: { date: unknown }[]): string[] {
  const set = new Set<string>(getDataYears(items));
  set.add(DEFAULT_YEAR);
  return [...set].sort((a, b) => b.localeCompare(a));
}

// Initial selected year: prefer DEFAULT_YEAR when it has data, otherwise the
// newest year that actually has data, falling back to DEFAULT_YEAR when empty.
export function resolveInitialYear(dataYears: string[]): string {
  if (dataYears.includes(DEFAULT_YEAR)) return DEFAULT_YEAR;
  return dataYears[0] ?? DEFAULT_YEAR;
}

// When year === 'all' return everything, otherwise only the matching year.
export function filterByYear<T extends { date: unknown }>(items: T[], year: string): T[] {
  if (year === 'all') return items;
  return items.filter((item) => getYear(item.date) === year);
}
