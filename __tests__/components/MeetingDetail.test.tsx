import { render, screen } from '@testing-library/react';
import MeetingDetail from '@/components/MeetingDetail';
import type { Meeting } from '@/lib/types';

const meeting: Meeting = {
  slug: '2025-05-15',
  title: '3주차 정기 미팅',
  date: '2025-05-15',
  type: 'meeting',
  attendees: ['alice', 'bob'],
  location: '온라인',
  contentHtml: '<h2>계획</h2><p>코드리뷰 실습</p>',
};

test('선택된 날짜의 미팅 제목/참석자/노트를 렌더한다', () => {
  render(<MeetingDetail meetings={[meeting]} date="2025-05-15" />);
  expect(screen.getByText('3주차 정기 미팅')).toBeInTheDocument();
  expect(screen.getByText('alice')).toBeInTheDocument();
  expect(screen.getByText('코드리뷰 실습')).toBeInTheDocument();
});

test('해당 날짜에 미팅이 없으면 안내 문구', () => {
  render(<MeetingDetail meetings={[]} date="2025-05-16" />);
  expect(screen.getByText('선택한 날짜에 일정이 없습니다.')).toBeInTheDocument();
});

test('date가 null이면 안내 문구', () => {
  render(<MeetingDetail meetings={[]} date={null} />);
  expect(screen.getByText('날짜를 선택하세요.')).toBeInTheDocument();
});
