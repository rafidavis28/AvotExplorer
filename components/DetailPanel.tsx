"use client";

import { useMemo } from "react";
import type { Lang } from "@/lib/types";
import { graph, getMishnah, neighborRefs } from "@/lib/data";
import { mishnayotForTheme, nodesById, themesForMishnah } from "@/lib/graph";
import { MishnahCard } from "./MishnahCard";
import { ThemeCard } from "./ThemeCard";

export interface DetailPanelProps {
  selectedId: string | null;
  lang: Lang;
  onLangChange: (lang: Lang) => void;
  onSelectNode: (id: string) => void;
  onClose: () => void;
}

export function DetailPanel({
  selectedId,
  lang,
  onLangChange,
  onSelectNode,
  onClose,
}: DetailPanelProps) {
  const byId = useMemo(() => nodesById(graph), []);
  if (!selectedId) return null;
  const node = byId.get(selectedId);
  if (!node) return null;

  return (
    <aside
      key={selectedId}
      className="vellum animate-panel-in scroll-vellum pointer-events-auto absolute right-4 top-4 bottom-4 z-20 flex w-[min(33rem,calc(100%-2rem))] flex-col rounded-2xl border border-vellum-edge p-6 shadow-2xl shadow-black/60"
      aria-label="Detail panel"
    >
      <div className="mb-1 flex justify-end">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close panel"
          className="rounded-full px-2 font-display text-2xl leading-none text-ink-soft transition-colors hover:text-ink"
        >
          ×
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        {node.type === "mishnah" ? (
          (() => {
            const mishnah = getMishnah(node.ref);
            if (!mishnah) return <p className="italic text-ink-soft">Teaching not found.</p>;
            const { prev, next } = neighborRefs(node.ref);
            return (
              <MishnahCard
                mishnah={mishnah}
                lang={lang}
                onLangChange={onLangChange}
                themes={themesForMishnah(graph, byId, node.ref)}
                onThemeClick={onSelectNode}
                prevRef={prev}
                nextRef={next}
                onNavigate={onSelectNode}
              />
            );
          })()
        ) : (
          <ThemeCard
            label={node.label}
            blurb={node.blurb}
            mishnayot={mishnayotForTheme(graph, node.id)
              .map((ref) => getMishnah(ref))
              .filter((m): m is NonNullable<typeof m> => Boolean(m))}
            onSelectMishnah={onSelectNode}
          />
        )}
      </div>
    </aside>
  );
}
