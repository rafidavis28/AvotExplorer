/**
 * Ingest Pirkei Avot from the public Sefaria-Export GCS bucket into a single
 * typed dataset: data/mishnayot.json.
 *
 * Source: https://storage.googleapis.com/sefaria-export/json/... (no auth).
 * Run with: npm run ingest
 *
 * Downloads are cached in .ingest-cache/ (gitignored) so re-runs are fast.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import type { CommentaryText, Mishnah } from "../lib/types";

const BUCKET = "https://storage.googleapis.com/sefaria-export";
const CACHE_DIR = join(process.cwd(), ".ingest-cache");
const OUT = join(process.cwd(), "data", "mishnayot.json");

/** A Sefaria merged.json: text is text[chapter][mishnah] = string (main)
 *  or text[chapter][mishnah] = string[] (commentary segments). */
interface SefariaText {
  title: string;
  text: (string | string[])[][];
}

const MAIN = {
  hebrew: "json/Mishnah/Seder Nezikin/Pirkei Avot/Hebrew/merged.json",
  english: "json/Mishnah/Seder Nezikin/Pirkei Avot/English/merged.json",
};

/** Curated core commentaries (display name, slug, He/En GCS paths). */
const COMMENTARIES: { name: string; slug: string; hebrew: string; english: string }[] = [
  {
    name: "Bartenura",
    slug: "bartenura",
    hebrew: "json/Mishnah/Rishonim on Mishnah/Bartenura/Seder Nezikin/Bartenura on Pirkei Avot/Hebrew/merged.json",
    english: "json/Mishnah/Rishonim on Mishnah/Bartenura/Seder Nezikin/Bartenura on Pirkei Avot/English/merged.json",
  },
  {
    name: "Rambam",
    slug: "rambam",
    hebrew: "json/Mishnah/Rishonim on Mishnah/Rambam/Seder Nezikin/Rambam on Pirkei Avot/Hebrew/merged.json",
    english: "json/Mishnah/Rishonim on Mishnah/Rambam/Seder Nezikin/Rambam on Pirkei Avot/English/merged.json",
  },
  {
    name: "Rabbeinu Yonah",
    slug: "rabbeinu-yonah",
    hebrew: "json/Mishnah/Rishonim on Mishnah/Rabbeinu Yonah/Seder Nezikin/Rabbeinu Yonah on Pirkei Avot/Hebrew/merged.json",
    english: "json/Mishnah/Rishonim on Mishnah/Rabbeinu Yonah/Seder Nezikin/Rabbeinu Yonah on Pirkei Avot/English/merged.json",
  },
  {
    name: "Tiferet Yisrael (Yachin)",
    slug: "tiferet-yisrael",
    hebrew: "json/Mishnah/Acharonim on Mishnah/Yachin/Seder Nezikin/Yachin on Pirkei Avot/Hebrew/merged.json",
    english: "json/Mishnah/Acharonim on Mishnah/Yachin/Seder Nezikin/Yachin on Pirkei Avot/English/merged.json",
  },
];

/** Fetch a bucket object as JSON, caching the raw file locally. */
async function fetchJson(objectPath: string): Promise<SefariaText> {
  const cacheFile = join(CACHE_DIR, objectPath.replace(/[\/\\:*?"<>| ]+/g, "_"));
  if (existsSync(cacheFile)) {
    return JSON.parse(await readFile(cacheFile, "utf8"));
  }
  const url = `${BUCKET}/${objectPath.split("/").map(encodeURIComponent).join("/")}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch failed (${res.status}): ${url}`);
  const body = await res.text();
  await writeFile(cacheFile, body, "utf8");
  return JSON.parse(body);
}

/** Strip Sefaria HTML/footnotes to clean plain text. */
function clean(raw: string): string {
  if (!raw) return "";
  return raw
    .replace(/<sup>[\s\S]*?<\/sup>/g, "") // footnote markers
    .replace(/<i\s+class="footnote">[\s\S]*?<\/i>/g, "") // footnote bodies
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/?[^>]+>/g, "") // remaining tags
    .replace(/&nbsp;/g, " ")
    .replace(/&thinsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

/** Get the raw cell at [chapter][mishnah], normalized to a string[] of segments. */
function cellSegments(text: SefariaText["text"], c: number, m: number): string[] {
  const cell = text[c]?.[m];
  if (cell == null) return [];
  const arr = Array.isArray(cell) ? cell : [cell];
  return arr.map((s) => clean(String(s))).filter((s) => s.length > 0);
}

async function main() {
  await mkdir(CACHE_DIR, { recursive: true });

  console.log("Fetching main text…");
  const he = await fetchJson(MAIN.hebrew);
  const en = await fetchJson(MAIN.english);

  console.log("Fetching commentaries…");
  const comm = await Promise.all(
    COMMENTARIES.map(async (c) => ({
      meta: c,
      he: await fetchJson(c.hebrew),
      en: await fetchJson(c.english),
    })),
  );

  const mishnayot: Mishnah[] = [];
  const chapterCount = he.text.length;

  for (let c = 0; c < chapterCount; c++) {
    const mishnahCount = he.text[c].length;
    for (let m = 0; m < mishnahCount; m++) {
      const hebrew = cellSegments(he.text, c, m).join(" ");
      const english = cellSegments(en.text, c, m).join(" ");

      const commentaries: CommentaryText[] = [];
      for (const cm of comm) {
        const cHe = cellSegments(cm.he.text, c, m);
        const cEn = cellSegments(cm.en.text, c, m);
        if (cHe.length === 0 && cEn.length === 0) continue;
        commentaries.push({ name: cm.meta.name, slug: cm.meta.slug, hebrew: cHe, english: cEn });
      }

      mishnayot.push({
        ref: `Avot ${c + 1}:${m + 1}`,
        chapter: c + 1,
        mishnah: m + 1,
        hebrew,
        english,
        commentaries,
      });
    }
  }

  // Verification
  const total = mishnayot.length;
  const missingHe = mishnayot.filter((x) => !x.hebrew).map((x) => x.ref);
  const missingEn = mishnayot.filter((x) => !x.english).map((x) => x.ref);
  const perCommentary = COMMENTARIES.map(
    (c) => `${c.name}: ${mishnayot.filter((x) => x.commentaries.some((k) => k.slug === c.slug)).length}/${total}`,
  );

  console.log(`\nChapters: ${chapterCount} | Total mishnayot: ${total}`);
  console.log(`Commentary coverage -> ${perCommentary.join(" | ")}`);
  if (missingHe.length) console.warn(`WARN missing Hebrew: ${missingHe.join(", ")}`);
  if (missingEn.length) console.warn(`WARN missing English: ${missingEn.join(", ")}`);
  if (total !== 108) throw new Error(`Expected 108 mishnayot, got ${total}`);

  await mkdir(join(process.cwd(), "data"), { recursive: true });
  await writeFile(OUT, JSON.stringify(mishnayot, null, 2), "utf8");
  console.log(`\nWrote ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
