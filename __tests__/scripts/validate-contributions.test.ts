import {
  validateFrontmatter,
  extractRawDate,
} from '../../scripts/validate-contributions';

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

test('labels에 빈 문자열 원소가 있으면 잡는다', () => {
  const errs = validateFrontmatter({ ...valid, labels: ['docs', ''] });
  expect(errs.some((e) => e.includes('labels'))).toBe(true);
});

test('존재하지 않는 날짜(형식만 맞음)를 잡는다', () => {
  expect(
    validateFrontmatter({ ...valid, date: '2025-02-30' }).some((e) => e.includes('date'))
  ).toBe(true);
  expect(
    validateFrontmatter({ ...valid, date: '2025-13-01' }).some((e) => e.includes('date'))
  ).toBe(true);
});

test('contribution_url이 유효한 URL/https가 아니면 잡는다', () => {
  expect(
    validateFrontmatter({ ...valid, contribution_url: 'not-a-url' }).some((e) =>
      e.includes('contribution_url')
    )
  ).toBe(true);
  expect(
    validateFrontmatter({ ...valid, contribution_url: 'http://crrev.com/c/1' }).some((e) =>
      e.includes('contribution_url')
    )
  ).toBe(true);
});

test('extractRawDate는 따옴표 안의 #를 주석으로 보지 않는다', () => {
  // 따옴표 스칼라: 내부 # 보존(주석 아님) → 이후 date 검증에서 무효로 잡힘
  expect(extractRawDate('date: "2025-05-08 # x"')).toBe('2025-05-08 # x');
  // 따옴표 없는 값: 인라인 YAML 주석만 제거
  expect(extractRawDate('date: 2025-05-08 # 실제 주석')).toBe('2025-05-08');
  expect(extractRawDate('title: t')).toBeUndefined();
});

test('따옴표+가짜주석 date는 validateFrontmatter에서 무효 처리된다', () => {
  // extractRawDate가 추출한 원본 문자열로 검증하면 형식 위반으로 잡혀야 한다
  const raw = extractRawDate('date: "2025-05-08 # x"');
  expect(validateFrontmatter({ ...valid, date: raw }).some((e) => e.includes('date'))).toBe(
    true
  );
});
