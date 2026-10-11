import type { I18nStore } from "../i18n/i18n";
import { t } from "../i18n/i18n";
import { initScrollReveal } from "../utils/scrollReveal";

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

    const stepsHtml = steps
      .map(
        (step, index) => `
          <li class="approach-step" data-reveal data-reveal-key="approach-step-${index}" style="--reveal-delay:${index * 90}ms">
            <span class="approach-step__number">${String(index + 1).padStart(2, "0")}</span>
            <div class="approach-step__content">
              <h3 class="approach-step__title">${step.title}</h3>
              <p class="approach-step__description">${step.description}</p>
            </div>
          </li>
        `
      )
      .join("");

    section.innerHTML = `
      <div class="approach__inner">
        <span class="section-eyebrow" data-reveal data-reveal-key="approach-eyebrow">${t(dict, "approach.eyebrow")}</span>
        <h2 class="section-heading" data-reveal data-reveal-key="approach-heading" style="--reveal-delay:60ms">${t(dict, "approach.heading")}</h2>
        <ol class="approach__steps">${stepsHtml}</ol>
      </div>
    `;
    initScrollReveal(section);
  };

  render();
  i18n.onChange(render);
  return section;
}