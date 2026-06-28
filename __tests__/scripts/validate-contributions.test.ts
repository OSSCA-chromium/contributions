import { validateFrontmatter } from '../../scripts/validate-contributions';

const valid = {
  title: 'Fix docs link',
  date: '2025-05-08',
  author: 'octocat',
  contribution_url: 'https://crrev.com/c/123',
  labels: ['docs'],
  status: 'in review',
};

test('유효한 frontmatter는 위반이 없다', () => {
  expect(validateFrontmatter(valid)).toEqual([]);
});

test('Date 객체 date도 허용한다', () => {
  expect(validateFrontmatter({ ...valid, date: new Date('2025-05-08') })).toEqual([]);
});

test('잘못된 status를 잡는다', () => {
  const errs = validateFrontmatter({ ...valid, status: 'open' });
  expect(errs.some((e) => e.includes('status'))).toBe(true);
});

test('잘못된 date 형식을 잡는다', () => {
  const errs = validateFrontmatter({ ...valid, date: '2025/05/08' });
  expect(errs.some((e) => e.includes('date'))).toBe(true);
});

test('필수 필드 누락을 잡는다', () => {
  const { title, ...noTitle } = valid;
  const errs = validateFrontmatter(noTitle);
  expect(errs.some((e) => e.includes('title'))).toBe(true);
});

test('labels가 배열이 아니면 잡는다', () => {
  const errs = validateFrontmatter({ ...valid, labels: 'docs' });
  expect(errs.some((e) => e.includes('labels'))).toBe(true);
});
