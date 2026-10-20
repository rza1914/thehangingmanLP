/* Single source of truth for the six contact channels.
   Scene, semantic/mobile lists and the footer must all read from here.
   href values may be overridden with VITE_CONTACT_<ID> env vars. */

export interface ContactChannel {
  id: "telegram" | "whatsapp" | "email" | "phone" | "github" | "x";
  label: string;
  href: string;
  shown: string;
}

function env(name: string): string | undefined {
  try {
    const v = (import.meta as unknown as { env?: Record<string, string | undefined> }).env?.[name];
    return v && v.length > 0 ? v : undefined;
  } catch {
    return undefined;
  }
}

export const CONTACT_CHANNELS: ContactChannel[] = [
  { id: "telegram", label: "TELEGRAM", href: env("VITE_CONTACT_TELEGRAM") || "https://t.me/thehangingman1911",      shown: "t.me/thehangingman1911" },
  { id: "whatsapp", label: "WHATSAPP", href: env("VITE_CONTACT_WHATSAPP") || "https://wa.me/message/CCMR56KMR4R3M1", shown: "wa.me/message/CCMR56KMR4R3M1" },
  { id: "email",    label: "EMAIL",    href: env("VITE_CONTACT_EMAIL")    || "mailto:thehangingman.1911@gmail.com",  shown: "thehangingman.1911@gmail.com" },
  { id: "phone",    label: "PHONE",    href: env("VITE_CONTACT_PHONE")    || "tel:+447449768066",                    shown: "+44 7449 768066" },
  { id: "github",   label: "GITHUB",   href: env("VITE_CONTACT_GITHUB")   || "https://github.com/thehangingman1911-ai", shown: "github.com/thehangingman1911-ai" },
  { id: "x",        label: "X",        href: env("VITE_CONTACT_X")        || "https://x.com/rbaghani31159",      shown: "x.com/rbaghani31159" },
];

/* External links open in a new tab; mailto: and tel: stay in the same tab. */
export function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href);
}
