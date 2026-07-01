import { render, screen } from '@testing-library/react';
import AttendanceTable from '@/components/AttendanceTable';

test('인원별 출석률을 렌더한다', () => {
  render(
    <AttendanceTable
      stats={{
        meetingCount: 2,
        milestoneCount: 0,
        rosterSize: 1,
        records: [{ username: 'alice', attended: 1, totalMeetings: 2, rate: 0.5 }],
      }}
    />
  );
  expect(screen.getByText('alice')).toBeInTheDocument();
  expect(screen.getByText('1 / 2')).toBeInTheDocument();
  expect(screen.getByText('50%')).toBeInTheDocument();
});

test('records가 비면 빈 상태 문구', () => {
  render(
    <AttendanceTable
      stats={{ meetingCount: 0, milestoneCount: 0, rosterSize: 0, records: [] }}
    />
  );
  expect(screen.getByText('출석 데이터가 없습니다.')).toBeInTheDocument();
});
