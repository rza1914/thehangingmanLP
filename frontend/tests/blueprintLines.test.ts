import { describe, it, expect } from "vitest";
import {
  buildBlueprintSegments,
  computeSegmentDrawProgress,
  computeDrawWindow,
  computeWrapperScrollProgress,
  type AnchorRect,
  type HeadingGroup
} from "../src/utils/blueprintLines";

function rect(id: string, left: number, centerY: number): AnchorRect {
  return { id, top: centerY, bottom: centerY, left, right: left, centerX: left, centerY };
}

describe("buildBlueprintSegments", () => {
  const heroAnchor = rect("hero-trunk-start", 40, 100);

  it("builds a continuous trunk spanning hero -> heading -> each item, tapering thinner with distance", () => {
    const anchorsById: Record<string, AnchorRect> = {
      "services-heading": rect("services-heading", 80, 210),
      "service-row-0": rect("service-row-0", 80, 280),
      "service-row-1": rect("service-row-1", 80, 340)
    };
    const groups: HeadingGroup[] = [{ headingId: "services-heading", itemIds: ["service-row-0", "service-row-1"] }];

    const segments = buildBlueprintSegments(heroAnchor, groups, anchorsById, 16);
    const trunkSegments = segments.filter((s) => s.level === "trunk");

    // hero->heading, heading->item0, item0->item1 = 3 trunk segments
    expect(trunkSegments.length).toBe(3);

    // Thickness decreases monotonically with distance from hero
    expect(trunkSegments[0].strokeWidth).toBeGreaterThan(trunkSegments[1].strokeWidth);
    expect(trunkSegments[1].strokeWidth).toBeGreaterThan(trunkSegments[2].strokeWidth);
  });

  it("creates one medium-width heading branch per group, thicker than item branches", () => {
    const anchorsById: Record<string, AnchorRect> = {
      "services-heading": rect("services-heading", 80, 210),
      "service-row-0": rect("service-row-0", 80, 280)
    };
    const groups: HeadingGroup[] = [{ headingId: "services-heading", itemIds: ["service-row-0"] }];

    const segments = buildBlueprintSegments(heroAnchor, groups, anchorsById, 16);
    const headingSegments = segments.filter((s) => s.level === "heading");
    const itemSegments = segments.filter((s) => s.level === "item");

    expect(headingSegments.length).toBe(1);
    expect(itemSegments.length).toBe(1);
    expect(itemSegments[0].strokeWidth).toBeLessThan(headingSegments[0].strokeWidth);
  });

  it("creates one thin item branch for every item", () => {
    const anchorsById: Record<string, AnchorRect> = {
      "services-heading": rect("services-heading", 80, 210),
      "service-row-0": rect("service-row-0", 80, 280),
      "service-row-1": rect("service-row-1", 80, 340)
    };
    const groups: HeadingGroup[] = [{ headingId: "services-heading", itemIds: ["service-row-0", "service-row-1"] }];

    const segments = buildBlueprintSegments(heroAnchor, groups, anchorsById, 16);
    expect(segments.filter((s) => s.level === "item").length).toBe(2);
  });

  it("skips an entire group whose heading anchor was not measured", () => {
    const anchorsById: Record<string, AnchorRect> = {
      "service-row-0": rect("service-row-0", 80, 280)
    };
    const groups: HeadingGroup[] = [{ headingId: "missing-heading", itemIds: ["service-row-0"] }];

    const segments = buildBlueprintSegments(heroAnchor, groups, anchorsById, 16);

    expect(segments.filter((s) => s.level === "heading" || s.level === "item").length).toBe(0);
    expect(segments.filter((s) => s.level === "trunk").length).toBe(0);
  });

  it("skips only the missing item while keeping the heading and other items", () => {
    const anchorsById: Record<string, AnchorRect> = {
      "services-heading": rect("services-heading", 80, 210),
      "service-row-0": rect("service-row-0", 80, 280)
    };
    const groups: HeadingGroup[] = [
      { headingId: "services-heading", itemIds: ["service-row-0", "missing-item"] }
    ];

    const segments = buildBlueprintSegments(heroAnchor, groups, anchorsById, 16);

    expect(segments.filter((s) => s.level === "heading").length).toBe(1);
    expect(segments.filter((s) => s.level === "item").length).toBe(1);
  });

  it("handles multiple groups, continuing the trunk across all of them in order", () => {
    const anchorsById: Record<string, AnchorRect> = {
      "services-heading": rect("services-heading", 80, 210),
      "approach-heading": rect("approach-heading", 80, 410)
    };
    const groups: HeadingGroup[] = [
      { headingId: "services-heading", itemIds: [] },
      { headingId: "approach-heading", itemIds: [] }
    ];

    const segments = buildBlueprintSegments(heroAnchor, groups, anchorsById, 16);
    expect(segments.filter((s) => s.level === "trunk").length).toBe(2);
    expect(segments.filter((s) => s.level === "heading").length).toBe(2);
  });
});

describe("computeSegmentDrawProgress", () => {
  it("returns 0 before the segment's draw window starts", () => {
    expect(computeSegmentDrawProgress(0.1, 0.3, 0.5)).toBe(0);
  });

  it("returns 1 after the segment's draw window ends", () => {
    expect(computeSegmentDrawProgress(0.9, 0.3, 0.5)).toBe(1);
  });

  it("returns a proportional value inside the window", () => {
    expect(computeSegmentDrawProgress(0.4, 0.3, 0.5)).toBeCloseTo(0.5);
  });
});

describe("computeDrawWindow", () => {
  it("centers the window on the segment's vertical ratio within the wrapper", () => {
    const [start, end] = computeDrawWindow(500, 1000, 0.2);
    expect(start).toBeCloseTo(0.4);
    expect(end).toBeCloseTo(0.6);
  });

  it("clamps the window to [0, 1] at the page edges", () => {
    const [start] = computeDrawWindow(0, 1000, 0.2);
    expect(start).toBe(0);
    const [, end] = computeDrawWindow(1000, 1000, 0.2);
    expect(end).toBe(1);
  });
});

describe("computeWrapperScrollProgress", () => {
  it("returns 0 before the wrapper enters the viewport", () => {
    expect(computeWrapperScrollProgress(2000, 1000, 800)).toBe(0);
  });

  it("returns 1 once the wrapper has fully scrolled past", () => {
    expect(computeWrapperScrollProgress(-2000, 1000, 800)).toBe(1);
  });

  it("returns an intermediate value while the wrapper is mid-scroll", () => {
    const progress = computeWrapperScrollProgress(0, 1000, 800);
    expect(progress).toBeGreaterThan(0);
    expect(progress).toBeLessThan(1);
  });
});