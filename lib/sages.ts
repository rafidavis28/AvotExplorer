// Typed access to the curated sage attributions (data/sages.json).
import sagesData from "../data/sages.json";

export interface Sage {
  /** URL-friendly id, e.g. "hillel". */
  slug: string;
  name: string;
  /** Pointed Hebrew name. */
  hebrew: string;
  /** Era label, e.g. "Tanna · 2nd cent. CE". */
  era: string;
  /** One-line biography. */
  bio: string;
}

/** One link in the chain of transmission: a sage, or a pre-Mishnaic figure. */
export interface ChainItem {
  slug?: string;
  name?: string;
  hebrew?: string;
}

/** A generation/group in the chain of transmission (Avot 1–2). */
export interface ChainGroup {
  title: string;
  note?: string;
  items: ChainItem[];
}

const data = sagesData as {
  sages: Sage[];
  chain: ChainGroup[];
  attributions: Record<string, string[]>;
};

export const sages: Sage[] = data.sages;

/** The chain of transmission, in order, as laid out in Avot 1–2. */
export const chain: ChainGroup[] = data.chain;

/** ref -> sage slugs (primary voice first). Anonymous mishnayot are absent. */
export const attributions: Record<string, string[]> = data.attributions;

const bySlug = new Map(sages.map((s) => [s.slug, s]));

export function getSage(slug: string): Sage | undefined {
  return bySlug.get(slug);
}

/** Sages who speak in a Mishnah (primary voice first); [] if anonymous. */
export function sagesForMishnah(ref: string): Sage[] {
  return (attributions[ref] ?? [])
    .map((slug) => bySlug.get(slug))
    .filter((s): s is Sage => Boolean(s));
}

/** Refs of every Mishnah in which a sage speaks, in canonical order. */
export function mishnayotForSage(slug: string): string[] {
  const out: string[] = [];
  for (const [ref, slugs] of Object.entries(attributions)) {
    if (slugs.includes(slug)) out.push(ref);
  }
  return out;
}

/** Node ids to keep lit when a sage is focused: their mishnayot. */
export function sageFocusSet(slug: string): Set<string> {
  return new Set(mishnayotForSage(slug));
}
