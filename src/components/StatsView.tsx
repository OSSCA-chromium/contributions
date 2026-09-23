'use client';

import { useMemo, useState } from 'react';
import type { SearchIndexItem } from '@/lib/types';
import { computeStats } from '@/lib/stats';
import { DEFAULT_YEAR, filterByYear, getAvailableYears } from '@/lib/years';
import StatsCharts from '@/components/StatsCharts';
import YearSelector from '@/components/YearSelector';

export default function StatsView({ items }: { items: SearchIndexItem[] }) {
  const years = useMemo(() => getAvailableYears(items), [items]);
  const [year, setYear] = useState(DEFAULT_YEAR);
  const stats = useMemo(() => computeStats(filterByYear(items, year)), [items, year]);

  return (
    <>
      <div className="mb-5">
        <YearSelector years={years} value={year} onChange={setYear} />
      </div>

      {stats.total === 0 ? (
        <p className="text-on-surface">표시할 데이터가 없습니다.</p>
      ) : (
        <>
          <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-outline bg-surface p-4 text-center">
              <div className="font-display text-3xl font-semibold text-primary">{stats.total}</div>
              <div className="text-sm text-on-surface-variant">총 컨트리뷰션</div>
            </div>
            <div className="rounded-2xl border border-outline bg-surface p-4 text-center">
              <div className="font-display text-3xl font-semibold text-success">
                {Math.round(stats.mergedRatio * 100)}%
              </div>
              <div className="text-sm text-on-surface-variant">Merged 비율</div>
            </div>
            <div className="rounded-2xl border border-outline bg-surface p-4 text-center">
              <div className="font-display text-3xl font-semibold text-info">{stats.contributorCount}</div>
              <div className="text-sm text-on-surface-variant">기여자 수</div>
            </div>
          </div>
          <StatsCharts stats={stats} />
        </>
      )}
    </>
  );
}
