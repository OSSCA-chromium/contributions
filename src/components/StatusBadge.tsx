import type { ContributionStatus } from '@/lib/types';

// IN REVIEW has no mockup counterpart (design C only specified merged/abandoned);
// it reuses the link-blue pair, which clears 4.5:1 on primary-weak in both themes.
const MAP: Record<ContributionStatus, { label: string; cls: string }> = {
  merged: { label: 'MERGED', cls: 'bg-success-weak text-badge-ok' },
  abandoned: { label: 'ABANDONED', cls: 'bg-gray-weak text-badge-off' },
  'in review': { label: 'IN REVIEW', cls: 'bg-primary-weak text-primary' },
};

export default function StatusBadge({ status }: { status?: ContributionStatus }) {
  if (!status || !MAP[status]) return null;
  const { label, cls } = MAP[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.05em] ${cls}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {label}
    </span>
  );
}
