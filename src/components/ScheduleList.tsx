import type { Meeting } from '@/lib/types';

const TYPE_LABEL: Record<Meeting['type'], string> = {
  meeting: '미팅',
  milestone: '주요 일정',
};

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
                <div className="pointer-events-none absolute left-0 top-full z-20 mt-1 hidden w-80 max-w-[90vw] rounded-lg border border-outline bg-surface p-3 text-sm shadow-lg group-hover:block group-focus-within:block">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs text-primary">
                      {TYPE_LABEL[m.type]}
                    </span>
                    <span className="text-on-surface-variant">{m.date}</span>
                  </div>
                  {m.location && (
                    <p className="mb-1 text-on-surface-variant">📍 {m.location}</p>
                  )}
                  {m.contentHtml && (
                    <div
                      className="prose prose-sm max-w-none dark:prose-invert"
                      dangerouslySetInnerHTML={{ __html: m.contentHtml }}
                    />
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
