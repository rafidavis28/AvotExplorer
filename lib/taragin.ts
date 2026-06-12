// Insights from Rav Reuven Taragin's "Biglal Avos" manuscript, keyed to the
// mishnayot and themes they illuminate. Quotes are his words verbatim and are
// always displayed with attribution.
import taraginData from "@/data/taragin.json";

/** A further source (commentary, midrash, gemara…) Rav Taragin cites in an article. */
export interface TaraginSource {
  /** Display name, e.g. "Rabbeinu Yonah". */
  name: string;
  /** The specific idea the article attributes to this source. */
  point: string;
}

/** One "Biglal Avos" article distilled: where it lives, what it says, who it cites. */
export interface TaraginInsight {
  /** Article title as it appears in the manuscript. */
  title: string;
  /** Mishnah refs the article expounds, e.g. ["Avot 1:14"]. */
  refs: string[];
  /** Verbatim quote from Rav Taragin capturing the article's thesis. */
  quote: string;
  /** Short paraphrase of the article's main idea. */
  summary: string;
  /** Further commentaries and sources the article cites. */
  sources: TaraginSource[];
  /** Slugs of site themes the article speaks to. */
  themes: string[];
}

interface TaraginData {
  author: string;
  work: string;
  insights: TaraginInsight[];
}

const data = taraginData as TaraginData;

export const taraginAuthor = data.author;
export const taraginWork = data.work;
export const taraginInsights = data.insights;

const byRef = new Map<string, TaraginInsight[]>();
const byTheme = new Map<string, TaraginInsight[]>();
for (const insight of data.insights) {
  for (const ref of insight.refs) {
    if (!byRef.has(ref)) byRef.set(ref, []);
    byRef.get(ref)!.push(insight);
  }
  for (const theme of insight.themes) {
    if (!byTheme.has(theme)) byTheme.set(theme, []);
    byTheme.get(theme)!.push(insight);
  }
}

/** Articles anchored to a Mishnah (canonical ref, e.g. "Avot 1:14"). */
export function insightsForMishnah(ref: string): TaraginInsight[] {
  return byRef.get(ref) ?? [];
}

/** Articles that speak to a theme (by slug). */
export function insightsForTheme(themeId: string): TaraginInsight[] {
  return byTheme.get(themeId) ?? [];
}
