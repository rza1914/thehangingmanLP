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
 */
export function t(dict: Dict, path: string): string {
  const parts = path.split(".");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let node: any = dict;
  for (const part of parts) {
    if (node && typeof node === "object" && part in node) {
      node = node[part];
    } else {
      return path;
    }
  }
  return typeof node === "string" ? node : path;
}

export function applyDocumentDirection(dict: Dict): void {
  document.documentElement.lang = dict.meta.lang;
  document.documentElement.dir = dict.meta.dir;
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
    this.listeners.forEach((listener) => listener(this.locale, this.dict));
  }

  onChange(listener: LocaleChangeListener): void {
    this.listeners.push(listener);
  }

  init(): void {
    applyDocumentDirection(this.dict);
  }
}