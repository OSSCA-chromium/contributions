'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { DEFAULT_YEAR } from '@/lib/years';

type YearContextValue = {
  year: string;
  // eslint-disable-next-line no-unused-vars
  setYear: (year: string) => void;
};

const YearContext = createContext<YearContextValue>({
  year: DEFAULT_YEAR,
  setYear: () => {},
});

export function YearProvider({
  children,
  initialYear = DEFAULT_YEAR,
  years = [],
}: {
  children: ReactNode;
  initialYear?: string;
  years?: string[];
}) {
  const [year, setYearState] = useState<string>(initialYear);

  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem('year');
    } catch {
      // storage may be blocked (SecurityError); keep the default year
      return;
    }
    // only restore values we can actually render: 'all' or a known year
    if (saved && (saved === 'all' || years.includes(saved))) {
      setYearState(saved);
    }
  }, [years]);

  const setYear = (y: string) => {
    setYearState(y);
    try {
      localStorage.setItem('year', y);
    } catch {
      // ignore storage errors
    }
  };

  return <YearContext.Provider value={{ year, setYear }}>{children}</YearContext.Provider>;
}

export function useYear(): YearContextValue {
  return useContext(YearContext);
}
