'use client';

import { useMemo, useState } from 'react';
import type { Contribution } from '@/lib/types';
import { CONTRIBUTION_STATUS_LABELS } from '@/lib/status-labels';
import { DEFAULT_YEAR, filterByYear, getAvailableYears } from '@/lib/years';
import ContributorAvatar from '@/components/ContributorAvatar';
import PatchTable from '@/components/PatchTable';
import SummaryMetrics from '@/components/SummaryMetrics';
import YearSelector from '@/components/YearSelector';

export default function ContributorView({
  username,
  contributions,
}: {
  username: string;
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
      <header className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">
        <div className="flex shrink-0 flex-col items-center gap-2 sm:w-28">
          <a
            href={`https://github.com/${username}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ContributorAvatar username={username} size={96} />
          </a>
          <h1 className="break-all text-center text-sm font-medium text-on-surface-variant">
            {username}
          </h1>
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-4">
            <YearSelector years={years} value={year} onChange={setYear} />
          </div>

          {total === 0 ? (
            <p className="text-on-surface-variant">
              {year === 'all' ? '등록된 활동이 없습니다.' : `${yearLabel}년 활동이 없습니다.`}
            </p>
          ) : (
            <SummaryMetrics cells={strip} />
          )}
        </div>
      </header>

      {total > 0 && (
        <>
          <h2 className="mb-3.5 section-title">
            컨트리뷰션
          </h2>
          <PatchTable items={filtered} />
        </>
      )}
    </>
  );
}
