import { config } from "../config";
import type { I18nStore } from "../i18n/i18n";
import { t } from "../i18n/i18n";

export function renderWork(i18n: I18nStore): HTMLElement {
  const section = document.createElement("section");
  section.id = "work";
  section.className = "work";

  const render = (): void => {
    const dict = i18n.getDict();

    section.innerHTML = `
      <div class="work__inner">
        <h2 class="section-heading">${t(dict, "work.heading")}</h2>
        <p class="work__lede">${t(dict, "work.lede")}</p>
        <a class="work-row" href="${config.githubUrl}" target="_blank" rel="noopener">
          <span class="work-row__cta">${t(dict, "work.cta")}</span>
          <span class="work-row__url" dir="ltr">${config.githubUrl.replace(/^https?:\/\//, "")}</span>
        </a>
      </div>
    `;
  };

  render();
  i18n.onChange(render);
  return section;
}