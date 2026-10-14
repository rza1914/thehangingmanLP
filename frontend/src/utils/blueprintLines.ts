export interface AnchorRect {
  id: string;
  top: number;
  bottom: number;
  left: number;
  right: number;
  centerX: number;
  centerY: number;
}

export type BlueprintLevel = "trunk" | "heading" | "item";

export interface BlueprintSegment {
  id: string;
  points: [number, number][];
  strokeWidth: number;
  level: BlueprintLevel;
  midY: number;
}

export interface HeadingGroup {
  headingId: string;
  itemIds: string[];
}

const TRUNK_WIDTH_HERO = 4;
const TRUNK_TAPER_STEP = 0.35;
const TRUNK_MIN_WIDTH = 1.25;
const HEADING_WIDTH = 2.25;
const ITEM_WIDTH = 1.1;

/**
 * Pure, DOM-free function: given the measured hero anchor rect, the groups
 * describing which heading owns which items, and a lookup of measured
 * anchor rects, builds the full set of straight orthogonal line segments
 * that make up the blueprint drawing:
 *
 *  - A single continuous vertical "trunk" running from the hero anchor,
 *    down through every heading and every item in order, getting
 *    progressively thinner the further it travels from the hero (thickest
 *    at the hero, tapering with distance).
 *  - One horizontal "heading" branch (medium stroke) from the trunk to
 *    each section heading.
 *  - One horizontal "item" branch (thin stroke) from the trunk to each
 *    individual item under that heading.
 *
 * No arrowheads are produced — lines are plain strokes only. The visual
 * reference with arrows previously provided by the client was for the
 * scroll-driven "pen drawing a line" animation behavior, not for the
 * arrow markers themselves.
 *
 * Groups/items whose anchor could not be measured (e.g. not yet rendered,
 * or removed) are silently skipped rather than throwing, so a partial or
 * changing DOM never crashes the drawing.
 */
export function buildBlueprintSegments(
  heroAnchor: AnchorRect,
  groups: HeadingGroup[],
  anchorsById: Record<string, AnchorRect>,
  trunkX: number
): BlueprintSegment[] {
  const segments: BlueprintSegment[] = [];
  const stopsY: number[] = [heroAnchor.centerY];
  const branches: { anchor: AnchorRect; level: "heading" | "item" }[] = [];

  groups.forEach((group) => {
    const heading = anchorsById[group.headingId];
    if (!heading) return;

    stopsY.push(heading.centerY);
    branches.push({ anchor: heading, level: "heading" });

    group.itemIds.forEach((itemId) => {
      const item = anchorsById[itemId];
      if (!item) return;
      stopsY.push(item.centerY);
      branches.push({ anchor: item, level: "item" });
    });
  });

  for (let i = 0; i < stopsY.length - 1; i += 1) {
    const y1 = stopsY[i];
    const y2 = stopsY[i + 1];
    segments.push({
      id: `trunk-${i}`,
      points: [
        [trunkX, y1],
        [trunkX, y2]
      ],
      strokeWidth: Math.max(TRUNK_WIDTH_HERO - i * TRUNK_TAPER_STEP, TRUNK_MIN_WIDTH),
      level: "trunk",
      midY: (y1 + y2) / 2
    });
  }

  branches.forEach(({ anchor, level }) => {
    segments.push({
      id: `${level}-${anchor.id}`,
      points: [
        [trunkX, anchor.centerY],
        [anchor.left, anchor.centerY]
      ],
      strokeWidth: level === "heading" ? HEADING_WIDTH : ITEM_WIDTH,
      level,
      midY: anchor.centerY
    });
  });

  return segments;
}

/**
 * Pure function: given the overall scroll progress through the blueprint
 * zone (0 = not entered yet, 1 = fully scrolled past) and a segment's own
 * draw window [start, end] on that same 0-1 scale, returns how "drawn"
 * that segment should currently be (0 = invisible, 1 = fully drawn).
 */
