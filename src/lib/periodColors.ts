import type { Meeting } from '@/lib/types';

export interface PeriodColor {
  bar: string; // calendar bar background
  badge: string; // list badge background + text
}

// Palette for period (date~endDate) events, assigned in date order so the
// calendar bar and the list badge for the same period always match.
const PALETTE: PeriodColor[] = [
  { bar: 'bg-info/25', badge: 'bg-info/20 text-info' },
  { bar: 'bg-success/25', badge: 'bg-success/20 text-success' },
  { bar: 'bg-warning/25', badge: 'bg-warning/20 text-warning' },
  { bar: 'bg-primary/25', badge: 'bg-primary/20 text-primary' },
];

export function periodColorMap(meetings: Meeting[]): Map<string, PeriodColor> {
  const map = new Map<string, PeriodColor>();
  meetings
    .filter((m) => m.endDate)
    .forEach((p, i) => map.set(p.slug, PALETTE[i % PALETTE.length]));
  return map;
}
