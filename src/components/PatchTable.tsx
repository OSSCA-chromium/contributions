import type { SearchIndexItem } from '@/lib/types';
import PatchRow from '@/components/PatchRow';

export default function PatchTable({ items }: { items: SearchIndexItem[] }) {
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
        {items.map((item) => (
          <PatchRow key={item.slug} item={item} />
        ))}
      </div>
    </div>
  );
}
