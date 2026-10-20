import { describe, it, expect, beforeEach } from "vitest";
import { I18nStore } from "../src/i18n/i18n";
import { renderStage, LAYOUT } from "../src/components/stage";
import { renderFooter } from "../src/components/footer";
import { CONTACT_CHANNELS, isExternalHref } from "../src/config/contact";
import { findNearDuplicates, rangeOverlapLength, type SceneLine } from "../src/scene/geometry";

const mm = (q: string) => ({
  matches: false,
  media: q,
  addEventListener() {},
  removeEventListener() {},
  addListener() {},
  removeListener() {}
});
(window as any).matchMedia = (window as any).matchMedia || mm;

const RAIL = 2340, BASE = 3150, TOPC = 2940, H2 = 900 + 270, OV = 60, LAST = 1280;
const CBASE = 300, CGAP = 60;
const X = (x: number, fa: boolean) => (fa ? 1600 - x : x);

function render(fa: boolean) {
  const i18n = new I18nStore(fa ? "fa" : "en");
  i18n.init();
  if (fa) i18n.setLocale("fa");
  const host = document.createElement("div");
  document.body.appendChild(host);
  renderStage(i18n, host);
  return { i18n, host };
}

function renderMobile(fa: boolean) {
  const orig = window.matchMedia;
  (window as any).matchMedia = (q: string) => ({
    matches: q.includes("max-width"),
    media: q,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {}
  });
  try {
    return render(fa);
  } finally {
    (window as any).matchMedia = orig;
  }
}

function parseD(d: string): [number, number, number, number] {
  const m = d.match(/M([\d.\-]+)\s+([\d.\-]+)\s+L([\d.\-]+)\s+([\d.\-]+)/);
  if (!m) throw new Error("bad d: " + d);
  return [+m[1], +m[2], +m[3], +m[4]];
}

function thickLines(host: HTMLElement): SceneLine[] {
  return Array.from(host.querySelectorAll("path.stg-ln.th")).map((p) => {
    const [x1, y1, x2, y2] = parseD(p.getAttribute("d") || "");
    return { x1, y1, x2, y2 };
  });
}

function allParseableLines(host: HTMLElement): SceneLine[] {
  return Array.from(host.querySelectorAll("path.stg-ln.th, path.stg-ln.tn")).map((p) => {
    const [x1, y1, x2, y2] = parseD(p.getAttribute("d") || "");
    return { x1, y1, x2, y2 };
  });
}

function verticalsSpanningRail(lines: SceneLine[]): SceneLine[] {
  return lines.filter(
    (l) => l.x1 === l.x2 && l.y1 === H2 - OV && l.y2 === RAIL
  );
}

beforeEach(() => {
  localStorage.clear();
  document.body.innerHTML = "";
});

describe("contact config — single source of truth", () => {
  it("has exactly the 6 required channels in order with exact data", () => {
    expect(CONTACT_CHANNELS.map((c) => c.id)).toEqual(
      ["telegram", "whatsapp", "email", "phone", "github", "x"]
    );
    expect(CONTACT_CHANNELS).toEqual([
      { id: "telegram", label: "TELEGRAM", href: "https://t.me/thehangingman1911", shown: "t.me/thehangingman1911" },
      { id: "whatsapp", label: "WHATSAPP", href: "https://wa.me/message/CCMR56KMR4R3M1", shown: "wa.me/message/CCMR56KMR4R3M1" },
      { id: "email", label: "EMAIL", href: "mailto:thehangingman.1911@gmail.com", shown: "thehangingman.1911@gmail.com" },
      { id: "phone", label: "PHONE", href: "tel:+447449768066", shown: "+44 7449 768066" },
      { id: "github", label: "GITHUB", href: "https://github.com/thehangingman1911-ai", shown: "github.com/thehangingman1911-ai" },
      { id: "x", label: "X", href: "https://x.com/rbaghani31159", shown: "x.com/rbaghani31159" },
    ]);
  });
});

