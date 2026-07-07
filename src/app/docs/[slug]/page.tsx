import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { getDocBySlug, getDocNav, getDocSlugs } from '@/lib/docs';
import DocsSidebar from '@/components/DocsSidebar';
import TableOfContents from '@/components/TableOfContents';

interface ParamsProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ParamsProps): Promise<Metadata> {
  const { slug } = await params;
  const doc = await getDocBySlug(slug);

  if (!doc) {
    return { title: '문서를 찾을 수 없습니다' };
  }

  return {
    title: `${doc.meta.title} | OSSCA Chromium`,
  };
}

export function generateStaticParams() {
  return getDocSlugs();
}

export default async function DocPage({ params }: ParamsProps) {
  const { slug } = await params;
  const doc = await getDocBySlug(slug);

  if (!doc) {
    notFound();
  }

  const nav = getDocNav();
  const currentIndex = nav.findIndex((d) => d.slug === slug);
  const prev = currentIndex > 0 ? nav[currentIndex - 1] : null;
  const next =
    currentIndex >= 0 && currentIndex < nav.length - 1 ? nav[currentIndex + 1] : null;

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 p-4 lg:flex-row">
      {/* 좌측 사이드바 */}
      <aside className="lg:w-48 lg:flex-shrink-0">
        <DocsSidebar items={nav} activeSlug={slug} />
      </aside>

      {/* 본문 */}
      <main className="min-w-0 flex-1">
        <h1 className="font-display mb-6 text-4xl font-semibold tracking-tight text-on-surface">{doc.meta.title}</h1>

        <article
          className="prose dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: doc.contentHtml }}
        />

        {/* 이전/다음 내비게이션 */}
        <nav className="mt-12 flex justify-between gap-4 border-t border-outline pt-6">
          {prev ? (
            <Link
              href={`/docs/${prev.slug}`}
              className="flex flex-col text-primary hover:underline"
            >
              <span className="text-xs text-on-surface-variant">이전</span>
              <span>← {prev.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={`/docs/${next.slug}`}
              className="flex flex-col items-end text-right text-primary hover:underline"
            >
              <span className="text-xs text-on-surface-variant">다음</span>
              <span>{next.title} →</span>
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </main>

      {/* 우측 목차 */}
      <aside className="order-first lg:order-last lg:w-40 lg:flex-shrink-0">
        <div className="lg:sticky lg:top-4">
          <TableOfContents headings={doc.headings} />
        </div>
      </aside>
    </div>
  );
}
