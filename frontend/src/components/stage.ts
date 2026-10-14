import { I18nStore } from "../i18n/i18n";
import { t } from "../i18n/i18n";
import { config } from "../config";

const NS = "http://www.w3.org/2000/svg";

/* module-level constants for LAYOUT export */
const F = 900;
const WORLD_D = 4 * F;
const X1 = 600, X2 = 1260, OV = 60;
const H2 = F + 270;
const H3 = 2 * F + 450;
const RAIL = 2340;
const BASE = 3150;
const TOPC = 2940;
const CAM: Array<[number, number]> = [[0.28, 0.38], [0.56, 0.66], [0.82, 0.90]];
const MWF = 1600, WORLD_M = 8000, PAN_M = 6400;

export const LAYOUT = {
  desktop: {
    frame: F, world: WORLD_D,
    margin: { l: 120, r: 1480 },
    trunk: { x1: X1, x2: X2 },
    h2: H2, h3: H3,
    rail: RAIL, base: BASE, topc: TOPC,
    channels: { base: X1 - 300, gap: 60, top: TOPC },
    cam: CAM,
  },
  mobile: {
    frame: MWF, world: WORLD_M, pan: PAN_M, spine: 70,
  },
} as const;

type Dict = any;

interface Item {
  el: SVGElement; s: number; e: number; isLine: boolean; dir?: number;
  x1?: number; y1?: number; x2?: number; y2?: number;
}
interface SlotDef { f: number; x: number; y: number; w: number; h: number; label: string; src: string; href: string; }

let teardown: (() => void) | null = null;
let currentHost: HTMLElement | null = null;
let currentStore: I18nStore | null = null;
let modeDesktop = true;
const wired = new WeakSet<object>();

function svgEl(tag: string, attrs: Record<string, string | number>, parent: Element): SVGElement {
  const el = document.createElementNS(NS, tag);
  Object.keys(attrs).forEach((k) => el.setAttribute(k, String(attrs[k])));
  parent.appendChild(el);
  return el;
}
const clamp = (v: number): number => Math.max(0, Math.min(1, v));
const ss = (a: number, b: number, p: number): number => {
  const q = clamp((p - a) / (b - a));
  return q * q * (3 - 2 * q);
};

