import { fireEvent, render, screen, within } from '@testing-library/react';
import ContributorView from '@/components/ContributorView';
import type { Contribution } from '@/lib/types';

const contributions: Contribution[] = [
  { slug: '1', date: '2026-09-01', status: 'merged' },
  { slug: '2', date: '2026-09-02', status: 'in review' },
  { slug: '3', date: '2026-09-03', status: 'abandoned' },
  { slug: '4', date: '2025-09-01', status: 'abandoned' },
].map((item) => ({
  title: `Patch ${item.slug}`,
  author: 'octocat',
  module: 'base',
  kind: 'fix',
  repo: 'chromium/src',
  related: [],
  relatedSlugs: [],
  excerpt: '',
  ...item,
  status: item.status as Contribution['status'],
}));

test('기여자 상세에서 연도에 맞는 Abandoned 건수와 패치를 표시한다', () => {
  render(<ContributorView contributions={contributions} />);

  const count = (label: string) =>
    screen.getByText(label).parentElement?.querySelector('b')?.textContent;

  expect(count('총 기여')).toBe('3');
  expect(count('Merged')).toBe('1');
  expect(count('In Review')).toBe('1');
  expect(count('Abandoned')).toBe('1');
  expect(screen.queryByRole('link', { name: 'Patch 4' })).not.toBeInTheDocument();

  const years = screen.getByRole('group', { name: '연도 선택' });
  fireEvent.click(within(years).getByRole('button', { name: '전체' }));
  expect(count('총 기여')).toBe('4');
  expect(count('Abandoned')).toBe('2');
  expect(screen.getByRole('link', { name: 'Patch 4' })).toBeInTheDocument();

  fireEvent.click(within(years).getByRole('button', { name: '2025' }));
  expect(count('총 기여')).toBe('1');
  expect(count('Merged')).toBe('0');
  expect(count('In Review')).toBe('0');
  expect(count('Abandoned')).toBe('1');
  expect(screen.queryByRole('link', { name: 'Patch 1' })).not.toBeInTheDocument();
});
