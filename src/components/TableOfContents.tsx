export default function TableOfContents({
  headings,
}: {
  headings: { id: string; text: string; level: number }[];
}) {
  if (headings.length === 0) {
    return null;
  }

  // 가장 얕은 레벨을 기준으로 들여쓰기 정규화
  const minLevel = Math.min(...headings.map((h) => h.level));

  return (
    <nav aria-label="목차" className="text-sm">
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
        목차
      </h2>
      <ul className="space-y-1">
        {headings.map((heading) => (
          <li
            key={heading.id}
            style={{ paddingLeft: `${(heading.level - minLevel) * 12}px` }}
          >
            <a
              href={`#${heading.id}`}
              className="block text-on-surface-variant transition-colors hover:text-primary"
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
