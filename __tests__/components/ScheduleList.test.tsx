import { render, screen } from '@testing-library/react';
import ScheduleList from '@/components/ScheduleList';
import type { Meeting } from '@/lib/types';

const meetings: Meeting[] = [
  {
    slug: '2026-07-11-opening',
    title: '발대식',
    date: '2026-07-11',
    type: 'milestone',
    attendees: [],
    contentHtml: '<p>필수 참석</p>',
  },
  {
    slug: '2026-08-15-masters',
    title: 'Masters 시작',
    date: '2026-08-15',
    type: 'milestone',
    attendees: [],
    contentHtml: '<p>본격 활동</p>',
  },
];

test('월별로 그룹핑해 제목을 렌더한다', () => {
  render(<ScheduleList meetings={meetings} />);
  expect(screen.getByText('7월')).toBeInTheDocument();
  expect(screen.getByText('8월')).toBeInTheDocument();
  expect(screen.getByText('발대식')).toBeInTheDocument();
  expect(screen.getByText('Masters 시작')).toBeInTheDocument();
});

test('세부 내용은 오버레이 마크업으로 DOM에 존재한다(호버 시 노출)', () => {
  render(<ScheduleList meetings={meetings} />);
  // 오버레이는 항상 DOM에 있고 CSS로만 토글되므로 텍스트가 존재해야 한다
  expect(screen.getByText('필수 참석')).toBeInTheDocument();
});

test('일정이 없으면 빈 상태 문구', () => {
  render(<ScheduleList meetings={[]} />);
  expect(screen.getByText('표시할 일정이 없습니다.')).toBeInTheDocument();
});
