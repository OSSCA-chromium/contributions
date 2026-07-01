import type { AttendanceStats } from '@/lib/types';

export default function AttendanceTable({ stats }: { stats: AttendanceStats }) {
  if (stats.records.length === 0) {
    return <p className="text-on-surface-variant">출석 데이터가 없습니다.</p>;
  }

  return (
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="border-b border-outline text-on-surface-variant text-sm">
          <th className="py-2 pr-4 font-medium">인원</th>
          <th className="py-2 pr-4 font-medium">참석 / 전체</th>
          <th className="py-2 font-medium">출석률</th>
        </tr>
      </thead>
      <tbody>
        {stats.records.map((r) => (
          <tr key={r.username} className="border-b border-outline">
            <td className="py-2 pr-4 text-on-surface">{r.username}</td>
            <td className="py-2 pr-4 text-on-surface-variant">
              {r.attended} / {r.totalMeetings}
            </td>
            <td className="py-2 font-semibold text-primary">
              {Math.round(r.rate * 100)}%
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
