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
      className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.05em] rounded-full whitespace-nowrap ${className}`}
    >
      <span>{label}</span>
      <span className="tabular-nums text-center inline-block min-w-[2ch]">
        {count}
      </span>
    </span>
  );
}

// Directory list row for a single contributor. TOTAL/MERGED are always shown;
// IN REVIEW/ABANDONED only appear when non-zero, so a contributor with no
// in-review or abandoned work doesn't carry two all-zero badges. Colors reuse
// StatusBadge's design C pairs (merged/in review/abandoned) so the same status
// reads the same way everywhere. When the username is a valid GitHub handle
// the whole row links to the profile page.
export default function ContributorRow({
  summary,
}: {
  summary: ContributorSummary;
}) {
  const { username, isValidGithubUser, total, merged, inReview, abandoned, lastActive } =
    summary;
  const updated = lastActive ? lastActive.slice(0, 10) : '';

  const inner = (
    <div className="flex items-center gap-2 bg-m1 border border-mline rounded-2xl px-4 py-2.5 transition-colors hover:border-primary text-on-surface">
      <ContributorAvatar username={username} size={32} />
      <span className="font-semibold flex-1 min-w-0 truncate">{username}</span>

      <StatBadge label="TOTAL" count={total} className="bg-m3 text-badge-off" />
      <StatBadge
        label="MERGED"
        count={merged}
        className="bg-success-weak text-badge-ok"
      />
      {inReview > 0 && (
        <StatBadge
          label="IN REVIEW"
          count={inReview}
          className="bg-primary-weak text-primary"
        />
      )}
      {abandoned > 0 && (
        <StatBadge
          label="ABANDONED"
          count={abandoned}
          className="bg-gray-weak text-badge-off"
        />
      )}

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
