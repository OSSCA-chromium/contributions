import { computeAttendance } from '@/lib/attendance';

const meetings = [
  { type: 'meeting' as const, attendees: ['alice', 'bob'] },
  { type: 'meeting' as const, attendees: ['alice'] },
  { type: 'milestone' as const, attendees: ['alice', 'bob', 'carol'] }, // 분모 제외
];

test('meeting만 분모로 출석률을 계산한다', () => {
  const s = computeAttendance(meetings);
  expect(s.meetingCount).toBe(2);
  expect(s.milestoneCount).toBe(1);
  // roster = meeting 참석자 합집합 → alice, bob (carol은 milestone에만 등장하므로 제외)
  expect(s.rosterSize).toBe(2);
  const alice = s.records.find((r) => r.username === 'alice')!;
  expect(alice).toEqual({ username: 'alice', attended: 2, totalMeetings: 2, rate: 1 });
  const bob = s.records.find((r) => r.username === 'bob')!;
  expect(bob.rate).toBeCloseTo(0.5);
});

test('records는 rate 내림차순, 동률은 username 오름차순', () => {
  const s = computeAttendance(meetings);
  expect(s.records.map((r) => r.username)).toEqual(['alice', 'bob']);
});

test('meeting이 0건이면 rate 0, 빈 records', () => {
  const s = computeAttendance([{ type: 'milestone', attendees: ['x'] }]);
  expect(s.meetingCount).toBe(0);
  expect(s.records).toEqual([]);
  expect(s.rosterSize).toBe(0);
});