export function renderStage(i18n: I18nStore, host: HTMLElement): void {
  if (teardown) { teardown(); teardown = null; }
  currentHost = host;
  currentStore = i18n;

  const dict: Dict = i18n.getDict();
  const fa: boolean = dict.meta.lang === "fa";
  const calm: boolean = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobile: boolean = matchMedia("(max-width:820px)").matches;
  modeDesktop = !mobile;

  host.textContent = "";

  /* semantic copy for screen readers and search engines */
  const sr = document.createElement("div");
  sr.className = "sr-only";
  const h1 = document.createElement("h1");
  h1.textContent = "The Hanging Man";
  const lead = document.createElement("p");
  lead.textContent = t(dict, "stage.srLead");
  sr.append(h1, lead);
  host.appendChild(sr);

  /* the stage — on mobile, a simplified centered "credits cut" of the same film */
  const wrap = document.createElement("div");
  wrap.className = "stage-wrap" + (mobile ? " stage-wrap--m" : "");
  const stageBox = document.createElement("div");
  stageBox.className = "stage";
  wrap.appendChild(stageBox);
  host.appendChild(wrap);

  const svg = svgEl("svg", {
    viewBox: mobile ? "0 0 800 1600" : "0 0 1600 900",
    preserveAspectRatio: "xMidYMid meet",
  }, stageBox);
  if (mobile) svg.setAttribute("class", "stg-m");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", t(dict, "stage.ariaLabel"));

  const slotsG = svgEl("g", { class: "stg-slots" }, svg);
  const lines = svgEl("g", { class: "stg-glow" }, svg);
  const texts = svgEl("g", {}, svg);
  const pen = svgEl("circle", { class: "stg-pen", r: mobile ? 7 : 5, cx: 0, cy: 0 }, svg);

  const X = (x: number): number => (fa ? (mobile ? 800 : 1600) - x : x);

  const cfgAny: any = config as any;
  const ch = (k: string): string => {
    const s = cfgAny.social;
    const v = s && typeof s === "object" ? s[k] : undefined;
    const out = v !== undefined ? v : cfgAny[k];
    return typeof out === "string" ? out : "";
  };

  const items: Item[] = [];
  const segs: Item[] = [];
  const slots: Array<{ g: SVGElement; f: number }> = [];
  let hint: SVGElement | null = null;
  let foot: SVGElement | null = null;

  const ln = (cls: string, x1: number, y1: number, x2: number, y2: number, s: number, e: number, parent?: SVGElement): Item => {
    const el = svgEl("path", {
      class: "stg-ln " + cls,
      d: "M" + X(x1) + " " + y1 + " L" + X(x2) + " " + y2,
      pathLength: 1,
    }, parent || lines);
    const it: Item = { el, s, e, isLine: true, x1: X(x1), y1, x2: X(x2), y2 };
    items.push(it);
    if (cls === "th") segs.push(it);
    return it;
  };

  const tx = (cls: string, x: number, y: number, str: string, s: number, e: number,
              parent?: SVGElement, anchor?: string, dir?: number, forceLtr?: boolean): SVGElement => {
    const el = svgEl("text", { class: "stg-tx " + cls, x, y, "text-anchor": anchor || "start" }, parent || texts);
    el.textContent = str;
    el.style.direction = forceLtr ? "ltr" : fa ? "rtl" : "ltr";
    items.push({ el, s, e, isLine: false, dir });
    return el;
  };

  const openUrl = (url: string): void => {
    if (/^mailto:/.test(url) || /^tel:/.test(url)) location.href = url;
    else window.open(url, "_blank", "noopener");
  };

  if (!mobile) {
    /* ═══════════ DESKTOP — unchanged composition ═══════════ */

    {
      const title = svgEl("text", {
        class: "stg-title", x: fa ? 1480 : 120, y: 124,
        textLength: 440, lengthAdjust: "spacing",
        "text-anchor": fa ? "end" : "start",
      }, lines);
      title.textContent = "The Hanging Man";
      title.style.direction = "ltr";
      svgEl("path", { class: "stg-hero-ln", pathLength: 1, d: "M120 150 H1480" }, lines);
    }
    ln("th", X1, 40, X1, F, 0.03, 0.15);
    {
      const gA = svgEl("g", { class: "stg-grp" }, texts);
      const keys = ["stage.about1", "stage.about2", "stage.about3", "stage.about4", "stage.about5", "stage.about6"];
      keys.forEach((key, i) => {
        const y = 270 + i * 90;
        ln("tn", X1, y, X1 + 500, y, 0.065 + i * 0.012, 0.125 + i * 0.012);
        tx("ds", X(X1 + 28), y - 16, t(dict, key), 0.085 + i * 0.012, 0.15 + i * 0.012, gA, "start");
      });
      const gWho = svgEl("g", { transform: "translate(" + X(X1 - 24) + " 540) rotate(-90)" }, gA);
      tx("h2", 0, 0, t(dict, "stage.who"), 0.09, 0.15, gWho, "start", 1, true);
    }
    hint = svgEl("text", { class: "stg-tx stg-hint", x: X(120), y: 880, "text-anchor": "start" }, texts);
    hint.textContent = t(dict, "stage.hint");
    hint.style.direction = fa ? "rtl" : "ltr";

    ln("th", X1, F, X1, H2 + OV, 0.28, 0.38);
    ln("th", X1, H2, X1 - OV, H2, 0.36, 0.38);
    ln("th", X1, H2, 1480, H2, 0.35, 0.48);
    {
      const gH = svgEl("g", { class: "stg-grp" }, texts);
      tx("h2", X(X2 + 30), H2 - 20, t(dict, "stage.how"), 0.42, 0.48, gH, "start");
      const steps: Array<[string, string]> = [
        ["stage.step1h", "stage.step1d"],
        ["stage.step2h", "stage.step2d"],
        ["stage.step3h", "stage.step3d"],
        ["stage.step4h", "stage.step4d"],
      ];
      steps.forEach((pair, i) => {
        const y = H2 + 120 + i * 120;
        ln("tn", X2, y, X2 - 520, y, 0.455 + i * 0.03, 0.525 + i * 0.03);
        tx("st", X(X2 - 28), y - 16, t(dict, pair[0]), 0.475 + i * 0.03, 0.54 + i * 0.03, gH, "end");
        tx("sd", X(X2 - 28), y + 34, t(dict, pair[1]), 0.49 + i * 0.03, 0.555 + i * 0.03, gH, "end");
      });
    }
    ln("th", X2, H2 - OV, X2, RAIL, 0.44, 0.64);   /* V2 crosses H2 and carries down to the rail */

    /* ═══ glide 2 → frame 3: what I build ═══ */
    const lastCardCenter = 1280;

    /* thick vertical (V3) at last card center — continues below rail as that card's connector */
    ln("th", lastCardCenter, H2 - OV, lastCardCenter, RAIL, 0.44, 0.64, lines);
    ln("tn", lastCardCenter, RAIL, lastCardCenter, RAIL + 120, 0.63 + 3 * 0.04, 0.70 + 3 * 0.04, lines);

    /* horizontal rail: crosses vertical at lastCardCenter, overshoots by OV, runs to margin */
    ln("th", lastCardCenter, RAIL, lastCardCenter + OV, RAIL, 0.60, 0.72);        /* overshoot right (EN) / left (FA) */
    ln("th", lastCardCenter, RAIL, 120, RAIL, 0.60, 0.72);                         /* to left margin (EN) / right margin (FA) */

    /* section label: horizontal, above rail, aligned to line's start corner */
    const labelX = fa ? 1480 : 120;  // right margin (FA) / left margin (EN)
    const labelAnchor = fa ? "end" : "start";
    tx("h2", labelX, RAIL - 18, t(dict, "stage.build"), 0.60, 0.66, undefined, labelAnchor, 1, fa ? false : true);

    const svc = [
      { t: "stage.s1t", d: "stage.s1d", m: "stage.s1m" },
      { t: "stage.s2t", d: "stage.s2d", m: "stage.s2m" },
      { t: "stage.s3t", d: "stage.s3d", m: "stage.s3m" },
      { t: "stage.s4t", d: "stage.s4d", m: "stage.s4m" },
    ];
    const centers = [320, 640, 960, 1280];
    const bw = 260, bh = 210, halfW = bw / 2;
    const frameTop = RAIL + 120;
    const textPad = 20;
    svc.forEach((sv, i) => {
      const cx = centers[i];
      const cardG = svgEl("g", { class: "stg-card" }, lines);
      const cardX = X(cx);
      const frameLeft = cardX - halfW;
      /* skip separate connector for last card — thick vertical continues as its connector */
      if (i !== 3) {
        ln("tn", cx, RAIL, cx, frameTop, 0.63 + i * 0.04, 0.70 + i * 0.04, cardG);
      }
      const bx = svgEl("path", {
        class: "stg-ln bx",
        d: "M" + frameLeft + " " + frameTop + " h " + bw + " v " + bh + " h " + (-bw) + " Z",
        pathLength: 1,
      }, cardG);
      items.push({ el: bx, s: 0.66 + i * 0.04, e: 0.78 + i * 0.04, isLine: true, x1: frameLeft, y1: frameTop, x2: frameLeft + bw, y2: frameTop });
      tx("bt", cardX, frameTop + textPad + 24, t(dict, sv.t), 0.72 + i * 0.04, 0.80 + i * 0.04, cardG, "middle");
      tx("bd", cardX, frameTop + textPad + 70, t(dict, sv.d), 0.74 + i * 0.04, 0.82 + i * 0.04, cardG, "middle");
      tx("bm", cardX, frameTop + textPad + 114, t(dict, sv.m), 0.76 + i * 0.04, 0.84 + i * 0.04, cardG, "middle", 1, true);
    });
    ln("th", 120, RAIL, 120, BASE, 0.80, 0.90);        /* the trunk drops to the final frame */
    ln("th", 120, BASE, 1480, BASE, 0.88, 0.96);       /* the base line */

    {
      const gC = svgEl("g", { class: "stg-grp" }, texts);
      tx("cta-h", X(X2 - 28), BASE + 62, t(dict, "stage.cta"), 0.88, 0.94, gC, "end");
      tx("ds", X(X2 - 28), BASE + 106, t(dict, "stage.ctaDesc1"), 0.91, 0.96, gC, "end");
      tx("ds", X(X2 - 28), BASE + 138, t(dict, "stage.ctaDesc2"), 0.93, 0.97, gC, "end");
    }

    const chans = [
      { label: t(dict, "contact.channels.telegram"), url: ch("telegram") },
      { label: t(dict, "contact.channels.whatsapp"), url: ch("whatsapp") },
      { label: t(dict, "contact.channels.email"),    url: ch("email") },
      { label: t(dict, "contact.channels.github"),   url: ch("githubUrl") || ch("github") },
      { label: t(dict, "contact.channels.x"),        url: ch("x") || ch("twitter") },
      { label: t(dict, "contact.channels.phone"),    url: ch("phone") },
    ].filter((c) => Boolean(c.url));
    const TOP = TOPC;
    chans.forEach((c, i) => {
      const x = X1 - 300 + i * 60;
      const line = ln("tn", x, BASE, x, TOP, 0.89 + i * 0.012, 0.93 + i * 0.012);
      const g = svgEl("g", { class: "stg-chan", role: "link", tabindex: 0, "aria-label": c.label }, texts);
      svgEl("rect", { x: X(x) - 28, y: TOP, width: 56, height: BASE - TOP, fill: "transparent" }, g);
      const rg = svgEl("g", { transform: "translate(" + (fa ? X(x) - 34 : X(x) + 34) + " " + (BASE - 24) + ") rotate(-90)" }, g);
      tx("ch", 0, 0, c.label, 0.90 + i * 0.012, 0.94 + i * 0.012, rg, "start", 1, true);
      const hi = (): void => { line.el.style.strokeWidth = "2"; line.el.style.opacity = "1"; };
      const lo = (): void => { line.el.style.strokeWidth = ""; line.el.style.opacity = ""; };
      g.addEventListener("click", () => openUrl(c.url));
      g.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); openUrl(c.url); }
      });
      g.addEventListener("mouseenter", hi);
      g.addEventListener("mouseleave", lo);
      g.addEventListener("focus", hi);
      g.addEventListener("blur", lo);
    });

    foot = svgEl("text", { class: "stg-tx stg-foot", x: X(120), y: WORLD_D - 24, "text-anchor": "start" }, texts);
    foot.textContent = t(dict, "stage.foot");
    foot.style.direction = fa ? "rtl" : "ltr";

    /* portfolio slots — behind the lines; scale up on hover/focus */
    const PF: SlotDef[] = (cfgAny.portfolio as SlotDef[]) || [];
    PF.forEach((w) => {
      const g = svgEl("g", { class: "stg-slot" }, slotsG);
      const inner = svgEl("g", { class: "stg-slot-in" }, g);
      const left = Math.min(X(w.x), X(w.x + w.w));
      const rect = svgEl("rect", { class: "stg-slot-r", x: left, y: w.y, width: w.w, height: w.h }, inner);
      rect.style.pointerEvents = "all";
      if (w.src) {
        svgEl("image", { class: "stg-shot", href: w.src, x: left, y: w.y, width: w.w, height: w.h, preserveAspectRatio: "xMidYMid slice" }, inner);
      } else {
        const lbl = svgEl("text", { class: "stg-slot-t", x: left + 18, y: w.y + 30 }, inner);
        lbl.textContent = w.label;
        lbl.style.direction = "ltr";
      }
      if (w.href) {
        rect.style.cursor = "pointer";
        rect.setAttribute("role", "link");
        rect.setAttribute("tabindex", "0");
        rect.addEventListener("click", () => window.open(w.href, "_blank", "noopener"));
        rect.addEventListener("keydown", (ev) => {
          if (ev.key === "Enter") window.open(w.href, "_blank", "noopener");
        });
      }
      slots.push({ g, f: w.f });
    });

  } else {
    /* ═══════════ MOBILE — the simplified credits cut ═══════════ */
    /* one spine at the margin draws through the entire scroll; the pen rides it. */

    ln("th", 70, 0, 70, WORLD_M, 0.01, 1);

    {
      const title = svgEl("text", { class: "stg-title", x: 400, y: 230, "text-anchor": "middle" }, lines);
      title.textContent = "The Hanging Man";
      title.style.direction = "ltr";
      svgEl("path", { class: "stg-hero-ln", pathLength: 1, d: "M70 300 H730" }, lines);
    }
    [230, 400, 570].forEach((x, i) => {
      ln("tn", x, 300, x, 520, 0.04 + i * 0.02, 0.10 + i * 0.02);
      tx("mteaser", X(x), 560, t(dict, "stage.teaser" + (i + 1)), 0.06 + i * 0.02, 0.12 + i * 0.02, undefined, "middle");
    });
    hint = svgEl("text", { class: "stg-tx mhint", x: 400, y: 1520, "text-anchor": "middle" }, texts);
    hint.textContent = t(dict, "stage.hint");
    hint.style.direction = fa ? "rtl" : "ltr";

    /* frame 1 — who I am */
    tx("mh2", 400, 1800, t(dict, "stage.who"), 0.30, 0.36, undefined, "middle");
    {
      const gA = svgEl("g", { class: "stg-grp" }, texts);
      const keys = ["stage.about1", "stage.about2", "stage.about3", "stage.about4", "stage.about5", "stage.about6"];
      keys.forEach((key, i) => {
        const y = 1980 + i * 170;
        ln("tn", 130, y, 670, y, 0.32 + i * 0.02, 0.38 + i * 0.02);
        tx("mds", 400, y - 20, t(dict, key), 0.34 + i * 0.02, 0.40 + i * 0.02, gA, "middle");
      });
    }

    /* frame 2 — how I work */
    tx("mh2", 400, 3400, t(dict, "stage.how"), 0.58, 0.64, undefined, "middle");
    {
      const gH = svgEl("g", { class: "stg-grp" }, texts);
      const steps: Array<[string, string]> = [
        ["stage.step1h", "stage.step1d"],
        ["stage.step2h", "stage.step2d"],
        ["stage.step3h", "stage.step3d"],
        ["stage.step4h", "stage.step4d"],
      ];
      steps.forEach((pair, i) => {
        const y = 3620 + i * 330;
        tx("mst", 400, y, t(dict, pair[0]), 0.60 + i * 0.03, 0.66 + i * 0.03, gH, "middle");
        ln("tn", 130, y + 52, 670, y + 52, 0.62 + i * 0.03, 0.68 + i * 0.03);
        tx("msd", 400, y + 108, t(dict, pair[1]), 0.64 + i * 0.03, 0.70 + i * 0.03, gH, "middle");
      });
    }

    /* frame 3 — what I build */
    tx("mh2", 400, 5000, t(dict, "stage.build"), 0.72, 0.78, undefined, "middle");
    {
      const gB = svgEl("g", { class: "stg-grp" }, texts);
      const svc = [
        { t: "stage.s1t", d: "stage.s1d" },
        { t: "stage.s2t", d: "stage.s2d" },
        { t: "stage.s3t", d: "stage.s3d" },
        { t: "stage.s4t", d: "stage.s4d" },
      ];
      svc.forEach((sv, i) => {
        const y = 5150 + i * 320;
        tx("mst", 400, y, t(dict, sv.t), 0.74 + i * 0.03, 0.80 + i * 0.03, gB, "middle");
        ln("tn", 130, y + 52, 670, y + 52, 0.76 + i * 0.03, 0.82 + i * 0.03);
        tx("msd", 400, y + 108, t(dict, sv.d), 0.78 + i * 0.03, 0.84 + i * 0.03, gB, "middle");
      });
    }

    /* frame 4 — start a project */
    {
      const gC = svgEl("g", { class: "stg-grp" }, texts);
      tx("mcta", 400, 6580, t(dict, "stage.cta"), 0.86, 0.92, gC, "middle");
      tx("msd", 400, 6660, t(dict, "stage.ctaDesc1"), 0.89, 0.94, gC, "middle");
      tx("msd", 400, 6710, t(dict, "stage.ctaDesc2"), 0.91, 0.95, gC, "middle");
    }
    const chans = [
      { label: t(dict, "contact.channels.telegram"), url: ch("telegram") },
      { label: t(dict, "contact.channels.whatsapp"), url: ch("whatsapp") },
      { label: t(dict, "contact.channels.email"),    url: ch("email") },
      { label: t(dict, "contact.channels.github"),   url: ch("githubUrl") || ch("github") },
      { label: t(dict, "contact.channels.x"),        url: ch("x") || ch("twitter") },
      { label: t(dict, "contact.channels.phone"),    url: ch("phone") },
    ].filter((c) => Boolean(c.url));
    chans.forEach((c, i) => {
      const y = 6900 + i * 160;
      const line = ln("tn", 130, y, 670, y, 0.90 + i * 0.012, 0.94 + i * 0.012);
      const g = svgEl("g", { class: "stg-chan", role: "link", tabindex: 0, "aria-label": c.label }, texts);
      svgEl("rect", { x: 90, y: y - 70, width: 620, height: 110, fill: "transparent" }, g);
      tx("mch", 400, y - 26, c.label, 0.91 + i * 0.012, 0.95 + i * 0.012, g, "middle", 1, true);
      g.addEventListener("click", () => openUrl(c.url));
      g.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); openUrl(c.url); }
      });
      line.el.addEventListener("mouseenter", () => { line.el.style.strokeWidth = "2"; line.el.style.opacity = "1"; });
      line.el.addEventListener("mouseleave", () => { line.el.style.strokeWidth = ""; line.el.style.opacity = ""; });
    });

    foot = svgEl("text", { class: "stg-tx mfoot", x: 400, y: 7940, "text-anchor": "middle" }, texts);
    foot.textContent = t(dict, "stage.foot");
    foot.style.direction = fa ? "rtl" : "ltr";
  }

  /* ---------- scroll engine: dwell-glide (desktop) / linear pan (mobile) ---------- */
  let ready = calm;
  let wrapTop = 0;
  let range = 1;

  const measure = (): void => {
    const r = wrap.getBoundingClientRect();
    wrapTop = r.top + window.scrollY;
    range = Math.max(1, wrap.offsetHeight - innerHeight);
  };

  const update = (): void => {
    const yv = window.scrollY;
    const p = calm ? 1 : clamp((yv - wrapTop) / range);
    if (mobile) {
      svg.setAttribute("viewBox", calm ? "0 0 800 " + WORLD_M : "0 " + (p * PAN_M).toFixed(1) + " 800 " + MWF);
    } else {
      const cam = calm ? 0 : F * (ss(CAM[0][0], CAM[0][1], p) + ss(CAM[1][0], CAM[1][1], p));
      svg.setAttribute("viewBox", calm ? "0 0 1600 " + WORLD_D : "0 " + cam.toFixed(1) + " 1600 " + F);
    }
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const k = calm ? 1 : clamp((p - it.s) / (it.e - it.s));
      if (it.isLine) it.el.style.strokeDashoffset = String(1 - k);
      else {
        it.el.style.opacity = String(k);
        it.el.style.transform = "translateY(" + (it.dir || 1) * (1 - k) * 10 + "px)";
      }
    }
    for (let i = 0; i < slots.length; i++) {
      const s = slots[i];
      const d = calm ? 0 : (p * (WORLD_D - F)) - F * s.f;
      s.g.style.opacity = calm ? "1" : String(clamp(1 - Math.abs(d) / (0.75 * F)));
      s.g.setAttribute("transform", "translate(0 " + (0.15 * d).toFixed(1) + ")");
    }
    let ride: Item | null = null;
    for (let j = 0; j < segs.length; j++) {
      const sg = segs[j];
      if (p >= sg.s && p <= sg.e && (ride === null || sg.s > ride.s)) ride = sg;
    }
    if (ride && ready && !calm) {
      const k2 = clamp((p - ride.s) / (ride.e - ride.s));
      pen.setAttribute("cx", String(ride.x1! + (ride.x2! - ride.x1!) * k2));
      pen.setAttribute("cy", String(ride.y1! + (ride.y2! - ride.y1!) * k2));
      pen.style.opacity = "1";
    } else pen.style.opacity = "0";
    if (hint) hint.style.opacity = ready && !calm && yv < 40 ? "1" : "0";
    if (foot) foot.style.opacity = String(clamp((p - 0.96) / 0.04));
  };

  let raf = 0;
  const sched = (): void => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; update(); }); };
  const onScroll = (): void => sched();
  const onResize = (): void => {
    const m = matchMedia("(max-width:820px)").matches;
    if (m === modeDesktop) {
      if (currentHost && currentStore) renderStage(currentStore, currentHost); /* crossed the breakpoint */
      return;
    }
    measure(); sched();
  };
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onResize);

  let timer = 0;
  if (!calm) timer = window.setTimeout(() => { ready = true; update(); }, 5400);

  const navHandler = (e: Event): void => {
    const btn = (e.target as HTMLElement).closest("[data-nav]");
    if (!btn) return;
    const key = btn.getAttribute("data-nav");
    const smooth: ScrollBehavior = calm ? "auto" : "smooth";
    if (key === "contact") {
      const el = document.getElementById("contact");
      if (el) el.scrollIntoView({ behavior: smooth });
      return;
    }
    const frac = mobile ? (key === "about" ? 0.37 : 0.62) : (key === "about" ? 0.15 : 0.50);
    scrollTo({ top: wrapTop + frac * range, behavior: smooth });
  };
  document.addEventListener("click", navHandler);

  teardown = (): void => {
    removeEventListener("scroll", onScroll);
    removeEventListener("resize", onResize);
    document.removeEventListener("click", navHandler);
    clearTimeout(timer);
    if (raf) cancelAnimationFrame(raf);
  };

  if (!wired.has(i18n)) {
    i18n.onChange(() => { if (currentHost && currentStore) renderStage(currentStore, currentHost); });
    wired.add(i18n);
  }

  /* ---------- 3D card interaction ---------- */
  const prefersReducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isDesktop = !matchMedia("(max-width: 860px)").matches;
  const hasFinePointer = matchMedia("(hover:hover) and (pointer:fine)").matches;
  const enable3D = !prefersReducedMotion && isDesktop && hasFinePointer;

  let cardEls: Array<SVGGElement> = [];
  let cardRects: Array<DOMRect> = [];
  let pointerX = 0;
  let pointerY = 0;
  let targetRx = 0;
  let targetRy = 0;
  let currentRx = 0;
  let currentRy = 0;
  let interactionRaf = 0;
  let pointerInside = false;

  function init3DCards(): void {
    if (!enable3D) return;
    cardEls = Array.from(wrap.querySelectorAll<SVGGElement>(".stg-card, .stg-slot"));
    if (cardEls.length === 0) return;

    cardEls.forEach((el, i) => {
      const n = cardEls.length;
      const visualIndex = fa ? n - 1 - i : i;
      const center = (n - 1) / 2;
      const offset = visualIndex - center;
      const idleDeg = offset * -5;
      const zPx = -Math.abs(offset) * 24;
      el.style.setProperty("--idle", `${idleDeg}deg`);
      el.style.setProperty("--z", `${zPx}px`);
      el.style.setProperty("--ry", "0deg");
      el.style.setProperty("--rx", "0deg");
    });

    updateCardRects();
  }

  function updateCardRects(): void {
    cardRects = cardEls.map((el) => el.getBoundingClientRect());
  }

  function onPointerMove(e: PointerEvent): void {
    if (!enable3D || cardEls.length === 0) return;
    pointerX = e.clientX;
    pointerY = e.clientY;
    pointerInside = true;
    if (!interactionRaf) interactionRaf = requestAnimationFrame(update3DTransform);
  }

  function onPointerLeave(): void {
    if (!enable3D) return;
    pointerInside = false;
    targetRx = 0;
    targetRy = 0;
  }

  function update3DTransform(): void {
    interactionRaf = 0;
    if (!pointerInside) {
      currentRx += (targetRx - currentRx) * 0.15;
      currentRy += (targetRy - currentRy) * 0.15;
      if (Math.abs(currentRx) < 0.01 && Math.abs(currentRy) < 0.01) {
        currentRx = 0;
        currentRy = 0;
      } else {
        requestAnimationFrame(update3DTransform);
      }
    } else {
      updateCardRects();
      cardEls.forEach((el, i) => {
        const rect = cardRects[i];
        if (!rect || rect.width === 0 || rect.height === 0) return;
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const px = (pointerX - cx) / rect.width;
        const py = (pointerY - cy) / rect.height;
        const rx = -py * 14;
        const ry = px * 14;
        el.style.setProperty("--rx", `${rx}deg`);
        el.style.setProperty("--ry", `${ry}deg`);
      });
    }
    if (pointerInside || Math.abs(currentRx) > 0.01 || Math.abs(currentRy) > 0.01) {
      interactionRaf = requestAnimationFrame(update3DTransform);
    }
  }

  function onFocusIn(): void {
    if (!enable3D) return;
    pointerInside = true;
  }

  function onFocusOut(): void {
    if (!enable3D) return;
    pointerInside = false;
    targetRx = 0;
    targetRy = 0;
  }

  if (enable3D) {
    init3DCards();
    wrap.addEventListener("pointermove", onPointerMove, { passive: true });
    wrap.addEventListener("pointerleave", onPointerLeave);
    wrap.addEventListener("focusin", onFocusIn);
    wrap.addEventListener("focusout", onFocusOut);
    window.addEventListener("resize", updateCardRects, { passive: true });

    const originalTeardown = teardown;
    teardown = (): void => {
      originalTeardown();
      wrap.removeEventListener("pointermove", onPointerMove);
      wrap.removeEventListener("pointerleave", onPointerLeave);
      wrap.removeEventListener("focusin", onFocusIn);
      wrap.removeEventListener("focusout", onFocusOut);
      window.removeEventListener("resize", updateCardRects);
      if (interactionRaf) cancelAnimationFrame(interactionRaf);
    };
  }

  measure();
  update();
  window.setTimeout(() => { measure(); update(); }, 80);
}