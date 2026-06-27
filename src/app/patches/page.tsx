import { getAllContributions } from '@/lib/contributions';
import { buildSearchIndex } from '@/lib/search-index';
import ContributionSearch from '@/components/ContributionSearch';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contributions | OSSCA Chromium',
  description: 'Chromium 프로젝트 컨트리뷰션 모음입니다.',
};

export default function PatchesPage() {
  const contributions = getAllContributions();
  const items = buildSearchIndex(contributions);

  return (
    <div>
      {items.length > 0 ? (
        <ContributionSearch items={items} />
      ) : (
        <div className="text-center py-12 text-on-surface">
          <p className="mb-4">아직 등록된 컨트리뷰션이 없습니다.</p>
          <p>학생들의 컨트리뷰션이 이곳에 등록될 예정입니다.</p>
        </div>
      )}
    </div>
  );
}
