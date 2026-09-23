'use client';

import { useMemo, useState } from 'react';
import type { Contribution } from '@/lib/types';
import { DEFAULT_YEAR, filterByYear, getAvailableYears } from '@/lib/years';
import ContributionCard from '@/components/ContributionCard';
import YearSelector from '@/components/YearSelector';

export default function ContributorView({
  contributions,
}: {
  contributions: Contribution[];
}) {
  const years = useMemo(() => getAvailableYears(contributions), [contributions]);
  const [year, setYear] = useState(DEFAULT_YEAR);
  const filtered = useMemo(
    () => filterByYear(contributions, year),
    [contributions, year]
  );

  const total = filtered.length;
  const merged = filtered.filter((c) => c.status === 'merged').length;
  const inReview = filtered.filter((c) => c.status === 'in review').length;
  const abandoned = filtered.filter((contribution) => contribution.status === 'abandoned').length;
  const yearLabel = year === 'all' ? '전체' : year;

  return (
    <>
      <div className="mb-6">
        <YearSelector years={years} value={year} onChange={setYear} />
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-outline bg-surface p-4 text-center">
          <div className="font-display text-2xl font-semibold text-primary">{total}</div>
          <div className="text-sm text-on-surface-variant">총 기여</div>
        </div>
        <div className="rounded-2xl border border-outline bg-surface p-4 text-center">
          <div className="font-display text-2xl font-semibold text-success">{merged}</div>
          <div className="text-sm text-on-surface-variant">Merged</div>
        </div>
        <div className="rounded-2xl border border-outline bg-surface p-4 text-center">
          <div className="font-display text-2xl font-semibold text-info">{inReview}</div>
          <div className="text-sm text-on-surface-variant">In Review</div>
        </div>
        <div className="rounded-2xl border border-outline bg-surface p-4 text-center">
          <div className="font-display text-2xl font-semibold text-amber-700 dark:text-warning">{abandoned}</div>
          <div className="text-sm text-on-surface-variant">Abandoned</div>
        </div>
      </div>

      <h2 className="mb-3 font-display text-lg font-semibold tracking-tight text-on-surface sm:text-xl">
        컨트리뷰션
      </h2>
      {total === 0 ? (
        <p className="text-on-surface-variant">
          {year === 'all' ? '등록된 활동이 없습니다.' : `${yearLabel}년 활동이 없습니다.`}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {filtered.map((contribution) => (
            <ContributionCard
              key={contribution.slug}
              contribution={contribution}
            />
          ))}
        </div>
      )}
    </>
  );
}
