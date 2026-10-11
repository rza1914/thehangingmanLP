import type { I18nStore } from "../i18n/i18n";
import { t } from "../i18n/i18n";
import { initScrollReveal } from "../utils/scrollReveal";
import { getLineVariant } from "../utils/lineVariant";

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

    const rowsHtml = items
      .map((item, index) => {
        const v = getLineVariant(index);
        return `
          <div class="row-wrap" data-reveal data-reveal-key="service-row-${index}" style="--reveal-delay:${index * 90}ms">
            <div class="row-divider" aria-hidden="true" style="--line-start:${v.startPercent}%; --line-end:${v.endPercent}%;">
              <span class="row-divider__jog row-divider__jog--${v.jogSide}" style="--jog-height:${v.jogHeight}px; --jog-grow:${v.jogGrowHeight}px;"></span>
            </div>
            <article class="service-row">
              <h3 class="service-row__title">${item.title}</h3>
              <p class="service-row__description">${item.description}</p>
            </article>
          </div>
        `;
      })
      .join("");

    const closing = getLineVariant(items.length);

    section.innerHTML = `
      <div class="services__inner">
        <span class="section-eyebrow" data-reveal data-reveal-key="services-eyebrow">${t(dict, "services.eyebrow")}</span>
        <h2 class="section-heading" data-reveal data-reveal-key="services-heading" style="--reveal-delay:60ms">${t(dict, "services.heading")}</h2>
        <div class="services__list">
          ${rowsHtml}
          <div class="row-divider row-divider--closing" aria-hidden="true" style="--line-start:${closing.startPercent}%; --line-end:${closing.endPercent}%;"></div>
        </div>
      </div>
    `;
    initScrollReveal(section);
  };

  render();
  i18n.onChange(render);
  return section;
}