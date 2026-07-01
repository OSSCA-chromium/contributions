import type { Metadata } from 'next';
import { getContributorSummaries } from '@/lib/contributors';
import ContributorCard from '@/components/ContributorCard';

export const metadata: Metadata = {
  title: 'Contributors | OSSCA Chromium',
  description: 'OSSCA Chromium 컨트리뷰션에 참여한 기여자 목록입니다.',
};

// Contributor directory: lists all contributors as cards, ordered by total
// contributions (descending). Server component, statically generated.
export default function ContributorsPage() {
  const summaries = getContributorSummaries();

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-on-surface mb-6">Contributors</h1>
      {summaries.length === 0 ? (
        <p className="text-on-surface-variant">아직 기여자가 없습니다.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {summaries.map((summary) => (
            <ContributorCard key={summary.username} summary={summary} />
          ))}
        </div>
      )}
    </div>
  );
}
