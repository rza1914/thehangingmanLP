import { describe, it, expect, beforeEach } from "vitest";
import { I18nStore, t, getDictionary } from "../src/i18n/i18n";

describe("i18n dictionary lookup", () => {
  it("resolves nested keys correctly for en", () => {
    const dict = getDictionary("en");
    expect(t(dict, "header.brand")).toBe("The Hanging Man");
    expect(t(dict, "hero.cta")).toBe("Let's talk about your project");
  });

  it("resolves nested keys correctly for fa", () => {
    const dict = getDictionary("fa");
    expect(t(dict, "header.brand")).toBe("The Hanging Man");
    expect(t(dict, "hero.eyebrow")).toBe("توسعه‌دهنده مستقل نرم‌افزار");
  });

  it("falls back to the key path when a key is missing", () => {
    const dict = getDictionary("en");
    expect(t(dict, "does.not.exist")).toBe("does.not.exist");
  });
});

describe("I18nStore", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("dir");
    document.documentElement.removeAttribute("lang");
  });

  it("initializes with default locale and applies dir/lang to <html>", () => {
    const store = new I18nStore("en");
    store.init();
    expect(document.documentElement.lang).toBe("en");
    expect(document.documentElement.dir).toBe("ltr");
  });

  it("switches locale, updates dir/lang, persists to localStorage, and notifies listeners", () => {
    const store = new I18nStore("en");
    store.init();

    let notified: string | null = null;
    store.onChange((locale) => {
      notified = locale;
    });

    store.setLocale("fa");

    expect(store.getLocale()).toBe("fa");
    expect(document.documentElement.lang).toBe("fa");
    expect(document.documentElement.dir).toBe("rtl");
    expect(localStorage.getItem("thm_locale")).toBe("fa");
    expect(notified).toBe("fa");
  });

  it("restores persisted locale on next initialization", () => {
    localStorage.setItem("thm_locale", "fa");
    const store = new I18nStore("en");
    expect(store.getLocale()).toBe("fa");
  });
});