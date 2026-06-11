"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { graph, neighborRefs } from "@/lib/data";
import {
  buildAdjacency,
  chapterFocusSet,
  neighborhood,
  nodesById,
  themeFocusSet,
} from "@/lib/graph";
import { getSage, sageFocusSet } from "@/lib/sages";
import type { Lang } from "@/lib/types";
import { GraphView } from "./GraphView";
import { DetailPanel } from "./DetailPanel";
import { SearchBar } from "./SearchBar";
import { ChapterBrowser } from "./ChapterBrowser";
import { ChainPanel } from "./ChainPanel";
import { AboutPanel } from "./AboutPanel";

/** What the graph is currently "gathered" around. */
type Focus =
  | { kind: "theme"; id: string }
  | { kind: "chapter"; chapter: number }
  | { kind: "sage"; slug: string };

const SAGE_PREFIX = "sage:";

function readUrlState(): { selected: string | null; focus: Focus | null } {
  const params = new URLSearchParams(window.location.search);
  const selected = params.get("n");
  const f = params.get("f");
  let focus: Focus | null = null;
  if (f) {
    const [kind, ...rest] = f.split(":");
    const value = rest.join(":");
    if (kind === "theme" && value) focus = { kind: "theme", id: value };
    else if (kind === "sage" && value) focus = { kind: "sage", slug: value };
    else if (kind === "chapter" && Number(value) >= 1 && Number(value) <= 6)
      focus = { kind: "chapter", chapter: Number(value) };
  }
  return { selected, focus };
}

function writeUrlState(selected: string | null, focus: Focus | null) {
  const params = new URLSearchParams();
  if (selected) params.set("n", selected);
  if (focus) {
    params.set(
      "f",
      focus.kind === "theme"
        ? `theme:${focus.id}`
        : focus.kind === "sage"
          ? `sage:${focus.slug}`
          : `chapter:${focus.chapter}`,
    );
  }
  const qs = params.toString();
  const url = qs ? `?${qs}` : window.location.pathname;
  window.history.replaceState(null, "", url);
}

