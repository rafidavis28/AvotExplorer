"use client";

import type { Mishnah } from "@/lib/types";
import type { Sage } from "@/lib/sages";

export interface SageCardProps {
  sage: Sage;
  /** The mishnayot in which this sage speaks, in canonical order. */
  mishnayot: Mishnah[];
  onSelectMishnah: (ref: string) => void;
}

export function SageCard({ sage, mishnayot, onSelectMishnah }: SageCardProps) {
  return (
    <article className="flex h-full flex-col">
      <header className="mb-4">
        <p className="font-display text-xs uppercase tracking-[0.22em] text-gold-dim">Sage</p>
        <h2 className="font-display text-3xl font-bold leading-tight text-ink">{sage.name}</h2>
        <p dir="rtl" lang="he" className="mt-1 font-hebrew text-xl text-ink-soft">
          {sage.hebrew}
        </p>
        <p className="mt-2 font-display text-sm uppercase tracking-[0.18em] text-gold-dim">
          {sage.era}
        </p>
        <p className="mt-2 leading-relaxed text-ink-soft">{sage.bio}</p>
        <div className="rule-gold mt-4" />
      </header>

      <p className="mb-2 font-display text-xs uppercase tracking-[0.22em] text-gold-dim">
        Speaks in {mishnayot.length} teaching{mishnayot.length === 1 ? "" : "s"}
      </p>

      <ul className="scroll-vellum -mr-2 flex-1 space-y-2 overflow-y-auto pr-2">
        {mishnayot.map((m) => (
          <li key={m.ref}>
            <button
              type="button"
              onClick={() => onSelectMishnah(m.ref)}
              className="group w-full rounded-lg border border-transparent px-3 py-2 text-left transition-colors hover:border-vellum-edge hover:bg-[#ece0c3]/50"
            >
              <span className="font-display text-lg font-semibold text-ink">
                {m.chapter}:{m.mishnah}
              </span>
              <span className="ml-3 text-sm text-ink-soft">{m.english.slice(0, 88)}…</span>
            </button>
          </li>
        ))}
      </ul>
    </article>
  );
}
