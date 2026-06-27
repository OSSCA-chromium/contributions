import { getAllContributions } from '@/lib/contributions';
import ContributionCard from '@/components/ContributionCard';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contributions | OSSCA Chromium',
  description: 'Chromium 프로젝트 컨트리뷰션 모음입니다.',
};

export default function PatchesPage() {
  const contributions = getAllContributions();

  // 상태별로 컨트리뷰션 필터링
  const inReviewContributions = contributions.filter(
    (contribution) => contribution.status === 'in review'
  );

  const mergedContributions = contributions.filter(
    (contribution) => contribution.status === 'merged'
  );

  return (
    <div>
      {contributions.length > 0 ? (
        <>
          {/* In Review 컨트리뷰션 */}
          {inReviewContributions.length > 0 && (
            <div className="mb-8">
              <h1 className="text-2xl font-semibold mb-3 text-info">In Review</h1>
              <div className="grid gap-4">
                {inReviewContributions.map((contribution) => (
                  <ContributionCard key={contribution.slug} contribution={contribution} />
                ))}
              </div>
            </div>
          )}

          {/* Merged 컨트리뷰션 */}
          {mergedContributions.length > 0 && (
            <div className="mb-8">
              <h1 className="text-2xl font-semibold mb-3 text-success">Merged</h1>
              <div className="grid gap-4">
                {mergedContributions.map((contribution) => (
                  <ContributionCard key={contribution.slug} contribution={contribution} />
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 text-on-surface">
          <p className="mb-4">아직 등록된 컨트리뷰션이 없습니다.</p>
          <p>학생들의 컨트리뷰션이 이곳에 등록될 예정입니다.</p>
        </div>
      )}
    </div>
  );
}
