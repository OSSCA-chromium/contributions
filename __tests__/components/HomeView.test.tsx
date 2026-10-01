import { fireEvent, render, screen, within } from '@testing-library/react';
import HomeView from '@/components/HomeView';
import type { SearchIndexItem } from '@/lib/types';

function item(slug: string, date: string, module: string, status: SearchIndexItem['status']): SearchIndexItem {
  return {
    slug, title: `Patch ${slug}`, author: `author${slug}`, date, module, status,
    kind: 'fix', keywords: ['legacy-keyword'], labels: ['legacy-keyword'],
    related: [], relatedSlugs: [], excerpt: '',
  };
}

test('the archive home shows recent patches in an accessible table and filters its summary by year', () => {
  render(<HomeView items={[
    item('1', '2026-10-01', 'blink', 'merged'),
    item('2', '2026-09-30', 'base', 'abandoned'),
    item('3', '2025-09-01', 'blink', 'in review'),
  ]} />);

  const table = screen.getByRole('table', { name: '기여 아카이브' });
  expect(within(table).getByRole('link', { name: 'Patch 1' })).toHaveAttribute('href', '/patches/1');
  expect(within(table).getByRole('link', { name: 'Patch 2' })).toBeInTheDocument();
  expect(within(table).queryByRole('link', { name: 'Patch 3' })).toBeNull();
  expect(screen.getByText('누적 기여').previousElementSibling).toHaveTextContent('2');
  expect(screen.getByText('머지 완료').previousElementSibling).toHaveTextContent('1');
  expect(screen.getByText('모듈').previousElementSibling).toHaveTextContent('2');

  fireEvent.click(screen.getByRole('button', { name: '2025' }));

  expect(within(table).getByRole('link', { name: 'Patch 3' })).toBeInTheDocument();
  expect(within(table).queryByRole('link', { name: 'Patch 1' })).toBeNull();
  expect(screen.getByText('누적 기여').previousElementSibling).toHaveTextContent('1');
  expect(screen.getByText('머지 완료').previousElementSibling).toHaveTextContent('0');
  expect(screen.getByText('모듈').previousElementSibling).toHaveTextContent('1');
});
