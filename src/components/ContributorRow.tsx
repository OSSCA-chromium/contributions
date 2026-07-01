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

// Directory list row for a single contributor. TOTAL/MERGED/IN REVIEW are pill
// badges with inline counts (same status colors as StatusBadge). When the
// username is a valid GitHub handle the whole row links to the profile page.
export default function ContributorRow({
  summary,
}: {
  summary: ContributorSummary;
}) {
  const { username, isValidGithubUser, total, merged, inReview, lastActive } =
    summary;
  const updated = lastActive ? lastActive.slice(0, 10) : '';

  const inner = (
    <div className="flex items-center gap-2 bg-surface border border-outline rounded-lg px-3 py-2 shadow-sm transition-shadow hover:shadow-md text-on-surface">
      <ContributorAvatar username={username} size={32} />
      <span className="font-semibold flex-1 min-w-0 truncate">{username}</span>

      <StatBadge
        label="TOTAL"
        count={total}
        className="bg-on-surface text-surface"
      />
      <StatBadge
        label="MERGED"
        count={merged}
        className="bg-success text-white"
      />
      <StatBadge
        label="IN REVIEW"
        count={inReview}
        className="bg-info text-white"
      />

      {updated && (
        <span className="hidden sm:inline text-xs text-on-surface-variant whitespace-nowrap">
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
      <Link href={`/contributors/${username}`} className="block">
        {inner}
      </Link>
    );
  }
  return inner;
}
