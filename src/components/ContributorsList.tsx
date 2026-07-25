'use client';

import { useMemo, useState } from 'react';
import type { ContributorSummary } from '@/lib/types';
import ContributorRow from '@/components/ContributorRow';

export type SortKey = 'latest' | 'total' | 'merged' | 'inReview';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'latest', label: '최신' },
  { key: 'total', label: '총 기여' },
  { key: 'merged', label: 'Merged' },
  { key: 'inReview', label: 'In review' },
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
            className="bg-surface border border-outline rounded-xl px-2 py-1 text-on-surface"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.key} value={o.key}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="flex flex-col gap-2">
        {sorted.map((summary) => (
          <ContributorRow key={summary.username} summary={summary} />
        ))}
      </div>
    </>
  );
}
