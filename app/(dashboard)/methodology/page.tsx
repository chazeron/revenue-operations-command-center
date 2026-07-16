import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { data } from "@/lib/dashboard";

export const metadata: Metadata = {
  title: "Methodology",
};

const formulas = [
  ["Booking Rate", "Bookings / Leads"],
  ["Show Rate", "Shows / Bookings"],
  ["Offer Rate", "Offers / Shows"],
  ["Close Rate", "Closed Sales / Offers"],
  ["Lead-to-Close Rate", "Closed Sales / Leads"],
  ["Cash Collection Rate", "Cash Collected / Contracted Revenue"],
  ["CAC", "Marketing Spend / Closed Sales"],
  ["ROAS", "Contracted Revenue / Marketing Spend"],
];

export default function MethodologyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Methodology"
        title="How the project was designed, calculated and validated"
        description="The public application uses a reproducible synthetic dataset. No real customer, employee or company information is included."
      />

      <section className="grid gap-6 xl:grid-cols-2">
        <article className="dashboard-card rounded-2xl p-6">
          <h3 className="text-2xl font-semibold">System architecture</h3>
          <p className="mt-3 text-[15px] leading-7 text-slate-400">
            The project demonstrates how fragmented commercial data can be converted into a structured decision system.
          </p>

          <div className="mt-7 grid gap-3 text-center text-[15px] font-semibold">
            {[
              "CRM & Lead Sources",
              "Python Synthetic Data Generator",
              "Validation & KPI Aggregation",
              "JSON Data Layer",
              "Next.js Analytics Application",
              "Vercel Deployment",
            ].map((item, index, array) => (
              <div key={item}>
                <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-4">
                  {item}
                </div>
                {index < array.length - 1 && (
                  <div className="py-2 text-cyan-300">↓</div>
                )}
              </div>
            ))}
          </div>
        </article>

        <article className="dashboard-card rounded-2xl p-6">
          <h3 className="text-2xl font-semibold">KPI definitions</h3>
          <div className="mt-6 overflow-hidden rounded-xl border border-white/10">
            {formulas.map(([name, formula]) => (
              <div
                key={name}
                className="grid gap-2 border-b border-white/10 px-4 py-4 last:border-b-0 sm:grid-cols-[0.9fr_1.1fr]"
              >
                <p className="font-semibold">{name}</p>
                <p className="text-[15px] text-slate-400">{formula}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-2">
        <article className="dashboard-card rounded-2xl p-6">
          <h3 className="text-2xl font-semibold">Technical stack</h3>
          <div className="mt-6 flex flex-wrap gap-3">
            {[
              "Next.js",
              "TypeScript",
              "Tailwind CSS",
              "Python",
              "pandas",
              "NumPy",
              "Faker",
              "GitHub",
              "Vercel",
              "CRM Data Modeling",
              "Revenue Operations",
            ].map((item) => (
              <span
                key={item}
                className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[15px] text-slate-300"
              >
                {item}
              </span>
            ))}
          </div>
        </article>

        <article className="dashboard-card rounded-2xl p-6">
          <h3 className="text-2xl font-semibold">Data policy</h3>
          <p className="mt-5 text-[15px] leading-7 text-slate-400">
            {data.meta.disclaimer}
          </p>
          <p className="mt-4 text-[15px] leading-7 text-slate-400">
            The dataset models leads, bookings, opportunities, activities, sales, payments, expenses and representatives across a six-month period.
          </p>
          <p className="mt-4 text-[15px] leading-7 text-slate-400">
            Relationship validation, primary-key checks and KPI realism checks are executed before dashboard data is generated.
          </p>
        </article>
      </section>
    </>
  );
}
