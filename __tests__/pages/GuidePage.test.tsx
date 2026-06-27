import { render, screen } from '@testing-library/react';
import GuidePage from '@/app/guide/page';

describe('가이드 페이지(리다이렉트 stub)', () => {
  it('docs 경로로 안내하는 리다이렉트 링크를 렌더링합니다', () => {
    render(<GuidePage />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/contributions/docs/');
  });
});
