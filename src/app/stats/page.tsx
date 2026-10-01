import { Metadata } from 'next';
import { getAllContributions } from '@/lib/contributions';
import { buildSearchIndex } from '@/lib/search-index';
import StatsView from '@/components/StatsView';

export const metadata: Metadata = {
  title: '통계 | OSSCA Chromium',
  description: 'OSSCA Chromium 컨트리뷰션 통계 대시보드입니다.',
};

export default function StatsPage() {
  const items = buildSearchIndex(getAllContributions());

  return (
    <div>
      <h1 className="page-title mb-6">
        통계
      </h1>
      <StatsView items={items} />
    </div>
  );
}
