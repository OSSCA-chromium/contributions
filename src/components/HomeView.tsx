'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { SearchIndexItem } from '@/lib/types';
import { computeStats } from '@/lib/stats';
import { DEFAULT_YEAR, filterByYear, getAvailableYears } from '@/lib/years';
import { SHOW_CONTRIBUTION_GRAPH } from '@/lib/feature-flags';
import ContributorAvatar from '@/components/ContributorAvatar';
import PatchTable from '@/components/PatchTable';
import ContributionGraph from '@/components/ContributionGraph';
import ContributionSummary from '@/components/ContributionSummary';
import YearSelector from '@/components/YearSelector';

// Section header with a right-aligned archive link.
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
      <h2 className="section-title">
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

  return (
    <>
      <h1 className="sr-only">홈</h1>
      <YearSelector years={years} value={year} onChange={setYear} />

      {filtered.length === 0 ? (
        <p className="mt-[22px] text-on-surface">
          {year === 'all'
            ? '아직 등록된 컨트리뷰션이 없습니다.'
            : `${yearLabel}년 컨트리뷰션이 아직 없습니다.`}
        </p>
      ) : (
        <>
          <div className="mt-[22px]"><ContributionSummary items={filtered} stats={stats} /></div>

          {SHOW_CONTRIBUTION_GRAPH && (
            <div className="mt-[34px]"><ContributionGraph items={filtered} compact /></div>
          )}

          <section className="mt-[34px]">
            <SectionHeader title="최근 기여" href="/patches" linkLabel="전체 목록 →" />
            <PatchTable items={recent} />
          </section>

          <section className="mt-[34px]">
            <SectionHeader title="기여자" href="/contributors" linkLabel="전체 보기 →" />
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
