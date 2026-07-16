type Props = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PageHeader({ eyebrow, title, description }: Props) {
  return (
    <header className="mb-8">
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300">
        {eyebrow}
      </p>
      <h2 className="mt-3 max-w-5xl text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
        {title}
      </h2>
      <p className="mt-4 max-w-3xl text-[16px] leading-7 text-slate-400">
        {description}
      </p>
    </header>
  );
}
