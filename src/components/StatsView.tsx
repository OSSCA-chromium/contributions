'use client';

import { useMemo, useState } from 'react';
import type { SearchIndexItem } from '@/lib/types';
import { computeStats } from '@/lib/stats';
import { DEFAULT_YEAR, filterByYear, getAvailableYears } from '@/lib/years';
import StatsCharts from '@/components/StatsCharts';
import ContributionGraph from '@/components/ContributionGraph';
import SummaryMetrics from '@/components/SummaryMetrics';
import YearSelector from '@/components/YearSelector';

export default function StatsView({ items }: { items: SearchIndexItem[] }) {
  const years = useMemo(() => getAvailableYears(items), [items]);
  const [year, setYear] = useState(DEFAULT_YEAR);
  const filtered = useMemo(() => filterByYear(items, year), [items, year]);
  const stats = useMemo(() => computeStats(filtered), [filtered]);
  const projectCount = new Set(filtered.map(item => item.repo?.trim() || 'chromium/src')).size;
  const strip = [
    { value: stats.total, label: '총 컨트리뷰션' },
    { value: `${Math.round(stats.mergedRatio * 100)}%`, label: 'Merged 비율' },
    { value: stats.contributorCount, label: '기여자 수' },
    { value: projectCount, label: '프로젝트 수', detail: `${stats.moduleCount}개 모듈에 기여` },
  ];

  return (
    <>
      <div className="mb-6">
        <YearSelector years={years} value={year} onChange={setYear} />
      </div>

      {stats.total === 0 ? (
        <p className="text-on-surface">표시할 데이터가 없습니다.</p>
      ) : (
        <>
          <div className="mb-6"><SummaryMetrics cells={strip} /></div>
          <div className="mb-6"><ContributionGraph items={filtered} /></div>
          <StatsCharts stats={stats} />
        </>
      )}
    </>
  );
}
