import Link from 'next/link';
import type { Meeting } from '@/lib/types';
import { TYPE_BADGE, TYPE_LABELS } from '@/lib/periodColors';

// public/ 아래 정적 자산은 배포 시 basePath 밑에서 서빙되지만, <Link>와 달리
// iframe/<a>의 원시 URL에는 basePath가 자동으로 붙지 않는다.
const BASE_PATH = '/contributions';

export function resolveSlidesUrl(slides: string): string {
  if (/^https?:\/\//.test(slides)) return slides;
  // next dev는 public/ 파일을 정확한 경로로만 서빙한다(디렉터리 index 없음).
  // 정적 export와 dev 양쪽에서 동작하도록 index.html을 명시한다.
  const path = slides.endsWith('/') ? `${slides}index.html` : slides;
  return `${BASE_PATH}${path}`;
}

// 모임 상세: 헤더(메타) + 본문(아젠다/노트) + 발표 자료(HTML 덱 임베드).
export default function MeetingDetail({ meeting }: { meeting: Meeting }) {
  const slidesUrl = meeting.slides ? resolveSlidesUrl(meeting.slides) : null;

  return (
    <div className="mx-auto max-w-7xl p-4">
      <Link href="/schedule" className="text-sm text-primary hover:underline">
        ← 일정으로 돌아가기
      </Link>

      <h1 className="font-display mb-3 mt-4 text-4xl font-semibold tracking-tight text-on-surface">
        {meeting.title}
      </h1>

      <div className="mb-8 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-on-surface-variant">
        <span className="tabular-nums">
          {meeting.endDate ? `${meeting.date} ~ ${meeting.endDate}` : meeting.date}
        </span>
        {meeting.time && <span className="tabular-nums">{meeting.time}</span>}
        <span className={`rounded px-1.5 py-0.5 text-xs ${TYPE_BADGE[meeting.type]}`}>
          {TYPE_LABELS[meeting.type]}
        </span>
        {meeting.badge && (
          <span className="rounded bg-primary/20 px-1.5 py-0.5 text-xs text-primary">
            {meeting.badge}
          </span>
        )}
        {meeting.location && <span>{meeting.location}</span>}
        {meeting.attendees.length > 0 && <span>참석: {meeting.attendees.join(', ')}</span>}
      </div>

      {meeting.contentHtml && (
        <article
          className="prose dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: meeting.contentHtml }}
        />
      )}

      {slidesUrl && (
        <section className="mt-10">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold text-on-surface">발표 자료</h2>
            <a
              href={slidesUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              새 탭에서 열기 ↗
            </a>
          </div>
          <iframe
            src={slidesUrl}
            title="발표 자료"
            className="aspect-video w-full rounded-2xl border border-outline"
            allowFullScreen
          />
        </section>
      )}
    </div>
  );
}
