import { render, screen } from '@testing-library/react';
import CalendarGrid from '@/components/CalendarGrid';
import type { Meeting } from '@/lib/types';

const point: Meeting = {
  slug: 'opening',
  title: '발대식',
  date: '2026-07-11',
  type: 'milestone',
  attendees: [],
  contentHtml: '<p>필수 참석</p>',
};
const period: Meeting = {
  slug: 'challenges',
  title: 'Challenges',
  date: '2026-07-11',
  endDate: '2026-08-14',
  type: 'milestone',
  attendees: [],
  contentHtml: '<p>온보딩</p>',
};

function renderGrid(overrides = {}) {
  return render(
    <CalendarGrid year={2026} month={7} meetings={[point, period]} today={'2026-07-02'} {...overrides} />
  );
}

test('월 제목과 요일 헤더를 렌더한다', () => {
  renderGrid();
  expect(screen.getByText('2026년 7월')).toBeInTheDocument();
  expect(screen.getByText('일')).toBeInTheDocument();
  expect(screen.getByText('토')).toBeInTheDocument();
});

test('이벤트 있는 날은 data-event, 오늘은 data-today로 표시한다', () => {
  const { container } = renderGrid();
  expect(container.querySelector('[data-event="true"]')).not.toBeNull();
  const todayCell = container.querySelector('[data-today="true"]');
  expect(todayCell?.textContent).toContain('2');
});

test('기간 이벤트 세부가 범위 내 날짜의 오버레이로 존재한다', () => {
  renderGrid();
  // Challenges(7/11~8/14)는 7월 내 여러 날에 걸쳐 오버레이로 노출된다
  expect(screen.getAllByText('Challenges').length).toBeGreaterThan(0);
});

test('today가 null이면 오늘 마커가 없다', () => {
  const { container } = renderGrid({ today: null });
  expect(container.querySelector('[data-today="true"]')).toBeNull();
});
