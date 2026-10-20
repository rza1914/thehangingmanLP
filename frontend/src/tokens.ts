/* Design tokens — single source of truth for palette, type scale, spacing rhythm,
   line weights, easing, durations and z-index layers.
   Every constant below encodes a design rule. Do not change values without owner sign-off.
   Values mirror src/styles/variables.css so there is one source of truth per value. */

/* ── Palette (black & white only, per approved look) ── */
export const PALETTE = {
  bg: '#000',
  text: '#fff',
  body: 'rgba(255,255,255,0.78)',
  dim: 'rgba(255,255,255,0.58)',
  dimSoft: 'rgba(255,255,255,0.72)',
  hair: 'rgba(255,255,255,0.22)',
  hairStrong: 'rgba(255,255,255,0.45)',
} as const;

/* ── Type scale ── */
export const TYPE = {
  sans: "'Jost','Vazirmatn','Helvetica Neue',Arial,sans-serif",
  fa: "'Vazirmatn','Jost',sans-serif",
  track: '0.3em',   /* letter-spacing for EN headings/labels; 0 for FA */
  lineHeight: 1.6,
} as const;

/* ── Spacing rhythm ──
   The SVG scene uses a 30-unit rhythm (scene/config.ts RHYTHM = 30). CSS spacing
   below is the page-space equivalent used by components; values match existing
   usage so nothing shifts. */
export const SPACE = {
  1: '8px',
  2: '16px',
  3: '24px',
  4: '32px',
  6: '48px',
  8: '64px',
} as const;

/* ── Breakpoints ──
   Single source: 860px. Used in CSS (variables.css/components.css) and TS (matchMedia).
   Never introduce a second breakpoint without updating both sides. */
export const BREAKPOINT = 860;
export const MQ = {
  mobile: `(max-width: ${BREAKPOINT}px)`,
  desktop: `(min-width: ${BREAKPOINT + 1}px)`,
} as const;

/* ── Line weights (scene units) ── */
export const LINE = {
  hair: 1,
  thin: 1,
  thick: 3,
  hero: 4,
  cardStroke: 1.15,
} as const;

/* ── Easing curves ── */
export const EASE = {
  standard: 'cubic-bezier(0.22, 0.7, 0.3, 1)',
  easeOut: 'cubic-bezier(0.5, 0, 0.2, 1)',
} as const;

/* ── Durations ── */
export const DURATION = {
  fast: '0.3s',
  normal: '0.6s',
  write: '3.2s',
  resolve: '1.6s',
} as const;

/* ── z-index layers ── */
export const Z_INDEX = {
  depthField: 0,
  decorative: 3,
  header: 5,
} as const;

/* ── Scene units ── */
export const SCENE = {
  rhythm: 30,   /* all structural scene coordinates are multiples of 30 */
  overshoot: 60,
} as const;

export type Palette = typeof PALETTE;
export type TokenSpace = typeof SPACE;
