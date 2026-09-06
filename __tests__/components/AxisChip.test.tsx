import { render, screen } from '@testing-library/react';
import AxisChip from '@/components/AxisChip';

test('module 칩은 값을 그대로 보여준다', () => {
  render(<AxisChip kind="module" value="content" />);
  expect(screen.getByText('content')).toBeInTheDocument();
});

test('kind 칩은 대문자 스타일 클래스를 갖는다', () => {
  render(<AxisChip kind="kind" value="fix" />);
  expect(screen.getByText('fix')).toHaveClass('uppercase');
});

test('빈 값이면 아무것도 렌더하지 않는다', () => {
  const { container } = render(<AxisChip kind="module" value="" />);
  expect(container).toBeEmptyDOMElement();
});

test('module 칩은 긴 값을 말줄임표로 자른다', () => {
  render(<AxisChip kind="module" value="components/on_device_translation" />);
  expect(screen.getByText('components/on_device_translation')).toHaveClass('text-ellipsis');
});
