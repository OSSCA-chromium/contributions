import { render, screen, within } from '@testing-library/react';
import PatchTable from '@/components/PatchTable';
import type { SearchIndexItem } from '@/lib/types';

const items = [
  {
    slug: '1012345',
    title: 'Set up WebRTC tests',
    date: '2026-05-08',
    author: 'alice',
    repo: 'devtools/devtools-frontend',
    module: 'blink/renderer',
    kind: 'test',
    keywords: ['webrtc'],
    labels: ['browser-tests'],
    relatedSlugs: [],
    related: [],
    status: 'in review' as const,
    excerpt: 'Browser peer connection coverage',
  },
  {
    slug: '2023456',
    title: 'Document the build setup',
    date: '2025-03-15',
    author: 'bob',
    module: 'docs',
    kind: 'docs',
    keywords: ['documentation'],
    labels: ['guide'],
    relatedSlugs: [],
    related: [],
    status: 'merged' as const,
    excerpt: 'Build setup reference',
  },
  {
    slug: '3034567',
    title: 'Clean up rendering tests',
    date: '2026-06-20',
    author: 'carol',
    module: 'blink/renderer',
    kind: 'cleanup',
    keywords: ['cleanup-keyword'],
    labels: ['legacy-cleanup'],
    relatedSlugs: [],
    related: [],
    status: 'abandoned' as const,
    excerpt: 'Remove outdated test helpers',
  },
] satisfies (SearchIndexItem & { repo?: string })[];

test('archive table shows upload date, review ID, axes, authors, and all statuses', () => {
  render(<PatchTable items={items} />);

  expect(screen.getByRole('table', { name: '기여 아카이브' })).toBeInTheDocument();
  expect(screen.getAllByRole('columnheader')).toHaveLength(5);
  expect(screen.getByRole('columnheader', { name: 'Created' })).toBeInTheDocument();
  expect(screen.getByText('2026-05-08')).toBeInTheDocument();
  expect(screen.getByText('1012345')).toBeInTheDocument();
  expect(screen.getAllByText('blink/renderer')).toHaveLength(2);
  expect(screen.getByText('test')).toBeInTheDocument();
  expect(screen.getByText('devtools/devtools-frontend')).toBeInTheDocument();
  expect(screen.getByRole('img', { name: 'alice 프로필 이미지' })).toBeInTheDocument();
  expect(screen.queryByText('alice')).not.toBeInTheDocument();
  expect(screen.getByText('In Review')).toBeInTheDocument();
  expect(screen.getByText('Merged')).toBeInTheDocument();
  expect(screen.getByText('Abandoned')).toBeInTheDocument();
});

test('archive title links to its local patch detail route', () => {
  render(<PatchTable items={items} />);

  expect(screen.getByRole('link', { name: 'Set up WebRTC tests' })).toHaveAttribute(
    'href',
    '/patches/1012345'
  );
});

test('singleton rows are direct children of the accessible table', () => {
  render(<PatchTable items={[items[0]]} />);

  const table = screen.getByRole('table', { name: '기여 아카이브' });
  const row = screen.getByRole('row', { name: /Set up WebRTC tests/ });
  expect(row.parentElement).toBe(table);
});

test('related patches remain visible as individual rows in the supplied order', () => {
  const relatedItems = [
    { ...items[0], issue: 31, crbug: 700, related: [3034567], relatedSlugs: ['3034567', '2023456'] },
    { ...items[2], relatedSlugs: ['1012345'] },
    { ...items[1], issue: 31, crbug: 700, relatedSlugs: ['1012345'] },
  ];

  render(<PatchTable items={relatedItems} />);

  const table = screen.getByRole('table', { name: '기여 아카이브' });
  const rows = within(table).getAllByRole('row');
  expect(rows).toHaveLength(4);
  expect(rows.slice(1).map((row) => within(row).getByRole('link', {
    name: /Set up WebRTC tests|Clean up rendering tests|Document the build setup/,
  }).textContent)).toEqual([
    'Set up WebRTC tests',
    'Clean up rendering tests',
    'Document the build setup',
  ]);
  expect(rows.slice(1).every((row) => row.parentElement === table)).toBe(true);
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
});
