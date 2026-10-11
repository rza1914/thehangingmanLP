import { describe, it, expect } from "vitest";
import { getLineVariant } from "../src/utils/lineVariant";

describe("getLineVariant", () => {
  it("returns a deterministic variant for a given index (same input -> same output)", () => {
    expect(getLineVariant(0)).toEqual(getLineVariant(0));
    expect(getLineVariant(3)).toEqual(getLineVariant(3));
  });

  it("cycles through the pattern once the index exceeds the pattern length", () => {
    const first = getLineVariant(0);
    const cycled = getLineVariant(5); // pattern length is 5
    expect(cycled).toEqual(first);
  });

  it("produces non-identical shapes for consecutive indices (irregular, not uniform)", () => {
    const a = getLineVariant(0);
    const b = getLineVariant(1);
    expect(a).not.toEqual(b);
  });

  it("always returns valid percent ranges and a defined jog side", () => {
    for (let i = 0; i < 10; i += 1) {
      const variant = getLineVariant(i);
      expect(variant.startPercent).toBeGreaterThanOrEqual(0);
      expect(variant.endPercent).toBeLessThanOrEqual(100);
      expect(variant.startPercent).toBeLessThan(variant.endPercent);
      expect(["start", "end"]).toContain(variant.jogSide);
      expect(variant.jogGrowHeight).toBeGreaterThan(variant.jogHeight);
    }
  });
});