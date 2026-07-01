import type { Meeting } from '@/lib/types';
import { buildMonthGrid } from '@/lib/calendar';
import EventPopover from '@/components/EventPopover';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

// Distinct tints for period bars, assigned per period in date order.
const PERIOD_TINTS = ['bg-info/25', 'bg-success/25', 'bg-warning/25', 'bg-primary/25'];

interface CalendarGridProps {
  year: number;
  month: number; // 1-12
  meetings: Meeting[];
  today: string | null; // YYYY-MM-DD or null before it resolves on the client
}

// Read-only month grid. Point events show a filled circle, period events
// (date~endDate) show a colored bar spanning the covered days, today gets a
// ring, and hovering any event day reveals its detail overlay. Weeks with no
// day in this month are dropped and other-month days render blank.
export default function CalendarGrid({ year, month, meetings, today }: CalendarGridProps) {
  const weeks = buildMonthGrid(year, month).filter((week) => week.some((d) => d.inMonth));
  const points = meetings.filter((m) => !m.endDate);
  const periods = meetings.filter((m) => m.endDate);

  const periodColor = new Map<string, string>();
  periods.forEach((p, i) => periodColor.set(p.slug, PERIOD_TINTS[i % PERIOD_TINTS.length]));

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
              if (!d.inMonth) {
                return <div key={d.date} className="h-9" />;
              }

              const covering = periods.filter(
                (p) => p.date <= d.date && d.date <= (p.endDate as string)
              );
              const dayPoints = points.filter((p) => p.date === d.date);
              const events = [...covering, ...dayPoints];
              const isToday = today === d.date;

              const band = covering[0];
              const bandColor = band ? periodColor.get(band.slug) : '';
              const roundL = ci === 0 || covering.some((p) => p.date === d.date);
              const roundR = ci === 6 || covering.some((p) => p.endDate === d.date);

              return (
                <div
                  key={d.date}
                  data-event={events.length ? 'true' : undefined}
                  data-today={isToday ? 'true' : undefined}
                  className="group relative flex h-9 items-center justify-center"
                >
                  {band && (
                    <span
                      className={`absolute inset-x-0 inset-y-1.5 ${bandColor} ${
                        roundL ? 'rounded-l-md' : ''
                      } ${roundR ? 'rounded-r-md' : ''}`}
                    />
                  )}
                  <span
                    className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-sm text-on-surface ${
                      dayPoints.length ? 'bg-primary/30' : ''
                    } ${isToday ? 'font-bold ring-2 ring-primary' : ''}`}
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
