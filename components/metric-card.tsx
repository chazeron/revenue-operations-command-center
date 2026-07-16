type Props = {
  label: string;
  value: string;
  helper?: string;
  accent?: "cyan" | "blue" | "gold" | "green" | "red";
};

const accents = {
  cyan: "from-cyan-400/20 to-transparent text-cyan-300",
  blue: "from-blue-400/20 to-transparent text-blue-300",
  gold: "from-amber-400/20 to-transparent text-amber-300",
  green: "from-emerald-400/20 to-transparent text-emerald-300",
  red: "from-rose-400/20 to-transparent text-rose-300",
};

export function MetricCard({
  label,
  value,
  helper,
  accent = "cyan",
}: Props) {
  return (
    <article className="dashboard-card relative overflow-hidden rounded-2xl p-5">
      <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${accents[accent]}`} />
      <p className="text-[15px] font-medium text-slate-400">{label}</p>
      <p className="metric-number mt-3 text-3xl font-semibold sm:text-4xl">{value}</p>
      {helper && <p className="mt-2 text-sm text-slate-500">{helper}</p>}
    </article>
  );
}
