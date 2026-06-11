# Push Avot Explorer to excellence

Goal: best-in-class app for *understanding Pirkei Avot and how it all interconnects*.
Acceptance: each feature verified in preview; typecheck + tests + build pass; committed & pushed.

## Interconnection (core)
- [x] Related teachings on MishnahCard — other mishnayot sharing themes, ranked by overlap, shared themes named
- [x] Related themes on ThemeCard — theme↔theme relations surfaced as chips
- [x] Sages layer — data/sages.json (69 sages: name/Hebrew/era/bio; 84 attributed refs incl. multi-voice), sage line on card, SageCard, sage focus on graph
- [x] Theme orbs sized by number of teachings (themeWeights)
- [x] Hover preview tooltip on graph nodes (ref + sage + first lines / theme + count + blurb)

## Shareability / navigation
- [x] URL deep-links (?n=…&f=…, replaceState; restored on load incl. centering after engine settle)
- [x] Keyboard: ←/→ prev/next mishnah; Esc cascade (about → panel → browser → focus)
- [x] Search: arrow-key navigation, active row highlight, sages searchable (En + He)

## Orientation & polish
- [x] Legend (star/orb) + "Begin at the beginning · 1:1" entry point
- [x] About panel: how to use + Sefaria/Kulp attribution
- [x] Mobile: bottom-sheet detail panel, full-width chapter browser, stacked top bar, focus pill at bottom
- [x] OG/twitter metadata
- [x] Chapter browser rows show sage names
- [x] Graph loading placeholder; camera no longer yanked by zoomToFit after an early centerAt (bug found in preview, fixed)

## Verify
- [x] eslint clean, tsc clean, 16/16 vitest (incl. new sages integrity tests + graph helper tests), next build OK
- [x] Preview (DOM-eval): 1:1 card (sage/themes/6 connected/4 commentaries), sage flow, theme flow, search kbd nav, ←/→ walk, Esc cascade, About, deep-link cold load, mobile 375px layout (no overlaps)
- [x] Chain of transmission panel (data + ChainPanel + Explorer side-panel slot, 17/17 tests)
- [x] Commit (local) — push blocked: repo has no remote; creating a new GitHub repo was denied by the permission classifier, left for the user

## Results
- New: lib/sages.ts (+tests), data/sages.json, SageCard, AboutPanel; graph helpers relatedMishnayot/relatedThemes/themeWeights (+tests)
- Rewritten: Explorer (focus union + URL state + keyboard), GraphView (weights, tooltip, camera fixes, loading), DetailPanel (3 card types), MishnahCard, ThemeCard, SearchBar, search.ts
- Known environment limit: preview window is hidden ⇒ rAF suspended ⇒ canvas hover/click not synthetically testable; wiring follows the proven react-force-graph API

## Lessons
- This preview environment can report a 0×0 viewport ("native size") and document.hidden=true: resize explicitly, and don't burn time trying to drive canvas rAF-based interaction synthetically — verify via DOM/state instead.
- force-graph listens to pointermove/pointerdown only (not mousemove) — synthetic tests must use PointerEvent.
