'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { SearchIndexItem } from '@/lib/types';
import { computeStats } from '@/lib/stats';
import { DEFAULT_YEAR, filterByYear, getAvailableYears } from '@/lib/years';
import ContributionCard from '@/components/ContributionCard';
import ContributorAvatar from '@/components/ContributorAvatar';
import YearSelector from '@/components/YearSelector';

export default function HomeView({ items }: { items: SearchIndexItem[] }) {
  const years = useMemo(() => getAvailableYears(items), [items]);
  const [year, setYear] = useState(DEFAULT_YEAR);
  const filtered = useMemo(() => filterByYear(items, year), [items, year]);
  const stats = useMemo(() => computeStats(filtered), [filtered]);
  const recent = filtered.slice(0, 3);
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
      <section className="mb-10">
        <div className="brand-mesh rounded-[32px] px-6 py-8 sm:px-10 sm:py-10 mb-6">
          <h1 className="font-display brand-gradient-text max-w-3xl text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
            OSSCA Chromium Contributions
          </h1>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/docs"
              className="rounded-full bg-primary px-5 py-2.5 font-medium text-on-primary transition-opacity hover:opacity-90"
            >
              가이드 시작하기
            </Link>
            <Link
              href="/patches"
              className="rounded-full border border-outline px-5 py-2.5 font-medium text-on-surface transition-colors hover:bg-surface-variant"
            >
              컨트리뷰션 보기
            </Link>
          </div>
        </div>
        <YearSelector years={years} value={year} onChange={setYear} />
      </section>

      {filtered.length === 0 ? (
        <p className="text-on-surface">
          {year === 'all'
            ? '아직 등록된 컨트리뷰션이 없습니다.'
            : `${yearLabel}년 컨트리뷰션이 아직 없습니다.`}
        </p>
      ) : (
        <>
          <section className="mb-10">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-surface border border-outline rounded-3xl p-6 text-center">
                <div className="font-display text-4xl font-semibold text-primary">{stats.total}</div>
                <div className="text-sm text-on-surface-variant">총 컨트리뷰션</div>
              </div>
              <div className="bg-surface border border-outline rounded-3xl p-6 text-center">
                <div className="font-display text-4xl font-semibold text-success">
                  {Math.round(stats.mergedRatio * 100)}%
                </div>
                <div className="text-sm text-on-surface-variant">Merged 비율</div>
              </div>
              <div className="bg-surface border border-outline rounded-3xl p-6 text-center">
                <div className="font-display text-4xl font-semibold text-info">{stats.contributorCount}</div>
                <div className="text-sm text-on-surface-variant">기여자 수</div>
              </div>
            </div>
            <div className="mt-4">
              <Link href="/stats" className="text-link hover:underline font-medium inline-flex items-center">
                통계 자세히 보기 →
              </Link>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="font-display text-2xl font-semibold tracking-tight mb-5 text-on-surface">
              Recent contributions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recent.map((item) => (
                <ContributionCard key={item.slug} contribution={item} />
              ))}
            </div>
            <div className="mt-6">
              <Link href="/patches" className="text-link hover:underline font-medium inline-flex items-center">
                모든 컨트리뷰션 보기 →
              </Link>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="font-display text-2xl font-semibold tracking-tight mb-5 text-on-surface">
              Contributors
            </h2>
            <div className="flex flex-wrap gap-[18px]">
              {contributors.map((username) => (
                <ContributorAvatar key={username} username={username} size={48} linkToProfile />
              ))}
            </div>
            <div className="mt-6">
              <Link href="/contributors" className="text-link hover:underline font-medium inline-flex items-center">
                전체 보기 →
              </Link>
            </div>
          </section>
        </>
      )}
    </>
  );
}
