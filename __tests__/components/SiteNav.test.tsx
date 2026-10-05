import { render, screen } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import SiteNav from '@/components/SiteNav';

jest.mock('next/navigation', () => ({ usePathname: jest.fn() }));

const links = [
  { href: '/patches', label: 'Contributions' },
  { href: '/contributors', label: 'Contributors' },
];

test.each(['/patches/', '/patches/123/'])('marks the archive menu active on %s', (path) => {
  (usePathname as jest.Mock).mockReturnValue(path);
  render(<SiteNav links={links} />);
  expect(screen.getByRole('link', { name: 'Contributions' })).toHaveAttribute('aria-current', 'page');
  expect(screen.getByRole('link', { name: 'Contributors' })).not.toHaveAttribute('aria-current');
});

test('does not match a route that only shares a prefix', () => {
  (usePathname as jest.Mock).mockReturnValue('/patches-other/');
  render(<SiteNav links={links} />);
  expect(screen.getByRole('link', { name: 'Contributions' })).not.toHaveAttribute('aria-current');
});
