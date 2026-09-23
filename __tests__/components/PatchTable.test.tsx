import { fireEvent, render, screen } from '@testing-library/react';
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

test('related groups show their count, start collapsed, and expose accessible expand controls', () => {
  const relatedItems = [
    { ...items[0], issue: 31, crbug: 700, relatedSlugs: ['2023456'] },
    { ...items[1], issue: 31, crbug: 700, relatedSlugs: ['1012345'] },
  ];

  render(<PatchTable items={relatedItems} />);

  const expandButton = screen.getByRole('button', { name: '전체 2건 펼치기' });
  expect(expandButton).toHaveAttribute('aria-expanded', 'false');
  expect(expandButton).toHaveAttribute('aria-controls');
  expect(screen.getByRole('link', { name: 'crbug 700' })).toHaveAttribute(
    'href',
    'https://crbug.com/700'
  );
  expect(screen.queryByRole('link', { name: 'Set up WebRTC tests' })).not.toBeInTheDocument();

  fireEvent.click(expandButton);
  expect(screen.getByRole('button', { name: '전체 2건 접기' })).toHaveAttribute(
    'aria-expanded',
    'true'
  );
  expect(screen.getByRole('link', { name: 'Set up WebRTC tests' })).toBeInTheDocument();
});

test('issue-only and explicit-related groups show valid or no invented external links', () => {
  const issueItems = [
    { ...items[0], slug: '11', issue: 44, relatedSlugs: ['22'] },
    { ...items[1], slug: '22', issue: 44, relatedSlugs: ['11'] },
  ];
  const { unmount } = render(<PatchTable items={issueItems} />);

  expect(screen.getByRole('link', { name: '이슈 #44' })).toHaveAttribute(
    'href',
    'https://github.com/OSSCA-chromium/contributions/issues/44'
  );
  unmount();

  render(<PatchTable items={[
    { ...items[0], slug: '31', relatedSlugs: ['32'] },
    { ...items[1], slug: '32', relatedSlugs: ['31'] },
  ]} />);

  expect(screen.getByRole('button', { name: '전체 2건 펼치기' })).toBeInTheDocument();
  expect(screen.queryByRole('link', { name: /crbug|이슈/ })).not.toBeInTheDocument();
});
