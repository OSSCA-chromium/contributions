'use client';

import { useMemo, useState } from 'react';
import type { Contribution } from '@/lib/types';
import { DEFAULT_YEAR, filterByYear, getAvailableYears } from '@/lib/years';
import PatchTable from '@/components/PatchTable';
import YearSelector from '@/components/YearSelector';

// Accent dot color per strip cell — same c1/c2/c3 scale as the home strip,
// just three cells instead of four (no c4).
const STRIP_ACCENTS = ['bg-c1', 'bg-c2', 'bg-c3'];

// A 3-col strip only needs one fold point: drop straight to 1 col on narrow
// screens (home's 4-col strip needs an intermediate 2-col step; 3 doesn't).
const STRIP_BORDERS = [
  '',
  'border-l border-mline max-[480px]:border-l-0 max-[480px]:border-t',
  'border-l border-mline max-[480px]:border-l-0 max-[480px]:border-t',
];

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
  const yearLabel = year === 'all' ? '전체' : year;
  const strip = [
    { value: total, label: '총 기여' },
    { value: merged, label: 'Merged' },
    { value: inReview, label: 'In Review' },
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
          <div className="mb-8 grid grid-cols-3 overflow-hidden rounded-2xl bg-m1 max-[480px]:grid-cols-1">
            {strip.map((cell, i) => (
              <div key={cell.label} className={`px-[18px] py-4 ${STRIP_BORDERS[i]}`}>
                <span
                  aria-hidden="true"
                  className={`mt-[1.5px] mb-[11px] ml-[1.5px] block h-[9px] w-[9px] rounded-full ring-[1.5px] ring-c1 ${STRIP_ACCENTS[i]}`}
                />
                <b className="block text-[27px] font-bold leading-[1.15] tracking-[-0.03em] tabular-nums">
                  {cell.value}
                </b>
                <span className="text-[12.5px] text-on-surface-variant">{cell.label}</span>
              </div>
            ))}
          </div>

          <h2 className="mb-3.5 text-[12px] font-semibold uppercase tracking-[0.09em] text-on-surface-variant">
            컨트리뷰션
          </h2>
          <PatchTable items={filtered} />
        </>
      )}
    </>
  );
}
