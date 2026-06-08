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
