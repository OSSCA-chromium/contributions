import { render, screen, fireEvent } from '@testing-library/react';
import ScheduleView from '@/components/ScheduleView';
import type { Meeting, AttendanceStats } from '@/lib/types';

const meetings: Meeting[] = [
  {
    slug: '2025-05-15',
    title: '3주차 정기 미팅',
    date: '2025-05-15',
    type: 'meeting',
    attendees: ['alice'],
    contentHtml: '<p>코드리뷰</p>',
  },
];
const attendance: AttendanceStats = {
  meetingCount: 1,
  milestoneCount: 0,
  rosterSize: 1,
  records: [{ username: 'alice', attended: 1, totalMeetings: 1, rate: 1 }],
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

test('최신 미팅 월을 초기 표시하고 출석 표를 렌더한다', () => {
  render(<ScheduleView meetings={meetings} attendance={attendance} />);
  expect(screen.getByText('2025년 5월')).toBeInTheDocument();
  expect(screen.getByText('일')).toBeInTheDocument(); // 달력 렌더
  // 'alice'는 상세 패널의 참석자 칩과 출석 표에 동시에 나타나므로,
  // 출석 표에만 있는 출석률 '100%'로 단언(초기 선택일=최신 미팅 UX 유지).
  expect(screen.getByText('100%')).toBeInTheDocument(); // 출석 표
});

test('미팅 날짜 클릭 시 상세가 표시된다', () => {
  render(<ScheduleView meetings={meetings} attendance={attendance} />);
  fireEvent.click(screen.getByRole('button', { name: /2025-05-15/ }));
  expect(screen.getByText('3주차 정기 미팅')).toBeInTheDocument();
});
