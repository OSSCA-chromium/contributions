import type { Contribution } from '@/lib/types';
import ContributorAvatar from '@/components/ContributorAvatar';
import StatusBadge from '@/components/StatusBadge';
import { getModuleLabel } from '@/lib/modules';

export default function PatchMeta({ contribution }: { contribution: Contribution }) {

  return (
    <dl className="grid gap-3 text-[13px]">
      <div className="grid grid-cols-[66px_minmax(0,1fr)] items-baseline gap-2">
        <dt className="text-on-surface-variant">작성자</dt>
        <dd><ContributorAvatar username={contribution.author} size={36} linkToProfile /></dd>
      </div>
      <div className="grid grid-cols-[66px_minmax(0,1fr)] items-baseline gap-2">
        <dt className="text-on-surface-variant">Created</dt>
        <dd>
          <time dateTime={contribution.date}>{contribution.date}</time>
        </dd>
      </div>
      <div className="grid grid-cols-[66px_minmax(0,1fr)] items-baseline gap-2">
        <dt className="text-on-surface-variant">모듈</dt>
        <dd>{getModuleLabel(contribution.module) || '기타'}</dd>
      </div>
      <div className="grid grid-cols-[66px_minmax(0,1fr)] items-baseline gap-2">
        <dt className="text-on-surface-variant">종류</dt>
        <dd>{contribution.kind || '기타'}</dd>
      </div>
      {contribution.repo && contribution.repo !== 'chromium/src' && (
        <div className="grid grid-cols-[66px_minmax(0,1fr)] items-baseline gap-2">
          <dt className="text-on-surface-variant">저장소</dt>
          <dd>{contribution.repo}</dd>
        </div>
      )}
      <div className="grid grid-cols-[66px_minmax(0,1fr)] items-baseline gap-2">
        <dt className="text-on-surface-variant">리뷰 ID</dt>
        <dd className="font-mono">
          {contribution.contributionUrl ? (
            <a href={contribution.contributionUrl} target="_blank" rel="noopener noreferrer" aria-label={`${contribution.contributionUrl.startsWith('https://github.com/') ? 'GitHub PR' : 'Gerrit 리뷰'} ${contribution.slug}`} className="text-link hover:underline">
              <span>{contribution.slug}</span> <span aria-hidden="true">↗</span>
            </a>
          ) : contribution.slug}
        </dd>
      </div>
      <div className="grid grid-cols-[66px_minmax(0,1fr)] items-baseline gap-2">
        <dt className="text-on-surface-variant">상태</dt>
        <dd>
          {contribution.status ? <StatusBadge status={contribution.status} /> : <span>상태 미지정</span>}
        </dd>
      </div>
    </dl>
  );
}
