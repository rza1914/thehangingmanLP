# The Hanging Man — Website

Bilingual (English / Persian) landing page for an independent software
development & automation business. Pure static site: HTML + CSS + vanilla
JavaScript. No build step, no paid services, no secrets in the frontend.

## Run locally

Option A — just open `index.html` in your browser.
Option B (closer to production):

    python3 -m http.server 8000
    # or: npx serve .

then visit http://localhost:8000

## Project structure

    index.html          page structure (all sections)
    css/styles.css      design system + responsive + RTL rules
    js/config.js        THE file you edit (contacts, form endpoint)
    js/i18n.js          all English & Persian copy
    js/main.js          language switcher, nav, FAQ, form logic
    assets/logo.png     drop your logo here (see below)
    assets/favicon.svg  temporary braces-mark favicon (replaceable)

## 1. Add your logo (2 minutes)

Save your logo image as `assets/logo.png` (PNG or JPG — the file must be
named `logo.png`, or update the three `<img data-logo>` tags in index.html).
It is picked up automatically in the header, hero, and footer. Until the
file exists, the site shows a typographic braces mark instead — nothing
breaks, no broken-image icons.

The hero frame is square (`aspect-ratio: 1/1` in css/styles.css, class
`.logo-frame`). If your logo is much wider than tall, change that to
e.g. `4/3`.

## 2. Make the contact form real (5 minutes, free)

Until configured, the form validates input but shows an honest notice
instead of pretending to send. To enable real submissions:

1. Create a free account at https://formspree.io
2. Create a new form → copy the endpoint (looks like `https://formspree.io/f/abcdwxyz`)
3. Open `js/config.js` and paste it into `formEndpoint`
4. Reload the site and send yourself a test inquiry

Formspree's free tier handles 50 submissions/month. The endpoint URL is
public by design — it is not a secret key, so it is safe in frontend code.
The form includes a `_gotcha` honeypot field for basic spam filtering and
tags every submission with the language it was sent in.

## 3. Contact channels

In `js/config.js`, fill any of:

    telegram: "https://t.me/yourusername"
    whatsapp: "https://wa.me/989123456789"
    email:    "mailto:hello@thehangingman.com"

Empty values stay completely hidden. Filled values appear automatically in
the Contact section and the footer, with a clean @handle / address / number.

## 4. Editing copy

All text lives in `js/i18n.js` — English and Persian side by side.
The brand name "The Hanging Man" is intentionally kept in English.

## Deploy (pick one — all free, no build step)

### GitHub Pages
1. Create a repository (e.g. `thehangingman`) and push these files to `main`.
2. Repo → Settings → Pages → Source: "Deploy from a branch" → `main` / `/ (root)`.
3. Live at `https://<username>.github.io/thehangingman/`.

### Cloudflare Pages (recommended for the custom domain later)
1. Push the files to GitHub.
2. Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git.
3. Framework preset: **None**. Build command: leave empty. Output directory: `/`.

### Vercel
1. Push to GitHub → vercel.com → Add New → Project → Import.
2. Framework Preset: **Other**. No build settings needed.

## Custom domain (when you buy thehangingman.com)

- Cloudflare Pages: project → Custom domains → add `thehangingman.com`
  (and `www`) → add the DNS records it shows you.
- GitHub Pages: Settings → Pages → Custom domain; point DNS with the
  A/CNAME records GitHub instructs.
- After that, uncomment the `canonical`, `og:url` and `og:image` lines
  near the top of `index.html`.
- Optional: add `assets/og.png` (1200×630) as the social share image.

## Still needed from you

- [ ] `assets/logo.png` — your actual logo file
- [ ] Telegram / WhatsApp / Email URLs → `js/config.js`
- [ ] Formspree endpoint → `js/config.js` (or your preferred provider)
- [ ] Real portfolio projects — a ready-to-copy HTML template is commented
      inside the `#work` section of index.html
- [ ] Domain purchase + DNS when you're ready
- [ ] Optional 1200×630 `og.png`

## Notes

- No analytics, no trackers, no external JavaScript. The only external
  requests are Google Fonts (Space Grotesk, JetBrains Mono, Vazirmatn).
- Persian mode is a full RTL experience: layout flips via logical CSS
  properties, typography switches to Vazirmatn, letter-spacing is removed
  (it breaks Persian letter joining), numbers localize, and the footer
  year becomes Jalali. The chosen language persists across reloads.
- The current favicon is an SVG braces mark drawn for this build. It is
  NOT your logo — swap `assets/favicon.svg` if you prefer.