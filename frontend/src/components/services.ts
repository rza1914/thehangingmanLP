import type { I18nStore } from "../i18n/i18n";
import { t } from "../i18n/i18n";
import { initScrollReveal } from "../utils/scrollReveal";

interface ServiceItem {
  title: string;
  description: string;
}

export function renderServices(i18n: I18nStore): HTMLElement {
  const section = document.createElement("section");
  section.id = "services";
  section.className = "services";

  const render = (): void => {
    const dict = i18n.getDict();
    const items = dict.services.items as ServiceItem[];

    const cardsHtml = items
      .map(
        (item, index) => `
          <article class="service-card" data-reveal data-reveal-key="service-card-${index}" style="--reveal-delay:${index * 90}ms">
            <h3 class="service-card__title">${item.title}</h3>
            <p class="service-card__description">${item.description}</p>
          </article>
        `
      )
      .join("");

    section.innerHTML = `
      <div class="services__inner">
        <span class="section-eyebrow" data-reveal data-reveal-key="services-eyebrow">${t(dict, "services.eyebrow")}</span>
        <h2 class="section-heading" data-reveal data-reveal-key="services-heading" style="--reveal-delay:60ms">${t(dict, "services.heading")}</h2>
        <div class="services__grid">${cardsHtml}</div>
      </div>
    `;
    initScrollReveal(section);
  };

  render();
  i18n.onChange(render);
  return section;
}