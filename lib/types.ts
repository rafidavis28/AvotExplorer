// Shared data model for the Avot Explorer.
// Used by both the build-time scripts (scripts/) and the app (app/, components/).

/** Reading-language preference for bilingual text. */
export type Lang = "he" | "en" | "both";

/** A single classical commentary's text on one Mishnah, kept as segments
 *  (Sefaria stores each comment as an array of dibur-hamatchil segments). */
export interface CommentaryText {
  /** Display name, e.g. "Bartenura". */
  name: string;
  /** URL-friendly id, e.g. "bartenura". */
  slug: string;
  /** Cleaned Hebrew segments (empty array if none for this Mishnah). */
  hebrew: string[];
  /** Cleaned English segments (empty array if untranslated for this Mishnah). */
  english: string[];
}

/** One Mishnah of Pirkei Avot with its text and curated commentaries. */
export interface Mishnah {
  /** Canonical reference, e.g. "Avot 1:1". */
  ref: string;
  /** 1-indexed chapter (perek), 1..6. */
  chapter: number;
  /** 1-indexed mishnah within the chapter. */
  mishnah: number;
  /** Cleaned Hebrew text (with nikkud). */
  hebrew: string;
  /** Cleaned English text. */
  english: string;
  /** Curated core commentaries that have content for this Mishnah. */
  commentaries: CommentaryText[];
}

/** A node in the idea graph: either a Mishnah or a theme. */
export type GraphNode =
  | {
      id: string; // same as ref, e.g. "Avot 1:1"
      type: "mishnah";
      label: string; // e.g. "1:1"
      ref: string;
      chapter: number;
    }
  | {
      id: string; // theme slug, e.g. "humility"
      type: "theme";
      label: string; // e.g. "Humility"
      blurb: string;
    };

/** A connection between two nodes. */
export interface GraphEdge {
  source: string; // node id
  target: string; // node id
  type: "mishnah-theme" | "theme-theme" | "mishnah-mishnah";
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}
