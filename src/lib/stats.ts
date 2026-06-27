import type { Contribution, Stats } from '@/lib/types';

// 날짜 값(문자열 또는 Date 객체)을 YYYY-MM 형태로 변환
function toMonth(date: unknown): string {
  if (typeof date === 'string') return date.slice(0, 7);
  const d = new Date(date as string | number | Date);
  if (Number.isNaN(d.getTime())) return 'unknown';
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${d.getFullYear()}-${month}`;
}

// 컨트리뷰션 목록으로부터 통계(총계/상태/월별/기여자/머지비율)를 집계
export function computeStats(contributions: Contribution[]): Stats {
  const total = contributions.length;
  const statusMap = new Map<string, number>();
  const monthMap = new Map<string, number>();
  const contribMap = new Map<string, number>();
  let merged = 0;

  for (const c of contributions) {
    const status = c.status ?? 'unknown';
    statusMap.set(status, (statusMap.get(status) ?? 0) + 1);
    if (c.status === 'merged') merged++;
    // gray-matter가 frontmatter 날짜를 Date 객체로 파싱하는 경우가 있어 YYYY-MM으로 정규화
    const month = toMonth(c.date);
    monthMap.set(month, (monthMap.get(month) ?? 0) + 1);
    contribMap.set(c.author, (contribMap.get(c.author) ?? 0) + 1);
  }

  return {
    total,
    byStatus: [...statusMap].map(([status, count]) => ({ status, count })),
    byMonth: [...monthMap]
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month)),
    topContributors: [...contribMap]
      .map(([username, count]) => ({ username, count }))
      .sort((a, b) => b.count - a.count),
    contributorCount: contribMap.size,
    mergedRatio: total ? merged / total : 0,
  };
}
