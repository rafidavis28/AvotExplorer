"use client";

import { useMemo } from "react";
import type { Lang } from "@/lib/types";
import { graph, getMishnah, neighborRefs } from "@/lib/data";
import {
  mishnayotForTheme,
  nodesById,
  relatedMishnayot,
  relatedThemes,
  themesForMishnah,
} from "@/lib/graph";
import { getSage, mishnayotForSage, sagesForMishnah } from "@/lib/sages";
import { insightsForMishnah, insightsForTheme } from "@/lib/taragin";
import { MishnahCard } from "./MishnahCard";
import { ThemeCard } from "./ThemeCard";
import { SageCard } from "./SageCard";

const SAGE_PREFIX = "sage:";

export interface DetailPanelProps {
  /** A graph node id ("Avot 1:1", theme slug) or a sage id ("sage:hillel"). */
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

  let body: React.ReactNode = null;

  if (selectedId.startsWith(SAGE_PREFIX)) {
    const sage = getSage(selectedId.slice(SAGE_PREFIX.length));
    if (!sage) return null;
    body = (
      <SageCard
        sage={sage}
        mishnayot={mishnayotForSage(sage.slug)
          .map((ref) => getMishnah(ref))
          .filter((m): m is NonNullable<typeof m> => Boolean(m))}
        onSelectMishnah={onSelectNode}
      />
    );
  } else {
    const node = byId.get(selectedId);
    if (!node) return null;

    if (node.type === "mishnah") {
      const mishnah = getMishnah(node.ref);
      if (!mishnah) {
        body = <p className="italic text-ink-soft">Teaching not found.</p>;
      } else {
        const { prev, next } = neighborRefs(node.ref);
        body = (
          <MishnahCard
            mishnah={mishnah}
            lang={lang}
            onLangChange={onLangChange}
            sages={sagesForMishnah(node.ref)}
            onSageClick={(slug) => onSelectNode(`${SAGE_PREFIX}${slug}`)}
            themes={themesForMishnah(graph, byId, node.ref)}
            onThemeClick={onSelectNode}
            related={relatedMishnayot(graph, byId, node.ref).map((r) => ({
              ...r,
              mishnah: getMishnah(r.ref),
            }))}
            taragin={insightsForMishnah(node.ref)}
            prevRef={prev}
            nextRef={next}
            onNavigate={onSelectNode}
          />
        );
      }
    } else {
      body = (
        <ThemeCard
          label={node.label}
          blurb={node.blurb}
          mishnayot={mishnayotForTheme(graph, node.id)
            .map((ref) => getMishnah(ref))
            .filter((m): m is NonNullable<typeof m> => Boolean(m))}
          relatedThemes={relatedThemes(graph, byId, node.id)}
          taragin={insightsForTheme(node.id)}
          onSelectTheme={onSelectNode}
          onSelectMishnah={onSelectNode}
        />
      );
    }
  }

  return (
    <aside
      key={selectedId}
      className="vellum animate-panel-in scroll-vellum pointer-events-auto absolute inset-x-2 bottom-2 top-[34dvh] z-20 flex flex-col rounded-2xl border border-vellum-edge p-4 shadow-2xl shadow-black/60 sm:inset-x-auto sm:bottom-4 sm:right-4 sm:top-4 sm:w-[min(33rem,calc(100%-2rem))] sm:p-6"
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

      <div className="flex min-h-0 flex-1 flex-col">{body}</div>
    </aside>
  );
}
