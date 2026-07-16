"use client";

import { useFilters } from "@/components/filters-provider";
import { groupByCloser } from "@/lib/analytics";
import { formatCurrency, formatPercent } from "@/lib/dashboard";

export function TeamClient() {
  const { filters } = useFilters();
  const closers = groupByCloser(filters).sort(
    (a, b) => b.closeRate - a.closeRate,
  );

  return (
    <section className="grid gap-5 xl:grid-cols-3">
      {closers.map((closer, index) => (
        <article key={closer.closer} className="dashboard-card rounded-2xl p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">
                Rank {index + 1}
              </p>
              <h3 className="mt-2 text-2xl font-semibold">{closer.closer}</h3>
            </div>
            <span className="rounded-full bg-white/[0.055] px-3 py-1.5 text-sm text-slate-300">
              {formatPercent(closer.closeRate)}
            </span>
          </div>

          <p className="metric-number mt-7 text-4xl font-semibold">
            {formatCurrency(closer.contractedRevenue)}
          </p>
          <p className="mt-2 text-[15px] text-slate-500">
            Contracted revenue
          </p>

          <dl className="mt-7 grid grid-cols-2 gap-5">
            <div>
              <dt className="text-sm text-slate-500">Shows</dt>
              <dd className="mt-1 text-2xl font-semibold">{closer.shows}</dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">Offers</dt>
              <dd className="mt-1 text-2xl font-semibold">{closer.offers}</dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">Closed sales</dt>
              <dd className="mt-1 text-2xl font-semibold">
                {closer.closedSales}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">Avg. contract</dt>
              <dd className="mt-1 text-2xl font-semibold">
                {formatCurrency(closer.averageContractValue)}
              </dd>
            </div>
          </dl>
        </article>
      ))}
    </section>
  );
}
