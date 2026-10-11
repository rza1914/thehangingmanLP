import type { I18nStore } from "../i18n/i18n";
import { t } from "../i18n/i18n";
import { initScrollReveal } from "../utils/scrollReveal";
import { getLineVariant } from "../utils/lineVariant";

interface ApproachStep {
  title: string;
  description: string;
}

export function renderApproach(i18n: I18nStore): HTMLElement {
  const section = document.createElement("section");
  section.id = "approach";
  section.className = "approach";

  const render = (): void => {
    const dict = i18n.getDict();
    const steps = dict.approach.steps as ApproachStep[];

    const rowsHtml = steps
      .map((step, index) => {
        const v = getLineVariant(index);
        return `
          <div class="row-wrap" data-reveal data-reveal-key="approach-step-${index}" style="--reveal-delay:${index * 90}ms">
            <div class="row-divider" aria-hidden="true" style="--line-start:${v.startPercent}%; --line-end:${v.endPercent}%;">
              <span class="row-divider__jog row-divider__jog--${v.jogSide}" style="--jog-height:${v.jogHeight}px; --jog-grow:${v.jogGrowHeight}px;"></span>
            </div>
            <article class="approach-step" data-blueprint-anchor="approach-step-${index}">
              <span class="approach-step__number">${String(index + 1).padStart(2, "0")}</span>
              <div class="approach-step__content">
                <h3 class="approach-step__title">${step.title}</h3>
                <p class="approach-step__description">${step.description}</p>
              </div>
            </article>
          </div>
        `;
      })
      .join("");

    const closing = getLineVariant(steps.length);

    section.innerHTML = `
      <div class="approach__inner">
        <span class="section-eyebrow" data-reveal data-reveal-key="approach-eyebrow">${t(dict, "approach.eyebrow")}</span>
        <h2 class="section-heading" data-reveal data-reveal-key="approach-heading" style="--reveal-delay:60ms" data-blueprint-anchor="approach-heading">${t(dict, "approach.heading")}</h2>
        <div class="approach__steps">
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