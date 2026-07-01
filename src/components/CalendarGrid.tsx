import type { Meeting } from '@/lib/types';
import { buildMonthGrid } from '@/lib/calendar';
import EventPopover from '@/components/EventPopover';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

interface CalendarGridProps {
  year: number;
  month: number; // 1-12
  meetings: Meeting[];
  today: string | null; // YYYY-MM-DD or null before it resolves on the client
}

// Read-only month grid. Point events show a filled circle, period events
// (date~endDate) show a horizontal bar spanning the covered days, today gets a
// ring, and hovering any event day reveals its detail overlay. No outer box.
export default function CalendarGrid({ year, month, meetings, today }: CalendarGridProps) {
  const weeks = buildMonthGrid(year, month);
  const points = meetings.filter((m) => !m.endDate);
  const periods = meetings.filter((m) => m.endDate);

  return (
    <div>
      <div className="mb-2 text-center font-semibold text-on-surface">
        {year}년 {month}월
      </div>
      <div className="grid grid-cols-7">
        {WEEKDAYS.map((w) => (
          <div key={w} className="py-1 text-center text-xs text-on-surface-variant">
            {w}
          </div>
        ))}
      </div>
      <div className="space-y-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7">
            {week.map((d, ci) => {
              const covering = d.inMonth
                ? periods.filter((p) => p.date <= d.date && d.date <= (p.endDate as string))
                : [];
              const dayPoints = d.inMonth ? points.filter((p) => p.date === d.date) : [];
              const events = [...covering, ...dayPoints];
              const isToday = d.inMonth && today === d.date;

              const inPeriod = covering.length > 0;
              const startsHere = covering.some((p) => p.date === d.date);
              const endsHere = covering.some((p) => p.endDate === d.date);
              const roundL = ci === 0 || startsHere;
              const roundR = ci === 6 || endsHere;

              return (
                <div
                  key={d.date}
                  data-event={events.length ? 'true' : undefined}
                  data-today={isToday ? 'true' : undefined}
                  className="group relative flex h-9 items-center justify-center"
                >
                  {inPeriod && (
                    <span
                      className={`absolute inset-x-0 inset-y-1.5 bg-primary/15 ${
                        roundL ? 'rounded-l-md' : ''
                      } ${roundR ? 'rounded-r-md' : ''}`}
                    />
                  )}
                  <span
                    className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-sm ${
                      dayPoints.length ? 'bg-primary/30' : ''
                    } ${isToday ? 'font-bold ring-2 ring-primary' : ''} ${
                      d.inMonth ? 'text-on-surface' : 'text-on-surface-variant opacity-40'
                    }`}
                  >
                    {d.day}
                  </span>
                  {events.length > 0 && (
                    <EventPopover
                      meetings={events}
                      className="left-1/2 top-full mt-1 -translate-x-1/2"
                    />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
