import type { Meeting, MeetingType } from '@/lib/types';

// Point-event(type) 공통 표기: 목록/상세 뱃지, 달력 원, 표시 라벨이
// 컴포넌트마다 어긋나지 않도록 여기서 한 번만 정의한다.
export const TYPE_LABELS: Record<MeetingType, string> = {
  meeting: '모임',
  milestone: '주요 일정',
  deadline: '마감',
};

export const TYPE_BADGE: Record<MeetingType, string> = {
  meeting: 'bg-warning/15 text-warning',
  milestone: 'bg-primary/15 text-primary',
  deadline: 'bg-error/15 text-error',
};

export const TYPE_CIRCLE: Record<MeetingType, string> = {
  meeting: 'bg-warning/30',
  milestone: 'bg-primary/30',
  deadline: 'bg-error/30',
};

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

// Map a badge label (e.g. "Challenges", "Masters") to the color of the period
// that owns it, so point events sharing a badge match the period's color.
export function badgeColorByLabel(meetings: Meeting[]): Map<string, PeriodColor> {
  const bySlug = periodColorMap(meetings);
  const map = new Map<string, PeriodColor>();
  for (const m of meetings) {
    if (m.endDate && m.badge) {
      const color = bySlug.get(m.slug);
      if (color) map.set(m.badge, color);
    }
  }
  return map;
}
