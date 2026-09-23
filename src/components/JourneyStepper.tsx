import type { Contribution } from '@/lib/types';
import StatusBadge from '@/components/StatusBadge';

export default function JourneyStepper({ contribution }: { contribution: Contribution }) {
  return (
    <ol aria-label="패치 진행 여정" className="my-5 grid gap-3 sm:grid-cols-2">
      <li className="rounded-xl border border-outline bg-surface p-4">
        <p className="mb-2 text-sm font-semibold text-on-surface">업로드</p>
        <p className="text-sm text-on-surface-variant">업로드일</p>
        <time className="font-medium text-on-surface" dateTime={contribution.date}>
          {contribution.date}
        </time>
      </li>
      <li className="rounded-xl border border-outline bg-surface p-4">
        <p className="mb-2 text-sm font-semibold text-on-surface">결과</p>
        <div className="flex flex-wrap items-center gap-2">
          {contribution.status
            ? <StatusBadge status={contribution.status} />
            : <span>상태 미지정</span>}
          {contribution.resolvedDate && (
            <span className="text-sm text-on-surface-variant">
              결과일{' '}
              <time dateTime={contribution.resolvedDate}>{contribution.resolvedDate}</time>
            </span>
          )}
        </div>
      </li>
    </ol>
  );
}
