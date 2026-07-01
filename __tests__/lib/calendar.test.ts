import { buildMonthGrid } from '@/lib/calendar';

test('6주 x 7일 = 42칸을 반환한다', () => {
  const grid = buildMonthGrid(2025, 5);
  expect(grid).toHaveLength(6);
  grid.forEach((week) => expect(week).toHaveLength(7));
});

test('해당 월의 모든 날짜를 inMonth=true로 포함한다', () => {
  const grid = buildMonthGrid(2025, 5); // 5월은 31일
  const flat = grid.flat();
  const inMonth = flat.filter((d) => d.inMonth);
  expect(inMonth).toHaveLength(31);
  expect(inMonth[0].date).toBe('2025-05-01');
  expect(inMonth[30].date).toBe('2025-05-31');
});

test('앞뒤 채움일은 inMonth=false이고 첫 칸은 일요일', () => {
  const grid = buildMonthGrid(2025, 5);
  const first = grid[0][0];
  // 2025-05-01은 목요일 → 그리드 시작은 직전 일요일 2025-04-27
  expect(first.date).toBe('2025-04-27');
  expect(first.inMonth).toBe(false);
});
