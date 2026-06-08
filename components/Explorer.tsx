"use client";

import { useEffect, useMemo, useState } from "react";
import { graph } from "@/lib/data";
import {
  buildAdjacency,
  chapterFocusSet,
  neighborhood,
  nodesById,
  themeFocusSet,
} from "@/lib/graph";
import type { Lang } from "@/lib/types";
import { GraphView } from "./GraphView";
import { DetailPanel } from "./DetailPanel";
import { SearchBar } from "./SearchBar";
import { ChapterBrowser } from "./ChapterBrowser";

export function Explorer() {
  const adj = useMemo(() => buildAdjacency(graph), []);
  const byId = useMemo(() => nodesById(graph), []);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [centerOnId, setCenterOnId] = useState<string | null>(null);
  const [lang, setLang] = useState<Lang>("both");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [focusThemeId, setFocusThemeId] = useState<string | null>(null);
  const [chapterFilter, setChapterFilter] = useState<number | null>(null);
  const [browserOpen, setBrowserOpen] = useState(false);

  const highlightIds = useMemo(() => {
    if (focusThemeId) return themeFocusSet(adj, focusThemeId);
    if (chapterFilter) return chapterFocusSet(graph, adj, chapterFilter);
    if (hoveredId) return neighborhood(adj, hoveredId);
    return null;
  }, [focusThemeId, chapterFilter, hoveredId, adj]);

  const selectNode = (id: string) => {
    setSelectedId(id);
    if (byId.get(id)?.type === "theme") {
      setFocusThemeId(id);
      setChapterFilter(null);
    }
  };

  const selectAndCenter = (id: string) => {
    selectNode(id);
    setCenterOnId(id);
  };

  const focusChapter = (chapter: number) => {
    setChapterFilter(chapter);
    setFocusThemeId(null);
    setBrowserOpen(false);
  };

  const clearFocus = () => {
    setFocusThemeId(null);
    setChapterFilter(null);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (selectedId) setSelectedId(null);
      else if (browserOpen) setBrowserOpen(false);
      else clearFocus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId, browserOpen]);

  const focusedTheme = focusThemeId ? byId.get(focusThemeId) : null;
  const focusLabel = focusedTheme?.type === "theme" ? focusedTheme.label : chapterFilter ? `Chapter ${chapterFilter}` : null;

  return (
    <main className="relative z-10 h-screen w-screen overflow-hidden">
      <GraphView
        graph={graph}
        selectedId={selectedId}
        highlightIds={highlightIds}
        centerOnId={centerOnId}
        onSelectNode={selectNode}
        onHoverNode={setHoveredId}
      />

      <header className="pointer-events-none absolute left-6 top-6 z-10 max-w-sm">
        <p className="font-hebrew text-sm tracking-wide text-gold-dim">פִּרְקֵי אָבוֹת</p>
        <h1 className="font-display text-4xl font-bold leading-none text-foreground">Avot Explorer</h1>
        <p className="mt-2 text-sm leading-relaxed text-foreground/60">
          A constellation of the Ethics of the Fathers — every teaching and the
          themes that bind them. Tap a star to read; tap a theme to gather its
          teachings.
        </p>
      </header>

      <div className="absolute right-6 top-6 z-30 flex items-center gap-3">
        <SearchBar onSelect={selectAndCenter} />
        <button
          type="button"
          onClick={() => setBrowserOpen((v) => !v)}
          aria-pressed={browserOpen}
          className="rounded-full border border-white/10 bg-night-deep/70 px-4 py-2 font-display text-sm text-foreground backdrop-blur transition-colors hover:border-gold/50"
        >
          Chapters
        </button>
      </div>

      {focusLabel && (
        <button
          type="button"
          onClick={clearFocus}
          className="absolute left-1/2 top-6 z-20 -translate-x-1/2 rounded-full border border-gold/50 bg-night-deep/70 px-4 py-1.5 font-display text-sm text-gold-bright backdrop-blur transition-colors hover:bg-night-deep"
        >
          Focused: {focusLabel}
          <span className="ml-2 text-gold-dim">clear ×</span>
        </button>
      )}

      {browserOpen && (
        <ChapterBrowser
          onSelect={selectAndCenter}
          onFocusChapter={focusChapter}
          onClose={() => setBrowserOpen(false)}
        />
      )}

      <DetailPanel
        selectedId={selectedId}
        lang={lang}
        onLangChange={setLang}
        onSelectNode={selectAndCenter}
        onClose={() => setSelectedId(null)}
      />
    </main>
  );
}
