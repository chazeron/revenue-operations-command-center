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

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

const summary = dashboardData.executive_summary;
const monthlyMaxRevenue = Math.max(
  ...dashboardData.monthly.map((item) => item.contracted_revenue),
);
const channelMaxRevenue = Math.max(
  ...dashboardData.channels.map((item) => item.contracted_revenue),
);

const cards = [
  { label: "Leads", value: formatNumber(summary.leads), helper: "Top-of-funnel volume" },
  { label: "Bookings", value: formatNumber(summary.bookings), helper: formatPercent(summary.booking_rate) },
  { label: "Show Rate", value: formatPercent(summary.show_rate), helper: `${formatNumber(summary.shows)} consultations` },
  { label: "Closed Sales", value: formatNumber(summary.closed_sales), helper: formatPercent(summary.close_rate) },
  { label: "Contracted Revenue", value: formatCurrency(summary.contracted_revenue), helper: "Total signed value" },
  { label: "Cash Collected", value: formatCurrency(summary.cash_collected), helper: formatPercent(summary.cash_collection_rate) },
  { label: "ROAS", value: `${summary.roas.toFixed(2)}x`, helper: formatCurrency(summary.marketing_spend) },
  { label: "Opportunity Cost", value: formatCurrency(summary.no_show_opportunity_cost), helper: `${summary.no_shows} no-shows` },
];

