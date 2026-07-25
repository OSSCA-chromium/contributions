import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getAllMeetings } from '@/lib/meetings';
import MeetingDetail from '@/components/MeetingDetail';

interface ParamsProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ParamsProps): Promise<Metadata> {
  const { slug } = await params;
  const meeting = getAllMeetings().find((m) => m.slug === slug);

  if (!meeting) {
    return { title: '일정을 찾을 수 없습니다' };
  }

  return {
    title: `${meeting.title} | OSSCA Chromium`,
  };
}

export function generateStaticParams() {
  return getAllMeetings().map((m) => ({ slug: m.slug }));
}

export default async function MeetingPage({ params }: ParamsProps) {
  const { slug } = await params;
  const meeting = getAllMeetings().find((m) => m.slug === slug);

  if (!meeting) {
    notFound();
  }

  return <MeetingDetail meeting={meeting} />;
}
