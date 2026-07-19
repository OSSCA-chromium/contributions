import { render, screen } from '@testing-library/react';
import Analytics from '@/components/Analytics';

jest.mock('@next/third-parties/google', () => ({
  GoogleAnalytics: ({ gaId }: { gaId: string }) => (
    <div data-testid="google-analytics" data-ga-id={gaId} />
  ),
}));

const originalLocation = window.location;

function mockHostname(hostname: string) {
  Object.defineProperty(window, 'location', {
    value: new URL(`https://${hostname}/contributions/`),
    writable: true,
  });
}

afterEach(() => {
  Object.defineProperty(window, 'location', {
    value: originalLocation,
    writable: true,
  });
});

describe('Analytics', () => {
  it('localhost에서는 GA를 렌더링하지 않는다', () => {
    // jsdom 기본 URL은 http://localhost/
    render(<Analytics />);
    expect(screen.queryByTestId('google-analytics')).not.toBeInTheDocument();
  });

  it('포크 배포 호스트에서는 GA를 렌더링하지 않는다', () => {
    mockHostname('someone-else.github.io');
    render(<Analytics />);
    expect(screen.queryByTestId('google-analytics')).not.toBeInTheDocument();
  });

  it('프로덕션 호스트에서만 GA를 측정 ID와 함께 렌더링한다', () => {
    mockHostname('ossca-chromium.github.io');
    render(<Analytics />);
    expect(screen.getByTestId('google-analytics')).toHaveAttribute(
      'data-ga-id',
      'G-5T5Q4PMYKM'
    );
  });
});
