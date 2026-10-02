import { getModuleLabel } from '@/lib/modules';

type Axis = 'module' | 'kind' | 'repo';

export default function AxisTag({
  axis,
  value,
  showLabel = false,
}: {
  axis: Axis;
  value: string;
  showLabel?: boolean;
}) {
  const label = axis === 'module' ? '모듈' : axis === 'kind' ? '종류' : '저장소';
  const displayValue = axis === 'module' ? getModuleLabel(value) : value;
  const colors = axis === 'module'
    ? 'bg-primary-weak text-primary'
    : axis === 'kind'
      ? 'bg-kind-weak text-kind'
      : 'bg-gray-weak text-badge-off';

  return (
    <span title={`${label}: ${displayValue}`} className={`inline-block rounded-md px-2 py-0.5 text-[11px] font-medium ${colors}`}>
      {showLabel ? `${label}: ${displayValue}` : displayValue}
    </span>
  );
}
