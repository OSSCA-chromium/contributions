import type { Meeting } from '@/lib/types';
import type { PeriodColor } from '@/lib/periodColors';
import EventPopover from '@/components/EventPopover';

const DEADLINE_BADGE = 'bg-red-500/15 text-red-600 dark:text-red-400';

interface MonthGroup {
  key: string; // YYYY-MM
  label: string; // "7월"
  items: Meeting[];
}

function groupByMonth(meetings: Meeting[]): MonthGroup[] {
  const groups: MonthGroup[] = [];
  for (const m of meetings) {
    const key = m.date.slice(0, 7);
    let group = groups.find((g) => g.key === key);
    if (!group) {
      group = { key, label: `${Number(m.date.slice(5, 7))}월`, items: [] };
      groups.push(group);
    }
    group.items.push(m);
  }
  return groups;
}

// Bullet list of event titles grouped by month. Period events (Challenges,
// Masters) render as a badge in the same color as their calendar bar; deadlines
// render as a light-red badge. Full detail appears on hover/focus.
export default function ScheduleList({
  meetings,
  showMonthHeaders = true,
  periodColors = new Map<string, PeriodColor>(),
}: {
  meetings: Meeting[];
  showMonthHeaders?: boolean;
  periodColors?: Map<string, PeriodColor>;
}) {
  if (meetings.length === 0) {
    return <p className="text-on-surface-variant">표시할 일정이 없습니다.</p>;
  }

  return (
    <div className="space-y-6">
      {groupByMonth(meetings).map((group) => (
        <div key={group.key}>
          {showMonthHeaders && (
            <h3 className="mb-2 font-semibold text-on-surface">{group.label}</h3>
          )}
          <ul className="list-disc space-y-1.5 pl-5 marker:text-on-surface-variant">
            {group.items.map((m) => {
              const badge = m.endDate
                ? (periodColors.get(m.slug)?.badge ?? 'bg-primary/20 text-primary')
                : m.type === 'deadline'
                  ? DEADLINE_BADGE
                  : null;
              return (
                <li key={m.slug} className="group relative">
                  <span tabIndex={0} className="inline-flex cursor-default items-baseline gap-2">
                    <span className="text-sm tabular-nums text-on-surface-variant">
                      {m.date.slice(5).replace('-', '/')}
                    </span>
                    {badge ? (
                      <span className={`rounded px-1.5 py-0.5 text-xs ${badge}`}>{m.title}</span>
                    ) : (
                      <span className="text-on-surface">{m.title}</span>
                    )}
                  </span>
                  <EventPopover meetings={[m]} showTitle={false} className="left-0 top-full mt-1" />
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
