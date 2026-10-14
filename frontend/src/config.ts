export interface SocialLinks {
  telegram: string;
  whatsapp: string;
  twitter: string;
  instagram: string;
  email: string;
  phone: string;
}

export interface PortfolioSlot {
  f: number;      /* فریم 0..2 که تصویر به آن تعلق دارد */
  x: number; y: number; w: number; h: number;
  label: string;  /* لیبل placeholder تا وقتی src خالی است */
  src: string;    /* آدرس تصویر یا data URI — خالی = قاب placeholder */
  href: string;   /* لینک اختیاری هنگام کلیک */
}

export interface AppConfig {
  apiBaseUrl: string;
  social: SocialLinks;
  githubUrl: string;
  canonicalDomain: string;
  defaultLocale: "en" | "fa";
  portfolio: PortfolioSlot[];
}

export const config: AppConfig = {
  apiBaseUrl: (import.meta.env.VITE_API_BASE_URL as string) || "http://localhost:8000",
  social: {
    telegram: 'https://t.me/thehangingman1911',
    whatsapp: 'https://wa.me/message/CCMR56KMR4R3M1',
    twitter: 'https://x.com/rbaghani31159',
    instagram: '',
    email: 'mailto:thehangingman.1911@gmail.com',
    phone: 'tel:+447449768066'
  },
  githubUrl: "https://github.com/thehangingman1911-ai",
  canonicalDomain: (import.meta.env.VITE_CANONICAL_DOMAIN as string) || "https://thehangingman.pages.dev",
  defaultLocale: "en",
  portfolio: [
    { f: 0, x: 1140, y: 240,  w: 340, h: 460, label: "PROJECT 01", src: "", href: "" },
    { f: 0, x: 120,  y: 380,  w: 420, h: 262, label: "PROJECT 02", src: "", href: "" },
    { f: 1, x: 120,  y: 930,  w: 400, h: 250, label: "PROJECT 03", src: "", href: "" },
    { f: 1, x: 120,  y: 1300, w: 400, h: 250, label: "PROJECT 04", src: "", href: "" },
    { f: 2, x: 700,  y: 1850, w: 520, h: 300, label: "PROJECT 05", src: "", href: "" },
    { f: 2, x: 120,  y: 1850, w: 520, h: 160, label: "PROJECT 06", src: "", href: "" },
  ],
};