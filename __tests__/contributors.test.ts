import { getContributorSlugs } from '@/lib/contributors';

test('getContributorSlugs는 유효한 GitHub username만 포함한다', () => {
  const slugs = getContributorSlugs();
  expect(slugs.every((s) => /^[a-zA-Z0-9-]+$/.test(s.username))).toBe(true);
});
