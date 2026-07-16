"use client";

import { Gauge } from "@/components/gauge";
import { InsightCard } from "@/components/insight-card";
import { MetricCard } from "@/components/metric-card";
import { useFilters } from "@/components/filters-provider";
import {
  calculateMetrics,
  groupByChannel,
  groupByCloser,
} from "@/lib/analytics";
import {
  formatCurrency,
  formatNumber,
  formatPercent,
} from "@/lib/dashboard";

export function OverviewClient() {
  const { filters } = useFilters();
  const metrics = calculateMetrics(filters);
  const channels = groupByChannel(filters);
  const closers = groupByCloser(filters);

  const bestChannel = [...channels]
    .filter((item) => item.marketingSpend > 0)
    .sort((a, b) => b.roas - a.roas)[0];

  const weakestChannel = [...channels]
    .filter((item) => item.marketingSpend > 0)
    .sort((a, b) => a.roas - b.roas)[0];

  const bestCloser = [...closers].sort(
    (a, b) => b.closeRate - a.closeRate,
  )[0];

  const cards = [
    ["Leads", formatNumber(metrics.leads), "Filtered lead volume", "cyan"],
    ["Bookings", formatNumber(metrics.bookings), formatPercent(metrics.bookingRate), "blue"],
    ["Show Rate", formatPercent(metrics.showRate), `${metrics.shows} consultations`, "green"],
    ["Closed Sales", formatNumber(metrics.closedSales), formatPercent(metrics.closeRate), "gold"],
    ["Contracted Revenue", formatCurrency(metrics.contractedRevenue), "Signed value", "gold"],
    ["Cash Collected", formatCurrency(metrics.cashCollected), formatPercent(metrics.cashCollectionRate), "green"],
    ["ROAS", `${metrics.roas.toFixed(2)}x`, formatCurrency(metrics.marketingSpend), "blue"],
    ["No-show Cost", formatCurrency(metrics.noShowOpportunityCost), `${metrics.noShows} no-shows`, "red"],
  ] as const;

  return (
    <>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value, helper, accent]) => (
          <MetricCard
            key={label}
            label={label}
            value={value}
            helper={helper}
            accent={accent}
          />
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <Gauge
          value={metrics.closeRate}
          label="Closing Rate Health"
          caption="The gauge updates dynamically as month, channel and closer filters change."
        />

        <article className="dashboard-card rounded-2xl p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">
            Filtered Funnel Snapshot
          </p>
          <h3 className="mt-2 text-2xl font-semibold">
            Commercial progression
          </h3>

          <div className="mt-7 grid gap-4 sm:grid-cols-5">
            {[
              ["Leads", metrics.leads],
              ["Bookings", metrics.bookings],
              ["Shows", metrics.shows],
              ["Offers", metrics.offers],
              ["Sales", metrics.closedSales],
            ].map(([label, value], index, array) => (
              <div key={label} className="relative">
                <div className="rounded-xl border border-white/10 bg-white/[0.035] px-4 py-5 text-center">
                  <p className="text-sm text-slate-500">{label}</p>
                  <p className="metric-number mt-2 text-2xl font-semibold">
                    {formatNumber(Number(value))}
                  </p>
                </div>
                {index < array.length - 1 && (
                  <span className="absolute -right-3 top-1/2 hidden -translate-y-1/2 text-cyan-300 sm:block">
                    →
                  </span>
                )}
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="mt-8">
        <div className="mb-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">
            Executive Insights
          </p>
          <h3 className="mt-2 text-2xl font-semibold">
            What leadership should act on
          </h3>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {bestChannel ? (
            <InsightCard
              title={`${bestChannel.channel} leads efficiency`}
              body={`${bestChannel.roas.toFixed(2)}x ROAS with a ${formatPercent(bestChannel.leadToCloseRate)} lead-to-close rate inside the active filters.`}
              tone="positive"
            />
          ) : (
            <InsightCard
              title="No channel data available"
              body="The active filter combination does not contain enough marketing-spend data for channel comparison."
            />
          )}

          {weakestChannel ? (
            <InsightCard
              title={`${weakestChannel.channel} requires review`}
              body={`${weakestChannel.roas.toFixed(2)}x ROAS indicates weaker commercial efficiency inside the active filters.`}
              tone="critical"
            />
          ) : null}

          <InsightCard
            title="Lost offers remain the largest revenue leak"
            body={`${formatCurrency(metrics.lostRevenue)} in estimated offered value did not close under the current selection.`}
            tone="warning"
          />

          {bestCloser ? (
            <InsightCard
              title={`${bestCloser.closer} leads closing efficiency`}
              body={`${formatPercent(bestCloser.closeRate)} close rate across ${bestCloser.offers} filtered offers.`}
              tone="neutral"
            />
          ) : null}
        </div>
      </section>
    </>
  );
}
