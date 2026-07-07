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

  // 사이드바와 같은 기준으로 그룹핑 (group 없으면 '문서')
  const groups = new Map<string, typeof docs>();
  for (const doc of docs) {
    const key = doc.group ?? '문서';
    const list = groups.get(key) ?? [];
    list.push(doc);
    groups.set(key, list);
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 p-4 lg:flex-row">
      <aside className="lg:w-56 lg:flex-shrink-0">
        <DocsSidebar items={docs} />
      </aside>

      <main className="min-w-0 flex-1">
        <h1 className="font-display mb-6 text-4xl font-semibold tracking-tight text-on-surface">문서</h1>
        {docs.length > 0 ? (
          <div className="space-y-6">
            {[...groups.entries()].map(([group, items]) => (
              <section key={group}>
                <h2 className="mb-2 border-b border-outline pb-1.5 text-sm font-bold uppercase tracking-wider text-primary">
                  {group}
                </h2>
                <ul className="space-y-0.5">
                  {items.map((doc) => (
                    <li key={doc.slug}>
                      <Link
                        href={`/docs/${doc.slug}`}
                        className="flex flex-wrap items-baseline gap-x-2 rounded-xl px-3 py-1.5 transition-colors hover:bg-surface-variant"
                      >
                        <span className="font-medium text-primary">{doc.title}</span>
                        {doc.description && (
                          <span className="text-sm text-on-surface-variant">
                            — {doc.description}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        ) : (
          <p className="text-on-surface-variant">등록된 문서가 없습니다.</p>
        )}
      </main>
    </div>
  );
}
