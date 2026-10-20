# The Hanging Man — Polish Pass Baseline (STEP 0)

Recorded before any polish changes. Environment: Windows, Node v22.17.0, npm 11.18.0.
Network unavailable — Playwright browsers and `@playwright/test`/`@axe-core/playwright`/`eslint`/`prettier`
could NOT be installed, so browser-based measurements (Lighthouse, Playwright screenshots, axe) are NOT
available in this session. Only source-level measurements are reported here.

## Baseline measurements (before)

| Metric | Value |
|---|---|
| Unit tests | 11 files / 114 tests, all passing (`npm run test`) |
| TypeScript strict (`tsc --noEmit`) | passes, exit 0 |
| Bundle: JS (raw / gzip) | 41.09 kB / 16.11 kB |
| Bundle: CSS (raw / gzip) | 19.18 kB / 4.62 kB |
| Bundle: index.html (raw / gzip) | 1.85 kB / 0.91 kB |
| ESLint | not installed (config added, not runnable) |
| Prettier | not installed (config added, not runnable) |
| Lighthouse desktop/mobile | not measurable (no Chrome) |
| Playwright screenshots per viewport x language | not measurable (no browsers) |
| axe violations | not measurable (no `@axe-core/playwright`) |
| Console warnings | not measurable (no browser) |

## Known deviations from the polish assumptions (baseline)

- `index.html` loads Google Fonts (`fonts.googleapis.com`) — P0-3 requires removal, but no self-hosted
  woff2 subset files exist in `public/fonts/`, so removal would change the look (Jost/Vazirmatn fall back
  to system fonts). Flagged in `needs_owner_decision`.
- `stage.ts` is 644 lines and mixes scene-graph / scroll engine / 3D cards — P0-9 split candidate.
- Two breakpoints in TS: `max-width:820px` (stage mobile, header nav) and `max-width:860px`
  (depthField, 3D cards, components.css); P0-2 wants a single 860px source.
- `config.ts` duplicates contact/social data that should live only in `src/config/contact.ts`.
- `src/i18n/i18n.ts` and `src/components/stage.ts` use `any`.
- `fa.json` contains corrupted copy (Italian words injected: "progetto", "Dopo", "José", "pequeños",
  "independiente") — copy may not be changed per the polish scope, flagged as a deviation.
- Contact form has NO submit handler, no offline/5xx handling — P0-5.
- No `frontend/public/_headers`, no robots.txt, no sitemap.xml.
- No ESLint/Prettier, no `npm run check`.
- `variables.css` references undefined tokens (`--max-width`, `--space-*`, `--border-color`,
  `--text-secondary`, `--radius-md`).

## Files changed in this pass (after)

- frontend/package.json — added `lint`/`format`/`typecheck`/`e2e`/`check` scripts + eslint/prettier devDeps
- frontend/.eslintrc.json, frontend/.prettierrc, frontend/.prettierrc — new
- frontend/public/_headers, frontend/public/robots.txt, frontend/public/sitemap.xml — new
- frontend/index.html — hreflang, canonical, og:locale alternates, JSON-LD scaffold
- frontend/src/tokens.ts — new design-token module
- frontend/src/styles/variables.css — defined previously-undefined tokens
- frontend/src/scheduler.ts — new shared rAF scheduler
- frontend/src/main.ts — try/catch resilience, idle init, shared scheduler cursor, API validation, feature detection
- frontend/src/components/depthField.ts — shared scheduler, batched scroll reads, pause on hidden
- frontend/src/components/contact.ts — submit handler, offline/5xx, inputmode, reserved status space
- frontend/src/components/stage.ts — split into stage.ts / stage-scroll.ts / stage-cards.ts (behavior preserved; 114 tests still pass)
- frontend/src/components/stage-scroll.ts, frontend/src/components/stage-cards.ts — new
- frontend/src/i18n/i18n.ts — removed `any`, JSON-LD sync on language switch
- frontend/scripts/verify-scene.mjs — new static verifier
- frontend/tests/e2e/contact-stage.spec.ts — new Playwright suite (requires browsers)
- frontend/playwright.config.ts — new

## After measurements (post-change, source-level)

| Metric | Value | Δ vs before |
|---|---|---|
| Unit tests | 11 files / 114 tests, all passing | 0 (unchanged) |
| TypeScript strict | passes | — |
| Bundle: JS (raw / gzip) | 44.03 kB / 17.66 kB | +2.94 kB / +1.55 kB gz |
| Bundle: CSS (raw / gzip) | 19.38 kB / 4.67 kB | +0.20 kB / +0.05 kB gz |
| Bundle: index.html (raw / gzip) | 2.66 kB / 1.08 kB | +0.81 kB / +0.17 kB gz (JSON-LD + hreflang) |

Browser-based measurements (Lighthouse, Playwright screenshots, axe, console warnings) remain
not measurable in this environment; they must be re-run by the owner after installing
`@playwright/test`, Playwright browsers, and Chrome for Lighthouse.
