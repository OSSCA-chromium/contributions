import { Metadata } from 'next';
import { getAllMeetings } from '@/lib/meetings';
import ScheduleView from '@/components/ScheduleView';

export const metadata: Metadata = {
  title: '일정 | OSSCA Chromium',
  description: 'OSSCA Chromium 일정 현황 대시보드입니다.',
};

export default function SchedulePage() {
  const meetings = getAllMeetings();

  return (
    <div>
      <h1 className="font-display mb-6 text-3xl font-semibold tracking-tight text-on-surface">일정</h1>
      <ScheduleView meetings={meetings} />
    </div>
  );
}
