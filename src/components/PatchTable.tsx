'use client';

import { useId, useState } from 'react';
import PatchRow, { type PatchRowItem } from '@/components/PatchRow';
import { groupByRelated, type GroupedRow } from '@/lib/grouping';
import type { Contribution } from '@/lib/types';

export type PatchTableItem = PatchRowItem &
  Pick<Contribution, 'relatedSlugs' | 'issue' | 'crbug'>;

const GROUP_PREVIEW_COUNT = 3;
const GROUP_REASONS = {
  crbug: '같은 crbug를 참조하는 패치',
  issue: '같은 과제 이슈의 패치',
  related: '여러 연결을 통해 연관된 패치',
};

function RelatedPatchGroup({ group }: {
  group: Extract<GroupedRow<PatchTableItem>, { type: 'group' }>;
}) {
  const [expanded, setExpanded] = useState(false);
  const rowsId = useId();
  const canCollapse = group.items.length > GROUP_PREVIEW_COUNT;
  const visible = canCollapse && !expanded
    ? group.items.slice(0, GROUP_PREVIEW_COUNT)
    : group.items;

  return (
    <section aria-label={group.label ?? '연관 패치'} className="border-t border-mline first:border-t-0">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 bg-m1 px-4 py-3 text-[12.5px]">
        <span className="rounded-full bg-primary-weak px-2.5 py-1 text-[11px] font-semibold text-primary">
          연관 {group.items.length}건
        </span>
        <div className="min-w-0">
          {group.href ? (
            <a href={group.href} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">
              {group.label}
            </a>
          ) : (
            <b className="font-semibold text-on-surface">연관 패치</b>
          )}
          <p className="mt-0.5 text-[11.5px] text-on-surface-variant">
            {GROUP_REASONS[group.reason]}
            {canCollapse && !expanded && ` · 최근 ${GROUP_PREVIEW_COUNT}건 표시`}
          </p>
        </div>
        {canCollapse && (
          <button
            type="button"
            aria-expanded={expanded}
            aria-controls={rowsId}
            onClick={() => setExpanded(!expanded)}
            className="ml-auto shrink-0 rounded-full border border-mline bg-background px-3 py-1.5 text-[12px] font-medium text-primary hover:bg-m2"
          >
            {expanded ? '접기' : `전체 ${group.items.length}건 펼치기`}
          </button>
        )}
      </div>
      <div id={rowsId}>
        {visible.map(item => <PatchRow key={item.slug} item={item} grouped />)}
      </div>
    </section>
  );
}

export default function PatchTable({ items }: { items: PatchTableItem[] }) {
  const rows = groupByRelated(items);

  return (
    <>
      {/* Below the fold each row carries its own chips, so the header row goes
          away rather than folding with them. */}
      <div className="patch-grid rounded-t-2xl border border-mline bg-m2 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.07em] text-on-surface-variant max-[780px]:hidden">
        <div className="[grid-area:date]">날짜</div>
        <div className="[grid-area:id]">리뷰 ID</div>
        <div className="[grid-area:title]">제목</div>
        <div className="[grid-area:author]">작성자</div>
        <div className="[grid-area:status]">상태</div>
      </div>

      <div className="overflow-hidden rounded-b-2xl border border-t-0 border-mline bg-background max-[780px]:rounded-2xl max-[780px]:border-t">
        {rows.map((row) =>
          row.type === 'single' ? (
            <PatchRow key={row.item.slug} item={row.item} />
          ) : (
            <RelatedPatchGroup key={row.items.map(item => item.slug).join(',')} group={row} />
          )
        )}
      </div>
    </>
  );
}
