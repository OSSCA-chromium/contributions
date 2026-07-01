import type { Meeting } from '@/lib/types';

const TYPE_LABEL: Record<Meeting['type'], string> = {
  meeting: '미팅',
  milestone: '주요 일정',
};

function dateLabel(m: Meeting): string {
  return m.endDate ? `${m.date} ~ ${m.endDate}` : m.date;
}

// Detail overlay shared by the calendar days and the schedule list. Always in
// the DOM; shown via CSS on hover/focus of the ancestor `.group`. contentHtml
// is already sanitized in markdownToHtml.
export default function EventPopover({
  meetings,
  className = '',
  showTitle = true,
}: {
  meetings: Meeting[];
  className?: string;
  showTitle?: boolean;
}) {
  return (
    <div
      className={`pointer-events-none absolute z-30 hidden w-64 max-w-[80vw] space-y-3 rounded-lg border border-outline bg-surface p-3 text-left text-sm shadow-lg group-hover:block group-focus-within:block ${className}`}
    >
      {meetings.map((m) => (
        <div key={m.slug}>
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs text-primary">
              {TYPE_LABEL[m.type]}
            </span>
            <span className="text-on-surface-variant">{dateLabel(m)}</span>
          </div>
          {showTitle && <div className="font-semibold text-on-surface">{m.title}</div>}
          {m.location && <p className="text-on-surface-variant">📍 {m.location}</p>}
          {m.contentHtml && (
            <div
              className="prose prose-sm max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: m.contentHtml }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
