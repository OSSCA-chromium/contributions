import { buildSearchIndex } from '@/lib/search-index';

const items = [
  {
    slug: '1',
    title: 'Fix docs',
    date: '2025-05-08',
    author: 'octocat',
    labels: ['docs'],
    status: 'merged' as const,
    excerpt: 'a',
  },
  {
    slug: '2',
    title: 'Add test',
    date: '2025-05-09',
    author: 'hubot',
    labels: ['test'],
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
    labels: ['docs'],
    status: 'merged',
    date: '2025-05-08',
    excerpt: 'a',
  });
  expect(Object.keys(idx[0])).not.toContain('contentHtml');
});