export function Explorer() {
  const adj = useMemo(() => buildAdjacency(graph), []);
  const byId = useMemo(() => nodesById(graph), []);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [centerOnId, setCenterOnId] = useState<string | null>(null);
  const [lang, setLang] = useState<Lang>("both");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [focus, setFocus] = useState<Focus | null>(null);
  // The left slot holds at most one of: chapter browser, chain of transmission.
  const [sidePanel, setSidePanel] = useState<"chapters" | "chain" | null>(null);
  const [aboutOpen, setAboutOpen] = useState(false);

  // Restore state from the URL once on mount (deep links). Must run after
  // hydration (window is client-only), so a one-shot effect is the right tool;
  // the single cascading render is intentional and bounded.
  const restored = useRef(false);
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (restored.current) return;
    restored.current = true;
    const { selected, focus: f } = readUrlState();
    if (f) setFocus(f);
    if (selected) {
      const isSage = selected.startsWith(SAGE_PREFIX);
      if (isSage ? getSage(selected.slice(SAGE_PREFIX.length)) : byId.has(selected)) {
        setSelectedId(selected);
        if (!isSage) setCenterOnId(selected);
      }
    }
  }, [byId]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Mirror state into the URL so any view is shareable.
  useEffect(() => {
    if (!restored.current) return;
    writeUrlState(selectedId, focus);
  }, [selectedId, focus]);

  const highlightIds = useMemo(() => {
    if (focus?.kind === "theme") return themeFocusSet(adj, focus.id);
    if (focus?.kind === "chapter") return chapterFocusSet(graph, adj, focus.chapter);
    if (focus?.kind === "sage") return sageFocusSet(focus.slug);
    if (hoveredId) return neighborhood(adj, hoveredId);
    return null;
  }, [focus, hoveredId, adj]);

  const selectNode = useCallback(
    (id: string) => {
      setSelectedId(id);
      if (id.startsWith(SAGE_PREFIX)) {
        setFocus({ kind: "sage", slug: id.slice(SAGE_PREFIX.length) });
      } else if (byId.get(id)?.type === "theme") {
        setFocus({ kind: "theme", id });
      }
    },
    [byId],
  );

  const selectAndCenter = useCallback(
    (id: string) => {
      selectNode(id);
      if (!id.startsWith(SAGE_PREFIX)) setCenterOnId(id);
    },
    [selectNode],
  );

  const focusChapter = useCallback((chapter: number) => {
    setFocus({ kind: "chapter", chapter });
    setSidePanel(null);
  }, []);

  const clearFocus = useCallback(() => setFocus(null), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing =
        target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if (typing) return;

      if (e.key === "Escape") {
        if (aboutOpen) setAboutOpen(false);
        else if (selectedId) setSelectedId(null);
        else if (sidePanel) setSidePanel(null);
        else clearFocus();
        return;
      }

      // ←/→ walk the teachings in reading order while one is open.
      if ((e.key === "ArrowLeft" || e.key === "ArrowRight") && selectedId) {
        const node = byId.get(selectedId);
        if (node?.type === "mishnah") {
          const { prev, next } = neighborRefs(node.ref);
          const target = e.key === "ArrowLeft" ? prev : next;
          if (target) {
            e.preventDefault();
            selectAndCenter(target);
          }
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId, sidePanel, aboutOpen, clearFocus, byId, selectAndCenter]);

  const focusLabel =
    focus?.kind === "theme"
      ? byId.get(focus.id)?.label
      : focus?.kind === "chapter"
        ? `Chapter ${focus.chapter}`
        : focus?.kind === "sage"
          ? getSage(focus.slug)?.name
          : null;

  return (
    <main className="relative z-10 h-dvh w-screen overflow-hidden">
      <GraphView
        graph={graph}
        selectedId={selectedId}
        highlightIds={highlightIds}
        centerOnId={centerOnId}
        onSelectNode={selectNode}
        onHoverNode={setHoveredId}
      />

      <header className="pointer-events-none absolute left-4 top-4 z-10 max-w-sm sm:left-6 sm:top-6">
        <p className="font-hebrew text-sm tracking-wide text-gold-dim">פִּרְקֵי אָבוֹת</p>
        <h1 className="font-display text-3xl font-bold leading-none text-foreground sm:text-4xl">
          Avot Explorer
        </h1>
        <p className="mt-2 hidden text-sm leading-relaxed text-foreground/60 sm:block">
          A constellation of the Ethics of the Fathers — every teaching and the
          themes that bind them. Tap a star to read; tap a theme to gather its
          teachings.
        </p>
        {!selectedId && (
          <button
            type="button"
            onClick={() => selectAndCenter("Avot 1:1")}
            className="pointer-events-auto mt-[3.75rem] rounded-full border border-gold/40 bg-night-deep/60 px-4 py-1.5 font-display text-sm text-gold-bright backdrop-blur transition-colors hover:border-gold/80 hover:bg-night-deep sm:mt-3"
          >
            Begin at the beginning · 1:1 →
          </button>
        )}
      </header>

      <div className="absolute inset-x-4 top-[4.75rem] z-30 flex items-center justify-end gap-2 sm:inset-x-auto sm:right-6 sm:top-6 sm:gap-3">
        <SearchBar onSelect={selectAndCenter} />
        <button
          type="button"
          onClick={() => setSidePanel((v) => (v === "chapters" ? null : "chapters"))}
          aria-pressed={sidePanel === "chapters"}
          className="rounded-full border border-white/10 bg-night-deep/70 px-4 py-2 font-display text-sm text-foreground backdrop-blur transition-colors hover:border-gold/50"
        >
          Chapters
        </button>
        <button
          type="button"
          onClick={() => setSidePanel((v) => (v === "chain" ? null : "chain"))}
          aria-pressed={sidePanel === "chain"}
          title="The chain of transmission"
          className="rounded-full border border-white/10 bg-night-deep/70 px-4 py-2 font-display text-sm text-foreground backdrop-blur transition-colors hover:border-gold/50"
        >
          Chain
        </button>
      </div>

      {focusLabel && (
        <button
          type="button"
          onClick={clearFocus}
          className="absolute bottom-20 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full border border-gold/50 bg-night-deep/70 px-4 py-1.5 font-display text-sm text-gold-bright backdrop-blur transition-colors hover:bg-night-deep sm:bottom-auto sm:top-6"
        >
          Gathered: {focusLabel}
          <span className="ml-2 text-gold-dim">clear ×</span>
        </button>
      )}

      {/* Legend + about */}
      <div className="pointer-events-none absolute bottom-4 left-4 z-10 hidden items-center gap-4 text-xs text-foreground/50 sm:flex sm:bottom-5 sm:left-6">
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="inline-block h-2 w-2 rounded-full bg-star shadow-[0_0_6px_rgba(236,226,196,0.8)]" />
          teaching
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="inline-block h-3 w-3 rounded-full bg-orb shadow-[0_0_8px_rgba(216,169,63,0.8)]" />
          theme — larger orbs bind more teachings
        </span>
      </div>
      <button
        type="button"
        onClick={() => setAboutOpen(true)}
        aria-label="About Avot Explorer and text sources"
        className="absolute bottom-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-night-deep/70 font-display text-sm text-foreground/70 backdrop-blur transition-colors hover:border-gold/50 hover:text-foreground sm:bottom-5 sm:right-6"
      >
        ?
      </button>

      {sidePanel === "chapters" && (
        <ChapterBrowser
          onSelect={selectAndCenter}
          onFocusChapter={focusChapter}
          onClose={() => setSidePanel(null)}
        />
      )}

      {sidePanel === "chain" && (
        <ChainPanel onSelect={selectAndCenter} onClose={() => setSidePanel(null)} />
      )}

      {aboutOpen && <AboutPanel onClose={() => setAboutOpen(false)} />}

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
