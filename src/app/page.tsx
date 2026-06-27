import Link from 'next/link';
import { getAllContributions, getUniqueContributors } from '@/lib/contributions';
import { computeStats } from '@/lib/stats';
import ContributionCard from '@/components/ContributionCard';
import ContributorAvatar from '@/components/ContributorAvatar';

export default function Home() {
  const allContributions = getAllContributions();
  const recent = allContributions.slice(0, 3);
  const contributors = getUniqueContributors();
  const stats = computeStats(allContributions);

  return (
    <>
      {/* 히어로 */}
      <section className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-on-surface mb-3">
          OSSCA Chromium Contributions
        </h1>
        <p className="text-on-surface-variant max-w-2xl">
          오픈소스 컨트리뷰션 아카데미 참가자들이 Chromium 프로젝트에 기여한
          컨트리뷰션 기록입니다.
        </p>
      </section>

      {/* 핵심 숫자 요약 */}
      <section className="mb-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-surface border border-outline rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-on-surface">
              {stats.total}
            </div>
            <div className="text-sm text-on-surface-variant">총 컨트리뷰션</div>
          </div>
          <div className="bg-surface border border-outline rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-success">
              {Math.round(stats.mergedRatio * 100)}%
            </div>
            <div className="text-sm text-on-surface-variant">Merged 비율</div>
          </div>
          <div className="bg-surface border border-outline rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-info">
              {stats.contributorCount}
            </div>
            <div className="text-sm text-on-surface-variant">기여자 수</div>
          </div>
        </div>
        <div className="mt-4">
          <Link
            href="/stats"
            className="text-primary hover:underline font-medium inline-flex items-center"
          >
            통계 자세히 보기 →
          </Link>
        </div>
      </section>

      {/* 최근 컨트리뷰션 */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-5 text-on-surface">
          Recent contributions
        </h2>
        {recent.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recent.map((contribution) => (
              <ContributionCard
                key={contribution.slug}
                contribution={contribution}
              />
            ))}
          </div>
        ) : (
          <p className="text-on-surface">아직 등록된 컨트리뷰션이 없습니다.</p>
        )}
        <div className="mt-6">
          <Link
            href="/patches"
            className="text-primary hover:underline font-medium inline-flex items-center"
          >
            모든 컨트리뷰션 보기 →
          </Link>
        </div>
      </section>

      {/* 기여자 그리드 */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-5 text-on-surface">Contributors</h2>
        {contributors.length > 0 ? (
          <div className="flex flex-wrap gap-[18px]">
            {contributors.map((contributor) => (
              <ContributorAvatar
                key={contributor.username}
                username={contributor.username}
                size={64}
                linkToProfile
              />
            ))}
          </div>
        ) : (
          <p className="text-on-surface">등록된 컨트리뷰터가 없습니다.</p>
        )}
      </section>
    </>
  );
}
