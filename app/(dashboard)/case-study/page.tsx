import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { ProjectActions } from "@/components/project-actions";
import {
  formatCurrency,
  formatPercent,
  summary,
} from "@/lib/dashboard";

export const metadata: Metadata = {
  title: "Case Study",
};

const capabilities = [
  "CRM data modeling",
  "Synthetic data generation",
  "Python validation workflows",
  "Revenue KPI design",
  "Interactive filtering",
  "Executive dashboard design",
  "Next.js application architecture",
  "Vercel deployment",
];

export default function CaseStudyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Portfolio Case Study"
        title="From fragmented CRM data to an executive revenue command center"
        description="This project demonstrates the end-to-end design of a commercial analytics product: data architecture, validation, KPI logic, interactive reporting and cloud deployment."
      />

      <ProjectActions />

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="dashboard-card rounded-2xl p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">
            Business Problem
          </p>
          <h3 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">
            Revenue teams often operate without one reliable source of truth
          </h3>
          <p className="mt-5 text-[16px] leading-8 text-slate-400">
            Leads, appointments, sales, payments, marketing expenses and sales
            activity frequently live in separate tools. That fragmentation makes
            it difficult to understand funnel health, rep performance, channel
            profitability and revenue leakage.
          </p>
          <p className="mt-4 text-[16px] leading-8 text-slate-400">
            The command center consolidates those operational concepts into one
            structured analytics layer designed for leadership decisions.
          </p>
        </article>

        <article className="dashboard-card rounded-2xl p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">
            Demo Outcomes
          </p>
          <dl className="mt-6 grid grid-cols-2 gap-6">
            <div>
              <dt className="text-[15px] text-slate-500">Contracted revenue</dt>
              <dd className="metric-number mt-2 text-3xl font-semibold">
                {formatCurrency(summary.contracted_revenue)}
              </dd>
            </div>
            <div>
              <dt className="text-[15px] text-slate-500">Cash collected</dt>
              <dd className="metric-number mt-2 text-3xl font-semibold">
                {formatCurrency(summary.cash_collected)}
              </dd>
            </div>
            <div>
              <dt className="text-[15px] text-slate-500">Closing rate</dt>
              <dd className="metric-number mt-2 text-3xl font-semibold">
                {formatPercent(summary.close_rate)}
              </dd>
            </div>
            <div>
              <dt className="text-[15px] text-slate-500">ROAS</dt>
              <dd className="metric-number mt-2 text-3xl font-semibold">
                {summary.roas.toFixed(2)}x
              </dd>
            </div>
          </dl>
        </article>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-2">
        <article className="dashboard-card rounded-2xl p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">
            Solution Architecture
          </p>
          <div className="mt-6 space-y-3">
            {[
              ["01", "Generate", "Create a realistic six-month synthetic commercial dataset."],
              ["02", "Validate", "Check keys, relationships, revenue consistency and KPI realism."],
              ["03", "Transform", "Aggregate operational CSV data into optimized JSON layers."],
              ["04", "Visualize", "Build multi-view analytics pages with dynamic filtering."],
              ["05", "Deploy", "Version with GitHub and publish through Vercel."],
            ].map(([number, title, body]) => (
              <div
                key={number}
                className="grid gap-3 rounded-xl border border-white/10 bg-white/[0.035] p-4 sm:grid-cols-[48px_120px_1fr]"
              >
                <span className="font-semibold text-cyan-300">{number}</span>
                <span className="font-semibold">{title}</span>
                <span className="text-[15px] leading-6 text-slate-400">
                  {body}
                </span>
              </div>
            ))}
          </div>
        </article>

        <article className="dashboard-card rounded-2xl p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">
            Demonstrated Capabilities
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {capabilities.map((item) => (
              <div
                key={item}
                className="rounded-xl border border-white/10 bg-white/[0.035] px-4 py-4 text-[15px] font-medium text-slate-300"
              >
                {item}
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="mt-6 dashboard-card rounded-2xl p-6 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">
          Key Decisions Enabled
        </p>
        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {[
            [
              "Channel allocation",
              "Identify which acquisition sources deserve more or less budget.",
            ],
            [
              "Closer coaching",
              "Compare conversion efficiency, revenue and average contract value.",
            ],
            [
              "Funnel optimization",
              "Find where leads are lost between booking, show, offer and close.",
            ],
            [
              "Revenue recovery",
              "Quantify no-show cost, lost offers and uncollected contracted value.",
            ],
          ].map(([title, body]) => (
            <article key={title}>
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-[15px] leading-7 text-slate-400">
                {body}
              </p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
