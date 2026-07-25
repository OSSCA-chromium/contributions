import Link from 'next/link';
import type { DocMeta } from '@/lib/types';

export default function DocsSidebar({
  items,
  activeSlug,
}: {
  items: DocMeta[];
  activeSlug?: string;
}) {
  // group 별로 묶기 (group 없으면 '문서')
  const groups = new Map<string, DocMeta[]>();
  for (const item of items) {
    const key = item.group ?? '문서';
    const list = groups.get(key) ?? [];
    list.push(item);
    groups.set(key, list);
  }

  return (
    <nav aria-label="문서 목록" className="text-sm">
      {[...groups.entries()].map(([group, docs]) => (
        <div key={group} className="mb-4">
          <h2 className="mb-1.5 border-b border-outline px-3 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-primary">
            {group}
          </h2>
          <ul className="space-y-0.5">
            {docs.map((doc) => {
              const isActive = doc.slug === activeSlug;
              return (
                <li key={doc.slug}>
                  <Link
                    href={`/docs/${doc.slug}`}
                    aria-current={isActive ? 'page' : undefined}
                    className={`block rounded-xl px-3 py-1.5 transition-colors ${
                      isActive
                        ? 'bg-primary-container text-primary font-medium'
                        : 'text-on-surface hover:bg-surface-variant'
                    }`}
                  >
                    {doc.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
