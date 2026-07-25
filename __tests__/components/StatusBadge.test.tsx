import { render, screen } from '@testing-library/react';
import StatusBadge from '@/components/StatusBadge';

test('merged 상태는 MERGED 라벨을 보여준다', () => {
  render(<StatusBadge status="merged" />);
  expect(screen.getByText('MERGED')).toBeInTheDocument();
});

test('status가 없으면 아무것도 렌더링하지 않는다', () => {
  const { container } = render(<StatusBadge />);
  expect(container).toBeEmptyDOMElement();
});
