import { render, screen } from '@testing-library/react';
import ScheduleView from '@/components/ScheduleView';
import type { Meeting } from '@/lib/types';

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

test('미팅이 없으면 빈 상태 문구', () => {
  render(<ScheduleView meetings={[]} />);
  expect(screen.getByText('등록된 일정이 없습니다.')).toBeInTheDocument();
});

test('데이터 범위의 모든 달을 렌더하고 일정 제목을 나열한다', () => {
  render(<ScheduleView meetings={meetings} today="2026-07-02" />);
  // 왼쪽: 7~8월 달력
  expect(screen.getByText('2026년 7월')).toBeInTheDocument();
  expect(screen.getByText('2026년 8월')).toBeInTheDocument();
  // 일정 제목(목록 + 달력 오버레이에 동시 등장 가능하므로 존재만 확인)
  expect(screen.getAllByText('발대식').length).toBeGreaterThan(0);
  expect(screen.getAllByText('Masters 시작').length).toBeGreaterThan(0);
});

test('today가 주어지면 오늘 마커를 표시한다', () => {
  const { container } = render(<ScheduleView meetings={meetings} today="2026-07-11" />);
  expect(container.querySelector('[data-today="true"]')).not.toBeNull();
});
