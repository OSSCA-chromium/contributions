import type { ContributionStatus } from '@/lib/types';

const MAP: Record<ContributionStatus, { label: string; cls: string }> = {
  'in review': { label: 'IN REVIEW', cls: 'bg-primary text-on-primary' },
  merged: { label: 'MERGED', cls: 'bg-success text-white dark:text-black' },
  draft: { label: 'DRAFT', cls: 'bg-warning text-black' },
};

export default function StatusBadge({ status }: { status?: ContributionStatus }) {
  if (!status || !MAP[status]) return null;
  const { label, cls } = MAP[status];
  return (
    <span className={`px-2 py-1 text-xs rounded-full font-medium ${cls}`}>
      {label}
    </span>
  );
}
