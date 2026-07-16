"use client";

import { useFilters } from "@/components/filters-provider";

function labelMonth(value: string) {
  if (value === "all") return "All months";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}-01T00:00:00Z`));
}

export function DashboardFilters() {
  const {
    filters,
    setMonth,
    setChannel,
    setCloser,
    reset,
    options,
  } = useFilters();

  const active =
    filters.month !== "all" ||
    filters.channel !== "all" ||
    filters.closer !== "all";

  const selectClass =
    "min-w-0 rounded-xl border border-white/10 bg-[#0b1828] px-4 py-3 text-[15px] text-slate-200 outline-none transition focus:border-cyan-400/50";

  return (
    <section className="dashboard-card mb-8 rounded-2xl p-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">
            Interactive Filters
          </p>
          <p className="mt-1 text-[15px] text-slate-400">
            Every KPI and visualization updates across the selected dimensions.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[180px_200px_200px_auto]">
          <select
            value={filters.month}
            onChange={(event) => setMonth(event.target.value)}
            className={selectClass}
            aria-label="Filter by month"
          >
            <option value="all">All months</option>
            {options.months.map((month) => (
              <option key={month} value={month}>
                {labelMonth(month)}
              </option>
            ))}
          </select>

          <select
            value={filters.channel}
            onChange={(event) => setChannel(event.target.value)}
            className={selectClass}
            aria-label="Filter by channel"
          >
            <option value="all">All channels</option>
            {options.channels.map((channel) => (
              <option key={channel} value={channel}>
                {channel}
              </option>
            ))}
          </select>

          <select
            value={filters.closer}
            onChange={(event) => setCloser(event.target.value)}
            className={selectClass}
            aria-label="Filter by closer"
          >
            <option value="all">All closers</option>
            {options.closers.map((closer) => (
              <option key={closer} value={closer}>
                {closer}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={reset}
            disabled={!active}
            className="rounded-xl border border-white/10 px-4 py-3 text-[15px] font-semibold text-slate-300 transition hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-35"
          >
            Reset
          </button>
        </div>
      </div>
    </section>
  );
}
