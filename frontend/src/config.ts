export interface SocialLinks {
  telegram: string;
  whatsapp: string;
  twitter: string;
  instagram: string;
}

export interface AppConfig {
  apiBaseUrl: string;
  social: SocialLinks;
  githubUrl: string;
  canonicalDomain: string;
  defaultLocale: "en" | "fa";
}

// Values below marked as empty strings are intentionally pending client input.
// Consuming components must treat an empty string as "not yet available"
// and omit the corresponding UI element rather than rendering a broken link.
export const config: AppConfig = {
  apiBaseUrl: (import.meta.env.VITE_API_BASE_URL as string) || "http://localhost:8000",
  social: {
    telegram: "", // TODO: provide real Telegram link
    whatsapp: "", // TODO: provide real WhatsApp link
    twitter: "", // TODO: provide real X/Twitter link
    instagram: "" // TODO: provide real Instagram link
  },
  githubUrl: "", // TODO: provide real GitHub profile/repo URL
  canonicalDomain: (import.meta.env.VITE_CANONICAL_DOMAIN as string) || "https://thehangingman.pages.dev",
  defaultLocale: "en"
};