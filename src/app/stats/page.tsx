import { Metadata } from 'next';
import { getAllContributions } from '@/lib/contributions';
import { computeStats } from '@/lib/stats';
import StatsCharts from '@/components/StatsCharts';

export const metadata: Metadata = {
  title: '통계 | OSSCA Chromium',
  description: 'OSSCA Chromium 컨트리뷰션 통계 대시보드입니다.',
};

export default function StatsPage() {
  const stats = computeStats(getAllContributions());

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-on-surface mb-6">통계</h1>

      {stats.total > 0 ? (
        <>
          {/* 요약 숫자 카드 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
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

          <StatsCharts stats={stats} />
        </>
      ) : (
        <p className="text-on-surface">아직 집계할 컨트리뷰션이 없습니다.</p>
      )}
    </div>
  );
}
