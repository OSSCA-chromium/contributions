'use client';

import { useMemo, useState } from 'react';
import type { SearchIndexItem } from '@/lib/types';
import { computeStats } from '@/lib/stats';
import { DEFAULT_YEAR, filterByYear, getAvailableYears } from '@/lib/years';
import StatsCharts from '@/components/StatsCharts';
import YearSelector from '@/components/YearSelector';

// Accent dot color per strip cell — same c1/c2/c3 scale as the home/
// contributor strips, three cells instead of four.
const STRIP_ACCENTS = ['bg-c1', 'bg-c2', 'bg-c3'];

// A 3-col strip only needs one fold point: drop straight to 1 col on narrow
// screens (home's 4-col strip needs an intermediate 2-col step; 3 doesn't).
const STRIP_BORDERS = [
  '',
  'border-l border-mline max-[480px]:border-l-0 max-[480px]:border-t',
  'border-l border-mline max-[480px]:border-l-0 max-[480px]:border-t',
];

export default function StatsView({ items }: { items: SearchIndexItem[] }) {
  const years = useMemo(() => getAvailableYears(items), [items]);
  const [year, setYear] = useState(DEFAULT_YEAR);
  const stats = useMemo(() => computeStats(filterByYear(items, year)), [items, year]);
  const strip = [
    { value: stats.total, label: '총 컨트리뷰션' },
    { value: `${Math.round(stats.mergedRatio * 100)}%`, label: 'Merged 비율' },
    { value: stats.contributorCount, label: '기여자 수' },
  ];

  return (
    <>
      <div className="mb-6">
        <YearSelector years={years} value={year} onChange={setYear} />
      </div>

      {stats.total === 0 ? (
        <p className="text-on-surface">표시할 데이터가 없습니다.</p>
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
          <StatsCharts stats={stats} />
        </>
      )}
    </>
  );
}
