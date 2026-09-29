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

// 'IN REVIEW'는 공백이 있는 두 단어라 좁은 카드에서 줄바꿈되면 배지가 깨진다.
test('in review 배지는 줄바꿈되지 않는다', () => {
  render(<StatusBadge status="in review" />);
  expect(screen.getByText('IN REVIEW')).toHaveClass('whitespace-nowrap');
});
