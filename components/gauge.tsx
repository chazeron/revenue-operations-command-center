type Props = {
  value: number;
  label: string;
  caption: string;
};

function statusFor(value: number) {
  if (value < 0.2) return { text: "Danger", color: "#ff6b6b" };
  if (value < 0.3) return { text: "Attention", color: "#f5c451" };
  return { text: "Healthy", color: "#2fcf85" };
}

export function Gauge({ value, label, caption }: Props) {
  const clamped = Math.min(Math.max(value, 0), 0.5);
  const angle = -90 + (clamped / 0.5) * 180;
  const status = statusFor(value);

  return (
    <article className="dashboard-card rounded-2xl p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[15px] font-medium text-slate-400">{label}</p>
          <p className="mt-2 text-2xl font-semibold">{(value * 100).toFixed(1)}%</p>
        </div>
        <span
          className="rounded-full px-3 py-1.5 text-sm font-semibold"
          style={{
            color: status.color,
            backgroundColor: `${status.color}18`,
          }}
        >
          {status.text}
        </span>
      </div>

      <div className="relative mx-auto mt-6 h-40 w-72 max-w-full overflow-hidden">
        <svg viewBox="0 0 240 135" className="h-full w-full">
          <path d="M25 115 A95 95 0 0 1 215 115" fill="none" stroke="#ff6b6b" strokeWidth="18" strokeLinecap="round" pathLength="100" strokeDasharray="34 66" />
          <path d="M25 115 A95 95 0 0 1 215 115" fill="none" stroke="#f5c451" strokeWidth="18" strokeLinecap="butt" pathLength="100" strokeDasharray="24 76" strokeDashoffset="-34" />
          <path d="M25 115 A95 95 0 0 1 215 115" fill="none" stroke="#2fcf85" strokeWidth="18" strokeLinecap="round" pathLength="100" strokeDasharray="42 58" strokeDashoffset="-58" />

          <g transform={`rotate(${angle} 120 115)`}>
            <line x1="120" y1="115" x2="120" y2="42" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
            <circle cx="120" cy="115" r="8" fill="#ffffff" />
          </g>
        </svg>
      </div>

      <div className="-mt-2 flex justify-between text-sm text-slate-500">
        <span>0%</span>
        <span>25%</span>
        <span>50%+</span>
      </div>

      <p className="mt-5 text-[15px] leading-6 text-slate-400">{caption}</p>
    </article>
  );
}
