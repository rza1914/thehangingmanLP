import type { I18nStore } from "../i18n/i18n";
import { t } from "../i18n/i18n";
import { initScrollReveal } from "../utils/scrollReveal";

export function renderHero(i18n: I18nStore): HTMLElement {
  const section = document.createElement("section");
  section.id = "top";
  section.className = "hero";

  const render = (): void => {
    const dict = i18n.getDict();
    section.innerHTML = `
      <div class="hero__inner">
        <span class="hero__eyebrow" data-reveal data-reveal-key="hero-eyebrow">${t(dict, "hero.eyebrow")}</span>
        <h1 class="hero__headline" data-reveal data-reveal-key="hero-headline" style="--reveal-delay:80ms">${t(dict, "hero.headline")}</h1>
        <p class="hero__subheadline" data-reveal data-reveal-key="hero-subheadline" style="--reveal-delay:160ms">${t(dict, "hero.subheadline")}</p>
        <a href="#contact" class="btn btn--primary hero__cta" data-reveal data-reveal-key="hero-cta" style="--reveal-delay:240ms">${t(dict, "hero.cta")}</a>
        <a href="#services" class="hero__scroll-cue" aria-label="Scroll to services">
          <span class="hero__scroll-cue-arrow" aria-hidden="true"></span>
        </a>
        <div class="hero__trunk-anchor" data-blueprint-anchor="hero-trunk-start" aria-hidden="true"></div>
      </div>
    `;
    initScrollReveal(section);
  };

  render();
  i18n.onChange(render);
  return section;
}