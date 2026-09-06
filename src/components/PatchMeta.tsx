import type { ReactNode } from 'react';
import Link from 'next/link';
import StatusBadge from '@/components/StatusBadge';
import { isValidGithubUsername } from '@/lib/github';
import { isoDay } from '@/lib/years';
import type { Contribution } from '@/lib/types';

export type PatchMetaItem = Pick<
  Contribution,
  'slug' | 'date' | 'author' | 'contributionUrl' | 'module' | 'kind' | 'repo' | 'status'
>;

// dt/dd are the grid items of the parent <dl>, so each row is a fragment
// rather than a wrapper element.
function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <>
      <dt className="text-[12.5px] text-on-surface-variant">{label}</dt>
      <dd className="m-0 min-w-0">{children}</dd>
    </>
  );
}

export default function PatchMeta({ contribution }: { contribution: PatchMetaItem }) {
  // `module` is read as `contribution.module` below: the bare name would shadow
  // the CJS module-scope identifier once transpiled.
  const { slug, date, author, contributionUrl, kind, repo, status } = contribution;

  return (
    <dl className="m-0 grid grid-cols-[66px_minmax(0,1fr)] gap-x-2.5 gap-y-2">
      {/* The mockup shows a bare name, but the contributor page predates this
          design and is still worth reaching — invalid handles have no page. */}
      <Row label="작성자">
        {isValidGithubUsername(author) ? (
          <Link href={`/contributors/${author}`} className="text-primary hover:underline">
            {author}
          </Link>
        ) : (
          author
        )}
      </Row>
      <Row label="날짜">
        <span className="font-mono tabular-nums">{isoDay(date)}</span>
      </Row>
      <Row label="모듈">
        <span className="font-mono">{contribution.module}</span>
      </Row>
      <Row label="종류">
        <span className="font-mono">{kind}</span>
      </Row>
      <Row label="저장소">
        <span className="font-mono">{repo}</span>
      </Row>
      <Row label="리뷰 ID">
        {contributionUrl ? (
          <a
            href={contributionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-primary hover:underline"
          >
            {slug}
          </a>
        ) : (
          <span className="font-mono">{slug}</span>
        )}
      </Row>
      <Row label="상태">
        <StatusBadge status={status} />
      </Row>
    </dl>
  );
}
