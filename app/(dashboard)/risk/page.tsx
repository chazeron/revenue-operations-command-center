import type { Metadata } from "next";
import { MetricCard } from "@/components/metric-card";
import { PageHeader } from "@/components/page-header";
import { data, formatCurrency, formatPercent, summary } from "@/lib/dashboard";

export const metadata: Metadata = {
  title: "Revenue Risk",
};

export default function RiskPage() {
  const topReasons = data.lost_reasons.slice(0, 8);
  const maxReason = Math.max(...topReasons.map((item) => item.count));

  return (
    <>
      <PageHeader
        eyebrow="Revenue Risk"
        title="Make hidden commercial losses visible"
        description="This view quantifies the financial impact of lost offers, no-shows, weak collection and recurring objections."
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Lost Offered Revenue"
          value={formatCurrency(summary.lost_revenue)}
          helper="Closed-lost opportunities with stated value"
          accent="red"
        />
        <MetricCard
          label="No-show Opportunity Cost"
          value={formatCurrency(summary.no_show_opportunity_cost)}
          helper={`${summary.no_shows} missed consultations`}
          accent="gold"
        />
        <MetricCard
          label="Cash Collection Rate"
          value={formatPercent(summary.cash_collection_rate)}
          helper={`${formatCurrency(summary.cash_collected)} collected`}
          accent="green"
        />
        <MetricCard
          label="Revenue Not Yet Collected"
          value={formatCurrency(summary.contracted_revenue - summary.cash_collected)}
          helper="Signed value minus collected cash"
          accent="blue"
        />
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <article className="dashboard-card rounded-2xl p-6">
          <h3 className="text-2xl font-semibold">Lost reasons</h3>
          <p className="mt-2 text-[15px] text-slate-400">
            Frequency of the most common reasons for commercial loss.
          </p>

          <div className="mt-7 space-y-5">
            {topReasons.map((item) => (
              <div key={item.reason}>
                <div className="mb-2 flex items-center justify-between gap-4 text-[15px]">
                  <span>{item.reason}</span>
                  <span className="text-slate-400">{item.count}</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-white/[0.055]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-rose-400 to-amber-400"
                    style={{
                      width: `${Math.max((item.count / maxReason) * 100, 4)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="dashboard-card rounded-2xl p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">
            Action Framework
          </p>
          <h3 className="mt-2 text-2xl font-semibold">
            Recommended operational priorities
          </h3>

          <ol className="mt-7 space-y-5 text-[15px] leading-7 text-slate-400">
            <li>
              <span className="mr-3 font-semibold text-white">01.</span>
              Audit lost calls by objection and closer to identify coaching gaps.
            </li>
            <li>
              <span className="mr-3 font-semibold text-white">02.</span>
              Deploy no-show recovery workflows across SMS, email and setter follow-up.
            </li>
            <li>
              <span className="mr-3 font-semibold text-white">03.</span>
              Separate contracted revenue from collected cash in executive reporting.
            </li>
            <li>
              <span className="mr-3 font-semibold text-white">04.</span>
              Prioritize channels with strong ROAS and lead-to-close performance.
            </li>
          </ol>
        </article>
      </section>
    </>
  );
}
