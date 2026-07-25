// Korean public holidays covering the schedule data range (2025-2026).
// Includes holiday runs (Seollal/Chuseok), substitute holidays, election
// days, and temporary holidays. When meeting data grows past 2026, append
// that year's dates here.
const KR_HOLIDAYS = new Set<string>([
  // 2025
  '2025-01-01', // New Year's Day
  '2025-01-27', // temporary holiday (Seollal bridge)
  '2025-01-28', // Seollal
  '2025-01-29', // Seollal
  '2025-01-30', // Seollal
  '2025-03-01', // Independence Movement Day
  '2025-03-03', // substitute (Independence Movement Day)
  '2025-05-05', // Children's Day & Buddha's Birthday
  '2025-05-06', // substitute
  '2025-06-03', // presidential election (temporary holiday)
  '2025-06-06', // Memorial Day
  '2025-08-15', // Liberation Day
  '2025-10-03', // National Foundation Day
  '2025-10-05', // Chuseok
  '2025-10-06', // Chuseok
  '2025-10-07', // Chuseok
  '2025-10-08', // substitute (Chuseok)
  '2025-10-09', // Hangul Day
  '2025-12-25', // Christmas
  // 2026
  '2026-01-01', // New Year's Day
  '2026-02-16', // Seollal
  '2026-02-17', // Seollal
  '2026-02-18', // Seollal
  '2026-03-01', // Independence Movement Day (Sun)
  '2026-03-02', // substitute (Independence Movement Day)
  '2026-05-05', // Children's Day
  '2026-05-24', // Buddha's Birthday (Sun)
  '2026-05-25', // substitute (Buddha's Birthday)
  '2026-06-03', // nationwide local elections
  '2026-06-06', // Memorial Day (Sat; no substitute by law)
  '2026-07-17', // Constitution Day (public holiday again since 2026)
  '2026-08-15', // Liberation Day (Sat)
  '2026-08-17', // substitute (Liberation Day)
  '2026-09-24', // Chuseok
  '2026-09-25', // Chuseok
  '2026-09-26', // Chuseok (Sat; Seollal/Chuseok substitute only for Sun)
  '2026-10-03', // National Foundation Day (Sat)
  '2026-10-05', // substitute (National Foundation Day)
  '2026-10-09', // Hangul Day
  '2026-12-25', // Christmas
]);

// True when the given YYYY-MM-DD date is a Korean public holiday.
export function isHoliday(date: string): boolean {
  return KR_HOLIDAYS.has(date);
}
