import type { Metadata } from 'next';
import { getContributorSummaries } from '@/lib/contributors';
import ContributorsList from '@/components/ContributorsList';

export const metadata: Metadata = {
  title: 'Contributors | OSSCA Chromium',
  description: 'OSSCA Chromium 컨트리뷰션에 참여한 기여자 목록입니다.',
};

// Contributor directory: full list with a sort menu (latest / total / merged /
// in review). Server component; ContributorsList (client) handles sorting.
export default function ContributorsPage() {
  const summaries = getContributorSummaries();

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-on-surface mb-6">Contributors</h1>
      {summaries.length === 0 ? (
        <p className="text-on-surface-variant">아직 기여자가 없습니다.</p>
      ) : (
        <ContributorsList summaries={summaries} />
      )}
    </div>
  );
}
