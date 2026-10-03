'use client';

import { useMemo, useState } from 'react';
import type { SearchIndexItem } from '@/lib/types';
import { computeStats } from '@/lib/stats';
import { DEFAULT_YEAR, filterByYear, getAvailableYears } from '@/lib/years';
import { SHOW_CONTRIBUTION_GRAPH } from '@/lib/feature-flags';
import StatsCharts from '@/components/StatsCharts';
import ContributionGraph from '@/components/ContributionGraph';
import ContributionSummary from '@/components/ContributionSummary';
import YearSelector from '@/components/YearSelector';

export default function StatsView({ items }: { items: SearchIndexItem[] }) {
  const years = useMemo(() => getAvailableYears(items), [items]);
  const [year, setYear] = useState(DEFAULT_YEAR);
  const filtered = useMemo(() => filterByYear(items, year), [items, year]);
  const stats = useMemo(() => computeStats(filtered), [filtered]);

  return (
    <>
      <div className="mb-6">
        <YearSelector years={years} value={year} onChange={setYear} />
      </div>

      {stats.total === 0 ? (
        <p className="text-on-surface">표시할 데이터가 없습니다.</p>
      ) : (
        <>
          <div className="mb-6"><ContributionSummary items={filtered} stats={stats} /></div>
          {SHOW_CONTRIBUTION_GRAPH && (
            <div className="mb-6"><ContributionGraph items={filtered} /></div>
          )}
          <StatsCharts stats={stats} />
        </>
      )}
    </>
  );
}
