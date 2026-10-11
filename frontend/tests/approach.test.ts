import { describe, it, expect } from "vitest";
import { I18nStore } from "../src/i18n/i18n";
import { renderApproach } from "../src/components/approach";

describe("Approach component", () => {
  it("renders exactly 4 numbered steps in English", () => {
    const i18n = new I18nStore("en");
    i18n.init();
    const section = renderApproach(i18n);

    const steps = section.querySelectorAll(".approach-step");
    expect(steps.length).toBe(4);
    expect(section.textContent).toContain("01");
    expect(section.textContent).toContain("Discovery Call");
    expect(section.textContent).toContain("Delivery & Support");
  });

  it("has the correct anchor id for nav linking", () => {
    const i18n = new I18nStore("en");
    i18n.init();
    const section = renderApproach(i18n);
    expect(section.id).toBe("approach");
  });

  it("updates content when locale changes to Persian", () => {
    const i18n = new I18nStore("en");
    i18n.init();
    const section = renderApproach(i18n);

    i18n.setLocale("fa");

    expect(section.textContent).toContain("تماس اولیه");
    const steps = section.querySelectorAll(".approach-step");
    expect(steps.length).toBe(4);
  });

  it("marks each row-wrap with a stable, unique data-reveal-key for scroll animation", () => {
    const i18n = new I18nStore("en");
    i18n.init();
    const section = renderApproach(i18n);

    for (let i = 0; i < 4; i += 1) {
      expect(section.querySelector(`[data-reveal-key="approach-step-${i}"]`)).toBeTruthy();
    }
  });

  it("renders one blueprint-style divider above each step plus a closing divider (steps + 1)", () => {
    const i18n = new I18nStore("en");
    i18n.init();
    const section = renderApproach(i18n);

    const dividers = section.querySelectorAll(".row-divider");
    expect(dividers.length).toBe(5);
    expect(section.querySelector(".row-divider--closing")).toBeTruthy();
  });

  it("renders a vertical jog tick inside each step's divider (not the closing one)", () => {
    const i18n = new I18nStore("en");
    i18n.init();
    const section = renderApproach(i18n);

    const jogs = section.querySelectorAll(".row-divider__jog");
    expect(jogs.length).toBe(4);
  });
});