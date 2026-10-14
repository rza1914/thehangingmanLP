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