import { describe, it, expect } from "vitest";
import { LAYOUT } from "../src/components/stage";

const d = LAYOUT.desktop;
const m = LAYOUT.mobile;

describe("stage layout invariants", () => {
  it("margins are symmetric around the canvas centre", () => {
    expect(d.margin.l).toBe(1600 - d.margin.r);
    expect(d.margin.l + d.margin.r).toBe(1600);
  });

  it("structural coordinates sit on the 30-unit rhythm", () => {
    [d.trunk.x1, d.trunk.x2, d.h2, d.h3, d.channels.top].forEach((v: number) => {
      expect(v % 30).toBe(0);
    });
  });

  it("channel lines are evenly spaced with a fixed gap", () => {
    expect(d.channels.gap).toBe(60);
    expect(d.channels.base % d.channels.gap).toBe(0);
  });

  it("camera glide windows are ordered and inside the scroll range", () => {
    const w = d.cam as ReadonlyArray<readonly [number, number]>;
    expect(w.length).toBeGreaterThan(0);
    let last = 0;
    w.forEach((pair: readonly [number, number]) => {
      expect(pair[0]).toBeGreaterThanOrEqual(0);
      expect(pair[1]).toBeLessThanOrEqual(1);
      expect(pair[0]).toBeLessThan(pair[1]);
      expect(pair[0]).toBeGreaterThanOrEqual(last);
      last = pair[1];
    });
  });

  it("mobile world is five frames and the pan matches", () => {
    expect(m.world).toBe(5 * m.frame);
    expect(m.pan).toBe(m.world - m.frame);
    expect(m.spine).toBeGreaterThan(0);
    expect(m.spine).toBeLessThan(d.margin.l);
  });
});