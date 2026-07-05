'use client';

import { useMemo, useState } from 'react';
import type { ContributionStatus, SearchIndexItem } from '@/lib/types';
import ContributionCard from '@/components/ContributionCard';
import YearSelector from '@/components/YearSelector';
import {
  filterByYear,
  getAvailableYears,
  getDataYears,
  resolveInitialYear,
} from '@/lib/years';

type StatusFilter = 'all' | ContributionStatus;

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'in review', label: 'In Review' },
  { value: 'merged', label: 'Merged' },
  { value: 'draft', label: 'Draft' },
];

export default function ContributionSearch({ items }: { items: SearchIndexItem[] }) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const years = useMemo(() => getAvailableYears(items), [items]);
  const [year, setYear] = useState(() => resolveInitialYear(getDataYears(items)));

  const allLabels = useMemo(() => {
    const set = new Set<string>();
    for (const item of items) {
      for (const label of item.labels) set.add(label);
    }
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [items]);

  const toggleLabel = (label: string) => {
    setSelectedLabels((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return filterByYear(items, year).filter((item) => {
      if (status !== 'all' && item.status !== status) return false;
      if (selectedLabels.length > 0 && !selectedLabels.every((l) => item.labels.includes(l))) {
        return false;
      }
      if (q) {
        const haystack = [item.title, item.author, item.excerpt, ...item.labels]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [items, query, status, selectedLabels, year]);

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3">
        <YearSelector years={years} value={year} onChange={setYear} />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="검색..."
          aria-label="컨트리뷰션 검색"
          className="w-full rounded-xl border border-outline bg-surface px-4 py-2.5 text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:outline-none"
        />

        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((filter) => {
            const active = status === filter.value;
            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => setStatus(filter.value)}
                aria-pressed={active}
                className={`rounded-full px-3 py-1 text-sm transition-colors ${
                  active
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-variant text-on-surface-variant hover:bg-primary-container'
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        {allLabels.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {allLabels.map((label) => {
              const active = selectedLabels.includes(label);
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => toggleLabel(label)}
                  aria-pressed={active}
                  className={`rounded-full px-2 py-1 text-xs transition-colors ${
                    active
                      ? 'bg-primary text-on-primary'
                      : 'bg-primary-container text-primary hover:opacity-80'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {filtered.length > 0 ? (
        <div className="grid gap-4">
          {filtered.map((item) => (
            <ContributionCard key={item.slug} contribution={item} />
          ))}
        </div>
      ) : (
        <p className="py-12 text-center text-on-surface-variant">검색 결과가 없습니다.</p>
      )}
    </div>
  );
}
