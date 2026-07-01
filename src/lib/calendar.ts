export interface CalendarDay {
  date: string; // YYYY-MM-DD
  day: number; // 1..31
  inMonth: boolean;
}

// Build a fixed 6-week (Sunday-first) grid covering the given month.
// `month` is 1-based (1 = January). UTC math avoids timezone drift.
export function buildMonthGrid(year: number, month: number): CalendarDay[][] {
  const first = new Date(Date.UTC(year, month - 1, 1));
  const startWeekday = first.getUTCDay(); // 0 = Sunday
  const cursor = new Date(first);
  cursor.setUTCDate(1 - startWeekday);

  const weeks: CalendarDay[][] = [];
  for (let w = 0; w < 6; w++) {
    const week: CalendarDay[] = [];
    for (let d = 0; d < 7; d++) {
      const y = cursor.getUTCFullYear();
      const m = cursor.getUTCMonth() + 1;
      const day = cursor.getUTCDate();
      const date = `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      week.push({ date, day, inMonth: y === year && m === month });
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
}