describe("ITEM 3 — Contact stage restored", () => {
  it("scene config contains Contact channels (base/gap/top)", () => {
    expect(LAYOUT.desktop.channels.gap).toBe(60);
    expect(LAYOUT.desktop.channels.top).toBe(2940);
  });

  it.each([false, true])("renders 6 real links with hrefs from the config, in order (fa=%s)", (fa) => {
    const { host } = render(fa);
    const links = Array.from(host.querySelectorAll("svg a.stg-chan"));
    expect(links.length).toBe(6);
    links.forEach((a, i) => {
      expect(a.tagName.toLowerCase()).toBe("a");
      expect(a.getAttribute("href")).toBe(CONTACT_CHANNELS[i].href);
      expect(a.getAttribute("aria-label")).toContain(CONTACT_CHANNELS[i].shown);
      if (isExternalHref(CONTACT_CHANNELS[i].href)) {
        expect(a.getAttribute("target")).toBe("_blank");
        expect(a.getAttribute("rel")).toBe("noopener noreferrer");
      } else {
        expect(a.getAttribute("target")).toBeNull();
      }
    });
  });

  it.each([false, true])("6 boundary lines rise from the base, one per channel, all attached (fa=%s)", (fa) => {
    const { host } = render(fa);
    const thin = Array.from(host.querySelectorAll("path.stg-ln.tn")).map((p) => parseD(p.getAttribute("d") || ""));
    const risers = thin.filter((t) => t[0] === t[2] && t[1] === BASE && t[3] === TOPC);
    expect(risers.length).toBe(6);
    const xs = risers.map((t) => t[0]).sort((a, b) => a - b);
    const expected = [0, 1, 2, 3, 4, 5].map((i) => X(CBASE + i * CGAP, fa)).sort((a, b) => a - b);
    expect(xs).toEqual(expected);
  });

  it.each([false, true])("short rotated labels sit in the gaps, one per channel (fa=%s)", (fa) => {
    const { host } = render(fa);
    const links = Array.from(host.querySelectorAll("svg a.stg-chan"));
    expect(links.length).toBe(6);
    links.forEach((a, i) => {
      const label = a.querySelector("text.ch");
      expect(label).toBeTruthy();
      expect(label!.textContent).toBe(CONTACT_CHANNELS[i].label);
      let node: Element | null = label!.parentElement;
      let rotated = false;
      while (node && node !== host) {
        if ((node.getAttribute("transform") || "").includes("rotate(-90)")) rotated = true;
        node = node.parentElement;
      }
      expect(rotated).toBe(true);
      const m = (label!.parentElement!.getAttribute("transform") || "").match(/translate\(([\d.\-]+)/);
      expect(m).toBeTruthy();
      const lx = parseFloat(m![1]);
      const lo = Math.min(X(CBASE + i * CGAP, fa), X(CBASE + (i + 1) * CGAP, fa));
      const hi = Math.max(X(CBASE + i * CGAP, fa), X(CBASE + (i + 1) * CGAP, fa));
      expect(lx).toBeGreaterThan(lo);
      expect(lx).toBeLessThan(hi);
    });
  });

  it.each([false, true])("hover/focus shows the address caption under the bottom line (fa=%s)", (fa) => {
    const { host } = render(fa);
    const cap = host.querySelector("text.stg-cap");
    expect(cap).toBeTruthy();
    expect(cap!.textContent).toBe("");
    const first = host.querySelectorAll("svg a.stg-chan")[0];
    first.dispatchEvent(new Event("mouseenter"));
    expect(cap!.textContent).toBe(CONTACT_CHANNELS[0].shown);
    first.dispatchEvent(new Event("mouseleave"));
    expect(cap!.textContent).toBe("");
    first.dispatchEvent(new Event("focus"));
    expect(cap!.textContent).toBe(CONTACT_CHANNELS[0].shown);
    first.dispatchEvent(new Event("blur"));
    expect(cap!.textContent).toBe("");
  });

  it.each([false, true])("chain connectivity with trunk overshoot (fa=%s)", (fa) => {
    const { host } = render(fa);
    const d = Array.from(host.querySelectorAll("path.stg-ln.th")).map((p) => p.getAttribute("d"));
    const vX = X(LAST, fa);
    // V3 spans H2-OV..RAIL at last-card center
    expect(d).toContain(`M${vX} ${H2 - OV} L${vX} ${RAIL}`);
    // rail main span starts at V3 and runs inward to the margin
    const margin = X(120, fa);
    expect(d).toContain(`M${vX} ${RAIL} L${margin} ${RAIL}`);
    // trunk drops from the rail's margin corner and crosses the base with OV overshoot
    expect(d).toContain(`M${margin} ${RAIL} L${margin} ${BASE + OV}`);
    // base starts on the trunk and runs inward
    const baseFar = X(1480, fa);
    expect(d).toContain(`M${margin} ${BASE} L${baseFar} ${BASE}`);
    // CTA copy present
    expect(host.textContent).toMatch(fa ? /شروع یک پروژه/ : /Start a project/);
  });

  it.each([false, true])("mirrored correctly (fa=%s)", (fa) => {
    const { host } = render(fa);
    const lines = thickLines(host);
    expect(lines.length).toBeGreaterThan(0);
    const other = fa ? render(false).host : render(true).host;
    expect(thickLines(other).length).toBe(lines.length);
  });

  it.each([false, true])("semantic channel list reads from the config (fa=%s)", (fa) => {
    const { host } = render(fa);
    const items = host.querySelectorAll(".sr-channels a");
    expect(items.length).toBe(6);
    items.forEach((a, i) => {
      expect(a.getAttribute("href")).toBe(CONTACT_CHANNELS[i].href);
      expect(a.textContent).toContain(CONTACT_CHANNELS[i].shown);
    });
  });

  it.each([false, true])("no near-duplicate lines on this frame (fa=%s)", (fa) => {
    const { host } = render(fa);
    expect(findNearDuplicates(allParseableLines(host), 40)).toEqual([]);
  });
});

describe("contact footer reads from the config", () => {
  it.each([false, true])("footer renders 6 channel links with correct targets (fa=%s)", (fa) => {
    const i18n = new I18nStore(fa ? "fa" : "en");
    i18n.init();
    if (fa) i18n.setLocale("fa");
    const el = renderFooter(i18n);
    document.body.appendChild(el);
    const links = Array.from(el.querySelectorAll("a.footer-channel"));
    expect(links.length).toBe(6);
    links.forEach((a, i) => {
      expect(a.getAttribute("href")).toBe(CONTACT_CHANNELS[i].href);
      expect(a.textContent).toContain(CONTACT_CHANNELS[i].shown);
      if (isExternalHref(CONTACT_CHANNELS[i].href)) {
        expect(a.getAttribute("target")).toBe("_blank");
        expect(a.getAttribute("rel")).toBe("noopener noreferrer");
      } else {
        expect(a.getAttribute("target")).toBeFalsy();
      }
    });
  });
});

describe("contact mobile list reads from the config", () => {
  it.each([false, true])("one row per channel with label, address and a rule (fa=%s)", (fa) => {
    const { host } = renderMobile(fa);
    const links = Array.from(host.querySelectorAll("a.stg-chan"));
    expect(links.length).toBe(6);
    const labelY: number[] = [];
    links.forEach((a, i) => {
      expect(a.getAttribute("href")).toBe(CONTACT_CHANNELS[i].href);
      expect(a.textContent).toContain(CONTACT_CHANNELS[i].label);
      expect(a.textContent).toContain(CONTACT_CHANNELS[i].shown);
      const label = Array.from(a.querySelectorAll("text")).find((t) => t.textContent === CONTACT_CHANNELS[i].label);
      expect(label).toBeTruthy();
      labelY.push(parseFloat(label!.getAttribute("y") || "0"));
    });
    for (let i = 1; i < labelY.length; i++) {
      expect(labelY[i] - labelY[i - 1]).toBeGreaterThanOrEqual(52);
    }
    const rules = Array.from(host.querySelectorAll("path.stg-ln.tn")).map((p) => parseD(p.getAttribute("d") || ""));
    const under = rules.filter((t) => t[1] === t[3] && Math.abs(t[0] - t[2]) === 540 && t[1] >= 6900);
    expect(under.length).toBe(6);
  });
});

describe("ITEM 2 — label inside the rail with 30-unit inset", () => {
  it("EN: left edge = margin + 30, baseline RAIL-18", () => {
    const { host } = render(false);
    const labels = Array.from(host.querySelectorAll("text.stg-tx.h2")).filter((el) =>
      (el.textContent || "").match(/WHAT I BUILD/i)
    );
    expect(labels.length).toBe(1);
    expect(labels[0].getAttribute("x")).toBe(String(120 + 30));
    expect(labels[0].getAttribute("y")).toBe(String(RAIL - 18));
    expect(labels[0].getAttribute("text-anchor")).toBe("start");
  });

  it("FA: right edge = margin - 30, baseline RAIL-18", () => {
    const { host } = render(true);
    const labels = Array.from(host.querySelectorAll("text.stg-tx.h2")).filter((el) =>
      (el.textContent || "").length > 0 && (el.textContent || "").match(/چه می‌سازم/)
    );
    expect(labels.length).toBe(1);
    expect(labels[0].getAttribute("x")).toBe(String(1480 - 30));
    expect(labels[0].getAttribute("y")).toBe(String(RAIL - 18));
    expect(labels[0].getAttribute("text-anchor")).toBe("end");
  });

  it.each([false, true])("label is horizontal: no rotation transform on it or its ancestors (fa=%s)", (fa) => {
    const { host } = render(fa);
    const label = Array.from(host.querySelectorAll("text.stg-tx.h2")).find((el) =>
      fa ? (el.textContent || "").match(/چه می‌سازم/) : (el.textContent || "").match(/WHAT I BUILD/i)
    );
    expect(label).toBeTruthy();
    expect(label!.getAttribute("transform")).toBeNull();
    let node: Element | null = label!.parentElement;
    while (node && node !== host) {
      expect(node.getAttribute("transform") || "").not.toMatch(/rotate/);
      node = node.parentElement;
    }
  });

  it("label follows the line after a language switch without reload", () => {
    const i18n = new I18nStore("en");
    i18n.init();
    const host = document.createElement("div");
    document.body.appendChild(host);
    renderStage(i18n, host);
    const find = () => {
      const fa = i18n.getLocale() === "fa";
      return Array.from(host.querySelectorAll("text.stg-tx.h2")).find((el) =>
        fa ? (el.textContent || "").match(/چه می‌سازم/) : (el.textContent || "").match(/WHAT I BUILD/i)
      )!;
    };
    expect(find().getAttribute("x")).toBe(String(LAYOUT.desktop.margin.l + 30));
    i18n.setLocale("fa");
    expect(find().getAttribute("x")).toBe(String(LAYOUT.desktop.margin.r - 30));
    expect(find().getAttribute("text-anchor")).toBe("end");
    i18n.setLocale("en");
    expect(find().getAttribute("x")).toBe(String(LAYOUT.desktop.margin.l + 30));
    expect(find().getAttribute("text-anchor")).toBe("start");
  });
});

describe("ITEM 1 — single surviving vertical + narrow guard", () => {
  it.each([false, true])("last-card center x equals the surviving thick vertical x (fa=%s)", (fa) => {
    const { host } = render(fa);
    const found = verticalsSpanningRail(thickLines(host));
    expect(found.length).toBe(1);
    expect(found[0].x1).toBe(X(LAST, fa));
  });

  it.each([false, true])("duplicate guard passes on this frame (fa=%s)", (fa) => {
    const { host } = render(fa);
    expect(findNearDuplicates(thickLines(host), 40)).toEqual([]);
  });

  it("guard flags true near-duplicates but not intended joints", () => {
    // two verticals 20 apart with overlapping range -> duplicate
    const dup: SceneLine[] = [
      { x1: 1260, y1: 1110, x2: 1260, y2: 2340 },
      { x1: 1280, y1: 1110, x2: 1280, y2: 2340 },
    ];
    expect(findNearDuplicates(dup, 40).length).toBe(1);
    // rail + its OV overshoot share only the crossing point -> intended joint, not a duplicate
    const joint: SceneLine[] = [
      { x1: 1280, y1: 2340, x2: 1340, y2: 2340 },
      { x1: 1280, y1: 2340, x2: 120, y2: 2340 },
    ];
    expect(rangeOverlapLength(1280, 1340, 1280, 120)).toBeLessThanOrEqual(1);
    expect(findNearDuplicates(joint, 40)).toEqual([]);
    // contact thin verticals are 60 apart -> outside the 40 window
    const chans: SceneLine[] = [0, 1, 2, 3, 4, 5].map((i) => ({
      x1: 300 + i * 60, y1: 3150, x2: 300 + i * 60, y2: 2940,
    }));
    expect(findNearDuplicates(chans, 40)).toEqual([]);
    // perpendicular crossing is never a duplicate
    const cross: SceneLine[] = [
      { x1: 1280, y1: 1110, x2: 1280, y2: 2340 },
      { x1: 1280, y1: 1170, x2: 1480, y2: 1170 },
    ];
    expect(findNearDuplicates(cross, 40)).toEqual([]);
  });

  it("render is idempotent across re-renders and language switches", () => {
    const i18n = new I18nStore("en");
    i18n.init();
    const host = document.createElement("div");
    document.body.appendChild(host);
    for (let i = 0; i < 3; i++) {
      renderStage(i18n, host);
      expect(verticalsSpanningRail(thickLines(host)).length).toBe(1);
    }
    for (let i = 0; i < 3; i++) {
      i18n.setLocale("fa");
      expect(verticalsSpanningRail(thickLines(host)).length).toBe(1);
      expect(findNearDuplicates(thickLines(host), 40)).toEqual([]);
      i18n.setLocale("en");
      expect(verticalsSpanningRail(thickLines(host)).length).toBe(1);
      expect(findNearDuplicates(thickLines(host), 40)).toEqual([]);
    }
    window.dispatchEvent(new Event("resize"));
    expect(verticalsSpanningRail(thickLines(host)).length).toBe(1);
  });
});

describe("integration — scroll to the end shows Contact", () => {
  it.each([false, true])("bottom line, CTA and 6 channels survive several language switches (fa=%s)", (fa) => {
    const i18n = new I18nStore("en");
    i18n.init();
    const host = document.createElement("div");
    document.body.appendChild(host);
    renderStage(i18n, host);
    for (let i = 0; i < 3; i++) {
      i18n.setLocale("fa");
      i18n.setLocale("en");
    }
    i18n.setLocale(fa ? "fa" : "en");
    const d = Array.from(host.querySelectorAll("path.stg-ln.th")).map((p) => p.getAttribute("d"));
    const margin = X(120, fa);
    const baseFar = X(1480, fa);
    expect(d).toContain(`M${margin} ${BASE} L${baseFar} ${BASE}`);
    expect(host.textContent).toMatch(fa ? /شروع یک پروژه/ : /Start a project/);
    expect(host.querySelectorAll("svg a.stg-chan").length).toBe(6);
  });
});
