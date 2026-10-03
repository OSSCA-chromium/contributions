'use client';

import { useMemo, useState } from 'react';
import type { ContributorSummary } from '@/lib/types';
import { CONTRIBUTION_STATUS_LABELS } from '@/lib/status-labels';
import ContributorRow from '@/components/ContributorRow';

export type SortKey = 'latest' | 'total' | 'merged' | 'inReview' | 'abandoned';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'latest', label: '최신' },
  { key: 'total', label: '총 기여' },
  { key: 'merged', label: CONTRIBUTION_STATUS_LABELS.merged },
  { key: 'inReview', label: CONTRIBUTION_STATUS_LABELS['in review'] },
  { key: 'abandoned', label: CONTRIBUTION_STATUS_LABELS.abandoned },
];

// Sort a copy of the summaries by the chosen key, always descending.
function sortSummaries(
  summaries: ContributorSummary[],
  key: SortKey
): ContributorSummary[] {
  const copy = [...summaries];
  switch (key) {
    case 'latest':
      return copy.sort((a, b) => b.lastActive.localeCompare(a.lastActive));
    case 'total':
      return copy.sort((a, b) => b.total - a.total);
    case 'merged':
      return copy.sort((a, b) => b.merged - a.merged);
    case 'inReview':
      return copy.sort((a, b) => b.inReview - a.inReview);
    case 'abandoned':
      return copy.sort((a, b) => b.abandoned - a.abandoned);
  }
}

export default function ContributorsList({
  summaries,
}: {
  summaries: ContributorSummary[];
}) {
  const [sortKey, setSortKey] = useState<SortKey>('latest');
  const sorted = useMemo(
    () => sortSummaries(summaries, sortKey),
    [summaries, sortKey]
  );

  return (
    <>
      <div className="flex justify-end mb-4">
        <label className="inline-flex items-center gap-2 text-sm text-on-surface-variant">
          정렬
          <select
            aria-label="정렬 기준"
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="bg-background border border-mline rounded-full px-3 py-1 text-on-surface"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.key} value={o.key}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {sorted.map((summary) => (
          <ContributorRow key={summary.username} summary={summary} />
        ))}
      </div>
    </>
  );
}
