import type { I18nStore } from "../i18n/i18n";
import { t } from "../i18n/i18n";

export function renderHero(i18n: I18nStore): HTMLElement {
  const section = document.createElement("section");
  section.id = "top";
  section.className = "hero";

  const render = (): void => {
    const dict = i18n.getDict();
    section.innerHTML = `
      <div class="hero__inner">
        <span class="hero__eyebrow">${t(dict, "hero.eyebrow")}</span>
        <h1 class="hero__headline">${t(dict, "hero.headline")}</h1>
        <p class="hero__subheadline">${t(dict, "hero.subheadline")}</p>
        <a href="#contact" class="btn btn--primary hero__cta">${t(dict, "hero.cta")}</a>
      </div>
    `;
  };

  render();
  i18n.onChange(render);
  return section;
}