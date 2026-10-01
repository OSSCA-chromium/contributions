import type { Contribution, Stats } from '@/lib/types';
import { KST_OFFSET_MS } from '@/lib/years';

// 날짜 값(문자열 또는 Date 객체)을 YYYY-MM 형태로 변환 (Date는 KST 기준)
function toMonth(date: unknown): string {
  if (typeof date === 'string') return date.slice(0, 7);
  const d = new Date(date as string | number | Date);
  if (Number.isNaN(d.getTime())) return 'unknown';
  const kst = new Date(d.getTime() + KST_OFFSET_MS);
  const month = String(kst.getUTCMonth() + 1).padStart(2, '0');
  return `${kst.getUTCFullYear()}-${month}`;
}

// 컨트리뷰션 목록으로부터 통계(총계/상태/월별/기여자/머지비율)를 집계
export function computeStats(
  contributions: (Pick<Contribution, 'author' | 'status'> & Partial<Pick<Contribution, 'module'>> & {
    date: string | Date;
  })[]
): Stats {
  const total = contributions.length;
  const statusMap = new Map<string, number>();
  const monthMap = new Map<string, number>();
  const contribMap = new Map<string, { count: number; statuses: Map<string, number> }>();
  const moduleMap = new Map<string, number>();
  let merged = 0;

  for (const c of contributions) {
    const status = c.status ?? 'unknown';
    statusMap.set(status, (statusMap.get(status) ?? 0) + 1);
    if (c.status === 'merged') merged++;
    // gray-matter가 frontmatter 날짜를 Date 객체로 파싱하는 경우가 있어 YYYY-MM으로 정규화
    const month = toMonth(c.date);
    monthMap.set(month, (monthMap.get(month) ?? 0) + 1);
    const contributor = contribMap.get(c.author) ?? { count: 0, statuses: new Map<string, number>() };
    contributor.count++;
    contributor.statuses.set(status, (contributor.statuses.get(status) ?? 0) + 1);
    contribMap.set(c.author, contributor);
    if (c.module) moduleMap.set(c.module, (moduleMap.get(c.module) ?? 0) + 1);
  }

  return {
    total,
    byStatus: [...statusMap].map(([status, count]) => ({ status, count })),
    byMonth: [...monthMap]
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month)),
    topContributors: [...contribMap]
      .sort(([, a], [, b]) =>
        b.count - a.count ||
        (b.statuses.get('merged') ?? 0) - (a.statuses.get('merged') ?? 0) ||
        (b.statuses.get('in review') ?? 0) - (a.statuses.get('in review') ?? 0) ||
        (b.statuses.get('abandoned') ?? 0) - (a.statuses.get('abandoned') ?? 0)
      )
      .map(([username, contributor]) => ({
        username,
        count: contributor.count,
        byStatus: [...contributor.statuses].map(([status, count]) => ({ status, count })),
      })),
    contributorCount: contribMap.size,
    mergedRatio: total ? merged / total : 0,
    moduleCount: moduleMap.size,
    byModule: [...moduleMap]
      .map(([module, count]) => ({ module, count }))
      .sort((a, b) => b.count - a.count),
  };
}
