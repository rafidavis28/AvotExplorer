// Pure helpers over the idea graph. Operate on the pristine GraphData
// (react-force-graph mutates its own copy of links, so never run these on the
// array handed to the force simulation).
import type { GraphData, GraphNode } from "./types";

export interface ThemeRef {
  id: string;
  label: string;
}

export function nodesById(graph: GraphData): Map<string, GraphNode> {
  return new Map(graph.nodes.map((n) => [n.id, n]));
}

/** Undirected adjacency: node id -> set of neighbor ids. */
export function buildAdjacency(graph: GraphData): Map<string, Set<string>> {
  const adj = new Map<string, Set<string>>();
  const link = (a: string, b: string) => {
    if (!adj.has(a)) adj.set(a, new Set());
    adj.get(a)!.add(b);
  };
  for (const e of graph.edges) {
    link(e.source, e.target);
    link(e.target, e.source);
  }
  return adj;
}

/** Immediate neighbors of a node (plus the node itself), for hover highlight. */
export function neighborhood(adj: Map<string, Set<string>>, id: string): Set<string> {
  const set = new Set<string>([id]);
  for (const n of adj.get(id) ?? []) set.add(n);
  return set;
}

/** The theme nodes a given Mishnah connects to. */
export function themesForMishnah(
  graph: GraphData,
  byId: Map<string, GraphNode>,
  ref: string,
): ThemeRef[] {
  const out: ThemeRef[] = [];
  for (const e of graph.edges) {
    if (e.type !== "mishnah-theme") continue;
    if (e.source !== ref) continue;
    const node = byId.get(e.target);
    if (node && node.type === "theme") out.push({ id: node.id, label: node.label });
  }
  return out;
}

/** The Mishnah refs that express a given theme. */
export function mishnayotForTheme(graph: GraphData, themeId: string): string[] {
  const out: string[] = [];
  for (const e of graph.edges) {
    if (e.type === "mishnah-theme" && e.target === themeId) out.push(e.source);
  }
  return out;
}

/**
 * Set of node ids to keep lit when a theme is focused: the theme itself, every
 * Mishnah that expresses it, and directly related themes.
 */
export function themeFocusSet(adj: Map<string, Set<string>>, themeId: string): Set<string> {
  return neighborhood(adj, themeId);
}

/** Another Mishnah reachable through themes shared with a source Mishnah. */
export interface RelatedMishnah {
  ref: string;
  /** Labels of the shared themes, in graph order. */
  sharedThemes: string[];
}

/**
 * Mishnayot that share at least one theme with the given one, ranked by how
 * many themes they share (then by canonical order). The connective tissue of
 * the map: "this teaching speaks to that one, through these ideas."
 */
export function relatedMishnayot(
  graph: GraphData,
  byId: Map<string, GraphNode>,
  ref: string,
  limit = 6,
): RelatedMishnah[] {
  const themeIds = themesForMishnah(graph, byId, ref).map((t) => t.id);
  if (themeIds.length === 0) return [];
  const themeSet = new Set(themeIds);

  const shared = new Map<string, string[]>(); // other ref -> shared theme labels
  for (const e of graph.edges) {
    if (e.type !== "mishnah-theme" || e.source === ref || !themeSet.has(e.target)) continue;
    const theme = byId.get(e.target);
    if (!theme || theme.type !== "theme") continue;
    if (!shared.has(e.source)) shared.set(e.source, []);
    shared.get(e.source)!.push(theme.label);
  }

  const order = new Map(graph.nodes.map((n, i) => [n.id, i]));
  return [...shared.entries()]
    .sort(
      (a, b) =>
        b[1].length - a[1].length || (order.get(a[0]) ?? 0) - (order.get(b[0]) ?? 0),
    )
    .slice(0, limit)
    .map(([r, sharedThemes]) => ({ ref: r, sharedThemes }));
}

/** Themes directly related to a theme (via theme-theme edges). */
export function relatedThemes(
  graph: GraphData,
  byId: Map<string, GraphNode>,
  themeId: string,
): ThemeRef[] {
  const out: ThemeRef[] = [];
  for (const e of graph.edges) {
    if (e.type !== "theme-theme") continue;
    const other = e.source === themeId ? e.target : e.target === themeId ? e.source : null;
    if (!other) continue;
    const node = byId.get(other);
    if (node && node.type === "theme") out.push({ id: node.id, label: node.label });
  }
  return out;
}

/** theme id -> number of mishnayot expressing it (for sizing orbs by weight). */
export function themeWeights(graph: GraphData): Map<string, number> {
  const weights = new Map<string, number>();
  for (const e of graph.edges) {
    if (e.type !== "mishnah-theme") continue;
    weights.set(e.target, (weights.get(e.target) ?? 0) + 1);
  }
  return weights;
}

/** Set of node ids to keep lit when a chapter is focused: every Mishnah in the
 *  chapter plus the themes they touch. */
export function chapterFocusSet(
  graph: GraphData,
  adj: Map<string, Set<string>>,
  chapter: number,
): Set<string> {
  const set = new Set<string>();
  for (const n of graph.nodes) {
    if (n.type === "mishnah" && n.chapter === chapter) {
      set.add(n.id);
      for (const nb of adj.get(n.id) ?? []) set.add(nb);
    }
  }
  return set;
}
