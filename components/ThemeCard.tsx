"use client";

import type { Mishnah } from "@/lib/types";
import type { ThemeRef } from "@/lib/graph";
import type { TaraginInsight } from "@/lib/taragin";
import { TaraginInsights } from "./TaraginInsights";

export interface ThemeCardProps {
  label: string;
  blurb: string;
  mishnayot: Mishnah[];
  /** Themes directly related to this one (theme-theme edges). */
  relatedThemes?: ThemeRef[];
  /** Rav Taragin's "Biglal Avos" articles that speak to this theme. */
  taragin?: TaraginInsight[];
  onSelectTheme?: (themeId: string) => void;
  onSelectMishnah: (ref: string) => void;
}

export function ThemeCard({
  label,
  blurb,
  mishnayot,
  relatedThemes = [],
  taragin = [],
  onSelectTheme,
  onSelectMishnah,
}: ThemeCardProps) {
  return (
    <article className="flex h-full flex-col">
      <header className="mb-4">
        <p className="font-display text-xs uppercase tracking-[0.22em] text-gold-dim">Theme</p>
        <h2 className="font-display text-3xl font-bold leading-tight text-ink">{label}</h2>
        <p className="mt-2 leading-relaxed text-ink-soft">{blurb}</p>

        {relatedThemes.length > 0 && (
          <div className="mt-3">
            <p className="mb-1.5 font-display text-xs uppercase tracking-[0.22em] text-gold-dim">
              Related themes
            </p>
            <ul className="flex flex-wrap gap-2">
              {relatedThemes.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => onSelectTheme?.(t.id)}
                    className="rounded-full border border-gold/60 bg-gold/10 px-3 py-1 font-display text-sm text-ink transition-colors hover:bg-gold/25"
                  >
                    {t.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="rule-gold mt-4" />
      </header>

      <p className="mb-2 font-display text-xs uppercase tracking-[0.22em] text-gold-dim">
        {mishnayot.length} teaching{mishnayot.length === 1 ? "" : "s"}
      </p>

      <div className="scroll-vellum -mr-2 flex-1 overflow-y-auto pr-2">
        <ul className="space-y-2">
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

        {/* Rav Taragin's Biglal Avos articles on this theme */}
        <TaraginInsights insights={taragin} onNavigate={onSelectMishnah} />
      </div>
    </article>
  );
}
