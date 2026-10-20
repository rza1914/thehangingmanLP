import enDict from "./en.json";
import faDict from "./fa.json";

export type Locale = "en" | "fa";
export type Dict = typeof enDict;

const dictionaries: Record<Locale, Dict> = {
  en: enDict,
  fa: faDict as Dict
};

const STORAGE_KEY = "thm_locale";

export function getStoredLocale(): Locale | null {
  const value = localStorage.getItem(STORAGE_KEY);
  return value === "en" || value === "fa" ? value : null;
}

export function storeLocale(locale: Locale): void {
  localStorage.setItem(STORAGE_KEY, locale);
}

export function detectInitialLocale(defaultLocale: Locale): Locale {
  const stored = getStoredLocale();
  if (stored) return stored;
  const nav = (navigator.language || "").toLowerCase();
  if (nav.startsWith("fa")) return "fa";
  return defaultLocale;
}

export function getDictionary(locale: Locale): Dict {
  return dictionaries[locale] ?? dictionaries.en;
}

/**
 * Dot-path lookup, e.g. t(dict, "header.nav.services").
 * Falls back to returning the path itself when a key is missing,
 * so missing translations are visibly obvious instead of blank.
 * No `any` is used: values are narrowed at each step.
 */
export function t(dict: Dict, path: string): string {
  const parts = path.split(".");
  let current: unknown = dict;
  for (const part of parts) {
    if (current !== null && typeof current === "object" && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return path;
    }
  }
  return typeof current === "string" ? current : path;
}

export function applyDocumentDirection(dict: Dict): void {
  document.documentElement.lang = dict.meta.lang;
  document.documentElement.dir = dict.meta.dir;
}

/* Keeps the static JSON-LD block in index.html in sync with the active locale. */
export function applyJsonLd(locale: Locale): void {
  const el = document.getElementById("json-ld") as HTMLScriptElement | null;
  if (!el) return;
  const payload = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "The Hanging Man",
    "jobTitle": "Independent Software Developer",
    "url": "https://thehangingman.pages.dev/",
    "sameAs": [
      "https://t.me/thehangingman1911",
      "https://wa.me/message/CCMR56KMR4R3M1",
      "https://github.com/thehangingman1911-ai",
      "https://x.com/rbaghani31159"
    ],
    "email": "thehangingman.1911@gmail.com",
    "description": locale === "fa"
      ? "The Hanging Man؛ توسعه‌دهنده‌ی مستقل نرم‌افزار: وب‌اپ، بک-end و API و اتوماسیون. یک توسعه‌دهنده، با دامنه و قیمتِ روشن، نرم‌افزارِ کارا."
      : "Independent software developer: web apps, backends and APIs, automation. One developer, clear scope and price, working software."
  };
  el.textContent = JSON.stringify(payload, null, 2);
}

type LocaleChangeListener = (locale: Locale, dict: Dict) => void;

export class I18nStore {
  private locale: Locale;
  private dict: Dict;
  private listeners: LocaleChangeListener[] = [];

  constructor(defaultLocale: Locale) {
    this.locale = detectInitialLocale(defaultLocale);
    this.dict = getDictionary(this.locale);
  }

  getLocale(): Locale {
    return this.locale;
  }

  getDict(): Dict {
    return this.dict;
  }

  setLocale(locale: Locale): void {
    this.locale = locale;
    this.dict = getDictionary(locale);
    storeLocale(locale);
    applyDocumentDirection(this.dict);
    // Update SEO meta tags
    const setMeta = (attr: 'name' | 'property', key: string, content: string) => {
      let el = document.head.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el); }
      el.setAttribute('content', content);
    };
    document.title = t(this.dict, 'doc.title');
    setMeta('name', 'description', t(this.dict, 'doc.desc'));
    setMeta('property', 'og:title', t(this.dict, 'doc.title'));
    setMeta('property', 'og:description', t(this.dict, 'doc.desc'));
    setMeta('property', 'og:locale', locale === 'fa' ? 'fa_IR' : 'en');
    applyJsonLd(locale);
    this.listeners.forEach((listener) => listener(this.locale, this.dict));
  }

  onChange(listener: LocaleChangeListener): void {
    this.listeners.push(listener);
  }

  init(): void {
    applyDocumentDirection(this.dict);
  }
}