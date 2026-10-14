import type { I18nStore } from "../i18n/i18n";
import { t } from "../i18n/i18n";
import { config } from "../config";

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

    // Build channel links from config (only non-empty values)
    // Order: telegram, whatsapp, email, github, x, phone
    const channels: Array<{ key: string; label: string; url: string }> = [
      { key: 'telegram', label: t(dict, "contact.channels.telegram"), url: config.social.telegram },
      { key: 'whatsapp', label: t(dict, "contact.channels.whatsapp"), url: config.social.whatsapp },
      { key: 'email',    label: t(dict, "contact.channels.email"),    url: config.social.email },
      { key: 'github',   label: t(dict, "contact.channels.github"),   url: config.githubUrl },
      { key: 'x',        label: t(dict, "contact.channels.x"),        url: config.social.twitter },
      { key: 'phone',    label: t(dict, "contact.channels.phone"),    url: config.social.phone },
    ].filter(c => c.url);

    const channelNames: Record<string, string> = {
      telegram: t(dict, "contact.channels.telegram"),
      whatsapp: t(dict, "contact.channels.whatsapp"),
      email: t(dict, "contact.channels.email"),
      github: t(dict, "contact.channels.github"),
      x: t(dict, "contact.channels.x"),
      phone: t(dict, "contact.channels.phone")
    };

    const channelLinks: HTMLAnchorElement[] = [];

    for (const c of channels) {
      const { key, url } = c;
      if (!url || !url.trim()) continue;

      const link = document.createElement("a");
      link.className = "footer-channel";
      link.textContent = key === "email" ? url!.trim() : key === "phone" ? formatPhone(url!) : t(dict, `contact.channels.${key}`);
      link.setAttribute("aria-label", t(dict, `contact.channels.${key}`));
      link.href = key === "phone" ? url : "";
      link.rel = key === "email" || key === "phone" ? "" : 'noopener';
      if (key !== "email" && key !== "phone") {
        link.target = '_blank';
      }
      channelLinks.push(link);
    }

    // Format phone number: +44 7449 768066
    function formatPhone(phone: string): string {
      // Remove any non-digit characters except +
      const digits = phone.replace(/\D/g, '').replace(/^\+/, '');
      // Format as +44 7449 768066
      if (digits.length >= 11) {
        return `+44 ${digits.slice(1, 5)} ${digits.slice(5)}`;
      }
      return phone;
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