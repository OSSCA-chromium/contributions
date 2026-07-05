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
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-on-surface mb-6">통계</h1>
      <StatsView items={items} />
    </div>
  );
}
