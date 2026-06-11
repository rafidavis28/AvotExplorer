// Integrity checks for the curated sage attributions against the real dataset.
import { describe, expect, it } from "vitest";
import mishnayotData from "../data/mishnayot.json";
import { attributions, chain, getSage, mishnayotForSage, sages, sagesForMishnah } from "./sages";

const refs = new Set((mishnayotData as { ref: string }[]).map((m) => m.ref));

describe("sages dataset", () => {
  it("every attribution ref is a real mishnah", () => {
    for (const ref of Object.keys(attributions)) {
      expect(refs.has(ref), `unknown ref ${ref}`).toBe(true);
    }
  });

  it("every attributed slug exists in the sage list", () => {
    const slugs = new Set(sages.map((s) => s.slug));
    for (const [ref, list] of Object.entries(attributions)) {
      expect(list.length, `${ref} has empty attribution`).toBeGreaterThan(0);
      for (const slug of list) {
        expect(slugs.has(slug), `${ref} references unknown sage ${slug}`).toBe(true);
      }
    }
  });

  it("every sage speaks somewhere (no orphan entries)", () => {
    for (const s of sages) {
      expect(mishnayotForSage(s.slug).length, `${s.slug} never speaks`).toBeGreaterThan(0);
    }
  });

  it("slugs are unique and sages have complete fields", () => {
    const slugs = sages.map((s) => s.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of sages) {
      expect(s.name).toBeTruthy();
      expect(s.hebrew).toBeTruthy();
      expect(s.era).toBeTruthy();
      expect(s.bio).toBeTruthy();
    }
  });

  it("every chain slug resolves and non-sage links carry a name", () => {
    expect(chain.length).toBeGreaterThan(0);
    for (const group of chain) {
      expect(group.title).toBeTruthy();
      expect(group.items.length).toBeGreaterThan(0);
      for (const item of group.items) {
        if (item.slug) {
          expect(getSage(item.slug), `chain references unknown sage ${item.slug}`).toBeDefined();
        } else {
          expect(item.name, `chain item missing both slug and name`).toBeTruthy();
        }
      }
    }
  });

  it("spot-checks the chain of transmission", () => {
    expect(sagesForMishnah("Avot 1:12")[0]?.slug).toBe("hillel");
    expect(sagesForMishnah("Avot 3:14")[0]?.slug).toBe("rabbi-akiva");
    expect(sagesForMishnah("Avot 5:1")).toEqual([]); // anonymous
    expect(getSage("hillel")?.name).toBe("Hillel");
    expect(mishnayotForSage("hillel")).toContain("Avot 2:4");
  });
});
