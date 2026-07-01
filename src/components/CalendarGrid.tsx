import { buildMonthGrid } from '@/lib/calendar';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

interface CalendarGridProps {
  year: number;
  month: number; // 1-12
  eventDates: Set<string>; // dates with a meeting/milestone (YYYY-MM-DD)
  today: string | null; // today's date (YYYY-MM-DD) or null before it resolves
}

// Read-only month grid: marks event days with a translucent circle and today
// with a ring. No day selection — the full schedule is listed separately.
export default function CalendarGrid({ year, month, eventDates, today }: CalendarGridProps) {
  const weeks = buildMonthGrid(year, month);

  return (
    <div className="border border-outline rounded-lg p-3">
      <div className="font-semibold text-on-surface mb-2 text-center">
        {year}년 {month}월
      </div>
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((w) => (
          <div key={w} className="text-center text-xs text-on-surface-variant py-1">
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {weeks.flat().map((d) => {
          // Only mark days belonging to this month, not adjacent-month padding.
          const isEvent = d.inMonth && eventDates.has(d.date);
          const isToday = d.inMonth && today === d.date;
          const circle = isEvent ? 'bg-primary/20' : '';
          const ring = isToday ? 'ring-2 ring-primary font-bold' : '';
          return (
            <div
              key={d.date}
              data-event={isEvent ? 'true' : undefined}
              data-today={isToday ? 'true' : undefined}
              className="flex items-center justify-center py-1"
            >
              <span
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm ${circle} ${ring} ${
                  d.inMonth ? 'text-on-surface' : 'text-on-surface-variant opacity-40'
                }`}
              >
                {d.day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
