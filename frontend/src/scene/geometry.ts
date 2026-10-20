import { VIEWBOX_W } from "./config";

export function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

export function windowProgress(p: number, start: number, end: number): number {
  if (end <= start) return p >= start ? 1 : 0;
  return clamp((p - start) / (end - start), 0, 1);
}

export function mirrorX(x: number): number {
  return VIEWBOX_W - x;
}

export function isMultipleOf30(n: number, tolerance = 0.001): boolean {
  return Math.abs((n / 30) - Math.round(n / 30)) < tolerance;
}

export function checkRhythm(coords: number[]): boolean {
  return coords.every(c => isMultipleOf30(c));
}

export function checkCrossing(x1: number, x2: number, overshoot: number): boolean {
  return Math.abs(x1 - x2) === overshoot || x1 === 0 || x2 === VIEWBOX_W;
}

export function checkMonotonicWindows(windows: [number, number][]): boolean {
  for (let i = 1; i < windows.length; i++) {
    if (windows[i][0] < windows[i - 1][0]) return false;
  }
  return true;
}

export interface SceneLine { x1: number; y1: number; x2: number; y2: number }

function isVertical(l: SceneLine): boolean { return l.x1 === l.x2 && l.y1 !== l.y2; }
function isHorizontal(l: SceneLine): boolean { return l.y1 === l.y2 && l.x1 !== l.x2; }

/** Overlap length of two 1D ranges; intended joints touch at a point (length ~0). */
export function rangeOverlapLength(a1: number, a2: number, b1: number, b2: number): number {
  const lo = Math.max(Math.min(a1, a2), Math.min(b1, b2));
  const hi = Math.min(Math.max(a1, a2), Math.max(b1, b2));
  return hi - lo;
}

/**
 * Narrow near-duplicate guard (test-only; never used to delete lines at render).
 * Flags ONLY same-orientation lines that are closer than `threshold` scene units
 * AND whose ranges overlap by more than a point AND that are not an intended
 * crossing/joint. Perpendicular crossings are never duplicates (orientation differs).
 * Collinear segments meeting end-to-end (e.g. rail + its OV overshoot sharing one
 * point) are an intended joint, not a duplicate.
 */
export function findNearDuplicates(lines: SceneLine[], threshold = 40): Array<[number, number]> {
  const out: Array<[number, number]> = [];
  for (let i = 0; i < lines.length; i++) {
    for (let j = i + 1; j < lines.length; j++) {
      const a = lines[i], b = lines[j];
      const bothV = isVertical(a) && isVertical(b);
      const bothH = isHorizontal(a) && isHorizontal(b);
      if (!bothV && !bothH) continue; /* intended crossing across orientations */
      if (bothV) {
        if (Math.abs(a.x1 - b.x1) >= threshold) continue;
        if (rangeOverlapLength(a.y1, a.y2, b.y1, b.y2) <= 1) continue; /* end-to-end joint */
        out.push([i, j]);
      } else {
        if (Math.abs(a.y1 - b.y1) >= threshold) continue;
        if (rangeOverlapLength(a.x1, a.x2, b.x1, b.x2) <= 1) continue; /* end-to-end joint */
        out.push([i, j]);
      }
    }
  }
  return out;
}