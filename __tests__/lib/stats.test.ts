import { computeStats } from '@/lib/stats';

const items = [
  {
    slug: '1',
    title: 'a',
    date: '2025-05-08',
    author: 'octocat',
    labels: [],
    status: 'merged' as const,
    excerpt: '',
  },
  {
    slug: '2',
    title: 'b',
    date: '2025-05-09',
    author: 'octocat',
    labels: [],
    status: 'in review' as const,
    excerpt: '',
  },
  {
    slug: '3',
    title: 'c',
    date: '2025-06-01',
    author: 'hubot',
    labels: [],
    status: 'merged' as const,
    excerpt: '',
  },
];

test('computeStats는 총계/상태/월별/기여자/머지비율을 계산한다', () => {
  const s = computeStats(items);
  expect(s.total).toBe(3);
  expect(s.contributorCount).toBe(2);
  expect(s.mergedRatio).toBeCloseTo(2 / 3);
  expect(s.byStatus.find((x) => x.status === 'merged')?.count).toBe(2);
  expect(s.byMonth.find((x) => x.month === '2025-05')?.count).toBe(2);
  expect(s.topContributors[0]).toEqual({ username: 'octocat', count: 2 });
});
