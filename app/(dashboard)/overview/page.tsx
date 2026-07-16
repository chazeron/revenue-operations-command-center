import type { Metadata } from "next";
import { Gauge } from "@/components/gauge";
import { InsightCard } from "@/components/insight-card";
import { MetricCard } from "@/components/metric-card";
import { PageHeader } from "@/components/page-header";
import {
  data,
  formatCurrency,
  formatNumber,
  formatPercent,
  summary,
} from "@/lib/dashboard";

export const metadata: Metadata = {
  title: "Overview",
};

export default function OverviewPage() {
  const bestChannel = [...data.channels]
    .filter((item) => item.roas !== null)
    .sort((a, b) => (b.roas ?? 0) - (a.roas ?? 0))[0];

  const weakestChannel = [...data.channels]
    .filter((item) => item.roas !== null)
    .sort((a, b) => (a.roas ?? 0) - (b.roas ?? 0))[0];

  const bestCloser = [...data.closers].sort(
    (a, b) => b.close_rate - a.close_rate,
  )[0];

  const cards = [
    ["Leads", formatNumber(summary.leads), "Top-of-funnel volume", "cyan"],
    ["Bookings", formatNumber(summary.bookings), formatPercent(summary.booking_rate), "blue"],
    ["Show Rate", formatPercent(summary.show_rate), `${summary.shows} consultations`, "green"],
    ["Closed Sales", formatNumber(summary.closed_sales), formatPercent(summary.close_rate), "gold"],
    ["Contracted Revenue", formatCurrency(summary.contracted_revenue), "Signed value", "gold"],
    ["Cash Collected", formatCurrency(summary.cash_collected), formatPercent(summary.cash_collection_rate), "green"],
    ["ROAS", `${summary.roas.toFixed(2)}x`, formatCurrency(summary.marketing_spend), "blue"],
    ["No-show Cost", formatCurrency(summary.no_show_opportunity_cost), `${summary.no_shows} no-shows`, "red"],
  ] as const;

  const monthlyMax = Math.max(
    ...data.monthly.map((item) => item.contracted_revenue),
  );

  return (
    <>
      <PageHeader
        eyebrow="Executive Overview"
        title="Revenue intelligence for faster commercial decisions"
        description="A synthetic-data portfolio project demonstrating how CRM, sales, payment and marketing information can be transformed into operational clarity."
      />

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

      <section className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Gauge
          value={summary.close_rate}
          label="Closing Rate Health"
          caption="A 30.5% offer-to-close rate places the sales operation inside the healthy range for this demo scenario."
        />

        <article className="dashboard-card rounded-2xl p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">
            Monthly Performance
          </p>
          <h3 className="mt-2 text-2xl font-semibold">Revenue vs. cash collected</h3>

          <div className="mt-8 grid min-h-[250px] grid-cols-6 items-end gap-3">
            {data.monthly.map((item) => {
              const revenueHeight = Math.max(
                (item.contracted_revenue / monthlyMax) * 185,
                12,
              );
              const cashHeight = Math.max(
                (item.cash_collected / monthlyMax) * 185,
                8,
              );

              return (
                <div key={item.month} className="flex min-w-0 flex-col items-center">
                  <div className="flex h-[195px] items-end gap-1.5">
                    <div
                      className="w-4 rounded-t-md bg-cyan-400 sm:w-6"
                      style={{ height: `${revenueHeight}px` }}
                      title={`Revenue: ${formatCurrency(item.contracted_revenue)}`}
                    />
                    <div
                      className="w-4 rounded-t-md bg-blue-400 sm:w-6"
                      style={{ height: `${cashHeight}px` }}
                      title={`Cash: ${formatCurrency(item.cash_collected)}`}
                    />
                  </div>
                  <p className="mt-3 truncate text-sm text-slate-500">
                    {item.label.replace(" 2026", "")}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex flex-wrap gap-5 text-sm text-slate-400">
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm bg-cyan-400" />
              Contracted revenue
            </span>
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm bg-blue-400" />
              Cash collected
            </span>
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
          <InsightCard
            title={`${bestChannel.channel} is the efficiency leader`}
            body={`${bestChannel.roas?.toFixed(2)}x ROAS with a ${formatPercent(bestChannel.lead_to_close_rate)} lead-to-close rate. This channel deserves protected budget and scalable follow-up capacity.`}
            tone="positive"
          />
          <InsightCard
            title={`${weakestChannel.channel} needs immediate review`}
            body={`${weakestChannel.roas?.toFixed(2)}x ROAS indicates that volume is not translating into efficient revenue. Creative, targeting and qualification should be audited before scaling spend.`}
            tone="critical"
          />
          <InsightCard
            title="Lost offers represent the largest revenue leak"
            body={`${formatCurrency(summary.lost_revenue)} in estimated contract value reached an offer but did not close. This is a stronger commercial risk than insufficient lead generation.`}
            tone="warning"
          />
          <InsightCard
            title={`${bestCloser.closer} leads conversion efficiency`}
            body={`${formatPercent(bestCloser.close_rate)} close rate across ${bestCloser.offers} offers. Their call process should be reviewed for repeatable behaviors and coaching opportunities.`}
            tone="neutral"
          />
        </div>
      </section>

      <footer className="mt-10 border-t border-white/10 pt-6 text-sm leading-6 text-slate-500">
        {data.meta.disclaimer}
      </footer>
    </>
  );
}
