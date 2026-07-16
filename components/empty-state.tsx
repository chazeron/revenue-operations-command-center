type Props = {
  title?: string;
  message?: string;
};

export function EmptyState({
  title = "No data for this selection",
  message = "Try changing or resetting the active filters.",
}: Props) {
  return (
    <div className="dashboard-card rounded-2xl px-6 py-14 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-400/[0.07] text-xl text-cyan-300">
        ∅
      </div>
      <h3 className="mt-5 text-xl font-semibold">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-[15px] leading-6 text-slate-400">
        {message}
      </p>
    </div>
  );
}
