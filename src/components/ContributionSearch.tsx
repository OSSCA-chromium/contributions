'use client';

import { useMemo, useState } from 'react';
import type { SearchIndexItem } from '@/lib/types';
import PatchTable from '@/components/PatchTable';
import { DEFAULT_YEAR, filterByYear, getAvailableYears } from '@/lib/years';

// Reset sentinel shared by every axis. `contributions.ts` trims the axes and
// `axisOptions` drops empties, so '' can never collide with a real value.
const ALL = '';

const LABEL_CLASS =
  'w-[52px] flex-none text-[11.5px] font-semibold uppercase tracking-[0.05em] text-on-surface-variant max-[620px]:w-full';

// Pills run most-used first (ties by name) — the order the mockup shows for
// this data (docs, base, … / fix, refactor, …) and the one that keeps the long
// module row useful once it wraps.
function axisOptions(
  items: SearchIndexItem[],
  key: 'module' | 'kind' | 'status'
): string[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    const value = item[key];
    if (value) counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([value]) => value);
}

function FilterRow({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  // eslint-disable-next-line no-unused-vars
  onChange: (value: string) => void;
}) {
  return (
    <div
      className="flex flex-wrap items-center gap-2"
      role="group"
      aria-label={`${label} 선택`}
    >
      <span className={LABEL_CLASS}>{label}</span>
      {[ALL, ...options].map((option) => {
        const active = value === option;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            aria-pressed={active}
            className={`rounded-full border px-3.5 py-1.5 text-[13px] transition-colors ${
              active
                ? 'border-transparent bg-primary-weak font-semibold text-primary'
                : 'border-mline bg-background text-on-surface-variant hover:bg-m2'
            }`}
          >
            {/* Decorative — aria-pressed already carries the state, so the
                accessible name stays the bare value. */}
            {active && <span aria-hidden="true">{'✓ '}</span>}
            {option === ALL ? '전체' : option}
          </button>
        );
      })}
    </div>
  );
}

export default function ContributionSearch({ items }: { items: SearchIndexItem[] }) {
  const [query, setQuery] = useState('');
  const [year, setYear] = useState(DEFAULT_YEAR);
  // `module` would shadow the CJS module-scope identifier once transpiled.
  const [moduleAxis, setModuleAxis] = useState(ALL);
  const [kind, setKind] = useState(ALL);
  const [status, setStatus] = useState(ALL);

  const years = useMemo(() => getAvailableYears(items), [items]);
  // Options come from the whole index, not the current result set, so the pill
  // rows stay put instead of reshuffling under the pointer on every click.
  const modules = useMemo(() => axisOptions(items, 'module'), [items]);
  const kinds = useMemo(() => axisOptions(items, 'kind'), [items]);
  const statuses = useMemo(() => axisOptions(items, 'status'), [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return filterByYear(items, year || 'all').filter((item) => {
      if (moduleAxis && item.module !== moduleAxis) return false;
      if (kind && item.kind !== kind) return false;
      if (status && item.status !== status) return false;
      if (q) {
        const haystack = [
          item.title,
          item.author,
          item.slug,
          item.excerpt,
          item.module,
          item.kind,
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [items, query, year, moduleAxis, kind, status]);

  return (
    <div>
      <p
        role="status"
        className="mb-3.5 text-[13px] tabular-nums text-on-surface-variant"
      >
        전체 {items.length}건 중 <b>{filtered.length}건</b> 표시
      </p>

      <div className="mb-3.5 grid gap-2.5 rounded-[20px] bg-m1 px-[18px] py-4">
        <FilterRow label="연도" options={years} value={year} onChange={setYear} />
        <FilterRow
          label="모듈"
          options={modules}
          value={moduleAxis}
          onChange={setModuleAxis}
        />
        <FilterRow label="종류" options={kinds} value={kind} onChange={setKind} />
        <FilterRow label="상태" options={statuses} value={status} onChange={setStatus} />

        <div className="flex flex-wrap items-center gap-2">
          <span className={LABEL_CLASS}>검색</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="제목·작성자·리뷰 ID"
            aria-label="검색"
            className="min-w-[180px] flex-1 rounded-full border border-mline bg-background px-4 py-2 text-[13.5px] text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:outline-none max-[620px]:w-full max-[620px]:flex-auto"
          />
        </div>
      </div>

      {filtered.length > 0 ? (
        <PatchTable items={filtered} />
      ) : (
        <p className="py-12 text-center text-on-surface-variant">검색 결과가 없습니다.</p>
      )}
    </div>
  );
}
