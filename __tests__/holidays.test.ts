import { isHoliday } from '@/lib/holidays';

test('법정 공휴일이면 true를 반환한다', () => {
  expect(isHoliday('2025-01-01')).toBe(true); // 신정
  expect(isHoliday('2026-02-17')).toBe(true); // 설날 연휴 가운데 날
  expect(isHoliday('2026-07-17')).toBe(true); // 제헌절 (2026년부터 재지정)
});

test('대체공휴일과 임시공휴일도 true를 반환한다', () => {
  expect(isHoliday('2025-06-03')).toBe(true); // 대통령선거 임시공휴일
  expect(isHoliday('2025-10-08')).toBe(true); // 추석 대체공휴일
  expect(isHoliday('2026-08-17')).toBe(true); // 광복절 대체공휴일
});

test('공휴일이 아닌 날은 false를 반환한다', () => {
  expect(isHoliday('2025-07-17')).toBe(false); // 제헌절 공휴일 적용은 2026년부터
  expect(isHoliday('2026-09-28')).toBe(false); // 추석은 토요일 겹침 — 대체공휴일 없음
  expect(isHoliday('2026-07-16')).toBe(false); // 평일
});
