import Image from 'next/image';
import Link from 'next/link';
import { isValidGithubUsername } from '@/lib/github';

export default function ContributorAvatar({
  username,
  size = 64,
  linkToProfile = false,
}: {
  username: string;
  size?: number;
  linkToProfile?: boolean;
}) {
  const valid = isValidGithubUsername(username);
  const inner = valid ? (
    <Image
      src={`https://github.com/${username}.png?size=${size * 2}`}
      alt={`${username} 프로필 이미지`}
      width={size}
      height={size}
      className="rounded-full border border-mline object-cover"
    />
  ) : (
    <svg
      role="img"
      aria-label={`${username} 프로필 이미지`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className="rounded-full bg-primary-weak p-1 text-primary"
    >
      <circle cx="12" cy="8" r="4" fill="currentColor" />
      <path d="M4 23v-3a8 8 0 0 1 16 0v3Z" fill="currentColor" />
    </svg>
  );
  const className = 'inline-flex shrink-0 rounded-full align-middle';
  if (valid && linkToProfile) {
    return <Link href={`/contributors/${username}`} title={username} className={className}>{inner}</Link>;
  }
  return <span title={username} className={className}>{inner}</span>;
}
