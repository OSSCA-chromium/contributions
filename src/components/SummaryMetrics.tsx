export default function SummaryMetrics({ cells }: {
  cells: { value: number | string; label: string; detail?: string }[];
}) {
  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-mline bg-mline lg:grid-cols-4">
      {cells.map((cell, index) => (
        <div key={cell.label} className="min-w-0 bg-m1 p-4 sm:p-5">
          <dt className="flex items-center gap-2 text-sm text-on-surface-variant">
            <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full ring-1 ring-c1" style={{ backgroundColor: `var(--c${Math.min(index + 1, 4)})` }} />
            {cell.label}
          </dt>
          <dd className="mt-3 text-[clamp(1.5rem,2vw,2rem)] font-bold leading-tight tracking-tight tabular-nums">{cell.value}</dd>
          {cell.detail && <dd className="mt-2 text-xs text-on-surface-variant">{cell.detail}</dd>}
        </div>
      ))}
    </dl>
  );
}
