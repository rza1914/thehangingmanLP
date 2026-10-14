import { describe, it, expect, beforeEach } from "vitest";
import { I18nStore } from "../src/i18n/i18n";
import { renderHeader } from "../src/components/header";

describe("Header component", () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = "";
  });

  it("renders the brand name and nav buttons", () => {
    const i18n = new I18nStore("en");
    i18n.init();
    const header = renderHeader(i18n);

    expect(header.textContent).toContain("The Hanging Man");
    expect(header.querySelector('button[data-nav="about"]')).toBeTruthy();
    expect(header.querySelector('button[data-nav="process"]')).toBeTruthy();
    expect(header.querySelector('button[data-nav="contact"]')).toBeTruthy();
  });

  it("toggles language when the language switch button is clicked", () => {
    const i18n = new I18nStore("en");
    i18n.init();
    const header = renderHeader(i18n);
    document.body.appendChild(header);

    const button = header.querySelector<HTMLButtonElement>("#lang-switch");
    expect(button).toBeTruthy();
    button?.click();

    expect(i18n.getLocale()).toBe("fa");
    expect(document.documentElement.dir).toBe("rtl");
    expect(header.textContent).toContain("درباره");
    expect(header.textContent).toContain("روند کار");
    expect(header.textContent).toContain("تماس");
  });
});