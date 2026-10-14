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

- Three 1600×900 frames on one continuous 1600×2700 canvas: the camera
  dwells on each frame, then glides softly to the next through the glide
  windows (`CAM` in `src/components/stage.ts`).
- Behind the lines sit the dimmed portfolio slots (`config.portfolio`),
  drifting with parallax; an empty `src` renders a placeholder frame
  with its label.
- The whole rhythm is one number: `.stage-wrap{height:900vh}` in
  `src/styles/components.css`.
- Services and Approach render below the stage at every viewport width.
- Mobile (<820px): a simplified centered "credits cut" of the same narrative —
  a margin spine draws through the whole scroll with the pen riding it; 450vh total.
- Portfolio slots scale and brighten on hover/focus. Disabled for touch and
  reduced-motion users.

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
- **Contact form** — name / email / message (+ hidden honeypot, + locale).
  Client-side validation with inline bilingual errors; POSTs to
  `${VITE_API_BASE_URL}/contact`; 15s AbortController timeout to tolerate
  Render cold starts; honest success/error states only.
- **Footer** — mobile only. On desktop the footer is the stage's final
  beat (hairline + descending tagline/copyright). Hidden via
  `@media (min-width:821px){.site-footer{display:none}}`.

> **Services** and **Approach** now live inside the scroll narrative itself
> (the "WHAT I BUILD" and "HOW I WORK" frames on the stage).

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
| ENVIRONMENT | No | development / production (controls CORS wildcard and production guard) |

If `BOT_TOKEN`/`CHAT_ID` are not set, `/contact` runs in **mock mode**: it
logs the submission server-side and returns success instead of calling
Telegram. ⚠️ Do not serve real traffic in mock mode — set the Telegram
credentials and `ENVIRONMENT=production` before sharing the site widely,
or inquiries will be logged but never delivered.

### Hardening (applied)

- **Rate limit**: 5 requests/hour per IP (in-memory sliding window; resets on restart)
- **Production guard**: Without `BOT_TOKEN`/`CHAT_ID` in production (`ENVIRONMENT=production`), `/contact` returns **503** (fail-closed) instead of mock success
- **CORS**: `ALLOWED_ORIGINS` supports `/*`, `allow-all`, `*` as wildcard only in `development`
- **Honeypot**: Hidden form field; if filled → silent 200 OK (no signal to bots)
- **Validation**: `name` (1-100), `email` (EmailStr), `message` (1-2000), `honeypot` (0-200), `locale` (`en`|`fa`)

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
