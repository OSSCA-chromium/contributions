import { getYear } from '@/lib/years';

export default function YearBadge({ date }: { date: unknown }) {
  const year = getYear(date);
  if (year === 'unknown') return null;
  return (
    <span className="rounded-full bg-surface-variant px-2 py-0.5 text-xs text-on-surface-variant">
      {year}
    </span>
  );
}
