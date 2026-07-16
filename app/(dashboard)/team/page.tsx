import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { data, formatCurrency, formatPercent } from "@/lib/dashboard";

export const metadata: Metadata = {
  title: "Sales Team",
};

export default function TeamPage() {
  const ranked = [...data.closers].sort(
    (a, b) => b.close_rate - a.close_rate,
  );

  return (
    <>
      <PageHeader
        eyebrow="Sales Team"
        title="Compare closer output, efficiency and revenue contribution"
        description="Performance is evaluated across shows, offers, sales, close rate, revenue and average contract value."
      />

      <section className="grid gap-5 xl:grid-cols-3">
        {ranked.map((closer, index) => (
          <article key={closer.closer} className="dashboard-card rounded-2xl p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">
                  Rank {index + 1}
                </p>
                <h3 className="mt-2 text-2xl font-semibold">{closer.closer}</h3>
              </div>
              <span className="rounded-full bg-white/[0.055] px-3 py-1.5 text-sm text-slate-300">
                {formatPercent(closer.close_rate)}
              </span>
            </div>

            <p className="metric-number mt-7 text-4xl font-semibold">
              {formatCurrency(closer.contracted_revenue)}
            </p>
            <p className="mt-2 text-[15px] text-slate-500">Contracted revenue</p>

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
                <dd className="mt-1 text-2xl font-semibold">{closer.closed_sales}</dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">Avg. contract</dt>
                <dd className="mt-1 text-2xl font-semibold">
                  {formatCurrency(closer.average_contract_value)}
                </dd>
              </div>
            </dl>
          </article>
        ))}
      </section>
    </>
  );
}
