/**
 * Build the idea graph (data/graph.json) from the Mishnah dataset and the
 * curated theme tagging in data/themes.json.
 *
 *   npm run tag-themes              -> build graph.json from committed themes.json
 *   npm run tag-themes -- --regenerate
 *                                   -> re-run the LLM tagging pass to rewrite
 *                                      themes.json assignments (needs ANTHROPIC_API_KEY),
 *                                      then build graph.json.
 *
 * The committed themes.json is the reviewed output of an LLM tagging pass over
 * all 108 mishnayot; --regenerate reproduces that pass.
 */
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { GraphData, GraphEdge, GraphNode, Mishnah } from "../lib/types";

const DATA = join(process.cwd(), "data");

interface ThemeDef {
  slug: string;
  label: string;
  blurb: string;
}
interface ThemesFile {
  themes: ThemeDef[];
  relations: [string, string][];
  assignments: Record<string, string[]>;
}

async function loadJson<T>(name: string): Promise<T> {
  return JSON.parse(await readFile(join(DATA, name), "utf8"));
}

/** Validate the tagging dataset against the mishnayot. Throws on any defect. */
function validate(mishnayot: Mishnah[], themes: ThemesFile): void {
  const slugs = new Set(themes.themes.map((t) => t.slug));
  if (slugs.size !== themes.themes.length) throw new Error("Duplicate theme slug");

  for (const [a, b] of themes.relations) {
    if (!slugs.has(a) || !slugs.has(b)) throw new Error(`Relation references unknown theme: ${a}/${b}`);
  }

  const used = new Set<string>();
  for (const m of mishnayot) {
    const tags = themes.assignments[m.ref];
    if (!tags || tags.length === 0) throw new Error(`No themes assigned to ${m.ref}`);
    for (const t of tags) {
      if (!slugs.has(t)) throw new Error(`${m.ref} references unknown theme "${t}"`);
      used.add(t);
    }
  }

  const orphans = [...slugs].filter((s) => !used.has(s));
  if (orphans.length) throw new Error(`Orphan themes (assigned to no mishnah): ${orphans.join(", ")}`);

  const extra = Object.keys(themes.assignments).filter((ref) => !mishnayot.some((m) => m.ref === ref));
  if (extra.length) throw new Error(`Assignments for unknown refs: ${extra.join(", ")}`);
}

function buildGraph(mishnayot: Mishnah[], themes: ThemesFile): GraphData {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  for (const m of mishnayot) {
    nodes.push({
      id: m.ref,
      type: "mishnah",
      label: `${m.chapter}:${m.mishnah}`,
      ref: m.ref,
      chapter: m.chapter,
    });
    for (const slug of themes.assignments[m.ref]) {
      edges.push({ source: m.ref, target: slug, type: "mishnah-theme" });
    }
  }

  for (const t of themes.themes) {
    nodes.push({ id: t.slug, type: "theme", label: t.label, blurb: t.blurb });
  }
  for (const [a, b] of themes.relations) {
    edges.push({ source: a, target: b, type: "theme-theme" });
  }

  return { nodes, edges };
}

async function main() {
  const regenerate = process.argv.includes("--regenerate");
  const mishnayot = await loadJson<Mishnah[]>("mishnayot.json");

  if (regenerate) {
    const { regenerateAssignments } = await import("./regenerate-themes");
    await regenerateAssignments(mishnayot);
  }

  const themes = await loadJson<ThemesFile>("themes.json");
  validate(mishnayot, themes);

  const graph = buildGraph(mishnayot, themes);
  const mishnahNodes = graph.nodes.filter((n) => n.type === "mishnah").length;
  const themeNodes = graph.nodes.filter((n) => n.type === "theme").length;
  const mtEdges = graph.edges.filter((e) => e.type === "mishnah-theme").length;
  const ttEdges = graph.edges.filter((e) => e.type === "theme-theme").length;

  console.log(`Nodes: ${mishnahNodes} mishnayot + ${themeNodes} themes`);
  console.log(`Edges: ${mtEdges} mishnah-theme + ${ttEdges} theme-theme`);
  console.log(`Avg themes/mishnah: ${(mtEdges / mishnahNodes).toFixed(2)}`);

  await writeFile(join(DATA, "graph.json"), JSON.stringify(graph, null, 2), "utf8");
  console.log(`Wrote ${join(DATA, "graph.json")}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
