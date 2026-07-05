'use client';

import { useMemo, useState } from 'react';
import type { SearchIndexItem } from '@/lib/types';
import { computeStats } from '@/lib/stats';
import {
  filterByYear,
  getAvailableYears,
  getDataYears,
  resolveInitialYear,
} from '@/lib/years';
import StatsCharts from '@/components/StatsCharts';
import YearSelector from '@/components/YearSelector';

export default function StatsView({ items }: { items: SearchIndexItem[] }) {
  const years = useMemo(() => getAvailableYears(items), [items]);
  const [year, setYear] = useState(() => resolveInitialYear(getDataYears(items)));
  const stats = useMemo(() => computeStats(filterByYear(items, year)), [items, year]);

  return (
    <>
      <div className="mb-6">
        <YearSelector years={years} value={year} onChange={setYear} />
      </div>

      {stats.total === 0 ? (
        <p className="text-on-surface">표시할 데이터가 없습니다.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-surface border border-outline rounded-3xl p-6 text-center">
              <div className="font-display text-4xl font-semibold text-primary">{stats.total}</div>
              <div className="text-sm text-on-surface-variant">총 컨트리뷰션</div>
            </div>
            <div className="bg-surface border border-outline rounded-3xl p-6 text-center">
              <div className="font-display text-4xl font-semibold text-success">
                {Math.round(stats.mergedRatio * 100)}%
              </div>
              <div className="text-sm text-on-surface-variant">Merged 비율</div>
            </div>
            <div className="bg-surface border border-outline rounded-3xl p-6 text-center">
              <div className="font-display text-4xl font-semibold text-info">{stats.contributorCount}</div>
              <div className="text-sm text-on-surface-variant">기여자 수</div>
            </div>
          </div>
          <StatsCharts stats={stats} />
        </>
      )}
    </>
  );
}
