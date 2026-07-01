import { Metadata } from 'next';
import { getAllMeetings } from '@/lib/meetings';
import { computeAttendance } from '@/lib/attendance';
import ScheduleView from '@/components/ScheduleView';

export const metadata: Metadata = {
  title: '일정 | OSSCA Chromium',
  description: 'OSSCA Chromium 일정·미팅·출석 현황 대시보드입니다.',
};

export default function SchedulePage() {
  const meetings = getAllMeetings();
  const attendance = computeAttendance(meetings);

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-on-surface mb-6">일정</h1>
      <ScheduleView meetings={meetings} attendance={attendance} />
    </div>
  );
}
