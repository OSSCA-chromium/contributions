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

test('월별 집계는 Date 객체를 KST(서울) 기준으로 분류한다', () => {
  // UTC 2025-12-31 15:00 = KST 2026-01-01 00:00 → '2026-01'
  const s = computeStats([
    {
      slug: 'x',
      title: 'x',
      date: new Date('2025-12-31T15:00:00.000Z'),
      author: 'octocat',
      labels: [],
      status: 'merged' as const,
      excerpt: '',
    },
  ]);
  expect(s.byMonth[0].month).toBe('2026-01');
});
