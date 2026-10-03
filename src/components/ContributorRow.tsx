import Link from 'next/link';
import ContributorAvatar from '@/components/ContributorAvatar';
import type { ContributorSummary } from '@/lib/types';

// Pill badge with an inline count. tabular-nums keeps the count monospaced so
// badge widths stay stable across rows when re-sorting.
function StatBadge({
  label,
  count,
  className,
}: {
  label: string;
  count: number;
  className: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full font-medium whitespace-nowrap ${className}`}
    >
      <span>{label}</span>
      <span className="tabular-nums text-center inline-block min-w-[2ch]">
        {count}
      </span>
    </span>
  );
}

// Directory card for a single contributor. Total and status counts are pill
// badges with inline counts (same status colors as StatusBadge). When the
// username is a valid GitHub handle the whole row links to the profile page.
export default function ContributorRow({
  summary,
}: {
  summary: ContributorSummary;
}) {
  const { username, isValidGithubUser, total, merged, inReview, abandoned, lastActive } =
    summary;
  const updated = lastActive ? lastActive.slice(0, 10) : '';

  const inner = (
    <div className="flex h-full flex-col items-center gap-4 bg-m1 border border-mline rounded-2xl p-5 transition-colors hover:border-primary text-on-surface">
      <ContributorAvatar username={username} size={64} />

      <div className="flex flex-wrap justify-center gap-2">
        <StatBadge
          label="총 기여"
          count={total}
          className="bg-m3 text-badge-off"
        />
        <StatBadge
          label="Merged"
          count={merged}
          className="bg-success-weak text-badge-ok"
        />
        <StatBadge
          label="In review"
          count={inReview}
          className="bg-primary-weak text-primary"
        />
        <StatBadge
          label="Abandoned"
          count={abandoned}
          className="bg-gray-weak text-badge-off"
        />
      </div>

      {updated && (
        <span className="text-xs text-on-surface-variant whitespace-nowrap">
          Updated {updated}
        </span>
      )}
      <span className="text-on-surface-variant" aria-hidden="true">
        ›
      </span>
    </div>
  );

  if (isValidGithubUser) {
    return (
      <Link href={`/contributors/${username}`} title={username} className="block h-full">
        {inner}
      </Link>
    );
  }
  return inner;
}
