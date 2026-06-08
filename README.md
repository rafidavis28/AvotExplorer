# Avot Explorer

An interactive **map of ideas** for Pirkei Avot (Ethics of the Fathers). The 108
mishnayot and ~30 thematic concepts form a force-directed "constellation"; tap a
star to read the teaching (Hebrew + English + classical commentaries), or tap a
theme to gather every teaching that expresses it.

Built as a static site — all data is baked in at build time, no runtime services.

## Stack

- **Next.js 16** (App Router) + TypeScript + **Tailwind v4**
- **react-force-graph-2d** for the canvas graph
- Fonts: Cormorant (display), Spectral (English body), Frank Ruhl Libre (Hebrew)

## Data pipeline (run once; output is committed under `data/`)

The text comes from the public [Sefaria-Export](https://github.com/Sefaria/Sefaria-Export)
dataset, hosted in a public GCS bucket (`https://storage.googleapis.com/sefaria-export/...`).

```bash
npm run ingest        # fetch 108 mishnayot (He/En) + 4 core commentaries -> data/mishnayot.json
npm run tag-themes    # build data/graph.json from the curated tagging in data/themes.json
```

- `data/themes.json` holds the curated theme vocabulary, theme→theme relations,
  and the per-mishnah theme assignments (the reviewed output of an LLM tagging pass).
- Regenerate the assignments with an LLM (needs `ANTHROPIC_API_KEY`):
  ```bash
  npm run tag-themes -- --regenerate
  ```

## Develop

```bash
npm install
npm run dev        # http://localhost:3000
npm run typecheck
npm test           # graph helper unit tests
npm run build
```

## Deploy

```bash
npx vercel deploy           # preview
npx vercel deploy --prod    # production
```

(Requires a one-time `vercel login`.)

## Layout

```
app/            shell + page (renders <Explorer/>)
components/     GraphView, DetailPanel, MishnahCard, ThemeCard, SearchBar, ChapterBrowser, …
lib/            data loaders, graph helpers (+ tests), search, shared types
data/           mishnayot.json, graph.json, themes.json   (committed, build output)
scripts/        ingest.ts, tag-themes.ts, regenerate-themes.ts
```
