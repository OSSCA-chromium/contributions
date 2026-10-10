'use client';

import type { SearchIndexItem } from '@/lib/types';
import PatchRow from '@/components/PatchRow';

export default function PatchTable({ items }: { items: SearchIndexItem[] }) {
  return (
    <div role="table" aria-label="기여 아카이브" className="patch-table w-full overflow-hidden rounded-2xl border border-mline">
      <div role="rowgroup">
        <div role="row" className="patch-grid patch-grid-heading">
          <div role="columnheader" className="patch-cell-date">Created</div>
          <div role="columnheader" className="patch-cell-id">리뷰 ID</div>
          <div role="columnheader" className="patch-cell-title">기여</div>
          <div role="columnheader" className="patch-cell-author">작성자</div>
          <div role="columnheader" className="patch-cell-status">상태</div>
        </div>
      </div>
      {items.map((item) => <PatchRow key={item.slug} item={item} />)}
    </div>
  );
}
