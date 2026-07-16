"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { filterData, type FilterState } from "@/lib/analytics";

type FilterContextValue = {
  filters: FilterState;
  setMonth: (value: string) => void;
  setChannel: (value: string) => void;
  setCloser: (value: string) => void;
  reset: () => void;
  options: typeof filterData.options;
};

const defaultFilters: FilterState = {
  month: "all",
  channel: "all",
  closer: "all",
};

const FilterContext = createContext<FilterContextValue | null>(null);

export function FiltersProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  const value = useMemo<FilterContextValue>(
    () => ({
      filters,
      setMonth: (month) =>
        setFilters((current) => ({ ...current, month })),
      setChannel: (channel) =>
        setFilters((current) => ({ ...current, channel })),
      setCloser: (closer) =>
        setFilters((current) => ({ ...current, closer })),
      reset: () => setFilters(defaultFilters),
      options: filterData.options,
    }),
    [filters],
  );

  return (
    <FilterContext.Provider value={value}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const value = useContext(FilterContext);

  if (!value) {
    throw new Error("useFilters must be used inside FiltersProvider");
  }

  return value;
}
