import { render, screen } from '@testing-library/react';
import MeetingDetail from '@/components/MeetingDetail';
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
    slug: '2026-07-18-meeting',
    title: '정기 미팅',
    date: '2026-07-18',
    type: 'meeting',
    attendees: ['alice'],
    contentHtml: '<p>코드리뷰</p>',
  },
];

test('모든 일정을 날짜·내용과 함께 렌더한다', () => {
  render(<MeetingDetail meetings={meetings} />);
  expect(screen.getByText('발대식')).toBeInTheDocument();
  expect(screen.getByText('2026-07-11')).toBeInTheDocument();
  expect(screen.getByText('필수 참석')).toBeInTheDocument();
  expect(screen.getByText('정기 미팅')).toBeInTheDocument();
  expect(screen.getByText('alice')).toBeInTheDocument();
});

test('일정이 없으면 빈 상태 문구', () => {
  render(<MeetingDetail meetings={[]} />);
  expect(screen.getByText('표시할 일정이 없습니다.')).toBeInTheDocument();
});
