import { describe, it, expect, beforeEach } from "vitest";
import { I18nStore } from "../src/i18n/i18n";
import { renderStage } from "../src/components/stage";

/* matchMedia mock for stage.ts reduced-motion / mobile queries */
const mm = (q: string) => ({
  matches: false,
  media: q,
  addEventListener() {},
  removeEventListener() {},
  addListener() {},
  removeListener() {}
});
(window as any).matchMedia = (window as any).matchMedia || mm;

describe("Stage component", () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = "";
  });

  it("renders stage-wrap and stage with headline", () => {
    const i18n = new I18nStore("en");
    i18n.init();
    const host = document.createElement("div");
    document.body.appendChild(host);
    renderStage(i18n, host);

    expect(host.querySelector(".stage-wrap")).toBeTruthy();
    expect(host.querySelector(".stage")).toBeTruthy();
    expect(host.textContent).toContain("The Hanging Man");
    expect(host.textContent).toContain("One developer. No agency, no sales team,");
  });

  it("renders stage.about1..6 texts", () => {
    const i18n = new I18nStore("en");
    i18n.init();
    const host = document.createElement("div");
    document.body.appendChild(host);
    renderStage(i18n, host);

    expect(host.textContent).toContain("One developer. No agency, no sales team,");
    expect(host.textContent).toContain("no inflated promises.");
    expect(host.textContent).toContain("I write the code, talk to you directly,");
    expect(host.textContent).toContain("and stand behind every line of it.");
    expect(host.textContent).toContain("Web apps, backends and APIs, automation,");
    expect(host.textContent).toContain("and an honest opinion on your codebase.");
  });

  it("renders WHO I AM / HOW I WORK headings", () => {
    const i18n = new I18nStore("en");
    i18n.init();
    const host = document.createElement("div");
    document.body.appendChild(host);
    renderStage(i18n, host);

    expect(host.textContent).toContain("WHO I AM");
    expect(host.textContent).toContain("HOW I WORK");
    expect(host.textContent).toContain("Discovery call");
    expect(host.textContent).toContain("Scope, timeline and price");
    expect(host.textContent).toContain("Build in the open");
    expect(host.textContent).toContain("Delivery and support");
    expect(host.textContent).toContain("Start a project");
    expect(host.textContent).toContain("Tell me what you need. You get a clear scope,");
    expect(host.textContent).toContain("and price first, with no obligation.");
  });

  it("updates text when locale changes to fa", () => {
    const i18n = new I18nStore("en");
    i18n.init();
    const host = document.createElement("div");
    document.body.appendChild(host);
    renderStage(i18n, host);

    i18n.setLocale("fa");

    expect(host.textContent).toContain("من که هستم");
    expect(host.textContent).toContain("روند کار");
    expect(host.textContent).toContain("شروع یک پروژه");
    expect(host.textContent).toContain("یک توسعه‌دهنده. نه آژانس، نه تیم فروش،");
  });

  it("has channel links in stage", () => {
    const i18n = new I18nStore("en");
    i18n.init();
    const host = document.createElement("div");
    document.body.appendChild(host);
    renderStage(i18n, host);

    const channels = host.querySelectorAll(".stg-chan");
    expect(channels.length).toBeGreaterThan(0);
  });

  it("mobile mode: renders simplified credits cut", () => {
    /* override matchMedia so max-width queries match (mobile) */
    const origMatchMedia = window.matchMedia;
    (window as any).matchMedia = (q: string) => {
      const m = q.includes("max-width");
      return {
        matches: m,
        media: q,
        addEventListener() {},
        removeEventListener() {},
        addListener() {},
        removeListener() {}
      };
    };

    const i18n = new I18nStore("en");
    i18n.init();
    const host = document.createElement("div");
    document.body.appendChild(host);
    renderStage(i18n, host);

    expect(host.querySelector(".stage-wrap--m")).toBeTruthy();
    expect(host.textContent).toContain("One developer"); /* teaser text */
    expect(host.querySelector(".stg-chan")).toBeTruthy();

    /* restore original matchMedia */
    (window as any).matchMedia = origMatchMedia;
  });
});