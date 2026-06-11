/**
 * Optional: re-run the LLM tagging pass that produced data/themes.json's
 * `assignments`. Invoked by `npm run tag-themes -- --regenerate`.
 * Requires ANTHROPIC_API_KEY. The theme vocabulary and relations in
 * themes.json are treated as fixed; only per-mishnah assignments are rewritten.
 */
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import Anthropic from "@anthropic-ai/sdk";
import type { Mishnah } from "../lib/types";

export async function regenerateAssignments(mishnayot: Mishnah[]): Promise<void> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is required for --regenerate");
  }
  const client = new Anthropic();
  const themesPath = join(process.cwd(), "data", "themes.json");
  const themes = JSON.parse(await readFile(themesPath, "utf8")) as {
    themes: { slug: string; label: string; blurb: string }[];
    assignments: Record<string, string[]>;
  };
  const vocab = themes.themes.map((t) => `- ${t.slug}: ${t.label} — ${t.blurb}`).join("\n");

  const assignments: Record<string, string[]> = {};
  for (const m of mishnayot) {
    const msg = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 200,
      system:
        `Tag each Mishnah of Pirkei Avot with the 1-4 most fitting themes from this fixed vocabulary. ` +
        `Use ONLY these slugs:\n${vocab}\n\nReturn ONLY a JSON array of slug strings, most central theme first.`,
      messages: [
        { role: "user", content: `${m.ref}\n\nHebrew: ${m.hebrew}\n\nEnglish: ${m.english}` },
      ],
    });
    const text = msg.content
      .filter((c) => c.type === "text")
      .map((c) => (c as { text: string }).text)
      .join("");
    const slugs = JSON.parse(text.slice(text.indexOf("["), text.lastIndexOf("]") + 1)) as string[];
    assignments[m.ref] = slugs;
    console.log(`${m.ref}: ${slugs.join(", ")}`);
  }

  themes.assignments = assignments;
  await writeFile(themesPath, JSON.stringify(themes, null, 2), "utf8");
  console.log("Rewrote data/themes.json assignments.");
}
