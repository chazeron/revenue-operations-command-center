"use client";

import { MetricCard } from "@/components/metric-card";
import { useFilters } from "@/components/filters-provider";
import { calculateMetrics } from "@/lib/analytics";
import { formatCurrency, formatPercent } from "@/lib/dashboard";

export function RiskClient() {
  const { filters } = useFilters();
  const metrics = calculateMetrics(filters);

  const reasons = metrics.facts
    .filter((fact) => fact.opportunity_status === "Lost" && fact.lost_reason)
    .reduce<Record<string, number>>((accumulator, fact) => {
      const reason = String(fact.lost_reason);
      accumulator[reason] = (accumulator[reason] ?? 0) + 1;
      return accumulator;
    }, {});

  const topReasons = Object.entries(reasons)
    .map(([reason, count]) => ({ reason, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const maxReason = Math.max(...topReasons.map((item) => item.count), 1);

  return (
    <>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Lost Offered Revenue"
          value={formatCurrency(metrics.lostRevenue)}
          helper="Closed-lost opportunities with stated value"
          accent="red"
        />
        <MetricCard
          label="No-show Opportunity Cost"
          value={formatCurrency(metrics.noShowOpportunityCost)}
          helper={`${metrics.noShows} missed consultations`}
          accent="gold"
        />
        <MetricCard
          label="Cash Collection Rate"
          value={formatPercent(metrics.cashCollectionRate)}
          helper={`${formatCurrency(metrics.cashCollected)} collected`}
          accent="green"
        />
        <MetricCard
          label="Revenue Not Yet Collected"
          value={formatCurrency(
            metrics.contractedRevenue - metrics.cashCollected,
          )}
          helper="Signed value minus collected cash"
          accent="blue"
        />
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <article className="dashboard-card rounded-2xl p-6">
          <h3 className="text-2xl font-semibold">Lost reasons</h3>
          <div className="mt-7 space-y-5">
            {topReasons.map((item) => (
              <div key={item.reason}>
                <div className="mb-2 flex justify-between gap-4 text-[15px]">
                  <span>{item.reason}</span>
                  <span className="text-slate-400">{item.count}</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-white/[0.055]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-rose-400 to-amber-400"
                    style={{
                      width: `${Math.max(
                        (item.count / maxReason) * 100,
                        4,
                      )}%`,
                    }}
                  />
                </div>
              </div>
            ))}
            {!topReasons.length && (
              <p className="text-[15px] text-slate-400">
                No lost reasons are available for this filter combination.
              </p>
            )}
          </div>
        </article>

        <article className="dashboard-card rounded-2xl p-6">
          <h3 className="text-2xl font-semibold">
            Recommended operational priorities
          </h3>
          <ol className="mt-7 space-y-5 text-[15px] leading-7 text-slate-400">
            <li><span className="mr-3 font-semibold text-white">01.</span>Audit lost calls by objection and closer.</li>
            <li><span className="mr-3 font-semibold text-white">02.</span>Deploy no-show recovery workflows.</li>
            <li><span className="mr-3 font-semibold text-white">03.</span>Separate contracted revenue from collected cash.</li>
            <li><span className="mr-3 font-semibold text-white">04.</span>Prioritize efficient channels before scaling spend.</li>
          </ol>
        </article>
      </section>
    </>
  );
}
