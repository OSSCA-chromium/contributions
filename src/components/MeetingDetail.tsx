import type { Meeting } from '@/lib/types';

const TYPE_LABEL: Record<Meeting['type'], string> = {
  meeting: '미팅',
  milestone: '주요 일정',
};

export default function MeetingDetail({
  meetings,
  date,
}: {
  meetings: Meeting[];
  date: string | null;
}) {
  if (!date) {
    return <p className="text-on-surface-variant">날짜를 선택하세요.</p>;
  }
  if (meetings.length === 0) {
    return <p className="text-on-surface-variant">선택한 날짜에 일정이 없습니다.</p>;
  }

  return (
    <div className="space-y-6">
      {meetings.map((m) => (
        <article key={m.slug}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
              {TYPE_LABEL[m.type]}
            </span>
            <h3 className="text-xl font-bold text-on-surface">{m.title}</h3>
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
