# The Hanging Man — Polish Pass Report

Role: executor | Type: polish pass (quality, no new features, no redesign) | Project: the-hanging-man

## Method

Every visual/layout claim was to be verified with real-browser measurement (Playwright) at the owner's
sizes, in EN and FA (RTL), after switching language several times without reload:

320x640, 390x844, 768x1024, 860x700, 1280x720, 1440x800, 1607x670, 1887x661, 1920x1080, 2560x1440.

**Environment limitation:** this session had no network access, so `@playwright/test`, Playwright
browsers, Chrome (Lighthouse), `eslint`, and `prettier` could not be installed. Browser-based
measurements (Lighthouse, Playwright screenshots, axe violations, console warnings) are therefore NOT
available here. Source-level measurements (tests, TypeScript, bundle sizes, `verify-scene.mjs`) are
reported below and must be re-measured in a browser environment by the owner.

## npm run check

`npm run check` = `typecheck && lint && test && build && e2e`.

- `typecheck` (`tsc --noEmit`): **passes** (strict, no `any`)
- `lint` (`eslint src tests`): config added; not runnable (eslint not installed)
- `test` (`vitest run`): **114 tests / 11 files, all passing**
- `build` (`tsc --noEmit && vite build`): **passes**
- `e2e` (`playwright test`): config + suite added; not runnable (no browsers installed)

## Measurements (before → after, source-level)

| Metric | Before | After | Δ | Target |
|---|---|---|---|---|
| Unit tests | 114 pass | 114 pass | 0 | all pass |
| TypeScript strict | pass | pass | — | pass |
| JS bundle raw/gzip | 41.09 / 16.11 kB | 44.03 / 17.66 kB | +2.94 / +1.55 kB | — |
| CSS bundle raw/gzip | 19.18 / 4.62 kB | 19.38 / 4.67 kB | +0.20 / +0.05 kB | — |
| HTML bundle raw/gzip | 1.85 / 0.91 kB | 2.66 / 1.08 kB | +0.81 / +0.17 kB | — |

## Lighthouse (not measurable in this session)

| | Desktop | Mobile | Target |
|---|---|---|---|
| Performance | — | — | ≥ 95 / ≥ 85 |
| CLS | — | — | < 0.02 |
| LCP (mobile) | — | — | < 2.5 s |
| TBT | — | — | < 150 ms |
| INP | — | — | < 200 ms |

To complete: `npm run build` then run Lighthouse against `npx vite preview` on Chromium (4x CPU
throttle for mobile).

## Accessibility (axe)

| | Before | After | Target |
|---|---|---|---|
| Serious/critical violations | not measurable | not measurable | 0 |

To complete: run the Playwright e2e suite (`npm run e2e`) on Chromium/Firefox/WebKit with
`@axe-core/playwright` installed; `checkA11y` must report zero serious/critical on every state.

## Screenshots

Per-viewport × language screenshots belong in `docs/polish/after/`. Not capturable in this session
(no Playwright browsers). The e2e suite at `frontend/tests/e2e/contact-stage.spec.ts` captures them
on failure and can be extended to capture all matrix states.

## Deviations from the assumptions

1. **Google Fonts not removed.** `index.html` still loads `fonts.googleapis.com` (Jost + Vazirmatn).
   `public/fonts/` is empty — no self-hosted woff2 subset files exist. Removing the request would change
   the look (fallback to system fonts). → `needs_owner_decision`: owner must supply `public/fonts/Jost`
   and `public/fonts/Vazirmatn` woff2 subsets, then the request can be removed and `@font-face` +
   `font-display: swap` + `size-adjust` fallbacks added.
2. **fa.json copy is corrupted.** Several strings contain injected non-Persian text
   (e.g. "progetto", "Dopo", "José", "pequeños", "independiente", "y"). Copy may not be changed per the
   polish scope ("do not change copy"), so this is reported only. It may cause FA text overflow/clipping
   and should be corrected by the owner with approved Persian copy.
3. **Multiple breakpoints.** Code uses `max-width:820px` (stage mobile, header nav), `max-width:860px`
   (depthField, 3D cards, components.css), `max-width:720px` (header nav in CSS). `src/tokens.ts`
   defines a single `BREAKPOINT = 860`, but wiring all `matchMedia` calls to it would change the look at
   820–860px widths. → deferred to `needs_owner_decision`.
4. **Contact data duplication.** `src/config.ts` still holds a `social` block that overlaps
   `src/config/contact.ts`. Left in place to avoid changing the look/behavior of anything that reads
   `config.social`. → candidate for cleanup in a follow-up, separately revertible.
5. **Contrast / focus-outline changes.** No token-opacity or focus-appearance changes were made, because
   any such change alters the look and must be owner-approved. The existing `--dim` (0.58) is estimated
   ≈5:1 on black (passes 4.5:1) but was not instrument-measured. → needs measurement in browser.

## needs_owner_decision (changes that would alter the look)

| # | What | Why it changes the look | Screenshot ref |
|---|---|---|---|
| 1 | Remove Google Fonts; self-host Jost + Persian font | System fallback differs from Jost/Vazirmatn | n/a (font files missing) |
| 2 | Unify breakpoints to 860px | Stage/header switch mobile at a different width | n/a |
| 3 | Raise `--dim` opacity for contrast | Text becomes brighter | n/a |
| 4 | Add visible focus outlines where absent | New outline rings on interactive elements | n/a |
| 5 | Replace drop-shadow/filter groups with cheaper equivalent | May differ visually from current shadows | n/a |

No copy, colors, line-scene behavior, card styling, 3D depth look, or backend code was changed.
