import { fireEvent, render, screen } from '@testing-library/react';
import ContributionGraph from '@/components/ContributionGraph';
import type { SearchIndexItem } from '@/lib/types';

const items: SearchIndexItem[] = [
  { slug: '1', title: 'Fix rendering', author: 'alice', date: '2026-01-01', module: 'blink', kind: 'fix', keywords: [], labels: [], related: [], relatedSlugs: ['2'], crbug: 42, status: 'merged', excerpt: '' },
  { slug: '2', title: 'Fix V8', author: 'bob', date: '2026-01-02', module: 'v8', kind: 'fix', keywords: [], labels: [], related: [], relatedSlugs: ['1'], crbug: 42, repo: 'v8/v8', status: 'in review', excerpt: '' },
];

test('selects a patch, shows real neighbors, and filters projects without persistent author IDs', () => {
  render(<ContributionGraph items={items} />);
  expect(screen.getByText('Chromium')).toBeInTheDocument();
  expect(screen.getByText('V8')).toBeInTheDocument();
  expect(screen.getByText('연관 패치 2건 · 연결 1개')).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('패치 선택'), { target: { value: '1' } });
  expect(screen.getByRole('link', { name: 'Fix rendering' })).toHaveAttribute('href', '/patches/1');
  expect(screen.getByRole('link', { name: 'Fix V8' })).toHaveAttribute('href', '/patches/2');
  expect(screen.getByRole('img', { name: 'alice 프로필 이미지' })).toBeInTheDocument();
  expect(screen.queryByText('alice')).not.toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('프로젝트 필터'), { target: { value: 'v8/v8' } });
  expect(screen.getAllByRole('button', { name: /^패치 / })).toHaveLength(1);
  expect(screen.getByText('연관 패치 0건 · 연결 0개')).toBeInTheDocument();
});

test('supports keyboard selection and the empty state', () => {
  const { rerender } = render(<ContributionGraph items={items} compact />);
  fireEvent.keyDown(screen.getByRole('button', { name: '패치 1: Fix rendering' }), { key: 'Enter' });
  expect(screen.getByRole('link', { name: 'Fix rendering' })).toBeInTheDocument();
  rerender(<ContributionGraph items={[]} />);
  expect(screen.getByText('표시할 패치가 없습니다.')).toBeInTheDocument();
});
