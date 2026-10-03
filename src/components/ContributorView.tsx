'use client';

import { useMemo, useState } from 'react';
import type { Contribution } from '@/lib/types';
import { CONTRIBUTION_STATUS_LABELS } from '@/lib/status-labels';
import { DEFAULT_YEAR, filterByYear, getAvailableYears } from '@/lib/years';
import PatchTable from '@/components/PatchTable';
import SummaryMetrics from '@/components/SummaryMetrics';
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
  const abandoned = filtered.filter((c) => c.status === 'abandoned').length;
  const yearLabel = year === 'all' ? '전체' : year;
  const strip = [
    { value: total, label: '총 기여' },
    { value: merged, label: CONTRIBUTION_STATUS_LABELS.merged },
    { value: inReview, label: CONTRIBUTION_STATUS_LABELS['in review'] },
    { value: abandoned, label: CONTRIBUTION_STATUS_LABELS.abandoned },
  ];

  return (
    <>
      <div className="mb-6">
        <YearSelector years={years} value={year} onChange={setYear} />
      </div>

      {total === 0 ? (
        <p className="text-on-surface-variant">
          {year === 'all' ? '등록된 활동이 없습니다.' : `${yearLabel}년 활동이 없습니다.`}
        </p>
      ) : (
        <>
          <div className="mb-8"><SummaryMetrics cells={strip} /></div>

          <h2 className="mb-3.5 section-title">
            컨트리뷰션
          </h2>
          <PatchTable items={filtered} />
        </>
      )}
    </>
  );
}
