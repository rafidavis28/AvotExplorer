// Typed access to the pre-built static dataset.
import mishnayotData from "@/data/mishnayot.json";
import graphData from "@/data/graph.json";
import type { GraphData, Mishnah } from "./types";

export const mishnayot = mishnayotData as Mishnah[];
export const graph = graphData as GraphData;

const byRef = new Map(mishnayot.map((m) => [m.ref, m]));
export function getMishnah(ref: string): Mishnah | undefined {
  return byRef.get(ref);
}

/** Mishnayot in canonical reading order (Avot 1:1 … 6:N). */
export const orderedRefs: string[] = mishnayot.map((m) => m.ref);

/** Previous/next refs for in-card sequential navigation. */
export function neighborRefs(ref: string): { prev: string | null; next: string | null } {
  const i = orderedRefs.indexOf(ref);
  if (i === -1) return { prev: null, next: null };
  return {
    prev: i > 0 ? orderedRefs[i - 1] : null,
    next: i < orderedRefs.length - 1 ? orderedRefs[i + 1] : null,
  };
}
