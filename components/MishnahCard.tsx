"use client";

import type { Lang, Mishnah } from "@/lib/types";
import { LangToggle } from "./LangToggle";
import { CommentaryAccordion } from "./CommentaryAccordion";

export interface MishnahCardProps {
  mishnah: Mishnah;
  lang: Lang;
  onLangChange: (lang: Lang) => void;
  /** Themes this Mishnah connects to (id + label), rendered as chips. */
  themes?: { id: string; label: string }[];
  onThemeClick?: (themeId: string) => void;
  /** Sequential navigation. */
  prevRef?: string | null;
  nextRef?: string | null;
  onNavigate?: (ref: string) => void;
}

export function MishnahCard({
  mishnah,
  lang,
  onLangChange,
  themes = [],
  onThemeClick,
  prevRef,
  nextRef,
  onNavigate,
}: MishnahCardProps) {
  const showHe = lang !== "en";
  const showEn = lang !== "he";

  return (
    <article className="flex h-full flex-col">
      {/* Header */}
      <header className="mb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-hebrew text-sm tracking-wide text-gold-dim">
              פִּרְקֵי אָבוֹת
            </p>
            <h2 className="font-display text-4xl font-bold leading-none text-ink">
              {mishnah.chapter}
              <span className="mx-1 text-gold">:</span>
              {mishnah.mishnah}
            </h2>
            <p className="mt-1 font-display text-sm uppercase tracking-[0.2em] text-ink-soft">
              Chapter {mishnah.chapter} · Mishnah {mishnah.mishnah}
            </p>
          </div>
          <LangToggle value={lang} onChange={onLangChange} />
        </div>
        <div className="rule-gold mt-4" />
      </header>

      {/* Scrolling body */}
      <div className="scroll-vellum -mr-2 flex-1 overflow-y-auto pr-2">
        {/* The Mishnah text */}
        <div className="space-y-4">
          {showHe && (
            <p
              dir="rtl"
              lang="he"
              className="font-hebrew text-2xl leading-[2] text-ink"
            >
              {mishnah.hebrew}
            </p>
          )}
          {showEn && (
            <p className="text-lg leading-relaxed text-ink-soft">
              {mishnah.english}
            </p>
          )}
        </div>

        {/* Theme chips */}
        {themes.length > 0 && (
          <div className="mt-6">
            <p className="mb-2 font-display text-xs uppercase tracking-[0.22em] text-gold-dim">
              Themes
            </p>
            <ul className="flex flex-wrap gap-2">
              {themes.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => onThemeClick?.(t.id)}
                    className="rounded-full border border-gold/60 bg-gold/10 px-3 py-1 font-display text-sm text-ink transition-colors hover:bg-gold/25"
                  >
                    {t.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Commentaries */}
        <section className="mt-7" aria-label="Commentaries">
          <p className="mb-2 font-display text-xs uppercase tracking-[0.22em] text-gold-dim">
            Commentary
          </p>
          <CommentaryAccordion commentaries={mishnah.commentaries} lang={lang} />
        </section>
      </div>

      {/* Sequential navigation */}
      <footer className="mt-4 flex items-center justify-between border-t border-vellum-edge pt-3">
        <NavButton
          dir="prev"
          targetRef={prevRef}
          onNavigate={onNavigate}
          label="Previous"
        />
        <NavButton
          dir="next"
          targetRef={nextRef}
          onNavigate={onNavigate}
          label="Next"
        />
      </footer>
    </article>
  );
}

function NavButton({
  dir,
  targetRef,
  onNavigate,
  label,
}: {
  dir: "prev" | "next";
  targetRef?: string | null;
  onNavigate?: (ref: string) => void;
  label: string;
}) {
  const disabled = !targetRef;
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => targetRef && onNavigate?.(targetRef)}
      className="flex items-center gap-2 font-display text-sm text-ink-soft transition-colors enabled:hover:text-ink disabled:opacity-30"
      aria-label={targetRef ? `${label}: ${targetRef}` : `${label} (none)`}
    >
      {dir === "prev" && <span aria-hidden>←</span>}
      {label}
      {dir === "next" && <span aria-hidden>→</span>}
    </button>
  );
}
