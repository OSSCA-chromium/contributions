import { render } from '@testing-library/react';
import Redirect from '@/components/Redirect';

test('Redirect는 안내 텍스트와 링크를 렌더링한다', () => {
  const { getByRole } = render(<Redirect to="/contributions/patches/" />);
  expect(getByRole('link')).toHaveAttribute('href', '/contributions/patches/');
});
