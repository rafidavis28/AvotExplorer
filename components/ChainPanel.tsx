"use client";

import { chain, getSage, mishnayotForSage } from "@/lib/sages";

export interface ChainPanelProps {
  /** Receives "sage:<slug>" ids. */
  onSelect: (id: string) => void;
  onClose: () => void;
}

/** The chain of transmission (shalshelet ha-mesorah) of Avot 1–2, in order. */
export function ChainPanel({ onSelect, onClose }: ChainPanelProps) {
  return (
    <nav
      className="vellum animate-panel-in scroll-vellum absolute inset-x-2 bottom-2 top-[20dvh] z-20 flex flex-col overflow-y-auto rounded-2xl border border-vellum-edge p-5 shadow-2xl shadow-black/60 sm:inset-x-auto sm:bottom-4 sm:left-4 sm:top-4 sm:w-80"
      aria-label="Chain of transmission"
    >
      <div className="mb-1 flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold text-ink">The Chain</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close chain of transmission"
          className="rounded-full px-2 font-display text-2xl leading-none text-ink-soft transition-colors hover:text-ink"
        >
          ×
        </button>
      </div>
      <p className="mb-3 text-sm leading-snug text-ink-soft">
        How the Torah was handed down, generation to generation — the spine of
        Avot&rsquo;s first two chapters.
      </p>
      <div className="rule-gold mb-4" />

      <ol className="space-y-5">
        {chain.map((group) => (
          <li key={group.title}>
            <h3 className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-gold-dim">
              {group.title}
            </h3>
            {group.note && (
              <p className="mt-0.5 text-xs italic leading-snug text-ink-soft/80">{group.note}</p>
            )}
            <ul className="mt-2 space-y-0.5 border-l border-vellum-edge pl-3">
              {group.items.map((item) => {
                const sage = item.slug ? getSage(item.slug) : undefined;
                if (!sage) {
                  return (
                    <li
                      key={item.name}
                      className="flex items-baseline justify-between px-2 py-1 text-ink-soft"
                    >
                      <span className="font-display text-base">{item.name}</span>
                      <span dir="rtl" lang="he" className="font-hebrew text-sm">
                        {item.hebrew}
                      </span>
                    </li>
                  );
                }
                const count = mishnayotForSage(sage.slug).length;
                return (
                  <li key={sage.slug}>
                    <button
                      type="button"
                      onClick={() => onSelect(`sage:${sage.slug}`)}
                      className="flex w-full items-baseline justify-between gap-2 rounded px-2 py-1 text-left transition-colors hover:bg-[#ece0c3]/60"
                    >
                      <span className="font-display text-base font-semibold text-ink">
                        {sage.name}
                        <span className="ml-1.5 font-normal text-gold-dim">{count}</span>
                      </span>
                      <span dir="rtl" lang="he" className="shrink-0 font-hebrew text-sm text-ink-soft">
                        {sage.hebrew}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ol>
    </nav>
  );
}
