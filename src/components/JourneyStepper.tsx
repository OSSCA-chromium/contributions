import type { Contribution } from '@/lib/types';
import StatusBadge from '@/components/StatusBadge';

export default function JourneyStepper({ contribution }: { contribution: Contribution }) {
  return (
    <ol aria-label="패치 진행 여정" className="ml-1.5 grid gap-5 border-l-2 border-mline pl-5">
      <li className="relative">
        <span aria-hidden="true" className="absolute -left-[27px] top-1 h-3 w-3 rounded-full bg-c2 ring-4 ring-m1" />
        <p className="mb-2 text-sm font-semibold text-on-surface">리뷰 생성</p>
        <p className="text-sm text-on-surface-variant">Created</p>
        <time className="font-medium text-on-surface" dateTime={contribution.date}>
          {contribution.date}
        </time>
      </li>
      <li className="relative">
        <span aria-hidden="true" className="absolute -left-[27px] top-1 h-3 w-3 rounded-full bg-c2 ring-4 ring-m1" />
        <p className="mb-2 text-sm font-semibold text-on-surface">진행 상태</p>
        <div className="flex flex-wrap items-center gap-2">
          {contribution.status
            ? <StatusBadge status={contribution.status} />
            : <span>상태 미지정</span>}
          {contribution.resolvedDate && (
            <span className="text-sm text-on-surface-variant">
              Closed{' '}
              <time dateTime={contribution.resolvedDate}>{contribution.resolvedDate}</time>
            </span>
          )}
        </div>
      </li>
    </ol>
  );
}
