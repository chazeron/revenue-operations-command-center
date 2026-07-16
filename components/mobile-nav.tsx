"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const items = [
  ["/overview", "Overview"],
  ["/funnel", "Sales Funnel"],
  ["/channels", "Channels"],
  ["/team", "Sales Team"],
  ["/risk", "Revenue Risk"],
  ["/methodology", "Methodology"],
  ["/case-study", "Case Study"],
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="sticky top-0 z-50 border-b border-white/10 bg-[#071321]/95 px-5 py-4 backdrop-blur-xl lg:hidden">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">
            RevOps Portfolio
          </p>
          <p className="mt-1 text-sm font-semibold">Command Center</p>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold"
          aria-expanded={open}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {open && (
        <nav className="mt-4 grid gap-2 border-t border-white/10 pt-4">
          {items.map(([href, label]) => {
            const active = pathname === href;

            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`rounded-xl border px-4 py-3 text-[15px] transition ${
                  active
                    ? "border-cyan-400/20 bg-cyan-400/[0.09] text-white"
                    : "border-transparent text-slate-300 hover:bg-white/[0.05] hover:text-white"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}
