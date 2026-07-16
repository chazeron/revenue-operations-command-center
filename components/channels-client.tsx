"use client";

import { useFilters } from "@/components/filters-provider";
import { groupByChannel } from "@/lib/analytics";
import {
  formatCurrency,
  formatNumber,
  formatPercent,
} from "@/lib/dashboard";

export function ChannelsClient() {
  const { filters } = useFilters();
  const channels = groupByChannel(filters).sort(
    (a, b) => b.contractedRevenue - a.contractedRevenue,
  );
  const maxRevenue = Math.max(
    ...channels.map((item) => item.contractedRevenue),
    1,
  );

  return (
    <section className="grid gap-5 lg:grid-cols-2">
      {channels.map((item) => (
        <article key={item.channel} className="dashboard-card rounded-2xl p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h3 className="text-2xl font-semibold">{item.channel}</h3>
              <p className="mt-1 text-[15px] text-slate-500">
                {formatNumber(item.leads)} leads ·{" "}
                {formatNumber(item.closedSales)} sales
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
                item.roas >= 3
                  ? "bg-emerald-400/10 text-emerald-300"
                  : item.roas >= 1
                    ? "bg-amber-400/10 text-amber-300"
                    : "bg-rose-400/10 text-rose-300"
              }`}
            >
              {item.roas.toFixed(2)}x ROAS
            </span>
          </div>

          <div className="mt-6">
            <div className="mb-2 flex justify-between gap-4">
              <span className="text-sm text-slate-400">Contracted revenue</span>
              <span className="font-semibold">
                {formatCurrency(item.contractedRevenue)}
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-white/[0.055]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-400"
                style={{
                  width: `${Math.max(
                    (item.contractedRevenue / maxRevenue) * 100,
                    3,
                  )}%`,
                }}
              />
            </div>
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-5 text-[15px]">
            <div>
              <dt className="text-slate-500">Booking rate</dt>
              <dd className="mt-1 text-xl font-semibold">
                {formatPercent(item.bookingRate)}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Lead-to-close</dt>
              <dd className="mt-1 text-xl font-semibold">
                {formatPercent(item.leadToCloseRate)}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">CAC</dt>
              <dd className="mt-1 text-xl font-semibold">
                {formatCurrency(item.cac)}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Marketing spend</dt>
              <dd className="mt-1 text-xl font-semibold">
                {formatCurrency(item.marketingSpend)}
              </dd>
            </div>
          </dl>
        </article>
      ))}
    </section>
  );
}
