// Three label axes, visually ranked: module (identifier) > kind (tag) > repo (context).
// module values are free-form directory paths and can run long (e.g.
// "components/on_device_translation"), so only that variant clips with an
// ellipsis — kind/repo are short controlled vocabularies and don't need it.
const STYLES = {
  module: 'font-mono text-xs text-primary bg-primary-weak overflow-hidden text-ellipsis max-w-full',
  kind: 'text-[11px] font-bold uppercase tracking-[0.04em] text-kind bg-kind-weak',
  repo: 'font-mono text-[11px] text-badge-off bg-m3',
} as const;

export default function AxisChip({
  kind,
  value,
}: {
  kind: keyof typeof STYLES;
  value: string;
}) {
  if (!value) return null;
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 leading-none ${STYLES[kind]}`}
    >
      {value}
    </span>
  );
}
