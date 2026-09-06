import { buildSearchIndex } from '@/lib/search-index';

const items = [
  {
    slug: '1',
    title: 'Fix docs',
    date: '2025-05-08',
    author: 'octocat',
    contributionUrl: 'https://crrev.com/c/1',
    module: 'docs',
    kind: 'fix',
    repo: 'chromium/src',
    crbug: 42,
    related: [],
    relatedSlugs: ['2'],
    status: 'merged' as const,
    excerpt: 'a',
    content: '본문',
    contentHtml: '<p>본문</p>',
  },
  {
    slug: '2',
    title: 'Add test',
    date: '2025-05-09',
    author: 'hubot',
    contributionUrl: 'https://crrev.com/c/2',
    module: 'base',
    kind: 'test',
    repo: 'chromium/src',
    related: [],
    relatedSlugs: ['1'],
    status: 'in review' as const,
    excerpt: 'b',
  },
];

test('buildSearchIndex는 필요한 필드만 추출한다', () => {
  const idx = buildSearchIndex(items);
  expect(idx[0]).toEqual({
    slug: '1',
    title: 'Fix docs',
    author: 'octocat',
    contributionUrl: 'https://crrev.com/c/1',
    module: 'docs',
    kind: 'fix',
    repo: 'chromium/src',
    issue: undefined,
    crbug: 42,
    relatedSlugs: ['2'],
    status: 'merged',
    date: '2025-05-08',
    excerpt: 'a',
  });
  expect(Object.keys(idx[0])).not.toContain('contentHtml');
  expect(Object.keys(idx[0])).not.toContain('content');
});
