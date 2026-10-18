import type { I18nStore } from "../i18n/i18n";
import { t } from "../i18n/i18n";
import { initScrollReveal } from "../utils/scrollReveal";

export function renderFaq(i18n: I18nStore): HTMLElement {
  const section = document.createElement("section");
  section.id = "faq";
  section.className = "faq";

  const render = (): void => {
    const dict = i18n.getDict();
    const currentLocale = i18n.getLocale();
    const isRtl = currentLocale === "fa";

    const items = dict.faq.items as { q: string; a: string }[];

    const toggleState = new Set<number>();

    const renderItems = items.map((item, index) => {
      const isOpen = toggleState.has(index);
      return `
        <div class="faq-item${isOpen ? ' open' : ''}">
          <h3 class="faq-q">
            <button type="button" id="faq-q-${index}" aria-expanded="${isOpen}" aria-controls="faq-a-${index}">
              <span>${t(dict, item.q)}</span>
              <svg class="faq-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M6 9l6 6 6-6"/></svg>
            </button>
          </h3>
          <div class="faq-a" id="faq-a-${index}" role="region" aria-labelledby="faq-q-${index}">
            <div class="faq-a-inner"><p>${t(dict, item.a)}</p></div>
          </div>
        </div>
      `;
    }).join("");

    section.innerHTML = `
      <div class="faq__inner">
        <h2 class="section-heading">${t(dict, "faq.heading")}</h2>
        <div class="faq-list">
          ${renderItems}
        </div>
      </div>
    `;

    initScrollReveal(section);

    const buttons = section.querySelectorAll<HTMLElement>(".faq-q button");
    buttons.forEach((button, i) => {
      button.addEventListener("click", () => {
        if (toggleState.has(i)) {
          toggleState.delete(i);
        } else {
          if (toggleState.size > 0) {
            // Allow multiple open, but could also close all first
            toggleState.clear();
          }
          toggleState.add(i);
        }
        const btn = button.parentElement?.parentElement as HTMLElement | null;
        if (btn) {
          btn.classList.toggle("open", toggleState.has(i));
          button.setAttribute("aria-expanded", String(toggleState.has(i)));
        }
      });
    });
  };

  render();
  i18n.onChange(render);
  return section;
}