import Link from 'next/link';
import ContributorAvatar from '@/components/ContributorAvatar';
import type { ContributorSummary } from '@/lib/types';
import { CONTRIBUTION_STATUS_LABELS } from '@/lib/status-labels';

// Only valid GitHub handles link to a statically generated profile.
export default function ContributorRow({
  summary,
}: {
  summary: ContributorSummary;
}) {
  const {
    username,
    isValidGithubUser,
    total,
    merged,
    inReview,
    abandoned,
    lastActive,
  } = summary;
  const latestDate = lastActive ? lastActive.slice(0, 10) : '';
  const statuses = [
    {
      label: CONTRIBUTION_STATUS_LABELS.merged,
      count: merged,
      color: 'bg-chart-merged',
      textColor: 'text-badge-ok',
    },
    {
      label: CONTRIBUTION_STATUS_LABELS['in review'],
      count: inReview,
      color: 'bg-chart-in-review',
      textColor: 'text-primary',
    },
    {
      label: CONTRIBUTION_STATUS_LABELS.abandoned,
      count: abandoned,
      color: 'bg-chart-abandoned',
      textColor: 'text-badge-off',
    },
  ];

  const inner = (
    <article className="flex h-full flex-col rounded-2xl border border-mline bg-m1 p-5 text-on-surface transition-[border-color,box-shadow] group-hover:border-primary/40 group-hover:shadow-md sm:p-6">
      <div className="mb-5 flex min-w-0 items-center gap-3">
        <ContributorAvatar username={username} size={48} />
        <h2
          className="mb-0! min-w-0 flex-1 truncate text-base font-semibold tracking-tight"
          title={username}
        >
          {username}
        </h2>
        {isValidGithubUser && (
          <span
            aria-hidden="true"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-m2 text-on-surface-variant transition-colors group-hover:bg-primary-weak group-hover:text-primary"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </span>
        )}
      </div>

      <div
        aria-hidden="true"
        className="mb-4 flex h-1.5 overflow-hidden rounded-full bg-m3"
      >
        {statuses.map((status) => (
          <span
            key={status.label}
            className={status.color}
            style={{
              width: `${total > 0 ? (status.count / total) * 100 : 0}%`,
            }}
          />
        ))}
      </div>

      <dl className="grid grid-cols-3 gap-2">
        {statuses.map((status) => (
          <div key={status.label}>
            <dt className="flex items-center gap-1.5 text-[11px] text-on-surface-variant sm:text-xs">
              <span
                aria-hidden="true"
                className={`h-1.5 w-1.5 shrink-0 rounded-full ${status.color}`}
              />
              {status.label}
            </dt>
            <dd
              className={`mt-1 text-lg font-medium tabular-nums ${status.textColor}`}
            >
              {status.count}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-4 flex items-center justify-between gap-2 border-t border-mline pt-3 text-xs text-on-surface-variant">
        <span>최근 기여</span>
        {latestDate ? (
          <time dateTime={latestDate} className="tabular-nums">
            {latestDate}
          </time>
        ) : (
          <span>날짜 미등록</span>
        )}
      </div>
    </article>
  );

  if (isValidGithubUser) {
    return (
      <Link
        href={`/contributors/${username}`}
        title={username}
        className="group block h-full rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
      >
        {inner}
      </Link>
    );
  }
  return inner;
}
