type Props = {
  title: string;
  body: string;
  tone?: "positive" | "warning" | "critical" | "neutral";
};

const tones = {
  positive: "border-emerald-400/20 bg-emerald-400/[0.055]",
  warning: "border-amber-400/20 bg-amber-400/[0.055]",
  critical: "border-rose-400/20 bg-rose-400/[0.055]",
  neutral: "border-cyan-400/20 bg-cyan-400/[0.055]",
};

export function InsightCard({ title, body, tone = "neutral" }: Props) {
  return (
    <article className={`rounded-2xl border p-5 ${tones[tone]}`}>
      <p className="text-base font-semibold">{title}</p>
      <p className="mt-2 text-[15px] leading-6 text-slate-400">{body}</p>
    </article>
  );
}
