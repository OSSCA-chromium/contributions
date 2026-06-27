import Link from 'next/link';
import type { Contribution } from '@/lib/types';
import StatusBadge from '@/components/StatusBadge';
import LabelChip from '@/components/LabelChip';
import ContributorAvatar from '@/components/ContributorAvatar';

export default function ContributionCard({
  contribution,
  compact = false,
}: {
  contribution: Contribution;
  compact?: boolean;
}) {
  const { slug, title, date, author, labels, status, excerpt } = contribution;

  return (
    <Link
      href={`/patches/${slug}`}
      className="block bg-surface border border-outline rounded-lg p-4 shadow-sm transition-shadow hover:shadow-md text-on-surface"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-on-surface line-clamp-2">{title}</h3>
        <StatusBadge status={status} />
      </div>

      {labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {labels.slice(0, 2).map((label) => (
            <LabelChip key={label} label={label} />
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 text-sm text-on-surface-variant mb-2">
        <ContributorAvatar username={author} size={18} />
        <span>{author}</span>
        <span aria-hidden="true">·</span>
        <span>{new Date(date).toLocaleDateString('ko-KR')}</span>
      </div>

      {!compact && (
        <p className="text-sm text-on-surface-variant line-clamp-3 mb-2">{excerpt}</p>
      )}

      <span className="text-sm text-primary font-medium">더 읽기 →</span>
    </Link>
  );
}
