'use client';

export default function YearSelector({
  years,
  value,
  onChange,
}: {
  years: string[];
  value: string;
  // eslint-disable-next-line no-unused-vars
  onChange: (year: string) => void;
}) {
  const options = ['all', ...years];

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="연도 선택">
      {options.map((opt) => {
        const active = value === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            aria-pressed={active}
            className={`rounded-full px-3 py-1 text-sm transition-colors ${
              active
                ? 'bg-primary text-on-primary'
                : 'bg-surface-variant text-on-surface-variant hover:bg-primary-container'
            }`}
          >
            {opt === 'all' ? '전체' : opt}
          </button>
        );
      })}
    </div>
  );
}
