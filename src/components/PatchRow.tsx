import Link from 'next/link';
import type { SearchIndexItem } from '@/lib/types';
import StatusBadge from '@/components/StatusBadge';

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
      <div role="cell" className="patch-cell-date">
        <span className="patch-cell-mobile-label">업로드일</span>
        <time dateTime={item.date}>{item.date}</time>
      </div>

      <div role="cell" className="patch-cell-id">
        <span className="patch-cell-mobile-label">리뷰 ID</span>
        <span>{item.slug}</span>
      </div>

      <div role="cell" className="patch-cell-title min-w-0">
        <Link
          href={`/patches/${item.slug}`}
          className="font-medium text-link hover:underline"
        >
          {item.title}
        </Link>
        <div className="patch-axis-meta mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-on-surface-variant">
          <span>모듈: {item.module || '기타'}</span>
          <span>종류: {item.kind || '기타'}</span>
          {item.repo && item.repo !== 'chromium/src' && (
            <>
              <span>저장소:</span>
              <span>{item.repo}</span>
            </>
          )}
        </div>
      </div>

      <div role="cell" className="patch-cell-author">
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
