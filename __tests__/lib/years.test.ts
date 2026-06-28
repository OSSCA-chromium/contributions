import {
  getYear,
  getAvailableYears,
  getDataYears,
  resolveInitialYear,
  filterByYear,
  DEFAULT_YEAR,
} from '@/lib/years';

test('getYear는 문자열/Date/잘못된 값을 처리한다', () => {
  expect(getYear('2025-05-08')).toBe('2025');
  expect(getYear(new Date('2026-01-02'))).toBe('2026');
  expect(getYear('nope')).toBe('unknown');
});

test('getYear는 UTC 자정 Date를 KST(서울) 기준 연도로 분류한다', () => {
  // gray-matter가 date-only를 UTC 자정 Date로 파싱하는 경우. 서울(UTC+9)에서는
  // 2026-01-01이 그대로 2026이어야 한다(로컬 타임존과 무관하게).
  expect(getYear(new Date('2026-01-01T00:00:00.000Z'))).toBe('2026');
  // UTC 2025-12-31 15:00 = KST 2026-01-01 00:00 → 2026
  expect(getYear(new Date('2025-12-31T15:00:00.000Z'))).toBe('2026');
});

test('getDataYears는 데이터에 실제 존재하는 연도만 내림차순으로 반환한다', () => {
  expect(getDataYears([{ date: '2025-05-08' }, { date: '2025-06-01' }])).toEqual(['2025']);
  expect(getDataYears([{ date: '2026-02-01' }, { date: '2025-06-01' }])).toEqual(['2026', '2025']);
  expect(getDataYears([{ date: 'nope' }])).toEqual([]);
});

test('resolveInitialYear는 DEFAULT 연도 데이터가 없으면 최신 데이터 연도로 폴백한다', () => {
  expect(resolveInitialYear(['2025'])).toBe('2025'); // 2026 데이터 없음 → 최신(2025)
  expect(resolveInitialYear(['2026', '2025'])).toBe('2026'); // 2026 있음 → 2026
  expect(resolveInitialYear([])).toBe(DEFAULT_YEAR); // 데이터 없음 → 기본
});

test('getAvailableYears는 DEFAULT_YEAR를 항상 포함하고 내림차순 정렬한다', () => {
  const years = getAvailableYears([{ date: '2025-05-08' }, { date: '2025-06-01' }]);
  expect(years).toEqual(['2026', '2025']);
  expect(DEFAULT_YEAR).toBe('2026');
});

test('filterByYear는 all과 특정 연도를 구분한다', () => {
  const items = [{ date: '2025-05-08' }, { date: '2026-01-02' }];
  expect(filterByYear(items, 'all')).toHaveLength(2);
  expect(filterByYear(items, '2025')).toEqual([{ date: '2025-05-08' }]);
});
