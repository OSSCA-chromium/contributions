'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { SearchIndexItem } from '@/lib/types';
import { computeStats } from '@/lib/stats';
import { DEFAULT_YEAR, filterByYear, getAvailableYears } from '@/lib/years';
import ContributorAvatar from '@/components/ContributorAvatar';
import PatchTable from '@/components/PatchTable';
import YearSelector from '@/components/YearSelector';

// Accent dot color per strip cell, left to right — mirrors the mockup's
// nth-child(1..4) --acc assignment (c1 = strongest blue, c4 = palest).
const STRIP_ACCENTS = ['bg-c1', 'bg-c2', 'bg-c3', 'bg-c4'];

// Divider per cell: a plain 4-col row only needs a left border on cells
// 2-4. The mockup folds the grid to 2 cols at <=620px (cell 3 moves to
// its own row) and to 1 col at <=380px (every cell but the first is on
// its own row), swapping the left border for a top border at each fold.
const STRIP_BORDERS = [
  '',
  'border-l border-mline max-[380px]:border-l-0 max-[380px]:border-t',
  'border-l border-mline max-[620px]:border-l-0 max-[620px]:border-t',
  'border-l border-mline max-[380px]:border-l-0 max-[620px]:border-t',
];

// Shared "SEC-H" header: small-caps section title + a right-aligned link.
function SectionHeader({
  title,
  href,
  linkLabel,
}: {
  title: string;
  href: string;
  linkLabel: string;
}) {
  return (
    <div className="mb-3.5 flex items-baseline justify-between gap-3">
      <h2 className="text-[12px] font-semibold uppercase tracking-[0.09em] text-on-surface-variant">
        {title}
      </h2>
      <Link href={href} className="text-[13.5px] font-medium text-link hover:underline">
        {linkLabel}
      </Link>
    </div>
  );
}

export default function HomeView({ items }: { items: SearchIndexItem[] }) {
  const years = useMemo(() => getAvailableYears(items), [items]);
  const [year, setYear] = useState(DEFAULT_YEAR);
  const filtered = useMemo(() => filterByYear(items, year), [items, year]);
  const stats = useMemo(() => computeStats(filtered), [filtered]);
  const recent = filtered.slice(0, 5);
  const contributors = useMemo(() => {
    // Most-recently-active first: each author's max contribution date, desc.
    const lastActive = new Map<string, number>();
    for (const item of filtered) {
      if (!item.author) continue;
      const ms = new Date(item.date).getTime();
      const prev = lastActive.get(item.author) ?? -Infinity;
      if (!Number.isNaN(ms) && ms > prev) lastActive.set(item.author, ms);
    }
    return Array.from(lastActive.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([username]) => username);
  }, [filtered]);

  const yearLabel = year === 'all' ? '전체' : year;
  const merged = stats.byStatus.find((s) => s.status === 'merged')?.count ?? 0;
  const strip = [
    { value: stats.total, label: '누적 기여' },
    { value: merged, label: '머지 완료' },
    { value: stats.moduleCount, label: '모듈' },
    { value: stats.contributorCount, label: '참여 멘티' },
  ];

  return (
    <>
      <section>
        <h1 className="mb-2.5 text-[27px] font-bold leading-[1.3] tracking-[-0.025em]">
          Chromium 기여 아카이브
        </h1>
        <p className="max-w-[66ch] text-[14.5px] text-on-surface-variant">
          오픈소스 컨트리뷰션 아카데미 Chromium 팀이 실제로 Chromium 코드베이스에 올린 패치를
          기록하는 아카이브입니다. 각 기여는 과제 이슈에서 출발해 crbug, Gerrit 리뷰를 거쳐
          머지되기까지의 과정과, 멘티가 직접 쓴 회고를 함께 담고 있습니다.
        </p>
        <div className="mt-4">
          <YearSelector years={years} value={year} onChange={setYear} />
        </div>
      </section>

      {filtered.length === 0 ? (
        <p className="mt-[22px] text-on-surface">
          {year === 'all'
            ? '아직 등록된 컨트리뷰션이 없습니다.'
            : `${yearLabel}년 컨트리뷰션이 아직 없습니다.`}
        </p>
      ) : (
        <>
          <div className="mt-[22px] grid grid-cols-4 overflow-hidden rounded-2xl bg-m1 max-[620px]:grid-cols-2 max-[380px]:grid-cols-1">
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

          <section className="mt-[34px]">
            <SectionHeader title="최근 기여" href="/patches" linkLabel="전체 목록 →" />
            <PatchTable items={recent} />
          </section>

          <section className="mt-[34px]">
            <SectionHeader title="Contributors" href="/contributors" linkLabel="전체 보기 →" />
            <div className="flex flex-wrap gap-[18px]">
              {contributors.map((username) => (
                <ContributorAvatar key={username} username={username} size={48} linkToProfile />
              ))}
            </div>
          </section>
        </>
      )}
    </>
  );
}
