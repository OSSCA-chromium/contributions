import { render, screen } from '@testing-library/react';
import MeetingDetail from '@/components/MeetingDetail';
import type { Meeting } from '@/lib/types';

const base: Meeting = {
  slug: '2026-07-18-week1',
  title: '1주차 정기 미팅',
  date: '2026-07-18',
  type: 'meeting',
  attendees: ['alice', 'bob'],
  location: '온라인',
  contentHtml: '<p>아젠다 내용</p>',
};

test('제목·날짜·장소·참석자·본문을 렌더한다', () => {
  render(<MeetingDetail meeting={base} />);
  expect(screen.getByRole('heading', { name: '1주차 정기 미팅' })).toBeInTheDocument();
  expect(screen.getByText('모임')).toHaveClass('text-warning');
  expect(screen.getByText('2026-07-18')).toBeInTheDocument();
  expect(screen.getByText('온라인')).toBeInTheDocument();
  expect(screen.getByText(/alice, bob/)).toBeInTheDocument();
  expect(screen.getByText('아젠다 내용')).toBeInTheDocument();
});

test('기간 일정은 date ~ endDate로 표시한다', () => {
  render(<MeetingDetail meeting={{ ...base, endDate: '2026-08-14' }} />);
  expect(screen.getByText('2026-07-18 ~ 2026-08-14')).toBeInTheDocument();
});

test('사이트 내 slides 경로는 basePath를 붙여 iframe·새 탭 링크로 렌더한다', () => {
  render(<MeetingDetail meeting={{ ...base, slides: '/slides/2026-07-18-week1/' }} />);
  expect(screen.getByTitle('발표 자료')).toHaveAttribute(
    'src',
    '/contributions/slides/2026-07-18-week1/index.html'
  );
  expect(screen.getByRole('link', { name: /새 탭에서 열기/ })).toHaveAttribute(
    'href',
    '/contributions/slides/2026-07-18-week1/index.html'
  );
});

test('외부 URL slides는 그대로 사용한다', () => {
  render(<MeetingDetail meeting={{ ...base, slides: 'https://example.com/deck/' }} />);
  expect(screen.getByTitle('발표 자료')).toHaveAttribute('src', 'https://example.com/deck/');
});

test('slides가 없으면 발표 자료 섹션을 렌더하지 않는다', () => {
  render(<MeetingDetail meeting={base} />);
  expect(screen.queryByTitle('발표 자료')).not.toBeInTheDocument();
  expect(screen.queryByText('발표 자료')).not.toBeInTheDocument();
});

test('일정 목록으로 돌아가는 링크가 있다', () => {
  render(<MeetingDetail meeting={base} />);
  expect(screen.getByRole('link', { name: /일정으로 돌아가기/ })).toHaveAttribute(
    'href',
    '/schedule'
  );
});
