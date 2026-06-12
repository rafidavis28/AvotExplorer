"use client";

import { useState } from "react";
import type { TaraginInsight } from "@/lib/taragin";
import { taraginAuthor, taraginWork } from "@/lib/taragin";

function InsightItem({
  insight,
  defaultOpen,
  onNavigate,
}: {
  insight: TaraginInsight;
  defaultOpen: boolean;
  /** When set, the insight shows its Mishnah refs as jump links (theme view). */
  onNavigate?: (ref: string) => void;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = `taragin-${insight.title.replace(/\W+/g, "-").toLowerCase()}`;

  return (
    <div className="py-1">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 py-2 text-left transition-colors hover:text-ink"
      >
        <span className="font-display text-lg font-semibold tracking-wide text-ink">
          {insight.title}
        </span>
        <span
          aria-hidden
          className={`text-gold-dim transition-transform duration-300 ${open ? "rotate-90" : ""}`}
        >
          ❧
        </span>
      </button>

      {open && (
        <div id={panelId} className="animate-rise-in space-y-3 pb-3 pl-1">
          <blockquote className="border-l-2 border-gold/60 pl-3">
            <p className="leading-relaxed text-ink">&ldquo;{insight.quote}&rdquo;</p>
            <footer className="mt-1.5 text-sm text-ink-soft">
              — {taraginAuthor}, <cite className="italic">{taraginWork}</cite>
            </footer>
          </blockquote>

          {onNavigate && (
            <p className="text-sm text-ink-soft">
              On{" "}
              {insight.refs.map((ref, i) => (
                <span key={ref}>
                  {i > 0 && <span aria-hidden> · </span>}
                  <button
                    type="button"
                    onClick={() => onNavigate(ref)}
                    className="font-display font-semibold text-ink underline decoration-gold/50 decoration-dotted underline-offset-4 transition-colors hover:text-gold-dim"
                  >
                    {ref.replace("Avot ", "")}
                  </button>
                </span>
              ))}
            </p>
          )}

          {insight.sources.length > 0 && (
            <div>
              <p className="mb-1 font-display text-xs uppercase tracking-[0.22em] text-gold-dim">
                Sources he cites
              </p>
              <ul className="space-y-1 text-sm leading-relaxed text-ink-soft">
                {insight.sources.map((s) => (
                  <li key={s.name}>
                    <span className="font-semibold text-ink">{s.name}</span> — {s.point}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** The "Biglal Avos" section of a card: Rav Taragin's articles on this
 *  Mishnah or theme, each an attributed quote plus the sources it cites. */
export function TaraginInsights({
  insights,
  onNavigate,
}: {
  insights: TaraginInsight[];
  onNavigate?: (ref: string) => void;
}) {
  if (insights.length === 0) return null;
  return (
    <section className="mt-7" aria-label={`From ${taraginWork} by ${taraginAuthor}`}>
      <p className="mb-2 font-display text-xs uppercase tracking-[0.22em] text-gold-dim">
        {taraginWork} · {taraginAuthor}
      </p>
      <div className="divide-y divide-vellum-edge border-y border-vellum-edge">
        {insights.map((ins, i) => (
          <InsightItem
            key={ins.title}
            insight={ins}
            defaultOpen={i === 0 && insights.length === 1}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    </section>
  );
}
