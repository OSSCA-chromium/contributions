'use client';

import { useId, useState } from 'react';
import type { SearchIndexItem } from '@/lib/types';
import PatchRow from '@/components/PatchRow';
import { groupByRelated, type GroupedRow } from '@/lib/grouping';

function RelatedPatchGroup({
  group,
}: {
  group: Extract<GroupedRow<SearchIndexItem>, { type: 'group' }>;
}) {
  const [expanded, setExpanded] = useState(false);
  const controlId = `related-patches-${useId().replace(/:/g, '')}`;

  const label = group.reason === 'crbug'
    ? '공통 crbug'
    : group.reason === 'issue'
      ? '공통 이슈'
      : '명시적으로 연결된 패치';
  const relationLink = group.reason === 'crbug' && group.relationId !== undefined
    ? {
        href: `https://crbug.com/${group.relationId}`,
        name: `crbug ${group.relationId}`,
      }
    : group.reason === 'issue' && group.relationId !== undefined
      ? {
          href: `https://github.com/OSSCA-chromium/contributions/issues/${group.relationId}`,
          name: `이슈 #${group.relationId}`,
        }
      : undefined;

  return (
    <div role="group" aria-label={`연관 패치 ${group.items.length}건`} className="overflow-hidden rounded-xl border border-outline bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-3 p-3">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="font-medium">{label}</span>
          {relationLink && (
            <a
              href={relationLink.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-link hover:underline"
            >
              {relationLink.name}
            </a>
          )}
        </div>
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={controlId}
          onClick={() => setExpanded((value) => !value)}
          className="rounded-lg border border-outline px-3 py-1.5 text-sm font-medium text-link hover:bg-surface-variant focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          전체 {group.items.length}건 {expanded ? '접기' : '펼치기'}
        </button>
      </div>
      <div id={controlId} hidden={!expanded} className="divide-y divide-outline">
        {group.items.map((item) => <PatchRow key={item.slug} item={item} />)}
      </div>
    </div>
  );
}

export default function PatchTable({ items }: { items: SearchIndexItem[] }) {
  const rows = groupByRelated(items);

  return (
    <div role="table" aria-label="기여 아카이브" className="patch-table w-full">
      <div role="rowgroup">
        <div role="row" className="patch-grid patch-grid-heading">
          <div role="columnheader" className="patch-cell-date">업로드일</div>
          <div role="columnheader" className="patch-cell-id">리뷰 ID</div>
          <div role="columnheader" className="patch-cell-title">제목 · 모듈 · 종류</div>
          <div role="columnheader" className="patch-cell-author">작성자</div>
          <div role="columnheader" className="patch-cell-status">상태</div>
        </div>
      </div>
      <div role="rowgroup">
        {rows.map((row) => row.type === 'single'
          ? <PatchRow key={row.item.slug} item={row.item} />
          : <RelatedPatchGroup key={row.items.map((item) => item.slug).join('-')} group={row} />
        )}
      </div>
    </div>
  );
}
