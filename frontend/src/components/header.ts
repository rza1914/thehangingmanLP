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
          <img
            src="/logo.png"
            alt="${t(dict, "header.brand")}"
            class="site-header__logo"
            width="40"
            height="40"
            onerror="this.style.display='none'"
          />
          <span class="site-header__brand-name">${t(dict, "header.brand")}</span>
        </a>
        <nav class="site-header__nav" aria-label="Primary">
          <a href="#services">${t(dict, "header.nav.services")}</a>
          <a href="#approach">${t(dict, "header.nav.approach")}</a>
          <a href="#portfolio">${t(dict, "header.nav.portfolio")}</a>
          <a href="#faq">${t(dict, "header.nav.faq")}</a>
          <a href="#contact">${t(dict, "header.nav.contact")}</a>
        </nav>
        <div class="site-header__actions">
          <button type="button" class="lang-switch" id="lang-switch" aria-label="Switch language">
            ${t(dict, "header.langSwitch")}
          </button>
          <a href="#contact" class="btn btn--primary site-header__cta">${t(dict, "header.cta")}</a>
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