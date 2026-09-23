type Axis = 'module' | 'kind';

export default function AxisChip({
  axis,
  value,
  selected,
  onClick,
}: {
  axis: Axis;
  value: string;
  selected: boolean;
  onClick: () => void;
}) {
  const axisLabel = axis === 'module' ? '모듈' : '종류';

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${axisLabel}: ${value}`}
      aria-pressed={selected}
      className={`rounded-full border px-3 py-1 text-sm transition-colors ${
        selected
          ? 'border-primary bg-primary text-on-primary'
          : 'border-outline bg-surface-variant text-on-surface-variant hover:bg-primary-container'
      }`}
    >
      {value}
    </button>
  );
}
