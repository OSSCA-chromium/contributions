import { render, screen, fireEvent } from '@testing-library/react';
import CalendarGrid from '@/components/CalendarGrid';

function setup(overrides = {}) {
  const onSelect = jest.fn();
  render(
    <CalendarGrid
      year={2025}
      month={5}
      meetingDates={new Set(['2025-05-15'])}
      selectedDate={'2025-05-15'}
      onSelect={onSelect}
      {...overrides}
    />
  );
  return { onSelect };
}

test('요일 헤더와 해당 월 날짜를 렌더한다', () => {
  setup();
  expect(screen.getByText('일')).toBeInTheDocument();
  expect(screen.getByText('토')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /^15$/ })).toBeInTheDocument();
});

test('미팅 있는 날은 data-has-meeting, 선택된 날은 data-selected', () => {
  setup();
  const day15 = screen.getByRole('button', { name: /^15$/ });
  expect(day15).toHaveAttribute('data-has-meeting', 'true');
  expect(day15).toHaveAttribute('data-selected', 'true');
  const day16 = screen.getByRole('button', { name: /^16$/ });
  expect(day16).not.toHaveAttribute('data-has-meeting', 'true');
});

test('날짜 클릭 시 onSelect(date) 호출', () => {
  const { onSelect } = setup();
  fireEvent.click(screen.getByRole('button', { name: /^16$/ }));
  expect(onSelect).toHaveBeenCalledWith('2025-05-16');
});
