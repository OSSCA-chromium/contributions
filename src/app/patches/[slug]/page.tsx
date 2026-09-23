import { notFound } from 'next/navigation';
import {
  getAllContributionSlugs,
  getContributionBySlug,
} from '@/lib/contributions';
import { Metadata } from 'next';
import Link from 'next/link';
import PatchMeta from '@/components/PatchMeta';
import JourneyStepper from '@/components/JourneyStepper';

interface ParamsProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ParamsProps): Promise<Metadata> {
  const { slug } = await params;
  const contribution = await getContributionBySlug(slug);

  if (!contribution) {
    return {
      title: '컨트리뷰션을 찾을 수 없습니다',
    };
  }

  return {
    title: `${contribution.title} | OSSCA Chromium`,
    description: contribution.excerpt,
  };
}

// 정적 생성을 위한 경로 생성 함수
export function generateStaticParams() {
  return getAllContributionSlugs();
}

export default async function PatchPage({ params }: ParamsProps) {
  const { slug } = await params;

  const contribution = await getContributionBySlug(slug);

  if (!contribution) {
    notFound();
  }

  return (
    <article className="mx-auto max-w-7xl p-4">
      {/* 헤더 정보 */}
      <header className="mb-4">
        <h1 className="font-display text-4xl font-semibold tracking-tight mb-2 text-on-surface">{contribution.title}</h1>
        <PatchMeta contribution={contribution} />
      </header>

      <JourneyStepper contribution={contribution} />

      {/* 컨트리뷰션 링크 */}
      {contribution.contributionUrl && (
        <div className="mb-4">
          <a
            href={contribution.contributionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-link hover:underline"
          >
            {contribution.contributionUrl}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 ml-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        </div>
      )}

      {/* HTML Content */}
      <main
        className="prose dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: contribution.contentHtml ?? '' }}
      />

      {/* 다른 컨트리뷰션 목록으로 돌아가기 */}
      <div className="border-t border-outline pt-6 mt-8">
        <Link
          href="/patches"
          className="inline-flex items-center text-link hover:underline"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          모든 컨트리뷰션 보기
        </Link>
      </div>
    </article>
  );
}
