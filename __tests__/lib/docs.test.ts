import { getAllDocs, getDocSlugs } from '@/lib/docs';

test('getAllDocs는 order 순으로 정렬되어 반환된다', () => {
  const docs = getAllDocs();
  expect(docs.length).toBeGreaterThan(0);
  const orders = docs.map((d) => d.order);
  expect(orders).toEqual([...orders].sort((a, b) => a - b));
});

test('getDocSlugs는 slug 목록을 반환한다', () => {
  const slugs = getDocSlugs();
  expect(slugs.every((s) => typeof s.slug === 'string')).toBe(true);
});
