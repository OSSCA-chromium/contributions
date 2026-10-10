import type { Metadata } from 'next';
import { getAllContributions } from '@/lib/contributions';
import { getContributorSummaries } from '@/lib/contributors';
import { filterByYear, getAvailableYears } from '@/lib/years';
import ContributorsList from '@/components/ContributorsList';

export const metadata: Metadata = {
  title: '기여자 | OSSCA Chromium',
  description: 'OSSCA Chromium 컨트리뷰션에 참여한 기여자 목록입니다.',
};

// Precompute yearly summaries for client-side filtering in the static export.
export default function ContributorsPage() {
  const contributions = getAllContributions();
  const summariesByYear = {
    all: getContributorSummaries(contributions),
    ...Object.fromEntries(getAvailableYears(contributions).map((year) => [
      year,
      getContributorSummaries(filterByYear(contributions, year)),
    ])),
  };

  return <ContributorsList summariesByYear={summariesByYear} />;
}
