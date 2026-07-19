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

test('점 이벤트가 있는 날의 오버레이는 기간 이벤트를 숨긴다', () => {
  const { container } = renderGrid();
  const dayCells = Array.from(container.querySelectorAll('[data-event="true"]'));
  // 7/11: 발대식(점) + Challenges(기간) — 오버레이에는 발대식만
  const openingCell = dayCells.find((c) => c.textContent?.includes('발대식'));
  expect(openingCell).toBeDefined();
  expect(openingCell?.textContent).not.toContain('Challenges');
  // 점 이벤트가 없는 날은 기간 오버레이를 유지한다
  const periodOnlyCell = dayCells.find((c) => c.textContent?.includes('Challenges'));
  expect(periodOnlyCell).toBeDefined();
});

test('모임(meeting)은 노란 원, 마일스톤은 기본 원으로 구분한다', () => {
  const meeting: Meeting = {
    slug: 'week1',
    title: '1주차 모임',
    date: '2026-07-18',
    type: 'meeting',
    attendees: [],
    contentHtml: '<p>아젠다</p>',
  };
  const { container } = renderGrid({ meetings: [point, meeting] });
  expect(container.querySelector('.bg-warning\\/30')?.textContent).toBe('18');
  expect(container.querySelector('.bg-primary\\/30')?.textContent).toBe('11');
});

test('일정이 있는 날짜는 첫 일정 상세로 링크된다', () => {
  const { container } = renderGrid();
  const links = Array.from(container.querySelectorAll('a'));
  // 7/11: 발대식(점)이 기간보다 우선 — 발대식 상세로
  expect(links.find((a) => a.textContent === '11')?.getAttribute('href')).toBe(
    '/schedule/opening'
  );
  // 7/12: 기간(Challenges)만 있는 날 — 기간 상세로
  expect(links.find((a) => a.textContent === '12')?.getAttribute('href')).toBe(
    '/schedule/challenges'
  );
  // 7/1: 일정 없는 날은 링크가 없다
  expect(links.find((a) => a.textContent === '1')).toBeUndefined();
});

test('today가 null이면 오늘 마커가 없다', () => {
  const { container } = renderGrid({ today: null });
  expect(container.querySelector('[data-today="true"]')).toBeNull();
});
