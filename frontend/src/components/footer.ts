import type { I18nStore } from "../i18n/i18n";
import { t } from "../i18n/i18n";
import { CONTACT_CHANNELS, isExternalHref } from "../config/contact";

export function renderFooter(i18n: I18nStore): HTMLElement {
  const section = document.createElement("footer");
  section.className = "site-footer";

  const render = (): void => {
    const dict = i18n.getDict();
    const year = new Intl.DateTimeFormat("en-GB", { year: "numeric" }).format(
      new Date()
    );
    const persianYear = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
      year: "numeric",
    }).format(new Date());

    const isRtl = dict.meta.lang === 'fa';

    // Channel links come from the single contact config (label + address)
    const channelLinks: HTMLAnchorElement[] = [];

    for (const c of CONTACT_CHANNELS) {
      const link = document.createElement("a");
      link.className = "footer-channel";
      link.textContent = c.label + ": " + c.shown;
      link.setAttribute("aria-label", c.label + " — " + c.shown);
      link.href = c.href;
      if (isExternalHref(c.href)) {
        link.target = "_blank";
        link.rel = "noopener noreferrer";
      }
      channelLinks.push(link);
    }

    section.innerHTML = `
      <div class="site-footer">
        <div class="footer-channels">
          ${channelLinks.map(link => link.outerHTML).join('')}
        </div>
        <span class="footer-tagline">${t(dict, "footer.tagline")}</span>
        <span class="footer-copy"
          >© ${isRtl ? persianYear : year} The Hanging Man — ${t(
            dict,
            "footer.rights"
          )}</span
        >
      </div>
    `;
  };

  render();
  i18n.onChange(render);
  return section;
}