import { render, screen } from '@testing-library/react';
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
    related: [],
    status: 'abandoned' as const,
    excerpt: 'Remove outdated test helpers',
  },
] satisfies (SearchIndexItem & { repo?: string })[];

test('archive table shows upload date, review ID, axes, authors, and all statuses', () => {
  render(<PatchTable items={items} />);

  expect(screen.getByRole('table', { name: '기여 아카이브' })).toBeInTheDocument();
  expect(screen.getAllByRole('columnheader')).toHaveLength(5);
  expect(screen.getByRole('columnheader', { name: '업로드일' })).toBeInTheDocument();
  expect(screen.getByText('2026-05-08')).toBeInTheDocument();
  expect(screen.getByText('1012345')).toBeInTheDocument();
  expect(screen.getAllByText('모듈: blink/renderer')).toHaveLength(2);
  expect(screen.getByText('종류: test')).toBeInTheDocument();
  expect(screen.getByText('devtools/devtools-frontend')).toBeInTheDocument();
  expect(screen.getByText('alice')).toBeInTheDocument();
  expect(screen.getByText('IN REVIEW')).toBeInTheDocument();
  expect(screen.getByText('MERGED')).toBeInTheDocument();
  expect(screen.getByText('ABANDONED')).toBeInTheDocument();
});

test('archive title links to its local patch detail route', () => {
  render(<PatchTable items={items} />);

  expect(screen.getByRole('link', { name: 'Set up WebRTC tests' })).toHaveAttribute(
    'href',
    '/patches/1012345'
  );
});
