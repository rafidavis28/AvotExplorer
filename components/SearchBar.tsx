"use client";

import { useState } from "react";
import { graph, mishnayot } from "@/lib/data";
import { searchNodes } from "@/lib/search";

export function SearchBar({ onSelect }: { onSelect: (id: string) => void }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const hits = open ? searchNodes(q, mishnayot, graph) : [];

  const choose = (id: string) => {
    onSelect(id);
    setQ("");
    setOpen(false);
  };

  return (
    <div className="relative w-72">
      <input
        type="search"
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && hits[0]) choose(hits[0].id);
          if (e.key === "Escape") setOpen(false);
        }}
        placeholder="Search teachings & themes…"
        aria-label="Search teachings and themes"
        className="w-full rounded-full border border-white/10 bg-night-deep/70 px-4 py-2 text-sm text-foreground placeholder:text-foreground/40 backdrop-blur focus:border-gold/60 focus:outline-none"
      />
      {open && hits.length > 0 && (
        <ul
          role="listbox"
          className="scroll-vellum absolute right-0 z-30 mt-2 max-h-80 w-80 overflow-y-auto rounded-xl border border-white/10 bg-night-deep/95 p-1 shadow-2xl shadow-black/60 backdrop-blur"
        >
          {hits.map((h) => (
            <li key={h.id}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(h.id)}
                className="flex w-full items-baseline gap-2 rounded-lg px-3 py-2 text-left transition-colors hover:bg-white/5"
              >
                <span
                  className={`font-display text-sm ${h.type === "theme" ? "text-gold-bright" : "text-star"}`}
                >
                  {h.label}
                </span>
                <span className="truncate text-xs text-foreground/45">{h.sublabel}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
