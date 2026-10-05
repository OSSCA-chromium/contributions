import type { Metadata } from 'next';
import { getContributorSummaries } from '@/lib/contributors';
import ContributorsList from '@/components/ContributorsList';

export const metadata: Metadata = {
  title: '기여자 | OSSCA Chromium',
  description: 'OSSCA Chromium 컨트리뷰션에 참여한 기여자 목록입니다.',
};

// Contributor directory. The client list handles search and sorting.
export default function ContributorsPage() {
  const summaries = getContributorSummaries();

  return (
    <div>
      <header className="mb-6">
        <div className="flex items-center gap-3">
          <h1 className="page-title mb-0!">기여자</h1>
          <span className="rounded-full bg-primary-weak px-3 py-1 text-sm font-medium text-primary tabular-nums">
            {summaries.length}명
          </span>
        </div>
      </header>
      {summaries.length === 0 ? (
        <p className="text-on-surface-variant">아직 기여자가 없습니다.</p>
      ) : (
        <ContributorsList summaries={summaries} />
      )}
    </div>
  );
}
