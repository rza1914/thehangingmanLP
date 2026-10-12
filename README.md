# The Hanging Man

Independent software developer's marketing website.
One continuous line-drawing narrative, drawn by the scroll itself.

## Structure

```
thehangingman/
├── frontend/   Vite + TypeScript site (Cloudflare Pages)
└── backend/    FastAPI contact-form endpoint (Render)
```

## Frontend

### Install & run locally

```bash
cd frontend
npm install
cp .env.example .env   # edit VITE_API_BASE_URL if backend runs elsewhere
npm run dev
```

Opens on http://localhost:5173

### Test

```bash
npm run test
```

50 tests across 8 files: stage, services, approach, header, i18n,
scroll-reveal, line variant, and the retired blueprint system.

### Build for production

```bash
npm run build
```

Runs `tsc --noEmit && vite build` — the build **fails on any type error**.
Output goes to `frontend/dist`.

## The scroll-narrative stage

The desktop experience is a single pinned "camera" that pans down one
continuous SVG drawing as the user scrolls:

- One `.stage-wrap` (520vh scroll band) + one sticky `.stage`.
- One SVG canvas of 1600 × 4500 units; the `viewBox` pans from y = 0 to
  y = 3600 with scroll progress. The narrative is never cut into separate
  screens — it is one continuous drawing.
- Every line and text gets its draw window derived from its canvas Y
  (`lineWin()` / `textWin()` in `src/components/stage.ts`), so drawing tips
  stay just ahead of the viewport's bottom edge: lines are drawn *by* the
  scroll, never static.
- A glowing pen tip rides the trunk segment currently being drawn.
- The narrative, in canvas order:
  1. **Hero** — the brand title writes itself, the hero line draws, three
     hanging teaser lines carry the value props, the trunk (V1) hangs from
     the very top edge.
  2. **WHO I AM** — thin lines off the trunk, words along them.
  3. **HOW I WORK** — the trunk continues as V2, crossing H2/H3; steps on
     thin lines.
  4. **WHAT I BUILD** — a horizontal rail with four sketch-drawn service
     boxes hanging from it.
  5. **START A PROJECT** — base line, CTA, six channel lines rising from
     it, and the footer hairline with descending tagline/copyright.
- The trunk is one continuous line from the top edge to the base line.
- **RTL / Persian**: the whole composition is mirrored (via the `X()`
  helper), text directions are set explicitly, typography switches to
  Vazirmatn. Switching languages re-renders the stage without a reload.
- **Mobile (< 820px)**: the stage is hidden; a semantic text page is shown
  instead (hero, services, approach, FAQ, work, contact form, footer).
- **prefers-reduced-motion**: the canvas renders fully drawn; scrolling
  pans the camera with no animation. To test: Chrome DevTools → Rendering
  tab → "Emulate CSS media feature prefers-reduced-motion" → `reduce`.
- **Pacing**: the total scroll length is one CSS value —
  `.stage-wrap{height:520vh}` in `src/styles/components.css`.
  Lower = faster narrative, higher = slower. Nothing else needs changing.

### Header navigation

Three buttons (`data-nav`): **About** pans the camera to the WHO I AM
screen, **Process** to HOW I WORK, **Contact** scrolls to the inquiry form
below the stage. On mobile they scroll the text sections.

### Retired systems

`src/components/hero.ts` and `src/utils/blueprintLines.ts` are no longer
rendered by `main.ts` — the stage replaced them — but are kept in the
tree, with their tests still passing. Optional cleanup: `git rm` them and
their test files in one commit.

## Sections below the stage

- **FAQ** — accessible accordion: first item open by default, keyboard
  operable, instant open under reduced motion.
- **Work** — a single GitHub row; no fabricated projects. A commented
  template inside `work.ts` shows how to add a real project later.
- **Contact form** — name / email / message (+ hidden honeypot, + locale).
  Client-side validation with inline bilingual errors; POSTs to
  `${VITE_API_BASE_URL}/contact`; 15s AbortController timeout to tolerate
  Render cold starts; honest success/error states only.
- **Footer** — mobile only. On desktop the footer is the stage's final
  beat (hairline + descending tagline/copyright). Hidden via
  `@media (min-width:821px){.site-footer{display:none}}`.

