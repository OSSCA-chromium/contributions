import { render, screen, fireEvent } from '@testing-library/react';
import { YearProvider } from '@/components/YearProvider';
import YearSelector from '@/components/YearSelector';

beforeEach(() => localStorage.clear());

test('전체 + 연도 옵션을 렌더하고 클릭 시 활성화된다', () => {
  render(
    <YearProvider>
      <YearSelector years={['2026', '2025']} />
    </YearProvider>
  );
  expect(screen.getByRole('button', { name: '전체' })).toBeInTheDocument();
  const y2025 = screen.getByRole('button', { name: '2025' });
  fireEvent.click(y2025);
  expect(y2025).toHaveAttribute('aria-pressed', 'true');
  expect(localStorage.getItem('year')).toBe('2025');
});
