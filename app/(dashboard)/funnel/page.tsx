import type { Metadata } from "next";
import { Gauge } from "@/components/gauge";
import { PageHeader } from "@/components/page-header";
import { data, formatNumber, formatPercent, summary } from "@/lib/dashboard";

export const metadata: Metadata = {
  title: "Sales Funnel",
};

export default function FunnelPage() {
  return (
    <>
      <PageHeader
        eyebrow="Sales Funnel"
        title="Understand where revenue momentum is created or lost"
        description="Stage-level conversion shows whether the commercial system needs more leads, better attendance, stronger qualification or improved closing."
      />

      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <article className="dashboard-card rounded-2xl p-6">
          <h3 className="text-2xl font-semibold">Full funnel progression</h3>
          <p className="mt-2 text-[15px] text-slate-400">
            Conversion rates are shown from the prior stage and from original lead volume.
          </p>

          <div className="mt-8 space-y-6">
            {data.funnel.map((item, index) => (
              <div key={item.stage}>
                <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold">{item.stage}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {index === 0
                        ? "Starting population"
                        : `${formatPercent(item.conversion_from_previous)} from previous stage`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="metric-number text-3xl font-semibold">
                      {formatNumber(item.value)}
                    </p>
                    <p className="mt-1 text-sm text-cyan-300">
                      {formatPercent(item.conversion_from_lead)} of leads
                    </p>
                  </div>
                </div>

                <div className="h-5 overflow-hidden rounded-full bg-white/[0.055]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-400"
                    style={{
                      width: `${Math.max(item.conversion_from_lead * 100, 3)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>

        <div className="grid gap-6">
          <Gauge
            value={summary.close_rate}
            label="Offer-to-Close Health"
            caption="This gauge provides fast operational context: red indicates danger, yellow requires attention and green indicates a healthy conversion level."
          />

          <article className="dashboard-card rounded-2xl p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">
              Drop-off Signals
            </p>
            <dl className="mt-5 space-y-5">
              <div>
                <dt className="text-[15px] text-slate-400">Lead → Booking</dt>
                <dd className="mt-1 text-2xl font-semibold">{formatPercent(summary.booking_rate)}</dd>
              </div>
              <div>
                <dt className="text-[15px] text-slate-400">Booking → Show</dt>
                <dd className="mt-1 text-2xl font-semibold">{formatPercent(summary.show_rate)}</dd>
              </div>
              <div>
                <dt className="text-[15px] text-slate-400">Show → Offer</dt>
                <dd className="mt-1 text-2xl font-semibold">{formatPercent(summary.offer_rate)}</dd>
              </div>
              <div>
                <dt className="text-[15px] text-slate-400">Offer → Close</dt>
                <dd className="mt-1 text-2xl font-semibold">{formatPercent(summary.close_rate)}</dd>
              </div>
            </dl>
          </article>
        </div>
      </section>
    </>
  );
}
