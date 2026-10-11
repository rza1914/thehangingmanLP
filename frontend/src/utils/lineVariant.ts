export interface LineVariant {
  startPercent: number;
  endPercent: number;
  jogSide: "start" | "end";
  jogHeight: number;
  jogGrowHeight: number;
}

// A fixed, hand-tuned sequence of irregular divider shapes: varying length,
// varying start offset, and alternating which side the vertical "jog" tick
// sits on. Deliberately NOT random (Math.random) so rendering is
// deterministic and testable, while still reading as irregular/blueprint-like
// rather than a uniform grid of identical lines.
const VARIANTS: LineVariant[] = [
  { startPercent: 0, endPercent: 88, jogSide: "end", jogHeight: 28, jogGrowHeight: 110 },
  { startPercent: 18, endPercent: 100, jogSide: "start", jogHeight: 18, jogGrowHeight: 92 },
  { startPercent: 0, endPercent: 64, jogSide: "end", jogHeight: 24, jogGrowHeight: 118 },
  { startPercent: 10, endPercent: 100, jogSide: "start", jogHeight: 32, jogGrowHeight: 96 },
  { startPercent: 0, endPercent: 46, jogSide: "end", jogHeight: 20, jogGrowHeight: 104 }
];

/**
 * Returns a deterministic, irregular divider-line variant for the nth
 * divider in a blueprint-style list (used by Services and Approach).
 * Cycles through a fixed set of length/offset/jog combinations so
 * consecutive dividers never look identical, evoking a technical drawing
 * rather than a uniform grid — while remaining fully deterministic for
 * predictable rendering and testability (no Math.random).
 */
export function getLineVariant(index: number): LineVariant {
  return VARIANTS[index % VARIANTS.length];
}