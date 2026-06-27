import { getYear, getAvailableYears, filterByYear, DEFAULT_YEAR } from '@/lib/years';

test('getYear는 문자열/Date/잘못된 값을 처리한다', () => {
  expect(getYear('2025-05-08')).toBe('2025');
  expect(getYear(new Date('2026-01-02'))).toBe('2026');
  expect(getYear('nope')).toBe('unknown');
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
