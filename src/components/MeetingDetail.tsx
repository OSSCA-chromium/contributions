import type { Meeting } from '@/lib/types';

const TYPE_LABEL: Record<Meeting['type'], string> = {
  meeting: '미팅',
  milestone: '주요 일정',
};

// Render the full list of events (chronological), each with its date and full
// content shown inline — no click-to-reveal.
export default function MeetingDetail({ meetings }: { meetings: Meeting[] }) {
  if (meetings.length === 0) {
    return <p className="text-on-surface-variant">표시할 일정이 없습니다.</p>;
  }

  return (
    <div className="space-y-6">
      {meetings.map((m) => (
        <article key={m.slug} className="border-b border-outline pb-4 last:border-b-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
              {TYPE_LABEL[m.type]}
            </span>
            <span className="text-sm text-on-surface-variant">{m.date}</span>
            <h3 className="text-lg font-bold text-on-surface">{m.title}</h3>
          </div>
          {m.location && (
            <p className="text-sm text-on-surface-variant mb-2">📍 {m.location}</p>
          )}
          {m.attendees.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {m.attendees.map((a) => (
                <span
                  key={a}
                  className="text-xs px-2 py-0.5 rounded-full border border-outline text-on-surface-variant"
                >
                  {a}
                </span>
              ))}
            </div>
          )}
          {m.contentHtml && (
            <div
              className="prose max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: m.contentHtml }}
            />
          )}
        </article>
      ))}
    </div>
  );
}
