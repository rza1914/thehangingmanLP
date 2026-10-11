import { describe, it, expect } from "vitest";
import { I18nStore } from "../src/i18n/i18n";
import { renderServices } from "../src/components/services";

describe("Services component", () => {
  it("renders exactly 4 service cards with titles and descriptions in English", () => {
    const i18n = new I18nStore("en");
    i18n.init();
    const section = renderServices(i18n);

    const cards = section.querySelectorAll(".service-card");
    expect(cards.length).toBe(4);
    expect(section.textContent).toContain("Web Application Development");
    expect(section.textContent).toContain("Backend & API Development");
    expect(section.textContent).toContain("Automation & Integrations");
    expect(section.textContent).toContain("Technical Consulting & Code Review");
  });

  it("has the correct anchor id for nav linking", () => {
    const i18n = new I18nStore("en");
    i18n.init();
    const section = renderServices(i18n);
    expect(section.id).toBe("services");
  });

  it("updates content when locale changes to Persian", () => {
    const i18n = new I18nStore("en");
    i18n.init();
    const section = renderServices(i18n);

    i18n.setLocale("fa");

    expect(section.textContent).toContain("توسعه اپلیکیشن وب");
    const cards = section.querySelectorAll(".service-card");
    expect(cards.length).toBe(4);
  });
});