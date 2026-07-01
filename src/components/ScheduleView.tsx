'use client';

import { useMemo, useState } from 'react';
import type { Meeting, AttendanceStats } from '@/lib/types';
import CalendarGrid from '@/components/CalendarGrid';
import MeetingDetail from '@/components/MeetingDetail';
import AttendanceTable from '@/components/AttendanceTable';

interface ScheduleViewProps {
  meetings: Meeting[];
  attendance: AttendanceStats;
}

export default function ScheduleView({ meetings, attendance }: ScheduleViewProps) {
  // Latest meeting drives the initial month + selected date (data-deterministic).
  const latest = meetings.length ? meetings[meetings.length - 1].date : null;
  const [year, setYear] = useState(() =>
    latest ? Number(latest.slice(0, 4)) : new Date().getFullYear()
  );
  const [month, setMonth] = useState(() =>
    latest ? Number(latest.slice(5, 7)) : new Date().getMonth() + 1
  );
  const [selectedDate, setSelectedDate] = useState<string | null>(latest);

  const meetingsByDate = useMemo(() => {
    const map = new Map<string, Meeting[]>();
    for (const m of meetings) {
      const list = map.get(m.date) ?? [];
      list.push(m);
      map.set(m.date, list);
    }
    return map;
  }, [meetings]);

  const meetingDates = useMemo(() => new Set(meetings.map((m) => m.date)), [meetings]);

  if (meetings.length === 0) {
    return <p className="text-on-surface">등록된 일정이 없습니다.</p>;
  }

  function shiftMonth(delta: number) {
    const next = new Date(Date.UTC(year, month - 1 + delta, 1));
    setYear(next.getUTCFullYear());
    setMonth(next.getUTCMonth() + 1);
  }

  const selectedMeetings = selectedDate ? (meetingsByDate.get(selectedDate) ?? []) : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div>
        <div className="flex items-center justify-between mb-3">
          <button
            type="button"
            onClick={() => shiftMonth(-1)}
            className="px-2 py-1 rounded hover:bg-primary/10 text-on-surface"
            aria-label="이전 달"
          >
            ‹
          </button>
          <div className="font-semibold text-on-surface">
            {year}년 {month}월
          </div>
          <button
            type="button"
            onClick={() => shiftMonth(1)}
            className="px-2 py-1 rounded hover:bg-primary/10 text-on-surface"
            aria-label="다음 달"
          >
            ›
          </button>
        </div>
        <CalendarGrid
          year={year}
          month={month}
          meetingDates={meetingDates}
          selectedDate={selectedDate}
          onSelect={setSelectedDate}
        />
      </div>
      <div className="space-y-8">
        <section>
          <h2 className="text-lg font-bold text-on-surface mb-3">상세</h2>
          <MeetingDetail meetings={selectedMeetings} date={selectedDate} />
        </section>
        <section>
          <h2 className="text-lg font-bold text-on-surface mb-3">참석 인원별 출석률</h2>
          <AttendanceTable stats={attendance} />
        </section>
      </div>
    </div>
  );
}
