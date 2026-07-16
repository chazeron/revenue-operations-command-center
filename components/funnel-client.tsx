"use client";

import { Gauge } from "@/components/gauge";
import { useFilters } from "@/components/filters-provider";
import { calculateMetrics } from "@/lib/analytics";
import { formatNumber, formatPercent } from "@/lib/dashboard";

export function FunnelClient() {
  const { filters } = useFilters();
  const metrics = calculateMetrics(filters);

  const steps = [
    ["Leads", metrics.leads, 1],
    ["Bookings", metrics.bookings, metrics.bookingRate],
    ["Shows", metrics.shows, metrics.showRate],
    ["Offers", metrics.offers, metrics.offerRate],
    ["Closed Sales", metrics.closedSales, metrics.closeRate],
  ] as const;

  return (
    <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
      <article className="dashboard-card rounded-2xl p-6">
        <h3 className="text-2xl font-semibold">Filtered funnel progression</h3>
        <div className="mt-8 space-y-6">
          {steps.map(([label, value, conversion], index) => (
            <div key={label}>
              <div className="mb-3 flex items-end justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold">{label}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {index === 0
                      ? "Starting population"
                      : `${formatPercent(conversion)} from previous stage`}
                  </p>
                </div>
                <p className="metric-number text-3xl font-semibold">
                  {formatNumber(value)}
                </p>
              </div>
              <div className="h-5 overflow-hidden rounded-full bg-white/[0.055]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-400"
                  style={{
                    width: `${Math.max(
                      metrics.leads ? (value / metrics.leads) * 100 : 0,
                      3,
                    )}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </article>

      <div className="grid gap-6">
        <Gauge
          value={metrics.closeRate}
          label="Offer-to-Close Health"
          caption="Red indicates danger, yellow requires attention and green indicates healthy offer conversion."
        />

        <article className="dashboard-card rounded-2xl p-6">
          <h3 className="text-2xl font-semibold">Drop-off signals</h3>
          <dl className="mt-6 space-y-5">
            {[
              ["Lead → Booking", metrics.bookingRate],
              ["Booking → Show", metrics.showRate],
              ["Show → Offer", metrics.offerRate],
              ["Offer → Close", metrics.closeRate],
            ].map(([label, value]) => (
              <div key={label as string} className="flex items-center justify-between gap-4">
                <dt className="text-[15px] text-slate-400">{label}</dt>
                <dd className="text-xl font-semibold">
                  {formatPercent(Number(value))}
                </dd>
              </div>
            ))}
          </dl>
        </article>
      </div>
    </section>
  );
}