const navigation = [
  ["overview", "Overview"],
  ["funnel", "Sales Funnel"],
  ["monthly", "Monthly Performance"],
  ["channels", "Channels"],
  ["team", "Sales Team"],
  ["risk", "Revenue Risk"],
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex max-w-[1600px]">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-white/10 bg-slate-950/95 px-5 py-7 lg:block">
          <div className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">
              RevOps Portfolio
            </p>
            <h1 className="mt-3 text-lg font-semibold leading-6">
              Revenue Operations Command Center
            </h1>
          </div>

          <nav className="space-y-1">
            {navigation.map(([href, label]) => (
              <a
                key={href}
                href={`#${href}`}
                className="block rounded-lg px-3 py-2 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="absolute bottom-7 left-5 right-5 rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs font-medium text-cyan-300">Demo environment</p>
            <p className="mt-2 text-xs leading-5 text-slate-400">
              Synthetic data only. No real customer or company information is shown.
            </p>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <section id="overview" className="border-b border-white/10">
            <div className="px-6 py-14 lg:px-10 xl:px-14">
              <div className="max-w-5xl">
                <p className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">
                  Portfolio Project
                </p>
                <h2 className="text-4xl font-semibold tracking-tight sm:text-6xl">
                  Revenue Operations & CRM Command Center
                </h2>
                <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
                  A business intelligence product that transforms fragmented CRM,
                  sales, appointment, payment and marketing data into clear,
                  actionable revenue insights.
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
                    ),
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="px-6 py-10 lg:px-10 xl:px-14">
            <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-medium text-cyan-300">Executive Overview</p>
                <h3 className="mt-1 text-2xl font-semibold">Business performance snapshot</h3>
              </div>
              <p className="max-w-xl text-sm leading-6 text-slate-400">
                {dashboardData.meta.disclaimer}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {cards.map((card) => (
                <article
                  key={card.label}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/10"
                >
                  <p className="text-sm text-slate-400">{card.label}</p>
                  <p className="mt-3 text-3xl font-semibold tracking-tight">{card.value}</p>
                  <p className="mt-2 text-xs text-slate-500">{card.helper}</p>
                </article>
              ))}
            </div>
          </section>

          <section id="funnel" className="px-6 pb-10 lg:px-10 xl:px-14">
            <div className="grid gap-6 xl:grid-cols-[1.45fr_1fr]">
              <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                <div className="mb-6">
                  <p className="text-sm font-medium text-cyan-300">Sales Funnel</p>
                  <h3 className="mt-1 text-xl font-semibold">Conversion by stage</h3>
                </div>

                <div className="space-y-5">
                  {dashboardData.funnel.map((item) => (
                    <div key={item.stage}>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span>{item.stage}</span>
                        <span className="text-slate-400">
                          {formatNumber(item.value)} · {formatPercent(item.conversion_from_lead)}
                        </span>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-white/5">
                        <div
                          className="h-full rounded-full bg-cyan-400"
                          style={{ width: `${Math.max(item.conversion_from_lead * 100, 3)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              <article id="risk" className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                <div className="mb-6">
                  <p className="text-sm font-medium text-cyan-300">Commercial Risk</p>
                  <h3 className="mt-1 text-xl font-semibold">Revenue leakage</h3>
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

          <section id="monthly" className="px-6 pb-10 lg:px-10 xl:px-14">
            <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
              <div className="mb-8">
                <p className="text-sm font-medium text-cyan-300">Monthly Performance</p>
                <h3 className="mt-1 text-xl font-semibold">Revenue and cash collection trend</h3>
              </div>

              <div className="grid min-h-[310px] grid-cols-6 items-end gap-3 sm:gap-6">
                {dashboardData.monthly.map((item) => {
                  const revenueHeight = Math.max((item.contracted_revenue / monthlyMaxRevenue) * 220, 12);
                  const cashHeight = Math.max((item.cash_collected / monthlyMaxRevenue) * 220, 8);

                  return (
                    <div key={item.month} className="flex min-w-0 flex-col items-center">
                      <div className="flex h-[230px] items-end gap-1.5">
                        <div
                          title={`Revenue: ${formatCurrency(item.contracted_revenue)}`}
                          className="w-4 rounded-t bg-cyan-400 sm:w-7"
                          style={{ height: `${revenueHeight}px` }}
                        />
                        <div
                          title={`Cash: ${formatCurrency(item.cash_collected)}`}
                          className="w-4 rounded-t bg-indigo-400 sm:w-7"
                          style={{ height: `${cashHeight}px` }}
                        />
                      </div>
                      <p className="mt-3 truncate text-xs text-slate-400">{item.label}</p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex flex-wrap gap-5 text-xs text-slate-400">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-sm bg-cyan-400" />
                  Contracted revenue
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-sm bg-indigo-400" />
                  Cash collected
                </span>
              </div>
            </article>
          </section>

          <section id="channels" className="px-6 pb-10 lg:px-10 xl:px-14">
            <article className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
              <div className="p-6">
                <p className="text-sm font-medium text-cyan-300">Acquisition Channels</p>
                <h3 className="mt-1 text-xl font-semibold">Channel efficiency and revenue contribution</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] text-left text-sm">
                  <thead className="border-y border-white/10 bg-white/[0.03] text-xs uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="px-6 py-4">Channel</th>
                      <th className="px-4 py-4">Leads</th>
                      <th className="px-4 py-4">Bookings</th>
                      <th className="px-4 py-4">Sales</th>
                      <th className="px-4 py-4">Revenue</th>
                      <th className="px-4 py-4">CAC</th>
                      <th className="px-4 py-4">ROAS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.channels.map((item) => (
                      <tr key={item.channel} className="border-b border-white/5">
                        <td className="px-6 py-4 font-medium">{item.channel}</td>
                        <td className="px-4 py-4 text-slate-300">{formatNumber(item.leads)}</td>
                        <td className="px-4 py-4 text-slate-300">{formatNumber(item.bookings)}</td>
                        <td className="px-4 py-4 text-slate-300">{formatNumber(item.closed_sales)}</td>
                        <td className="px-4 py-4">
                          <div className="min-w-[170px]">
                            <div className="mb-2 flex items-center justify-between gap-3">
                              <span>{formatCurrency(item.contracted_revenue)}</span>
                            </div>
                            <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                              <div
                                className="h-full rounded-full bg-cyan-400"
                                style={{
                                  width: `${Math.max((item.contracted_revenue / channelMaxRevenue) * 100, 2)}%`,
                                }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-slate-300">
                          {item.cac === null ? "—" : formatCurrency(item.cac)}
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                              item.roas !== null && item.roas >= 3
                                ? "bg-emerald-400/10 text-emerald-300"
                                : item.roas !== null && item.roas >= 1
                                  ? "bg-amber-400/10 text-amber-300"
                                  : "bg-rose-400/10 text-rose-300"
                            }`}
                          >
                            {item.roas === null ? "—" : `${item.roas.toFixed(2)}x`}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          </section>

          <section id="team" className="px-6 pb-16 lg:px-10 xl:px-14">
            <div className="mb-6">
              <p className="text-sm font-medium text-cyan-300">Sales Team</p>
              <h3 className="mt-1 text-xl font-semibold">Closer performance</h3>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {dashboardData.closers.map((closer) => (
                <article
                  key={closer.closer}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-6"
                >
                  <p className="text-lg font-semibold">{closer.closer}</p>
                  <p className="mt-1 text-sm text-slate-400">
                    {formatCurrency(closer.contracted_revenue)} contracted
                  </p>

                  <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <dt className="text-slate-500">Shows</dt>
                      <dd className="mt-1 text-xl font-semibold">{closer.shows}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Offers</dt>
                      <dd className="mt-1 text-xl font-semibold">{closer.offers}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Sales</dt>
                      <dd className="mt-1 text-xl font-semibold">{closer.closed_sales}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Close rate</dt>
                      <dd className="mt-1 text-xl font-semibold">{formatPercent(closer.close_rate)}</dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