## i18n

- Engine: `src/i18n/i18n.ts` (`I18nStore`); dictionaries in
  `src/i18n/en.json` / `src/i18n/fa.json`.
- English default, Persian toggle with no reload: `lang`/`dir` switch,
  `document.title`, meta description and OG locale update, choice
  persisted in localStorage.
- The brand name stays in English in both languages.
- Persian typography: Vazirmatn, letter-spacing removed (it breaks Persian
  letter joining), Jalali year in the footer.

## Contact channels

All channels live in `frontend/src/config.ts`. An empty value hides that
channel everywhere (stage channel lines and footer) — no broken links are
possible. Currently configured:

| Channel | Value |
|---|---|
| GitHub | https://github.com/thehangingman1911-ai |
| Telegram | https://t.me/thehangingman1911 |
| WhatsApp | https://wa.me/message/CCMR56KMR4R3M1 |
| X | https://x.com/rbaghani31159 |
| Email | thehangingman.1911@gmail.com |
| Phone | +44 7449 768066 |

## Backend

### Install & run locally

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env        # fill BOT_TOKEN / CHAT_ID when available
uvicorn app.main:app --reload
```

Runs on http://localhost:8000

### Test

```bash
pytest -v
```

### Environment variables

| Var | Required | Description |
|---|---|---|
| BOT_TOKEN | No (mock mode if absent) | Telegram bot token |
| CHAT_ID | No (mock mode if absent) | Telegram chat id to receive messages |
| ALLOWED_ORIGINS | Yes in production | Comma-separated list of allowed CORS origins |
| ENVIRONMENT | No | development / production (informational) |

If `BOT_TOKEN`/`CHAT_ID` are not set, `/contact` runs in **mock mode**: it
logs the submission server-side and returns success instead of calling
Telegram. ⚠️ Do not serve real traffic in mock mode — set the Telegram
credentials and `ENVIRONMENT=production` before sharing the site widely,
or inquiries will be logged but never delivered.

## Deploy

Order matters:

1. **Backend → Render**: use the included `render.yaml` blueprint, or a
   Web Service with root directory `backend`, build command
   `pip install -r requirements.txt`, start command
   `uvicorn app.main:app --host 0.0.0.0 --port $PORT`. Set
   `ALLOWED_ORIGINS=*` temporarily and `ENVIRONMENT=development`.
2. **Frontend env**: set `VITE_API_BASE_URL` to the deployed backend URL
   (locally in `frontend/.env`, later in Cloudflare Pages settings).
3. **Frontend → Cloudflare Pages**: connect the repo; root directory
   `frontend`; build command `npm run build`; output directory `dist`;
   environment variable `VITE_API_BASE_URL`.
4. **Lock CORS**: set `ALLOWED_ORIGINS` on Render to your Pages URL.
5. **Activate Telegram**: create a bot with @BotFather, get your chat id,
   set `BOT_TOKEN` and `CHAT_ID` on Render, set `ENVIRONMENT=production`,
   then submit one real test inquiry and confirm it arrives in Telegram.

Custom domain (when purchased): Cloudflare Pages → Custom domains; then
enable the commented canonical/OG lines in `frontend/index.html`.

## IMPORTANT: Logo asset

The design is intentionally self-sufficient without a logo. To add one,
place the PNG at `frontend/public/logo.png` — no other changes required
beyond referencing it where wanted.

## Project status

Done:
- Scroll-narrative stage (camera-pan over a continuous canvas, bilingual,
  full RTL mirror)
- All content sections: FAQ, Work, Contact form, footer (mobile)
- Real contact channels wired from config
- Per-locale SEO/meta + Open Graph + favicon
- Type-checked build (`tsc --noEmit && vite build`), 50/50 tests green

Pending (before real traffic):
- [ ] Backend hardening: in-memory rate limiting (~5 requests/hour per IP)
      and a production guard that fails closed when Telegram credentials
      are missing, instead of silently returning mock success
- [ ] `BOT_TOKEN` / `CHAT_ID` on Render
- [ ] Optional `frontend/public/logo.png`
- [ ] Custom domain + canonical/OG URLs
