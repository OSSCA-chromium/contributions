import {
  validateFrontmatter,
  extractRawDate,
  extractReviewId,
} from '../../scripts/validate-contributions';

const valid = {
  title: 'Fix docs link',
  date: '2025-05-08',
  author: 'octocat',
  contribution_url: 'https://crrev.com/c/123',
  module: 'docs',
  kind: 'fix',
  status: 'merged',
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

test.each(['in review', 'merged', 'abandoned'])('%s 상태를 허용한다', (status) => {
  expect(validateFrontmatter({ ...valid, status })).toEqual([]);
});

test('draft 상태를 거부한다', () => {
  const errs = validateFrontmatter({ ...valid, status: 'draft' });
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

test('폐기된 labels 필드를 거부한다', () => {
  const errs = validateFrontmatter({ ...valid, labels: ['docs'] });
  expect(errs.some((e) => e.includes('labels'))).toBe(true);
});

test('module/kind 누락·빈 값·배열을 잡는다', () => {
  const { module, ...noModule } = valid; // same unused-rest pattern as the noTitle test above
  expect(validateFrontmatter(noModule).some((e) => e.includes('module'))).toBe(true);
  expect(validateFrontmatter({ ...valid, kind: '' }).some((e) => e.includes('kind'))).toBe(true);
  expect(validateFrontmatter({ ...valid, module: ['docs'] }).some((e) => e.includes('module'))).toBe(true);
});

test('status는 merged/abandoned/in review만 허용한다', () => {
  expect(validateFrontmatter({ ...valid, status: 'abandoned' })).toEqual([]);
  expect(validateFrontmatter({ ...valid, status: 'in review' })).toEqual([]);
  expect(validateFrontmatter({ ...valid, status: 'draft' }).some((e) => e.includes('status'))).toBe(true);
});

test('허용되지 않은 호스트·review id 없는 URL을 잡는다', () => {
  expect(
    validateFrontmatter({ ...valid, contribution_url: 'https://example.com/c/123' }).some((e) =>
      e.includes('contribution_url')
    )
  ).toBe(true);
  expect(
    validateFrontmatter({ ...valid, contribution_url: 'https://crrev.com/about' }).some((e) =>
      e.includes('contribution_url')
    )
  ).toBe(true);
});

test('issue/crbug/related/repo 형식을 검증한다', () => {
  expect(validateFrontmatter({ ...valid, issue: 42, crbug: 5386, related: [100, 200], repo: 'chromium/src' })).toEqual([]);
  expect(validateFrontmatter({ ...valid, issue: 0 }).some((e) => e.includes('issue'))).toBe(true);
  expect(validateFrontmatter({ ...valid, crbug: 'x' }).some((e) => e.includes('crbug'))).toBe(true);
  expect(validateFrontmatter({ ...valid, related: [1.5] }).some((e) => e.includes('related'))).toBe(true);
  expect(validateFrontmatter({ ...valid, repo: 7 }).some((e) => e.includes('repo'))).toBe(true);
});

test('extractReviewId는 crrev와 full URL 모두에서 id를 뽑는다', () => {
  expect(extractReviewId('https://crrev.com/c/8146040')).toBe('8146040');
  expect(
    extractReviewId('https://chromium-review.googlesource.com/c/chromium/src/+/8146040')
  ).toBe('8146040');
  expect(
    extractReviewId('https://chromium-review.googlesource.com/c/devtools/devtools-frontend/+/1000')
  ).toBe('1000');
  expect(extractReviewId('https://crrev.com/about')).toBeUndefined();
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
