import { render, screen } from '@testing-library/react';
import CalendarGrid from '@/components/CalendarGrid';

function renderGrid(overrides = {}) {
  return render(
    <CalendarGrid
      year={2026}
      month={7}
      eventDates={new Set(['2026-07-11'])}
      today={'2026-07-02'}
      {...overrides}
    />
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
  const eventCell = container.querySelector('[data-event="true"]');
  expect(eventCell?.textContent).toContain('11');
  const todayCell = container.querySelector('[data-today="true"]');
  expect(todayCell?.textContent).toContain('2');
});

test('today가 null이면 오늘 마커가 없다', () => {
  const { container } = renderGrid({ today: null });
  expect(container.querySelector('[data-today="true"]')).toBeNull();
});
