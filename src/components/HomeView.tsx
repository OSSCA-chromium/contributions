'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import type { SearchIndexItem } from '@/lib/types';
import { computeStats } from '@/lib/stats';
import { useYear } from '@/components/YearProvider';
import { filterByYear } from '@/lib/years';
import ContributionCard from '@/components/ContributionCard';
import ContributorAvatar from '@/components/ContributorAvatar';

export default function HomeView({ items }: { items: SearchIndexItem[] }) {
  const { year } = useYear();
  const filtered = useMemo(() => filterByYear(items, year), [items, year]);
  const stats = useMemo(() => computeStats(filtered), [filtered]);
  const recent = filtered.slice(0, 3);
  const contributors = useMemo(() => {
    const seen = new Set<string>();
    const list: string[] = [];
    for (const item of filtered) {
      if (item.author && !seen.has(item.author)) {
        seen.add(item.author);
        list.push(item.author);
      }
    }
    return list;
  }, [filtered]);

  const yearLabel = year === 'all' ? '전체' : year;

  return (
    <>
      <section className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-on-surface mb-3">
          OSSCA Chromium Contributions
        </h1>
        <p className="text-on-surface-variant max-w-2xl">
          오픈소스 컨트리뷰션 아카데미 참가자들이 Chromium 프로젝트에 기여한 컨트리뷰션 기록입니다.
        </p>
      </section>

      {filtered.length === 0 ? (
        <p className="text-on-surface">
          {yearLabel}년 컨트리뷰션이 아직 없습니다.
        </p>
      ) : (
        <>
          <section className="mb-10">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-surface border border-outline rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-on-surface">{stats.total}</div>
                <div className="text-sm text-on-surface-variant">총 컨트리뷰션</div>
              </div>
              <div className="bg-surface border border-outline rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-success">
                  {Math.round(stats.mergedRatio * 100)}%
                </div>
                <div className="text-sm text-on-surface-variant">Merged 비율</div>
              </div>
              <div className="bg-surface border border-outline rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-info">{stats.contributorCount}</div>
                <div className="text-sm text-on-surface-variant">기여자 수</div>
              </div>
            </div>
            <div className="mt-4">
              <Link href="/stats" className="text-primary hover:underline font-medium inline-flex items-center">
                통계 자세히 보기 →
              </Link>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-5 text-on-surface">Recent contributions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recent.map((item) => (
                <ContributionCard key={item.slug} contribution={item} />
              ))}
            </div>
            <div className="mt-6">
              <Link href="/patches" className="text-primary hover:underline font-medium inline-flex items-center">
                모든 컨트리뷰션 보기 →
              </Link>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-5 text-on-surface">Contributors</h2>
            <div className="flex flex-wrap gap-[18px]">
              {contributors.map((username) => (
                <ContributorAvatar key={username} username={username} size={64} linkToProfile />
              ))}
            </div>
          </section>
        </>
      )}
    </>
  );
}
