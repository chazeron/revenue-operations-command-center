import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { data, formatCurrency, formatNumber, formatPercent } from "@/lib/dashboard";

export const metadata: Metadata = {
  title: "Channels",
};

export default function ChannelsPage() {
  const maxRevenue = Math.max(
    ...data.channels.map((item) => item.contracted_revenue),
  );

  return (
    <>
      <PageHeader
        eyebrow="Acquisition Channels"
        title="Compare volume, efficiency and commercial return"
        description="A channel should not be judged by lead volume alone. This view connects acquisition, sales conversion, CAC and ROAS."
      />

      <section className="grid gap-5 lg:grid-cols-2">
        {data.channels
          .slice()
          .sort((a, b) => b.contracted_revenue - a.contracted_revenue)
          .map((item) => (
            <article key={item.channel} className="dashboard-card rounded-2xl p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-semibold">{item.channel}</h3>
                  <p className="mt-1 text-[15px] text-slate-500">
                    {formatNumber(item.leads)} leads · {formatNumber(item.closed_sales)} sales
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
                    item.roas !== null && item.roas >= 3
                      ? "bg-emerald-400/10 text-emerald-300"
                      : item.roas !== null && item.roas >= 1
                        ? "bg-amber-400/10 text-amber-300"
                        : "bg-rose-400/10 text-rose-300"
                  }`}
                >
                  {item.roas === null ? "No ROAS" : `${item.roas.toFixed(2)}x ROAS`}
                </span>
              </div>

              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between gap-4">
                  <span className="text-sm text-slate-400">Contracted revenue</span>
                  <span className="font-semibold">{formatCurrency(item.contracted_revenue)}</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-white/[0.055]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-400"
                    style={{
                      width: `${Math.max((item.contracted_revenue / maxRevenue) * 100, 3)}%`,
                    }}
                  />
                </div>
              </div>

              <dl className="mt-6 grid grid-cols-2 gap-5 text-[15px]">
                <div>
                  <dt className="text-slate-500">Booking rate</dt>
                  <dd className="mt-1 text-xl font-semibold">{formatPercent(item.booking_rate)}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Lead-to-close</dt>
                  <dd className="mt-1 text-xl font-semibold">{formatPercent(item.lead_to_close_rate)}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">CAC</dt>
                  <dd className="mt-1 text-xl font-semibold">
                    {item.cac === null ? "—" : formatCurrency(item.cac)}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Marketing spend</dt>
                  <dd className="mt-1 text-xl font-semibold">{formatCurrency(item.marketing_spend)}</dd>
                </div>
              </dl>
            </article>
          ))}
      </section>
    </>
  );
}
