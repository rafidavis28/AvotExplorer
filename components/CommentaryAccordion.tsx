"use client";

import { useState } from "react";
import type { CommentaryText, Lang } from "@/lib/types";

function CommentaryItem({ c, lang }: { c: CommentaryText; lang: Lang }) {
  const [open, setOpen] = useState(false);
  const showHe = lang !== "en" && c.hebrew.length > 0;
  const showEn = lang !== "he" && c.english.length > 0;
  const panelId = `commentary-${c.slug}`;

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
          {c.name}
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
          {showHe &&
            c.hebrew.map((seg, i) => (
              <p
                key={`he-${i}`}
                dir="rtl"
                lang="he"
                className="font-hebrew text-[1.05rem] leading-[1.9] text-ink"
              >
                {seg}
              </p>
            ))}
          {showEn &&
            c.english.map((seg, i) => (
              <p key={`en-${i}`} className="leading-relaxed text-ink-soft">
                {seg}
              </p>
            ))}
          {!showHe && !showEn && (
            <p className="italic text-ink-soft/80">
              Not available in the selected language.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export function CommentaryAccordion({
  commentaries,
  lang,
}: {
  commentaries: CommentaryText[];
  lang: Lang;
}) {
  if (commentaries.length === 0) {
    return (
      <p className="italic text-ink-soft/80">
        No classical commentary recorded for this teaching.
      </p>
    );
  }
  return (
    <div className="divide-y divide-vellum-edge border-y border-vellum-edge">
      {commentaries.map((c) => (
        <CommentaryItem key={c.slug} c={c} lang={lang} />
      ))}
    </div>
  );
}
