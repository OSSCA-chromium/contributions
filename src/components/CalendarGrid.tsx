'use client';

import { buildMonthGrid } from '@/lib/calendar';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

interface CalendarGridProps {
  year: number;
  month: number; // 1-12
  meetingDates: Set<string>;
  selectedDate: string | null;
  // eslint-disable-next-line no-unused-vars
  onSelect: (date: string) => void;
}

export default function CalendarGrid({
  year,
  month,
  meetingDates,
  selectedDate,
  onSelect,
}: CalendarGridProps) {
  const weeks = buildMonthGrid(year, month);

  return (
    <div>
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((w) => (
          <div key={w} className="text-center text-sm text-on-surface-variant py-1">
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {weeks.flat().map((d) => {
          const hasMeeting = meetingDates.has(d.date);
          const selected = selectedDate === d.date;
          // Translucent circle behind meeting days; solid circle when selected.
          const circle = selected
            ? 'bg-primary text-on-primary'
            : hasMeeting
              ? 'bg-primary/20'
              : '';
          return (
            <button
              key={d.date}
              type="button"
              onClick={() => onSelect(d.date)}
              data-has-meeting={hasMeeting ? 'true' : undefined}
              data-selected={selected ? 'true' : undefined}
              className="flex items-center justify-center py-1"
            >
              <span
                className={`flex items-center justify-center w-9 h-9 rounded-full text-sm ${circle} ${
                  d.inMonth ? 'text-on-surface' : 'text-on-surface-variant opacity-40'
                }`}
              >
                {d.day}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
