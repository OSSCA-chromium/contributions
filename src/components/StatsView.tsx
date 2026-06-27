'use client';

import { useMemo } from 'react';
import type { SearchIndexItem } from '@/lib/types';
import { computeStats } from '@/lib/stats';
import { useYear } from '@/components/YearProvider';
import { filterByYear } from '@/lib/years';
import StatsCharts from '@/components/StatsCharts';

export default function StatsView({ items }: { items: SearchIndexItem[] }) {
  const { year } = useYear();
  const stats = useMemo(() => computeStats(filterByYear(items, year)), [items, year]);

  if (stats.total === 0) {
    return <p className="text-on-surface">표시할 데이터가 없습니다.</p>;
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-surface border border-outline rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-on-surface">{stats.total}</div>
          <div className="text-sm text-on-surface-variant">총 컨트리뷰션</div>
        </div>
        <div className="bg-surface border border-outline rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-success">
            {Math.round(stats.mergedRatio * 100)}%
          </div>
          <div className="text-sm text-on-surface-variant">Merged 비율</div>
        </div>
        <div className="bg-surface border border-outline rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-info">{stats.contributorCount}</div>
          <div className="text-sm text-on-surface-variant">기여자 수</div>
        </div>
      </div>
      <StatsCharts stats={stats} />
    </>
  );
}
