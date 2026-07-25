import { render, screen } from '@testing-library/react';
import YearBadge from '@/components/YearBadge';

test('날짜에서 연도를 배지로 렌더한다', () => {
  render(<YearBadge date="2025-05-08" />);
  expect(screen.getByText('2025')).toBeInTheDocument();
});

test('잘못된 날짜는 렌더하지 않는다', () => {
  const { container } = render(<YearBadge date="nope" />);
  expect(container).toBeEmptyDOMElement();
});
