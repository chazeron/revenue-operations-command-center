import Link from "next/link";

const items = [
  { href: "/overview", label: "Overview", badge: "01" },
  { href: "/funnel", label: "Sales Funnel", badge: "02" },
  { href: "/channels", label: "Channels", badge: "03" },
  { href: "/team", label: "Sales Team", badge: "04" },
  { href: "/risk", label: "Revenue Risk", badge: "05" },
  { href: "/methodology", label: "Methodology", badge: "06" },
];

export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-white/10 bg-[#071321]/95 px-6 py-7 backdrop-blur-xl lg:block">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.26em] text-cyan-300">
          RevOps Portfolio
        </p>
        <h1 className="mt-4 text-xl font-semibold leading-7">
          Revenue Operations
          <span className="block text-slate-400">Command Center</span>
        </h1>
      </div>

      <nav className="mt-10 space-y-2">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group flex items-center justify-between rounded-xl border border-transparent px-4 py-3 text-[15px] text-slate-300 transition hover:border-white/10 hover:bg-white/[0.045] hover:text-white"
          >
            <span>{item.label}</span>
            <span className="text-xs text-slate-600 transition group-hover:text-cyan-300">
              {item.badge}
            </span>
          </Link>
        ))}
      </nav>

      <div className="absolute bottom-7 left-6 right-6">
        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
          <p className="text-sm font-semibold text-cyan-300">Built by Yasser Ramirez</p>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            CRM · Automation · Data Analytics · Revenue Operations
          </p>
        </div>
      </div>
    </aside>
  );
}
