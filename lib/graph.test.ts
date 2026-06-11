import { describe, expect, it } from "vitest";
import type { GraphData } from "./types";
import {
  buildAdjacency,
  chapterFocusSet,
  mishnayotForTheme,
  neighborhood,
  nodesById,
  relatedMishnayot,
  relatedThemes,
  themeFocusSet,
  themesForMishnah,
  themeWeights,
} from "./graph";

const fixture: GraphData = {
  nodes: [
    { id: "Avot 1:1", type: "mishnah", label: "1:1", ref: "Avot 1:1", chapter: 1 },
    { id: "Avot 1:2", type: "mishnah", label: "1:2", ref: "Avot 1:2", chapter: 1 },
    { id: "Avot 2:1", type: "mishnah", label: "2:1", ref: "Avot 2:1", chapter: 2 },
    { id: "humility", type: "theme", label: "Humility", blurb: "Lowliness." },
    { id: "torah-study", type: "theme", label: "Torah Study", blurb: "Learning." },
  ],
  edges: [
    { source: "Avot 1:1", target: "humility", type: "mishnah-theme" },
    { source: "Avot 1:1", target: "torah-study", type: "mishnah-theme" },
    { source: "Avot 1:2", target: "torah-study", type: "mishnah-theme" },
    { source: "Avot 2:1", target: "humility", type: "mishnah-theme" },
    { source: "humility", target: "torah-study", type: "theme-theme" },
  ],
};

const adj = buildAdjacency(fixture);
const byId = nodesById(fixture);

describe("buildAdjacency", () => {
  it("links both directions", () => {
    expect(adj.get("Avot 1:1")).toEqual(new Set(["humility", "torah-study"]));
    expect(adj.get("torah-study")).toEqual(new Set(["Avot 1:1", "Avot 1:2", "humility"]));
  });
});

describe("neighborhood", () => {
  it("includes the node itself and its neighbors", () => {
    expect(neighborhood(adj, "humility")).toEqual(
      new Set(["humility", "Avot 1:1", "Avot 2:1", "torah-study"]),
    );
  });
});

describe("themesForMishnah", () => {
  it("returns the theme nodes a mishnah connects to", () => {
    expect(themesForMishnah(fixture, byId, "Avot 1:1")).toEqual([
      { id: "humility", label: "Humility" },
      { id: "torah-study", label: "Torah Study" },
    ]);
  });
});

describe("mishnayotForTheme", () => {
  it("returns the mishnayot expressing a theme", () => {
    expect(mishnayotForTheme(fixture, "torah-study")).toEqual(["Avot 1:1", "Avot 1:2"]);
  });
});

describe("themeFocusSet", () => {
  it("lights the theme, its mishnayot, and related themes", () => {
    expect(themeFocusSet(adj, "humility")).toEqual(
      new Set(["humility", "Avot 1:1", "Avot 2:1", "torah-study"]),
    );
  });
});

describe("relatedMishnayot", () => {
  it("ranks other mishnayot by shared theme count and names the shared themes", () => {
    // 1:1 shares humility with 2:1 and torah-study with 1:2.
    expect(relatedMishnayot(fixture, byId, "Avot 1:1")).toEqual([
      { ref: "Avot 1:2", sharedThemes: ["Torah Study"] },
      { ref: "Avot 2:1", sharedThemes: ["Humility"] },
    ]);
  });

  it("returns [] for a mishnah with no themes", () => {
    const lonely: GraphData = {
      nodes: [{ id: "Avot 9:9", type: "mishnah", label: "9:9", ref: "Avot 9:9", chapter: 9 }],
      edges: [],
    };
    expect(relatedMishnayot(lonely, nodesById(lonely), "Avot 9:9")).toEqual([]);
  });

  it("respects the limit", () => {
    expect(relatedMishnayot(fixture, byId, "Avot 1:1", 1)).toHaveLength(1);
  });
});

describe("relatedThemes", () => {
  it("returns themes linked by theme-theme edges, either direction", () => {
    expect(relatedThemes(fixture, byId, "humility")).toEqual([
      { id: "torah-study", label: "Torah Study" },
    ]);
    expect(relatedThemes(fixture, byId, "torah-study")).toEqual([
      { id: "humility", label: "Humility" },
    ]);
  });
});

describe("themeWeights", () => {
  it("counts mishnayot per theme", () => {
    const w = themeWeights(fixture);
    expect(w.get("humility")).toBe(2);
    expect(w.get("torah-study")).toBe(2);
  });
});

describe("chapterFocusSet", () => {
  it("lights a chapter's mishnayot and the themes they touch", () => {
    expect(chapterFocusSet(fixture, adj, 1)).toEqual(
      new Set(["Avot 1:1", "Avot 1:2", "humility", "torah-study"]),
    );
    expect(chapterFocusSet(fixture, adj, 2)).toEqual(new Set(["Avot 2:1", "humility"]));
  });
});
