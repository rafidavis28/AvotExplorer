// Lightweight search across Mishnah text/refs, theme labels, and sages.
import type { GraphData, Mishnah } from "./types";
import { sages } from "./sages";

export interface SearchHit {
  /** Graph node id, or "sage:<slug>" for a sage. */
  id: string;
  label: string;
  sublabel: string;
  type: "mishnah" | "theme" | "sage";
}

/** Strip Hebrew nikkud (combining marks) so searches match unpointed text. */
function normalizeHebrew(s: string): string {
  return s.replace(/[֑-ׇ]/g, "");
}

function fold(s: string): string {
  return normalizeHebrew(s.toLowerCase()).trim();
}

export function searchNodes(
  query: string,
  mishnayot: Mishnah[],
  graph: GraphData,
  limit = 12,
): SearchHit[] {
  const q = fold(query);
  if (q.length < 2) return [];
  const hits: SearchHit[] = [];

  for (const t of graph.nodes) {
    if (t.type !== "theme") continue;
    if (fold(t.label).includes(q)) {
      hits.push({ id: t.id, label: t.label, sublabel: "Theme", type: "theme" });
    }
  }

  for (const s of sages) {
    if (fold(s.name).includes(q) || fold(s.hebrew).includes(q)) {
      hits.push({ id: `sage:${s.slug}`, label: s.name, sublabel: s.era, type: "sage" });
    }
  }

  for (const m of mishnayot) {
    const inRef = fold(m.ref).includes(q) || m.ref.replace("Avot ", "").includes(q);
    const inText = fold(m.english).includes(q) || fold(m.hebrew).includes(q);
    if (inRef || inText) {
      hits.push({
        id: m.ref,
        label: m.ref,
        sublabel: m.english.slice(0, 60) + "…",
        type: "mishnah",
      });
    }
  }

  // Themes first, then sages, then mishnayot in order.
  return hits.slice(0, limit);
}
