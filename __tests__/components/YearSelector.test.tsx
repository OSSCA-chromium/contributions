import { render, screen, fireEvent } from '@testing-library/react';
import { useState } from 'react';
import YearSelector from '@/components/YearSelector';

function Harness() {
  const [year, setYear] = useState('2026');
  return <YearSelector years={['2026', '2025']} value={year} onChange={setYear} />;
}

test('전체 + 연도 옵션을 렌더하고 클릭 시 활성화된다', () => {
  render(<Harness />);
  expect(screen.getByRole('button', { name: '전체' })).toBeInTheDocument();

  const y2026 = screen.getByRole('button', { name: '2026' });
  expect(y2026).toHaveAttribute('aria-pressed', 'true');

  const y2025 = screen.getByRole('button', { name: '2025' });
  fireEvent.click(y2025);
  expect(y2025).toHaveAttribute('aria-pressed', 'true');
  expect(y2026).toHaveAttribute('aria-pressed', 'false');
});