export function computeSegmentDrawProgress(globalProgress: number, start: number, end: number): number {
  if (end <= start) return globalProgress >= start ? 1 : 0;
  const raw = (globalProgress - start) / (end - start);
  return Math.min(1, Math.max(0, raw));
}

/**
 * Pure function: computes a segment's [start, end] draw window on the 0-1
 * scale based on its vertical midpoint relative to the wrapper's total
 * height, so segments near the top of the page draw early in the scroll
 * and segments further down draw later — producing the sensation of the
 * line being drawn as the user follows it down the page.
 */
export function computeDrawWindow(midY: number, wrapperHeight: number, windowSize = 0.16): [number, number] {
  if (wrapperHeight <= 0) return [0, 1];
  const ratio = Math.min(1, Math.max(0, midY / wrapperHeight));
  const start = Math.max(0, ratio - windowSize / 2);
  const end = Math.min(1, ratio + windowSize / 2);
  return [start, end];
}

/**
 * Pure function: the standard "scroll progress through an element"
 * formula. Returns 0 before the wrapper enters the viewport and 1 once it
 * has fully scrolled past.
 */
export function computeWrapperScrollProgress(wrapperTop: number, wrapperHeight: number, viewportHeight: number): number {
  const total = wrapperHeight + viewportHeight;
  if (total <= 0) return 0;
  const raw = (viewportHeight - wrapperTop) / total;
  return Math.min(1, Math.max(0, raw));
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function isMobileViewport(breakpoint = 860): boolean {
  return typeof window !== "undefined" && window.innerWidth <= breakpoint;
}

const SVG_NS = "http://www.w3.org/2000/svg";

/**
 * Wires the pure segment-building/progress functions above to the real DOM:
 * measures anchor elements marked with [data-blueprint-anchor], draws the
 * resulting SVG path segments (plain lines, no arrowheads) into an overlay
 * inside `wrapper`, and ties each segment's "drawn-ness" to the user's
 * scroll position through the wrapper (a pen-on-blueprint drawing effect).
 * Call `recompute()` after any re-render that changes layout or text (e.g.
 * a language switch) so anchor positions are re-measured.
 */
export class BlueprintLines {
  private wrapper: HTMLElement;
  private svg: SVGSVGElement;
  private penDot: SVGCircleElement;
  private groups: HeadingGroup[];
  private rafId: number | null = null;
  private active = false;

  constructor(wrapper: HTMLElement, groups: HeadingGroup[]) {
    this.wrapper = wrapper;
    this.groups = groups;

    this.svg = document.createElementNS(SVG_NS, "svg") as SVGSVGElement;
    this.svg.setAttribute("class", "blueprint-svg");
    this.svg.setAttribute("aria-hidden", "true");

    this.penDot = document.createElementNS(SVG_NS, "circle") as SVGCircleElement;
    this.penDot.setAttribute("class", "blueprint-pen");
    this.penDot.setAttribute("r", "4");

    this.wrapper.prepend(this.svg);

    window.addEventListener("resize", this.handleResize);
    window.addEventListener("scroll", this.handleScroll, { passive: true });

    this.recompute();
  }

  private handleResize = (): void => {
    this.recompute();
  };

  private handleScroll = (): void => {
    if (this.rafId !== null) return;
    this.rafId = requestAnimationFrame(() => {
      this.rafId = null;
      this.updateDrawProgress();
    });
  };

  private getAnchorRect(el: HTMLElement, wrapperRect: DOMRect): AnchorRect {
    const rect = el.getBoundingClientRect();
    return {
      id: el.dataset.blueprintAnchor || "",
      top: rect.top - wrapperRect.top,
      bottom: rect.bottom - wrapperRect.top,
      left: rect.left - wrapperRect.left,
      right: rect.right - wrapperRect.left,
      centerX: rect.left - wrapperRect.left + rect.width / 2,
      centerY: rect.top - wrapperRect.top + rect.height / 2
    };
  }

  /**
   * Re-measures every anchor and re-draws the blueprint. Must be called
   * after any DOM change affecting layout or anchor positions (resize,
   * language switch re-render). Safe to call repeatedly.
   */
  recompute(): void {
    if (isMobileViewport()) {
      this.active = false;
      this.svg.innerHTML = "";
      this.svg.style.display = "none";
      return;
    }

    this.svg.style.display = "block";
    this.active = true;

    const wrapperRect = this.wrapper.getBoundingClientRect();
    this.svg.setAttribute("width", String(wrapperRect.width));
    this.svg.setAttribute("height", String(wrapperRect.height));
    this.svg.setAttribute("viewBox", `0 0 ${wrapperRect.width} ${wrapperRect.height}`);

    const heroEl = this.wrapper.querySelector<HTMLElement>('[data-blueprint-anchor="hero-trunk-start"]');
    if (!heroEl) return;
    const heroAnchor = this.getAnchorRect(heroEl, wrapperRect);

    const anchorsById: Record<string, AnchorRect> = {};
    this.wrapper.querySelectorAll<HTMLElement>("[data-blueprint-anchor]").forEach((el) => {
      const key = el.dataset.blueprintAnchor as string;
      anchorsById[key] = this.getAnchorRect(el, wrapperRect);
    });

    const isRtl = document.documentElement.dir === "rtl";
    const mainRect = document.querySelector('main, #root, .app')?.getBoundingClientRect();
    const gutter = 32;
    let trunkX: number;
    if (isRtl) {
      // RTL: position trunk from the opposite side of the main content area
      trunkX = mainRect ? mainRect.left + gutter : wrapperRect.width - gutter;
    } else {
      // LTR: position trunk from the start of the main content area
      trunkX = mainRect ? mainRect.left + gutter : gutter;
    }

    const segments = buildBlueprintSegments(heroAnchor, this.groups, anchorsById, trunkX);

    this.svg.innerHTML = "";
    const reduced = prefersReducedMotion();

    segments.forEach((segment) => {
      const path = document.createElementNS(SVG_NS, "path");
      const [[x1, y1], [x2, y2]] = segment.points;
      path.setAttribute("d", `M${x1},${y1} L${x2},${y2}`);
      path.setAttribute("stroke-width", String(segment.strokeWidth));
      path.setAttribute("class", `blueprint-segment blueprint-segment--${segment.level}`);
      path.setAttribute("fill", "none");
      path.dataset.midY = String(segment.midY);
      this.svg.appendChild(path);

      const length = typeof path.getTotalLength === "function" ? path.getTotalLength() : 0;
      path.style.strokeDasharray = `${length}`;
      path.style.strokeDashoffset = reduced ? "0" : `${length}`;
    });

    this.svg.appendChild(this.penDot);
    this.updateDrawProgress();
  }

  private updateDrawProgress(): void {
    if (!this.active) return;
    const wrapperRect = this.wrapper.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const reduced = prefersReducedMotion();
    const globalProgress = reduced
      ? 1
      : computeWrapperScrollProgress(wrapperRect.top, wrapperRect.height, viewportHeight);

    const paths = this.svg.querySelectorAll<SVGPathElement>(".blueprint-segment");
    let penY = 0;
    let penX = 0;

    paths.forEach((path) => {
      const midY = Number(path.dataset.midY || "0");
      const [start, end] = computeDrawWindow(midY, wrapperRect.height);
      const drawProgress = reduced ? 1 : computeSegmentDrawProgress(globalProgress, start, end);
      const length = typeof path.getTotalLength === "function" ? path.getTotalLength() : 0;
      path.style.strokeDashoffset = `${length * (1 - drawProgress)}`;

      if (drawProgress > 0.01) {
        penY = midY;
        const d = path.getAttribute("d") || "";
        const match = d.match(/M([\d.]+),/);
        if (match) penX = Number(match[1]);
      }
    });

    this.penDot.setAttribute("cx", String(penX));
    this.penDot.setAttribute("cy", String(penY));
  }

  destroy(): void {
    window.removeEventListener("resize", this.handleResize);
    window.removeEventListener("scroll", this.handleScroll);
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    this.svg.remove();
  }
}