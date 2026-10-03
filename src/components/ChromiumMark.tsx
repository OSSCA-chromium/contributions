// CSS-only Chromium logo mark: three 120-degree wedges around a center disc,
// separated by a background-colored moat (box-shadow) like the real mark.
export default function ChromiumMark({ size = 24 }: { size?: number }) {
  const inset = size * (5.5 / 24);
  const moat = size * (2.5 / 24);
  return (
    <span
      aria-hidden="true"
      className="relative inline-block shrink-0 rounded-full"
      style={{
        width: size,
        height: size,
        background:
          'conic-gradient(from -90deg, var(--c1) 0 33.34%, var(--c3) 33.34% 66.67%, var(--c4) 66.67% 100%)',
      }}
    >
      <span
        className="absolute rounded-full"
        style={{
          inset,
          background: 'var(--c2)',
          boxShadow: `0 0 0 ${moat}px var(--color-background)`,
        }}
      />
    </span>
  );
}
