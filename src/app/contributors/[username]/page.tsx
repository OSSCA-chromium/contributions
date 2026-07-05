import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import {
  getContributorByUsername,
  getContributorSlugs,
} from '@/lib/contributors';
import ContributorAvatar from '@/components/ContributorAvatar';
import ContributorView from '@/components/ContributorView';

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

  const { contributions } = data;

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
          <h1 className="font-display text-3xl font-semibold tracking-tight text-on-surface">{username}</h1>
          <a
            href={`https://github.com/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-link hover:underline"
          >
            github.com/{username}
          </a>
        </div>
      </header>

      <ContributorView contributions={contributions} />
    </div>
  );
}
