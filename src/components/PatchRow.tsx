import Link from 'next/link';
import type { SearchIndexItem } from '@/lib/types';
import StatusBadge from '@/components/StatusBadge';
import AxisTag from '@/components/AxisTag';

export default function PatchRow({
  item,
  id,
  hidden,
}: {
  item: SearchIndexItem;
  id?: string;
  hidden?: boolean;
}) {
  return (
    <div
      id={id}
      role="row"
      hidden={hidden}
      style={hidden ? { display: 'none' } : undefined}
      className="patch-grid patch-grid-fold patch-grid-row"
    >
      <div role="cell" className="patch-cell-date font-mono text-[12px] text-on-surface-variant">
        <span className="patch-cell-mobile-label">업로드일</span>
        <time dateTime={item.date}>{item.date}</time>
      </div>

      <div role="cell" className="patch-cell-id font-mono text-[12px] text-on-surface-variant">
        <span className="patch-cell-mobile-label">리뷰 ID</span>
        <span>{item.slug}</span>
      </div>

      <div role="cell" className="patch-cell-title min-w-0">
        <Link
          href={`/patches/${item.slug}`}
          className="text-[14.5px] font-semibold leading-snug text-on-surface hover:text-primary"
        >
          {item.title}
        </Link>
        <div className="patch-axis-meta mt-1.5 flex flex-wrap items-center gap-1.5">
          <AxisTag axis="module" value={item.module || '기타'} showLabel />
          <AxisTag axis="kind" value={item.kind || '기타'} showLabel />
          {item.repo && item.repo !== 'chromium/src' && (
            <AxisTag axis="repo" value={item.repo} />
          )}
        </div>
      </div>

      <div role="cell" className="patch-cell-author text-[12px] text-on-surface-variant">
        <span className="patch-cell-mobile-label">작성자</span>
        <span className="break-words">{item.author}</span>
      </div>

      <div role="cell" className="patch-cell-status">
        <span className="patch-cell-mobile-label">상태</span>
        {item.status ? <StatusBadge status={item.status} /> : <span>상태 미지정</span>}
      </div>
    </div>
  );
}
