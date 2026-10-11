import { describe, it, expect } from "vitest";
import { I18nStore } from "../src/i18n/i18n";
import { renderHero } from "../src/components/hero";

describe("Hero component", () => {
  it("renders headline and cta link in the current locale", () => {
    const i18n = new I18nStore("en");
    i18n.init();
    const hero = renderHero(i18n);

    expect(hero.textContent).toContain("I build software");
    expect(hero.querySelector('a[href="#contact"]')).toBeTruthy();
  });

  it("updates text when the locale changes", () => {
    const i18n = new I18nStore("en");
    i18n.init();
    const hero = renderHero(i18n);

    i18n.setLocale("fa");

    expect(hero.textContent).toContain("نرم‌افزار می‌سازم");
  });

  it("marks headline, subheadline, and cta with data-reveal attributes for scroll animation", () => {
    const i18n = new I18nStore("en");
    i18n.init();
    const hero = renderHero(i18n);

    expect(hero.querySelector('[data-reveal-key="hero-headline"]')).toBeTruthy();
    expect(hero.querySelector('[data-reveal-key="hero-subheadline"]')).toBeTruthy();
    expect(hero.querySelector('[data-reveal-key="hero-cta"]')).toBeTruthy();
  });

  it("renders a scroll cue linking to the services section", () => {
    const i18n = new I18nStore("en");
    i18n.init();
    const hero = renderHero(i18n);

    const scrollCue = hero.querySelector('a[href="#services"].hero__scroll-cue');
    expect(scrollCue).toBeTruthy();
  });
});