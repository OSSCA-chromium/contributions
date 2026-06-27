import Link from 'next/link';
import { Metadata } from 'next';
import { getDocNav } from '@/lib/docs';
import DocsSidebar from '@/components/DocsSidebar';

export const metadata: Metadata = {
  title: '문서 | OSSCA Chromium',
  description: 'Chromium 컨트리뷰션을 위한 문서와 가이드 모음입니다.',
};

export default function DocsIndexPage() {
  const docs = getDocNav();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 p-4 lg:flex-row">
      <aside className="lg:w-56 lg:flex-shrink-0">
        <DocsSidebar items={docs} />
      </aside>

      <main className="min-w-0 flex-1">
        <h1 className="mb-4 text-3xl font-bold text-on-surface">문서</h1>
        {docs.length > 0 ? (
          <p className="text-on-surface-variant">
            왼쪽 목록에서 문서를 선택하거나{' '}
            <Link href={`/docs/${docs[0].slug}`} className="text-primary hover:underline">
              {docs[0].title}
            </Link>
            부터 시작하세요.
          </p>
        ) : (
          <p className="text-on-surface-variant">등록된 문서가 없습니다.</p>
        )}
      </main>
    </div>
  );
}
