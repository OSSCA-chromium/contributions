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

export function YearProvider({ children }: { children: ReactNode }) {
  const [year, setYearState] = useState<string>(DEFAULT_YEAR);

  useEffect(() => {
    const saved = localStorage.getItem('year');
    if (saved) setYearState(saved);
  }, []);

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
