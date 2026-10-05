import { render, screen } from '@testing-library/react';
import StatusBadge from '@/components/StatusBadge';

test('merged 상태는 MERGED 라벨을 보여준다', () => {
  render(<StatusBadge status="merged" />);
  expect(screen.getByText('Merged')).toBeInTheDocument();
});

test('status가 없으면 아무것도 렌더링하지 않는다', () => {
  const { container } = render(<StatusBadge />);
  expect(container).toBeEmptyDOMElement();
});

// Keep the two-word In Review label on one line in narrow cards.
test('in review 배지는 줄바꿈되지 않는다', () => {
  render(<StatusBadge status="in review" />);
  expect(screen.getByText('In Review')).toHaveClass('whitespace-nowrap');
});
