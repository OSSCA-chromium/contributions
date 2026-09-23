import { fireEvent, render, screen, within } from '@testing-library/react';
import ContributionSearch from '@/components/ContributionSearch';
import type { SearchIndexItem } from '@/lib/types';

const items: SearchIndexItem[] = [
  {
    slug: '1012345',
    title: 'Set up WebRTC coverage',
    date: '2026-05-08',
    author: 'alice',
    module: 'blink/renderer',
    kind: 'test',
    keywords: ['canonical-term', 'webrtc'],
    labels: ['legacy-term', 'old-webrtc'],
    related: [],
    status: 'in review',
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
    status: 'merged',
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
    status: 'abandoned',
    excerpt: 'Remove outdated test helpers',
  },
];

test('free-text search matches every archive field and both keyword arrays', () => {
  const searchableTerms = [
    '1012345',
    'Set up WebRTC coverage',
    'alice',
    'peer connection coverage',
    'blink/renderer',
    'test',
    'canonical-term',
    'legacy-term',
  ];

  for (const term of searchableTerms) {
    const { unmount } = render(<ContributionSearch items={items} />);
    fireEvent.change(screen.getByRole('searchbox', { name: '아카이브 검색' }), {
      target: { value: term },
    });

    expect(screen.getByText('Set up WebRTC coverage')).toBeInTheDocument();
    expect(screen.queryByText('Document the build setup')).not.toBeInTheDocument();
    unmount();
  }
});

test('module and kind chips combine as filters', () => {
  render(<ContributionSearch items={items} />);
  fireEvent.click(screen.getByText('모듈 및 종류 필터'));
  fireEvent.click(screen.getByRole('button', { name: '모듈: blink/renderer' }));
  fireEvent.click(screen.getByRole('button', { name: '종류: cleanup' }));

  expect(screen.getByText('Clean up rendering tests')).toBeInTheDocument();
  expect(screen.queryByText('Set up WebRTC coverage')).not.toBeInTheDocument();
  expect(screen.queryByText('Document the build setup')).not.toBeInTheDocument();
});

test('module option search narrows the available module chips', () => {
  render(<ContributionSearch items={items} />);
  fireEvent.click(screen.getByText('모듈 및 종류 필터'));
  fireEvent.change(screen.getByRole('searchbox', { name: '모듈 옵션 검색' }), {
    target: { value: 'docs' },
  });

  expect(screen.getByRole('button', { name: '모듈: docs' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: '모듈: blink/renderer' })).not.toBeInTheDocument();
});

test.each([
  ['In Review', 'Set up WebRTC coverage'],
  ['Merged', 'Document the build setup'],
  ['Abandoned', 'Clean up rendering tests'],
])('status filter selects %s records', (status, title) => {
  render(<ContributionSearch items={items} />);
  fireEvent.click(within(screen.getByRole('group', { name: '연도 선택' })).getByRole('button', { name: '전체' }));
  fireEvent.click(screen.getByRole('button', { name: status }));

  expect(screen.getByText(title)).toBeInTheDocument();
  for (const otherTitle of items.map((item) => item.title).filter((itemTitle) => itemTitle !== title)) {
    expect(screen.queryByText(otherTitle)).not.toBeInTheDocument();
  }
});

test('year selector keeps its date filter behavior', () => {
  render(<ContributionSearch items={items} />);
  fireEvent.click(within(screen.getByRole('group', { name: '연도 선택' })).getByRole('button', { name: '2025' }));

  expect(screen.getByText('Document the build setup')).toBeInTheDocument();
  expect(screen.queryByText('Set up WebRTC tests')).not.toBeInTheDocument();
});

test('search precedes status and year, which precede module and kind filters', () => {
  render(<ContributionSearch items={items} />);
  fireEvent.click(screen.getByText('모듈 및 종류 필터'));

  const search = screen.getByRole('searchbox', { name: '아카이브 검색' });
  const status = screen.getByRole('group', { name: '상태 선택' });
  const year = screen.getByRole('group', { name: '연도 선택' });
  const moduleSearch = screen.getByRole('searchbox', { name: '모듈 옵션 검색' });

  expect(search.compareDocumentPosition(status) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(status.compareDocumentPosition(year) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(year.compareDocumentPosition(moduleSearch) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
});
