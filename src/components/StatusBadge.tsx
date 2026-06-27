import type { ContributionStatus } from '@/lib/types';

const MAP: Record<ContributionStatus, { label: string; cls: string }> = {
  'in review': { label: 'IN REVIEW', cls: 'bg-info' },
  merged: { label: 'MERGED', cls: 'bg-success' },
  draft: { label: 'DRAFT', cls: 'bg-on-surface-variant' },
};

export default function StatusBadge({ status }: { status?: ContributionStatus }) {
  if (!status || !MAP[status]) return null;
  const { label, cls } = MAP[status];
  return (
    <span className={`px-2 py-1 text-xs text-white rounded-full font-medium ${cls}`}>
      {label}
    </span>
  );
}
