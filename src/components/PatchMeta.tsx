import Link from 'next/link';
import type { Contribution } from '@/lib/types';
import ContributorAvatar from '@/components/ContributorAvatar';
import StatusBadge from '@/components/StatusBadge';
import { isValidGithubUsername } from '@/lib/github';

export default function PatchMeta({ contribution }: { contribution: Contribution }) {
  const author = isValidGithubUsername(contribution.author) ? (
    <Link
      href={`/contributors/${contribution.author}`}
      aria-label={contribution.author}
      className="inline-flex items-center gap-2 text-link hover:underline"
    >
      <ContributorAvatar username={contribution.author} size={24} />
      <span>{contribution.author}</span>
    </Link>
  ) : (
    <span>{contribution.author}</span>
  );

  return (
    <dl className="grid grid-cols-1 gap-3 rounded-xl border border-outline bg-surface p-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
      <div>
        <dt className="mb-1 text-on-surface-variant">작성자</dt>
        <dd>{author}</dd>
      </div>
      <div>
        <dt className="mb-1 text-on-surface-variant">업로드일</dt>
        <dd>
          <time dateTime={contribution.date}>{contribution.date}</time>
        </dd>
      </div>
      <div>
        <dt className="mb-1 text-on-surface-variant">모듈</dt>
        <dd>{contribution.module || '기타'}</dd>
      </div>
      <div>
        <dt className="mb-1 text-on-surface-variant">종류</dt>
        <dd>{contribution.kind || '기타'}</dd>
      </div>
      {contribution.repo && contribution.repo !== 'chromium/src' && (
        <div>
          <dt className="mb-1 text-on-surface-variant">저장소</dt>
          <dd>{contribution.repo}</dd>
        </div>
      )}
      <div>
        <dt className="mb-1 text-on-surface-variant">리뷰 ID</dt>
        <dd>{contribution.slug}</dd>
      </div>
      <div>
        <dt className="mb-1 text-on-surface-variant">상태</dt>
        <dd>
          {contribution.status ? <StatusBadge status={contribution.status} /> : <span>상태 미지정</span>}
        </dd>
      </div>
    </dl>
  );
}
