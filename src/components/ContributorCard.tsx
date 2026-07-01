import Link from 'next/link';
import ContributorAvatar from '@/components/ContributorAvatar';
import type { ContributorSummary } from '@/lib/types';

// Directory card for a single contributor. When the username is a valid
// GitHub handle the whole card links to the contributor's profile page.
export default function ContributorCard({
  summary,
}: {
  summary: ContributorSummary;
}) {
  const { username, isValidGithubUser, total, merged, inReview } = summary;

  const inner = (
    <div className="bg-surface border border-outline rounded-lg p-4 flex flex-col items-center text-center gap-2 hover:border-primary transition-colors h-full">
      <ContributorAvatar username={username} size={64} />
      <div className="font-semibold text-on-surface">{username}</div>
      <div className="text-sm text-on-surface-variant">
        {`총 ${total} · Merged ${merged} · In review ${inReview}`}
      </div>
    </div>
  );

  if (isValidGithubUser) {
    return (
      <Link href={`/contributors/${username}`} className="block h-full">
        {inner}
      </Link>
    );
  }
  return inner;
}
