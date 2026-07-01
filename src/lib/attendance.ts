import type { Meeting, AttendanceStats } from '@/lib/types';

// Aggregate per-attendee attendance. Only `meeting` entries count toward the
// denominator; `milestone` entries are excluded from the roster and the rate.
export function computeAttendance(
  meetings: Pick<Meeting, 'type' | 'attendees'>[]
): AttendanceStats {
  const meetingEntries = meetings.filter((m) => m.type === 'meeting');
  const meetingCount = meetingEntries.length;
  const milestoneCount = meetings.length - meetingCount;

  const counts = new Map<string, number>();
  for (const m of meetingEntries) {
    for (const username of m.attendees) {
      counts.set(username, (counts.get(username) ?? 0) + 1);
    }
  }

  const records = [...counts]
    .map(([username, attended]) => ({
      username,
      attended,
      totalMeetings: meetingCount,
      rate: meetingCount ? attended / meetingCount : 0,
    }))
    .sort((a, b) => b.rate - a.rate || a.username.localeCompare(b.username));

  return { meetingCount, milestoneCount, rosterSize: counts.size, records };
}
