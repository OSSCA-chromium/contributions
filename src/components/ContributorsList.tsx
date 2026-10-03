'use client';

import { useMemo, useState } from 'react';
import type { ContributorSummary } from '@/lib/types';
import { CONTRIBUTION_STATUS_LABELS } from '@/lib/status-labels';
import ContributorRow from '@/components/ContributorRow';

export type SortKey = 'latest' | 'total' | 'merged' | 'inReview' | 'abandoned';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'latest', label: '최신' },
  { key: 'total', label: '기여 수' },
  { key: 'merged', label: CONTRIBUTION_STATUS_LABELS.merged },
  { key: 'inReview', label: CONTRIBUTION_STATUS_LABELS['in review'] },
  { key: 'abandoned', label: CONTRIBUTION_STATUS_LABELS.abandoned },
];

// Sort a copy of the summaries by the chosen key, always descending.
function sortSummaries(
  summaries: ContributorSummary[],
  key: SortKey,
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
  const [query, setQuery] = useState('');
  const sorted = useMemo(() => {
    const search = query.trim().toLowerCase();
    const filtered = summaries.filter((summary) =>
      summary.username.toLowerCase().includes(search),
    );
    return sortSummaries(filtered, sortKey);
  }, [summaries, sortKey, query]);

  return (
    <>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="relative sm:w-80">
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-on-surface-variant"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          >
            <circle cx="10.5" cy="10.5" r="6.5" />
            <path d="m16 16 4 4" />
          </svg>
          <input
            type="search"
            aria-label="기여자 검색"
            placeholder="GitHub 이름으로 검색"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full rounded-xl border border-mline bg-background py-2.5 pr-3 pl-11 text-sm text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:outline-2 focus:outline-primary/20"
          />
        </div>
        <div className="flex flex-1 items-center justify-between gap-4">
          <p role="status" className="text-sm text-on-surface-variant">
            {query.trim()
              ? `${sorted.length} / ${summaries.length}명`
              : `전체 ${summaries.length}명`}
          </p>
          <label className="inline-flex items-center gap-2 text-sm text-on-surface-variant">
            정렬
            <select
              aria-label="정렬 기준"
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="rounded-xl border border-mline bg-background px-3 py-2.5 text-on-surface focus:border-primary focus:outline-2 focus:outline-primary/20"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.key} value={o.key}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
      {sorted.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {sorted.map((summary) => (
            <ContributorRow key={summary.username} summary={summary} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-mline bg-m1 px-6 py-14 text-center">
          <p className="font-medium text-on-surface">검색 결과가 없습니다.</p>
          <p className="mt-2 text-sm text-on-surface-variant">
            다른 GitHub 이름으로 검색해 보세요.
          </p>
          <button
            type="button"
            onClick={() => setQuery('')}
            className="mt-5 rounded-full bg-primary-weak px-4 py-2 text-sm font-medium text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            검색 초기화
          </button>
        </div>
      )}
    </>
  );
}
