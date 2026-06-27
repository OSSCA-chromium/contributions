import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import {
  getContributorByUsername,
  getContributorSlugs,
} from '@/lib/contributors';
import ContributorAvatar from '@/components/ContributorAvatar';
import ContributionCard from '@/components/ContributionCard';

interface ParamsProps {
  params: Promise<{ username: string }>;
}

export function generateStaticParams() {
  return getContributorSlugs();
}

export async function generateMetadata({
  params,
}: ParamsProps): Promise<Metadata> {
  const { username } = await params;
  const data = getContributorByUsername(username);

  if (!data) {
    return {
      title: '기여자를 찾을 수 없습니다',
    };
  }

  return {
    title: `${username} | OSSCA Chromium`,
    description: `${username}님의 컨트리뷰션 목록입니다.`,
  };
}

export default async function ContributorPage({ params }: ParamsProps) {
  const { username } = await params;
  const data = getContributorByUsername(username);

  if (!data) {
    notFound();
  }

  const { summary, contributions } = data;

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* 프로필 헤더 */}
      <header className="flex flex-col sm:flex-row items-center gap-4 mb-8">
        <a
          href={`https://github.com/${username}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <ContributorAvatar username={username} size={96} />
        </a>
        <div className="text-center sm:text-left">
          <h1 className="text-3xl font-bold text-on-surface">{username}</h1>
          <a
            href={`https://github.com/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            github.com/{username}
          </a>
        </div>
      </header>

      {/* 요약 통계 */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-surface border border-outline rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-on-surface">
            {summary.total}
          </div>
          <div className="text-sm text-on-surface-variant">총 기여</div>
        </div>
        <div className="bg-surface border border-outline rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-success">
            {summary.merged}
          </div>
          <div className="text-sm text-on-surface-variant">Merged</div>
        </div>
        <div className="bg-surface border border-outline rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-info">
            {summary.inReview}
          </div>
          <div className="text-sm text-on-surface-variant">In Review</div>
        </div>
      </div>

      {/* 컨트리뷰션 목록 */}
      <h2 className="text-xl font-semibold text-on-surface mb-4">컨트리뷰션</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {contributions.map((contribution) => (
          <ContributionCard
            key={contribution.slug}
            contribution={contribution}
          />
        ))}
      </div>
    </div>
  );
}
