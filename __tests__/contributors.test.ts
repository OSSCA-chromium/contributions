import {
  getContributorSlugs,
  getContributorSummaries,
} from '@/lib/contributors';

test('getContributorSlugs는 유효한 GitHub username만 포함한다', () => {
  const slugs = getContributorSlugs();
  expect(slugs.every((s) => /^[a-zA-Z0-9-]+$/.test(s.username))).toBe(true);
});

test('getContributorSummaries는 각 기여자에 lastActive(ISO date)를 포함한다', () => {
  const summaries = getContributorSummaries();
  expect(summaries.length).toBeGreaterThan(0);
  for (const s of summaries) {
    expect(s.lastActive).toMatch(/^\d{4}-\d{2}-\d{2}/);
  }
});
