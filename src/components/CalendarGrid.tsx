import Link from 'next/link';
import type { Meeting } from '@/lib/types';
import { buildMonthGrid } from '@/lib/calendar';
import { periodColorMap, TYPE_CIRCLE } from '@/lib/periodColors';
import EventPopover from '@/components/EventPopover';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

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
  const periodColor = periodColorMap(meetings);

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
              // Point events take priority in the hover overlay; covering
              // periods (Challenges/Masters) only show on days without one.
              const popoverEvents = dayPoints.length ? dayPoints : covering;
              const isToday = today === d.date;

              const band = covering[0];
              const bandColor = band ? (periodColor.get(band.slug)?.bar ?? '') : '';
              // 같은 날에 여러 점 이벤트가 겹치면 마감 > 모임 > 주요 일정 순.
              const circleType = dayPoints.some((p) => p.type === 'deadline')
                ? 'deadline'
                : dayPoints.some((p) => p.type === 'meeting')
                  ? 'meeting'
                  : 'milestone';
              const pointCircle = dayPoints.length ? TYPE_CIRCLE[circleType] : '';
              const roundL = ci === 0 || covering.some((p) => p.date === d.date);
              const roundR = ci === 6 || covering.some((p) => p.endDate === d.date);
              // Align the popover toward the calendar so edge columns (Sun/Mon,
              // Fri/Sat) don't push it past the viewport.
              const popoverAlign =
                ci <= 1 ? 'left-0' : ci >= 5 ? 'right-0' : 'left-1/2 -translate-x-1/2';

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
                  {popoverEvents.length > 0 ? (
                    // Days with an event link to their first event's detail
                    // page (point events win over covering periods).
                    <Link
                      href={`/schedule/${popoverEvents[0].slug}`}
                      className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-sm text-on-surface ${pointCircle} ${
                        isToday ? 'font-bold ring-2 ring-primary' : ''
                      }`}
                    >
                      {d.day}
                    </Link>
                  ) : (
                    <span
                      className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-sm text-on-surface ${pointCircle} ${
                        isToday ? 'font-bold ring-2 ring-primary' : ''
                      }`}
                    >
                      {d.day}
                    </span>
                  )}
                  {popoverEvents.length > 0 && (
                    <EventPopover
                      meetings={popoverEvents}
                      className={`top-full mt-1 ${popoverAlign}`}
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
