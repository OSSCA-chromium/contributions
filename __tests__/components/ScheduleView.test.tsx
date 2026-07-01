import { render, screen } from '@testing-library/react';
import ScheduleView from '@/components/ScheduleView';
import type { Meeting, AttendanceStats } from '@/lib/types';

const meetings: Meeting[] = [
  {
    slug: '2026-07-11-opening',
    title: '발대식',
    date: '2026-07-11',
    type: 'milestone',
    attendees: [],
    contentHtml: '<p>x</p>',
  },
  {
    slug: '2026-08-15-masters',
    title: 'Masters 시작',
    date: '2026-08-15',
    type: 'milestone',
    attendees: [],
    contentHtml: '<p>y</p>',
  },
];
const attendance: AttendanceStats = {
  meetingCount: 0,
  milestoneCount: 2,
  rosterSize: 0,
  records: [],
};

test('미팅이 없으면 빈 상태 문구', () => {
  render(
    <ScheduleView
      meetings={[]}
      attendance={{ meetingCount: 0, milestoneCount: 0, rosterSize: 0, records: [] }}
    />
  );
  expect(screen.getByText('등록된 일정이 없습니다.')).toBeInTheDocument();
});

test('데이터 범위의 모든 달을 렌더하고 전체 일정을 나열한다', () => {
  render(<ScheduleView meetings={meetings} attendance={attendance} today="2026-07-02" />);
  // 7월~8월 달력이 모두 렌더된다
  expect(screen.getByText('2026년 7월')).toBeInTheDocument();
  expect(screen.getByText('2026년 8월')).toBeInTheDocument();
  // 전체 일정 목록
  expect(screen.getByText('발대식')).toBeInTheDocument();
  expect(screen.getByText('Masters 시작')).toBeInTheDocument();
});

test('today가 주어지면 오늘 마커를 표시한다', () => {
  const { container } = render(
    <ScheduleView meetings={meetings} attendance={attendance} today="2026-07-11" />
  );
  expect(container.querySelector('[data-today="true"]')).not.toBeNull();
});
