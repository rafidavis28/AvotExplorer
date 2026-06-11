"use client";

import type { Lang, Mishnah } from "@/lib/types";
import type { Sage } from "@/lib/sages";
import type { RelatedMishnah } from "@/lib/graph";
import { LangToggle } from "./LangToggle";
import { CommentaryAccordion } from "./CommentaryAccordion";

export interface MishnahCardProps {
  mishnah: Mishnah;
  lang: Lang;
  onLangChange: (lang: Lang) => void;
  /** The sages who speak in this Mishnah (primary voice first). */
  sages?: Sage[];
  onSageClick?: (slug: string) => void;
  /** Themes this Mishnah connects to (id + label), rendered as chips. */
  themes?: { id: string; label: string }[];
  onThemeClick?: (themeId: string) => void;
  /** Teachings that share themes with this one, with the shared themes named. */
  related?: (RelatedMishnah & { mishnah?: Mishnah })[];
  /** Sequential navigation. */
  prevRef?: string | null;
  nextRef?: string | null;
  onNavigate?: (ref: string) => void;
}

export function MishnahCard({
  mishnah,
  lang,
  onLangChange,
  sages = [],
  onSageClick,
  themes = [],
  onThemeClick,
  related = [],
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
            {sages.length > 0 && (
              <p className="mt-2 text-sm text-ink-soft">
                {sages.map((s, i) => (
                  <span key={s.slug}>
                    {i > 0 && <span aria-hidden> · </span>}
                    <button
                      type="button"
                      onClick={() => onSageClick?.(s.slug)}
                      title={`${s.era} — ${s.bio}`}
                      className="font-display text-base font-semibold text-ink underline decoration-gold/50 decoration-dotted underline-offset-4 transition-colors hover:text-gold-dim"
                    >
                      {s.name}
                    </button>
                  </span>
                ))}
              </p>
            )}
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

        {/* Connected teachings — the threads of the web */}
        {related.length > 0 && (
          <section className="mt-7" aria-label="Connected teachings">
            <p className="mb-2 font-display text-xs uppercase tracking-[0.22em] text-gold-dim">
              Connected teachings
            </p>
            <ul className="space-y-1.5">
              {related.map((r) => (
                <li key={r.ref}>
                  <button
                    type="button"
                    onClick={() => onNavigate?.(r.ref)}
                    className="group w-full rounded-lg border border-transparent px-3 py-2 text-left transition-colors hover:border-vellum-edge hover:bg-[#ece0c3]/50"
                  >
                    <span className="flex items-baseline justify-between gap-3">
                      <span className="font-display text-base font-semibold text-ink">
                        {r.ref.replace("Avot ", "")}
                      </span>
                      <span className="truncate font-display text-xs text-gold-dim">
                        via {r.sharedThemes.join(" · ")}
                      </span>
                    </span>
                    {r.mishnah && (
                      <span className="mt-0.5 line-clamp-2 block text-sm leading-snug text-ink-soft">
                        {r.mishnah.english}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </section>
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
        <span className="hidden font-display text-xs uppercase tracking-[0.18em] text-ink-soft/60 sm:block">
          ← → keys
        </span>
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
