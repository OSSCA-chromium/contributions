import Link from 'next/link';
import AxisChip from '@/components/AxisChip';
import StatusBadge from '@/components/StatusBadge';
import { isoDay } from '@/lib/years';
import type { Contribution } from '@/lib/types';

// Nearly every patch lands here, so a repo chip on every row would be pure
// noise — only the exceptions (devtools, wpt, …) get one. The detail page
// applies the same rule, hence the export.
export const DEFAULT_REPO = 'chromium/src';

export type PatchRowItem = Pick<
  Contribution,
  | 'slug'
  | 'title'
  | 'date'
  | 'author'
  | 'contributionUrl'
  | 'module'
  | 'kind'
  | 'repo'
  | 'status'
>;

export default function PatchRow({
  item,
  grouped = false,
}: {
  item: PatchRowItem;
  grouped?: boolean;
}) {
  // `module` is destructured as `item.module` below: the bare name would shadow
  // the CJS module-scope identifier once transpiled.
  const { slug, title, date, author, contributionUrl, kind, repo, status } = item;

  return (
    <div
      className={`patch-grid patch-grid-fold border-t border-t-mline px-4 py-2.5 first:border-t-0 hover:bg-m1 max-[780px]:py-[13px] ${
        grouped ? 'border-l-[3px] border-l-c1 pl-[13px]' : ''
      }`}
    >
      <div className="[grid-area:date] font-mono text-[12.5px] tabular-nums text-on-surface-variant">
        {isoDay(date)}
      </div>

      <div className="[grid-area:id] font-mono text-[12.5px]">
        {contributionUrl ? (
          <a
            href={contributionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {slug}
          </a>
        ) : (
          <span className="text-on-surface-variant">{slug}</span>
        )}
      </div>

      {/* The title is the row's only internal link — making the whole row one
          link would nest it inside the crrev anchor above. */}
      <div className="[grid-area:title] min-w-0">
        <Link
          href={`/patches/${slug}`}
          className="text-[14.5px] font-semibold text-on-surface hover:text-primary"
        >
          {title}
        </Link>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          <AxisChip kind="module" value={item.module} />
          <AxisChip kind="kind" value={kind} />
          {repo !== DEFAULT_REPO && <AxisChip kind="repo" value={repo} />}
        </div>
      </div>

      <div className="[grid-area:author] overflow-hidden text-ellipsis text-[13px] text-on-surface-variant max-[780px]:text-right">
        {author}
      </div>

      <div className="[grid-area:status] justify-self-start max-[780px]:justify-self-end">
        <StatusBadge status={status} />
      </div>
    </div>
  );
}
