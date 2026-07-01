import type { Meeting } from '@/lib/types';
import EventPopover from '@/components/EventPopover';

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

// Month-grouped list of event titles. Full details appear as a hover/focus
// overlay so the list stays scannable. (Overlay markup is always in the DOM,
// only visually toggled via CSS.)
export default function ScheduleList({ meetings }: { meetings: Meeting[] }) {
  if (meetings.length === 0) {
    return <p className="text-on-surface-variant">표시할 일정이 없습니다.</p>;
  }

  return (
    <div className="space-y-6">
      {groupByMonth(meetings).map((group) => (
        <div key={group.key}>
          <h3 className="font-semibold text-on-surface mb-2">{group.label}</h3>
          <ul className="space-y-1">
            {group.items.map((m) => (
              <li key={m.slug} className="group relative">
                <button
                  type="button"
                  className="flex w-full items-baseline gap-2 text-left text-on-surface hover:text-primary focus:text-primary"
                >
                  <span className="text-sm tabular-nums text-on-surface-variant">
                    {m.date.slice(5).replace('-', '/')}
                  </span>
                  <span>{m.title}</span>
                </button>
                <EventPopover meetings={[m]} showTitle={false} className="left-0 top-full mt-1" />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
