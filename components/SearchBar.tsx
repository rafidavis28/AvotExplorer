"use client";

import { useEffect, useRef, useState } from "react";
import { graph, mishnayot } from "@/lib/data";
import { searchNodes } from "@/lib/search";

const TYPE_COLOR: Record<string, string> = {
  theme: "text-gold-bright",
  sage: "text-[#c9b8e8]",
  mishnah: "text-star",
};

export function SearchBar({ onSelect }: { onSelect: (id: string) => void }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);
  const hits = open ? searchNodes(q, mishnayot, graph) : [];

  // Reset the active row when the query changes (state adjustment in render).
  const [prevQ, setPrevQ] = useState(q);
  if (prevQ !== q) {
    setPrevQ(q);
    setActive(0);
  }

  // Keep the active row visible as the user arrows through results.
  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const choose = (id: string) => {
    onSelect(id);
    setQ("");
    setOpen(false);
  };

  return (
    <div className="relative min-w-0 flex-1 sm:w-72 sm:flex-none">
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
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((a) => Math.min(a + 1, hits.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((a) => Math.max(a - 1, 0));
          } else if (e.key === "Enter" && hits[active]) {
            choose(hits[active].id);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
        placeholder="Search…"
        aria-label="Search teachings, themes, and sages"
        role="combobox"
        aria-expanded={open && hits.length > 0}
        aria-controls="search-results"
        aria-activedescendant={hits[active] ? `search-hit-${active}` : undefined}
        className="w-full rounded-full border border-white/10 bg-night-deep/70 px-4 py-2 text-sm text-foreground placeholder:text-foreground/40 backdrop-blur focus:border-gold/60 focus:outline-none"
      />
      {open && hits.length > 0 && (
        <ul
          id="search-results"
          role="listbox"
          ref={listRef}
          className="scroll-vellum absolute right-0 z-30 mt-2 max-h-80 w-[min(20rem,calc(100vw-2rem))] overflow-y-auto rounded-xl border border-white/10 bg-night-deep/95 p-1 shadow-2xl shadow-black/60 backdrop-blur"
        >
          {hits.map((h, i) => (
            <li key={h.id} id={`search-hit-${i}`} role="option" aria-selected={i === active}>
              <button
                type="button"
                data-index={i}
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setActive(i)}
                onClick={() => choose(h.id)}
                className={`flex w-full items-baseline gap-2 rounded-lg px-3 py-2 text-left transition-colors ${
                  i === active ? "bg-white/10" : "hover:bg-white/5"
                }`}
              >
                <span className={`font-display text-sm ${TYPE_COLOR[h.type]}`}>{h.label}</span>
                <span className="truncate text-xs text-foreground/45">{h.sublabel}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
