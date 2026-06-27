'use client';

import { useYear } from '@/components/YearProvider';

export default function YearSelector({ years }: { years: string[] }) {
  const { year, setYear } = useYear();
  const options = ['all', ...years];

  return (
    <div className="flex flex-wrap gap-1" role="group" aria-label="연도 선택">
      {options.map((opt) => {
        const active = year === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => setYear(opt)}
            aria-pressed={active}
            className={`rounded-full px-2 py-0.5 text-sm transition-colors ${
              active
                ? 'bg-on-primary text-primary'
                : 'text-on-primary hover:bg-white/10'
            }`}
          >
            {opt === 'all' ? '전체' : opt}
          </button>
        );
      })}
    </div>
  );
}
