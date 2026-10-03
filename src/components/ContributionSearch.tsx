'use client';

import { useMemo, useState } from 'react';
import type { ContributionStatus, SearchIndexItem } from '@/lib/types';
import AxisChip from '@/components/AxisChip';
import PatchTable from '@/components/PatchTable';
import YearSelector from '@/components/YearSelector';
import { DEFAULT_YEAR, filterByYear, getAvailableYears } from '@/lib/years';

type StatusFilter = 'all' | ContributionStatus;
type Axis = 'module' | 'kind';

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'in review', label: 'In Review' },
  { value: 'merged', label: 'Merged' },
  { value: 'abandoned', label: 'Abandoned' },
];

export default function ContributionSearch({ items }: { items: SearchIndexItem[] }) {
  const [query, setQuery] = useState('');
  const [moduleQuery, setModuleQuery] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [selectedKinds, setSelectedKinds] = useState<string[]>([]);
  const years = useMemo(() => getAvailableYears(items), [items]);
  const [year, setYear] = useState(DEFAULT_YEAR);

  const modules = useMemo(
    () => [...new Set(items.map((item) => item.module).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
    [items]
  );
  const kinds = useMemo(
    () => [...new Set(items.map((item) => item.kind).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
    [items]
  );
  const visibleModules = useMemo(() => {
    const normalizedQuery = moduleQuery.trim().toLowerCase();
    return normalizedQuery
      ? modules.filter((module) => module.toLowerCase().includes(normalizedQuery))
      : modules;
  }, [moduleQuery, modules]);

  const toggleAxisValue = (axis: Axis, value: string) => {
    const setSelected = axis === 'module' ? setSelectedModules : setSelectedKinds;
    setSelected((previous) =>
      previous.includes(value) ? previous.filter((entry) => entry !== value) : [...previous, value]
    );
  };

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return filterByYear(items, year).filter((item) => {
      if (status !== 'all' && item.status !== status) return false;
      if (selectedModules.length > 0 && !selectedModules.includes(item.module)) return false;
      if (selectedKinds.length > 0 && !selectedKinds.includes(item.kind)) return false;
      if (normalizedQuery) {
        const haystack = [
          item.slug,
          item.title,
          item.author,
          item.excerpt,
          item.module,
          item.kind,
          ...item.keywords,
          ...item.labels,
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(normalizedQuery)) return false;
      }
      return true;
    });
  }, [items, query, selectedKinds, selectedModules, status, year]);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="검색..."
          aria-label="아카이브 검색"
          className="w-full rounded-xl border border-outline bg-surface px-4 py-2.5 text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:outline-none"
        />

        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-wrap gap-2" role="group" aria-label="상태 선택">
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
          <YearSelector years={years} value={year} onChange={setYear} />
        </div>

        <details open className="rounded-xl border border-outline bg-surface">
          <summary className="cursor-pointer px-4 py-2 font-medium text-on-surface">
            모듈 및 종류 필터
            {(selectedModules.length > 0 || selectedKinds.length > 0) && (
              <span className="ml-2 text-sm text-on-surface-variant">
                ({selectedModules.length + selectedKinds.length}개 선택)
              </span>
            )}
          </summary>
          <div className="flex flex-col gap-4 border-t border-outline p-4">
            <section aria-label="모듈 필터" className="space-y-2">
              <label htmlFor="module-filter-search" className="block text-sm font-medium">
                모듈 옵션 검색
              </label>
              <input
                id="module-filter-search"
                type="search"
                value={moduleQuery}
                onChange={(event) => setModuleQuery(event.target.value)}
                aria-label="모듈 옵션 검색"
                placeholder="모듈 찾기..."
                className="w-full rounded-lg border border-outline bg-background px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:outline-none md:max-w-sm"
              />
              <div className="flex flex-wrap gap-2" role="group" aria-label="모듈">
                {visibleModules.map((module) => (
                  <AxisChip
                    key={module}
                    axis="module"
                    value={module}
                    selected={selectedModules.includes(module)}
                    onClick={() => toggleAxisValue('module', module)}
                  />
                ))}
                {visibleModules.length === 0 && (
                  <span className="text-sm text-on-surface-variant">일치하는 모듈이 없습니다.</span>
                )}
              </div>
            </section>

            <section aria-label="종류 필터" className="space-y-2">
              <h2 className="text-sm font-medium">종류</h2>
              <div className="flex flex-wrap gap-2" role="group" aria-label="종류">
                {kinds.map((kind) => (
                  <AxisChip
                    key={kind}
                    axis="kind"
                    value={kind}
                    selected={selectedKinds.includes(kind)}
                    onClick={() => toggleAxisValue('kind', kind)}
                  />
                ))}
              </div>
            </section>
          </div>
        </details>
      </div>

      {filtered.length > 0 ? (
        <PatchTable items={filtered} />
      ) : (
        <p className="py-12 text-center text-on-surface-variant">검색 결과가 없습니다.</p>
      )}
    </div>
  );
}
