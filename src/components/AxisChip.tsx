import { getModuleLabel } from '@/lib/modules';

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
  const displayValue = axis === 'module' ? getModuleLabel(value) : value;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${axisLabel}: ${value}`}
      aria-pressed={selected}
      className={`max-w-full break-words rounded-lg border px-2.5 py-1 text-[12px] font-medium transition-colors ${
        selected
          ? axis === 'module'
            ? 'border-module bg-module text-on-module'
            : 'border-primary bg-primary text-on-primary'
          : axis === 'kind'
            ? 'border-transparent bg-kind-weak text-kind hover:border-kind'
            : 'border-transparent bg-module-weak text-module hover:border-module'
      }`}
    >
      {displayValue}
    </button>
  );
}
