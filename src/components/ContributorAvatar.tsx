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
      className="rounded-full"
    />
  ) : (
    <div
      className="rounded-full bg-primary flex items-center justify-center text-on-primary font-bold"
      style={{ width: size, height: size }}
    >
      {username.charAt(0).toUpperCase()}
    </div>
  );
  if (valid && linkToProfile) {
    return <Link href={`/contributors/${username}`}>{inner}</Link>;
  }
  return inner;
}
