import type { I18nStore, Locale } from "../i18n/i18n";
import { t } from "../i18n/i18n";

export function renderHeader(i18n: I18nStore): HTMLElement {
  const header = document.createElement("header");
  header.className = "site-header";
  header.setAttribute("role", "banner");

  const render = (): void => {
    const dict = i18n.getDict();
    const currentLocale = i18n.getLocale();

    header.innerHTML = `
      <div class="site-header__inner">
        <a href="#top" class="site-header__brand" aria-label="${t(dict, "header.brand")}">
          <span class="site-header__brand-name">${t(dict, "header.brand")}</span>
        </a>
        <div class="site-header__end">
          <nav class="site-header__nav" aria-label="Primary">
            <button type="button" class="site-header__nav-btn" data-nav="about">${t(dict, "header.nav.about")}</button>
            <button type="button" class="site-header__nav-btn" data-nav="process">${t(dict, "header.nav.process")}</button>
            <button type="button" class="site-header__nav-btn" data-nav="contact">${t(dict, "header.nav.contact")}</button>
          </nav>
          <button type="button" class="lang-switch" id="lang-switch" aria-label="Switch language">
            ${t(dict, "header.langSwitch")}
          </button>
        </div>
      </div>
    `;

    const toggleButton = header.querySelector<HTMLButtonElement>("#lang-switch");
    toggleButton?.addEventListener("click", () => {
      const next: Locale = currentLocale === "en" ? "fa" : "en";
      i18n.setLocale(next);
    });
  };

  render();
  i18n.onChange(render);
  return header;
}