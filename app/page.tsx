import dashboardData from "@/public/data/dashboard.json";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

const summary = dashboardData.executive_summary;

const cards = [
  { label: "Leads", value: summary.leads.toLocaleString() },
  { label: "Bookings", value: summary.bookings.toLocaleString() },
  { label: "Show Rate", value: formatPercent(summary.show_rate) },
  { label: "Closed Sales", value: summary.closed_sales.toLocaleString() },
  { label: "Contracted Revenue", value: formatCurrency(summary.contracted_revenue) },
  { label: "Cash Collected", value: formatCurrency(summary.cash_collected) },
  { label: "ROAS", value: `${summary.roas.toFixed(2)}x` },
  { label: "Opportunity Cost", value: formatCurrency(summary.no_show_opportunity_cost) },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div className="max-w-4xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">
              Portfolio Project
            </p>

            <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
              Revenue Operations & CRM Command Center
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
              A synthetic-data business intelligence product showing how CRM,
              appointment, sales, payment and marketing data can be transformed
              into actionable revenue insights.
            </p>

            <div className="mt-8 flex flex-wrap gap-3 text-sm text-slate-300">
              {["Next.js", "TypeScript", "Python", "SQL", "CRM", "Revenue Operations"].map(
                (item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2"
                  >
                    {item}
                  </span>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-cyan-300">Executive Overview</p>
            <h2 className="mt-1 text-2xl font-semibold">Business performance snapshot</h2>
          </div>

          <p className="max-w-xl text-sm leading-6 text-slate-400">
            {dashboardData.meta.disclaimer}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <article
              key={card.label}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/10"
            >
              <p className="text-sm text-slate-400">{card.label}</p>
              <p className="mt-3 text-3xl font-semibold tracking-tight">{card.value}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-16 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
            <div className="mb-6">
              <p className="text-sm font-medium text-cyan-300">Sales Funnel</p>
              <h2 className="mt-1 text-xl font-semibold">Conversion by stage</h2>
            </div>

            <div className="space-y-4">
              {dashboardData.funnel.map((item) => (
                <div key={item.stage}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span>{item.stage}</span>
                    <span className="text-slate-400">
                      {item.value.toLocaleString()} ·{" "}
                      {formatPercent(item.conversion_from_lead)}
                    </span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full bg-cyan-400"
                      style={{
                        width: `${Math.max(item.conversion_from_lead * 100, 3)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
            <div className="mb-6">
              <p className="text-sm font-medium text-cyan-300">Commercial Risk</p>
              <h2 className="mt-1 text-xl font-semibold">Revenue leakage</h2>
            </div>

            <dl className="space-y-6">
              <div>
                <dt className="text-sm text-slate-400">Lost offered revenue</dt>
                <dd className="mt-2 text-3xl font-semibold">
                  {formatCurrency(summary.lost_revenue)}
                </dd>
              </div>

              <div>
                <dt className="text-sm text-slate-400">No-show opportunity cost</dt>
                <dd className="mt-2 text-3xl font-semibold">
                  {formatCurrency(summary.no_show_opportunity_cost)}
                </dd>
              </div>

              <div>
                <dt className="text-sm text-slate-400">Cash collection rate</dt>
                <dd className="mt-2 text-3xl font-semibold">
                  {formatPercent(summary.cash_collection_rate)}
                </dd>
              </div>
            </dl>
          </article>
        </div>
      </section>
    </main>
  );
}
