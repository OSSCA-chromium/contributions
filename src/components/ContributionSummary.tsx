import type { SearchIndexItem, Stats } from '@/lib/types';
import SummaryMetrics from '@/components/SummaryMetrics';

export default function ContributionSummary({ items, stats }: {
  items: SearchIndexItem[];
  stats: Stats;
}) {
  const merged = stats.byStatus.find(({ status }) => status === 'merged')?.count ?? 0;
  const inReview = stats.byStatus.find(({ status }) => status === 'in review')?.count ?? 0;
  const projectCount = new Set(items.map(item => item.repo?.trim() || 'chromium/src')).size;
  const cells = [
    { value: stats.total, label: '총 컨트리뷰션' },
    { value: `${Math.round(stats.mergedRatio * 100)}%`, label: 'Merged 비율' },
    { value: merged, label: 'Merge 완료' },
    { value: inReview, label: '리뷰 중' },
    { value: stats.contributorCount, label: '기여자 수' },
    { value: projectCount, label: '프로젝트 수', detail: `${stats.moduleCount}개 모듈에 기여` },
  ];

  return <SummaryMetrics cells={cells} />;
}
