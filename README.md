# The Hanging Man

Independent software developer's marketing website.

## Structure

```
thehangingman/
├── frontend/   Vite + TypeScript static site (Cloudflare Pages)
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

### Build for production

```bash
npm run build
```

Output goes to `frontend/dist`.

### Deploy (Cloudflare Pages)

1. Connect the repository in Cloudflare Pages.
2. Build command: `npm run build` (root directory: `frontend`)
3. Output directory: `dist`
4. Set environment variable `VITE_API_BASE_URL` to the deployed backend URL.

### IMPORTANT: Logo asset

This text-based delivery channel cannot transmit binary files. Before deploying,
manually place the approved logo PNG at `frontend/public/logo.png`.
The header component degrades gracefully (hides broken image) if the file is missing.

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

If `BOT_TOKEN`/`CHAT_ID` are not set, `/contact` runs in **mock mode**: it logs
the submission server-side and returns success, instead of calling Telegram.
This lets the whole stack be developed and tested before real bot credentials exist.

### Deploy (Render)

Use the included `render.yaml` blueprint, or manually create a Web Service:

- Root directory: `backend`
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Set env vars: `BOT_TOKEN`, `CHAT_ID`, `ALLOWED_ORIGINS` (set to your Cloudflare Pages URL)

## Motion & Accessibility

The site uses a lightweight, dependency-free motion layer (see
`frontend/src/utils/scrollReveal.ts`):

- **Scroll-reveal**: sections and cards fade/slide into view the first time
  they enter the viewport, using `IntersectionObserver`. Content already seen
  (e.g. before a language switch rebuilds the DOM) is shown immediately
  instead of re-animating, to avoid a jarring re-fade.
- **Micro-interactions**: a subtle breathing glow on the header logo, a
  bouncing scroll cue under the Hero, smooth anchor scrolling, and richer
  hover states on cards/steps.
- **Accessibility**: every animation respects the OS-level
  `prefers-reduced-motion` setting. When enabled, all scroll-reveal content
  is shown immediately and all CSS animations/transitions are effectively
  disabled (see the global override in `base.css` and the component-level
  rules in `components.css`).

To test reduced-motion behavior locally: in Chrome DevTools, open the
Rendering tab → "Emulate CSS media feature prefers-reduced-motion" → `reduce`.

## Phase 1 scope

- Project scaffolding (frontend + backend)
- i18n engine (EN default, FA toggle, no reload, dir/lang switching)
- Header component (logo, brand, nav placeholders, language switch, CTA)
- Hero section (draft copy, pending final approval)
- Backend `/health` and `/contact` (mock mode + honeypot spam stub)
- CORS wired via env var

## Phase 2 scope

- Services section (4 cards, draft copy)
- Approach / How I Work section (4 steps, draft copy)
- Scroll-reveal motion layer + micro-interactions (this update), fully
  accessible via `prefers-reduced-motion`

Not yet implemented (future phases): Portfolio-link, FAQ, Footer, full
Contact form, real Telegram send, rate limiting, SEO/meta polish.