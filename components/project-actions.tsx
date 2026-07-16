"use client";

import { useState } from "react";

const PROJECT_URL =
  "https://revenue-operations-command-center.vercel.app/overview";
const GITHUB_URL =
  "https://github.com/chazeron/revenue-operations-command-center";

export function ProjectActions() {
  const [copied, setCopied] = useState(false);

  async function copyProjectLink() {
    await navigator.clipboard.writeText(PROJECT_URL);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="flex flex-wrap gap-3">
      <a
        href={GITHUB_URL}
        target="_blank"
        rel="noreferrer"
        className="rounded-xl bg-cyan-300 px-5 py-3 text-[15px] font-semibold text-slate-950 transition hover:bg-cyan-200"
      >
        View GitHub Repository
      </a>

      <button
        type="button"
        onClick={copyProjectLink}
        className="rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-[15px] font-semibold text-slate-200 transition hover:bg-white/[0.08]"
      >
        {copied ? "Link copied" : "Copy Project Link"}
      </button>
    </div>
  );
}
