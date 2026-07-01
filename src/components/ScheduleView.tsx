'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Meeting, AttendanceStats } from '@/lib/types';
import CalendarGrid from '@/components/CalendarGrid';
import MeetingDetail from '@/components/MeetingDetail';
import AttendanceTable from '@/components/AttendanceTable';

interface ScheduleViewProps {
  meetings: Meeting[]; // sorted ascending by date
  attendance: AttendanceStats;
  today?: string; // injectable for tests; otherwise computed on the client
}

// Today's local date as YYYY-MM-DD. Computed in the browser so a static build
// doesn't freeze "today" to the build date.
function localTodayISO(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

// Every month from minDate's month to maxDate's month, inclusive.
function monthList(minDate: string, maxDate: string): { year: number; month: number }[] {
  let year = Number(minDate.slice(0, 4));
  let month = Number(minDate.slice(5, 7));
  const maxYear = Number(maxDate.slice(0, 4));
  const maxMonth = Number(maxDate.slice(5, 7));
  const out: { year: number; month: number }[] = [];
  while (year < maxYear || (year === maxYear && month <= maxMonth)) {
    out.push({ year, month });
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  }
  return out;
}

export default function ScheduleView({ meetings, attendance, today: todayProp }: ScheduleViewProps) {
  // Resolve "today" on the client after mount (null on the server → no marker,
  // so no hydration mismatch). Tests pass `todayProp` for determinism.
  const [today, setToday] = useState<string | null>(todayProp ?? null);
  useEffect(() => {
    if (!todayProp) setToday(localTodayISO());
  }, [todayProp]);

  const eventDates = useMemo(() => new Set(meetings.map((m) => m.date)), [meetings]);
  const months = useMemo(
    () => (meetings.length ? monthList(meetings[0].date, meetings[meetings.length - 1].date) : []),
    [meetings]
  );

  if (meetings.length === 0) {
    return <p className="text-on-surface">등록된 일정이 없습니다.</p>;
  }

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {months.map(({ year, month }) => (
          <CalendarGrid
            key={`${year}-${month}`}
            year={year}
            month={month}
            eventDates={eventDates}
            today={today}
          />
        ))}
      </div>
      <section>
        <h2 className="text-lg font-bold text-on-surface mb-4">전체 일정</h2>
        <MeetingDetail meetings={meetings} />
      </section>
      <section>
        <h2 className="text-lg font-bold text-on-surface mb-3">참석 인원별 출석률</h2>
        <AttendanceTable stats={attendance} />
      </section>
    </div>
  );
}
