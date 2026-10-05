import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import {
  getContributorByUsername,
  getContributorSlugs,
} from '@/lib/contributors';
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
    <div>
      <ContributorView username={username} contributions={contributions} />
    </div>
  );
}
