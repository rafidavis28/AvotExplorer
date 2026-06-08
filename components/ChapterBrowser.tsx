"use client";

import { useState } from "react";
import { mishnayot } from "@/lib/data";

const CHAPTERS = [1, 2, 3, 4, 5, 6];

export interface ChapterBrowserProps {
  onSelect: (ref: string) => void;
  onFocusChapter: (chapter: number) => void;
  onClose: () => void;
}

export function ChapterBrowser({ onSelect, onFocusChapter, onClose }: ChapterBrowserProps) {
  const [openChapter, setOpenChapter] = useState<number | null>(1);

  return (
    <nav
      className="vellum animate-panel-in scroll-vellum absolute left-4 top-4 bottom-4 z-20 flex w-72 flex-col overflow-y-auto rounded-2xl border border-vellum-edge p-5 shadow-2xl shadow-black/60"
      aria-label="Browse by chapter"
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold text-ink">Chapters</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close chapter browser"
          className="rounded-full px-2 font-display text-2xl leading-none text-ink-soft transition-colors hover:text-ink"
        >
          ×
        </button>
      </div>
      <div className="rule-gold mb-3" />

      <ul className="space-y-1">
        {CHAPTERS.map((c) => {
          const list = mishnayot.filter((m) => m.chapter === c);
          const isOpen = openChapter === c;
          return (
            <li key={c}>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenChapter(isOpen ? null : c)}
                  className="flex flex-1 items-center justify-between rounded-lg px-2 py-1.5 text-left font-display text-lg font-semibold text-ink transition-colors hover:bg-[#ece0c3]/60"
                >
                  Chapter {c}
                  <span className="text-sm text-ink-soft">{list.length}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onFocusChapter(c)}
                  aria-label={`Focus chapter ${c} on the graph`}
                  title="Focus on the graph"
                  className="rounded-full px-2 py-1 text-gold-dim transition-colors hover:text-gold"
                >
                  ✦
                </button>
              </div>
              {isOpen && (
                <ul className="mb-2 ml-2 border-l border-vellum-edge pl-2">
                  {list.map((m) => (
                    <li key={m.ref}>
                      <button
                        type="button"
                        onClick={() => onSelect(m.ref)}
                        className="block w-full truncate rounded px-2 py-1 text-left text-sm text-ink-soft transition-colors hover:bg-[#ece0c3]/60 hover:text-ink"
                      >
                        <span className="font-display font-semibold text-ink">
                          {m.chapter}:{m.mishnah}
                        </span>{" "}
                        {m.english.slice(0, 34)}…
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
