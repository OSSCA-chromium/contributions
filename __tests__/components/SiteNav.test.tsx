import { render, screen } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import SiteNav from '@/components/SiteNav';

jest.mock('next/navigation', () => ({ usePathname: jest.fn() }));

const mockUsePathname = usePathname as jest.Mock;

const links = [
  { href: '/patches', label: '기여 목록' },
  { href: '/stats', label: '통계' },
];

test('현재 경로의 링크에 aria-current를 붙인다', () => {
  mockUsePathname.mockReturnValue('/patches/');
  render(<SiteNav links={links} />);
  expect(screen.getByText('기여 목록')).toHaveAttribute('aria-current', 'page');
  expect(screen.getByText('통계')).not.toHaveAttribute('aria-current');
});

// basePath is stripped by usePathname(), but sub-routes like a patch detail
// page still need the parent nav link ("기여 목록") to read as active.
test('하위 경로도 활성 상태로 취급한다', () => {
  mockUsePathname.mockReturnValue('/patches/8260570/');
  render(<SiteNav links={links} />);
  expect(screen.getByText('기여 목록')).toHaveAttribute('aria-current', 'page');
});
