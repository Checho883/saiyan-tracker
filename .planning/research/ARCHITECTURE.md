# Architecture Research: v2.0 Deploy & Visual Overhaul

**Domain:** Vercel + VPS deployment with Vite asset pipeline integration
**Researched:** 2026-03-11
**Confidence:** HIGH (Vercel + FastAPI CORS from official docs; Vite asset handling from official docs; systemd patterns from multiple production guides)

## Current Architecture Snapshot (Existing — Do Not Break)

```
Dev Mode (current)
  Browser :5173
      |
      | Vite dev proxy: /api/* -> localhost:8000
      |
  FastAPI :8000 (uvicorn, process started manually)
      |
  SQLite: backend/saiyan_tracker.db  (relative path, hardcoded in config.py)
```

```
Production Target (v2.0 goal)
  Browser -> https://saiyan-tracker.vercel.app
      |
      | CORS cross-origin XHR (no proxy — ky uses VITE_API_BASE env var)
      |
  Nginx (port 443) on Hostinger VPS
      |
      | reverse proxy to 127.0.0.1:8000
      |
  FastAPI + uvicorn (systemd-managed, auto-restart)
      |
  SQLite: /home/deploy/saiyan-tracker/saiyan_tracker.db (absolute path)
```

## Component Responsibilities

| Component | Responsibility | Notes |
|-----------|---------------|-------|
| Vercel CDN | Serve Vite-built static files (HTML/JS/CSS/assets) | Zero-config Vite detection; free tier sufficient |
| Nginx on VPS | TLS termination, reverse proxy to uvicorn, serve no static files | Needed for HTTPS and clean port 80/443 binding |
| uvicorn (systemd) | Run FastAPI ASGI app, bind to 127.0.0.1:8000 only | Never expose 8000 publicly; Nginx is the public face |
| SQLite file | Persist all data, absolute path on VPS disk | No migration away from SQLite needed for single user |
| FastAPI CORSMiddleware | Allow cross-origin requests from Vercel domain | Must be added to main.py — currently absent |

## What Must Change vs What Stays the Same

### Changes Required

| File | Change | Reason |
|------|--------|--------|
| `backend/app/core/config.py` | Read `DATABASE_URL` from env var with fallback | Hardcoded `sqlite:///saiyan_tracker.db` is relative to CWD; breaks on VPS |
| `backend/app/main.py` | Add `CORSMiddleware` with Vercel origin + localhost | No CORS headers = all API calls fail from Vercel |
| `frontend/vite.config.ts` | No change needed for production | Vite proxy only runs in dev server mode |
| `frontend/src/services/api.ts` | No change needed | Already reads `VITE_API_BASE` env var with localhost fallback |
| `frontend/.env.production` | Add `VITE_API_BASE=https://api.yourdomain.com/api/v1` | Baked into build at compile time; set in Vercel dashboard |

### New Files Required

| File | Purpose |
|------|---------|
| `vercel.json` (repo root or frontend/) | SPA fallback rewrite so direct URL navigation works |
| `/etc/systemd/system/saiyan-tracker.service` | Auto-start and auto-restart FastAPI on VPS boot |
| `frontend/public/assets/avatars/*.webp` | Saiyan transformation images (base, ssj, ssj2, ssj3, ssg, ssb, ui) |
| `frontend/public/assets/characters/*.webp` | Goku + Vegeta portrait images for `CharacterQuote.showCharacterQuote()` |
| `frontend/public/assets/dragon-balls/*.webp` | Dragon Ball sphere orb images (optional — balls are currently CSS circles) |
| `frontend/public/assets/backgrounds/*.webp` | Background/splash art (optional — current CSS gradients work) |
| `backend/.env` | `DATABASE_URL` and `CORS_ORIGINS` on VPS (not committed) |

### Stays Identical

- All 9 API routers and their endpoints
- All Zustand stores
- All React components (they already have image fallbacks via `onError`)
- Audio sprite files in `frontend/public/audio/`
- Tailwind v4 theme tokens
- SQLite database schema (no migration needed for deployment)

## Deployment Architecture: Vercel Frontend

### Project Root Setting

The repo root contains both `frontend/` and `backend/` subdirectories. Vercel must be pointed at the `frontend/` subdirectory as the project root.

**Vercel project settings (set in dashboard or vercel.json):**
```
Root Directory: frontend
Build Command:  npm run build        (runs vite build)
Output Directory: dist               (Vite default, auto-detected)
Install Command: npm install
```

Vercel auto-detects Vite from `package.json` and applies these defaults. Setting Root Directory to `frontend` is the only manual step required.

### SPA Routing Fix

Without this, refreshing any non-root URL (e.g. `/analytics`) returns a 404 from Vercel's CDN. React uses client-side routing — the server must always serve `index.html`.

Create `frontend/vercel.json`:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Environment Variable Flow

```
Vercel Dashboard -> Project Settings -> Environment Variables
  VITE_API_BASE = https://api.yourdomain.com/api/v1   (Production)
  VITE_API_BASE = https://api.yourdomain.com/api/v1   (Preview, same or staging)

         |
         | Vercel injects at build time
         v

vite build reads import.meta.env.VITE_API_BASE
         |
         | Statically replaced in compiled JS bundle
         v

Browser executes: ky uses baked-in https://api.yourdomain.com/api/v1 as prefixUrl
```

**Critical:** `VITE_*` vars are compile-time constants baked into the JS bundle. They are NOT runtime secrets. Never put actual secrets in `VITE_*` variables.

**Local dev unchanged:** `VITE_API_BASE` is absent in `.env.development` so `api.ts` falls back to `http://localhost:8000/api/v1` and the Vite proxy takes over for `/api/*` paths.

## Deployment Architecture: VPS Backend

### Stack on Hostinger VPS

```
Internet -> port 443 (HTTPS)
    |
  Nginx (reverse proxy + TLS via Let's Encrypt certbot)
    |
  127.0.0.1:8000 (never exposed publicly)
    |
  uvicorn (FastAPI ASGI, managed by systemd)
    |
  /home/deploy/saiyan-tracker/saiyan_tracker.db (SQLite, absolute path)
```

### systemd Service File

Location on VPS: `/etc/systemd/system/saiyan-tracker.service`

```ini
[Unit]
Description=Saiyan Tracker FastAPI
After=network.target

[Service]
Type=simple
User=deploy
Group=deploy
WorkingDirectory=/home/deploy/saiyan-tracker/backend
EnvironmentFile=/home/deploy/saiyan-tracker/backend/.env
ExecStart=/home/deploy/saiyan-tracker/.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Activation:
```bash
sudo systemctl daemon-reload
sudo systemctl enable saiyan-tracker
sudo systemctl start saiyan-tracker
sudo journalctl -u saiyan-tracker -f   # watch logs
```

### Backend .env File (VPS only, not committed)

Location: `/home/deploy/saiyan-tracker/backend/.env`

```
DATABASE_URL=sqlite:////home/deploy/saiyan-tracker/saiyan_tracker.db
CORS_ORIGINS=https://saiyan-tracker.vercel.app,http://localhost:5173
```

**SQLite absolute path format:** Four slashes total — `sqlite:////` prefix followed by the absolute path starting with `/`. The relative path `sqlite:///saiyan_tracker.db` breaks when systemd changes the working directory.

### FastAPI Config Change

Modify `backend/app/core/config.py`:
```python
import os

class Settings:
    APP_TITLE: str = "Saiyan Tracker"
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "sqlite:///saiyan_tracker.db"   # dev fallback (relative path, fine for local)
    )
    CORS_ORIGINS: list[str] = [
        o.strip()
        for o in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5173,http://localhost:3000"
        ).split(",")
    ]
```

### CORSMiddleware Addition

Modify `backend/app/main.py` — add after `app = FastAPI(...)`:
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=False,   # no cookies used — keep False, allows wildcard-style flexibility
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Why `allow_credentials=False`:** The app has no auth, uses no cookies, and sends no credentials. Keeping it False means `allow_origins` can remain a list without the strict `allow_credentials=True` constraint (which forbids `["*"]` in other params). Simpler and correct for this app.

**CORS origin list must include:**
- `https://saiyan-tracker.vercel.app` (production Vercel domain)
- `https://saiyan-tracker-*.vercel.app` — note: FastAPI CORSMiddleware does NOT support wildcard subdomains. Add preview URLs explicitly if needed, or use `["*"]` during initial setup then lock down.
- `http://localhost:5173` (local dev)

## Visual Asset Architecture

### Decision: public/ Not src/assets/

All game art goes in `frontend/public/assets/` — NOT in `frontend/src/assets/`.

**Rationale:**

| Criterion | public/ | src/assets/ |
|-----------|---------|-------------|
| Referenced by URL string in JS | Required (SaiyanAvatar uses `/assets/avatars/${transformation}.webp`) | Cannot use string interpolation with imports |
| File hash/cache-busting | Manual (use deployment date or version suffix if needed) | Automatic (Vite appends content hash) |
| Vite processing | None — copied verbatim | Processed, can be inlined if < 4KB |
| Dynamic paths | Supported | Not supported (must be static import) |
| CharacterQuote `avatar_path` from API | Yes — API returns a path string | No — cannot import by dynamic string |

**The existing components already hardcode public-style paths:**
- `SaiyanAvatar`: `/assets/avatars/${transformation}.webp`
- `CharacterQuote`: `quote.avatar_path` (a string from the API response)
- `DragonBallTracker`: currently CSS circles, no image paths yet

All three patterns require URL strings, which rules out `src/assets/` imports.

### Asset Directory Structure

```
frontend/public/
├── audio/
│   ├── sprite.mp3          (existing — 13 sound effects)
│   └── sprite.webm         (existing)
└── assets/
    ├── avatars/
    │   ├── base.webp        (Base Goku — SaiyanAvatar fallback)
    │   ├── ssj.webp         (Super Saiyan)
    │   ├── ssj2.webp        (SSJ2)
    │   ├── ssj3.webp        (SSJ3)
    │   ├── ssg.webp         (Super Saiyan God)
    │   ├── ssb.webp         (Super Saiyan Blue)
    │   ├── ui.webp          (Ultra Instinct)
    │   ├── beast.webp       (Beast — 8th form if needed)
    │   └── README.txt       (license/source notes for personal use)
    ├── characters/
    │   ├── goku.webp        (Goku portrait for CharacterQuote toasts)
    │   ├── vegeta.webp      (Vegeta portrait for CharacterQuote toasts)
    │   ├── gohan.webp       (optional — if used in quotes)
    │   ├── piccolo.webp     (optional)
    │   └── frieza.webp      (optional)
    ├── dragon-balls/
    │   ├── 1-star.webp      (optional — DragonBallTracker upgrade)
    │   ├── 2-star.webp
    │   └── ... (7 total)
    └── backgrounds/
        └── space.webp       (optional — hero section bg)
```

### Format Choice: WebP

Use WebP for all game art raster images.

**Reasoning:**
- Smaller file size than PNG (25-35% reduction typical) with same visual quality
- Supported in all modern browsers used in 2026 (Chrome, Firefox, Safari 14+, Edge)
- Vite/browser serves WebP natively from `public/` without any conversion
- Components already use `.webp` extension in their `src` attributes (`SaiyanAvatar`, `CharacterQuote`)

**SVG vs WebP for avatar art:**
- SVGs are ideal for clean vector art (logos, icons, geometric illustrations)
- DBZ anime-faithful art is typically raster (paintings/screenshots/renders), not clean vector
- Sourced art from Vecteezy/wallpaper sites will be PNG/JPG/WebP — convert to WebP at target size
- If SVG art is available, place in `public/assets/avatars/*.svg` and update component `src` attributes — SVGs also load fine from `public/`

**Target sizes:**
- Avatars: 192×192px (displayed at 96px max, 2x for retina) — crop to square, circular mask is CSS
- Character portraits: 80×80px (displayed at 40×40px in toast, 2x retina)
- Dragon Ball orbs: 64×64px (displayed at 32×32px)
- Background art: 768×1024px max (single user, mobile-first)

### Image Optimization Before Deployment

Vite does NOT optimize images in `public/` — they pass through verbatim. Optimize before placing them in the repo:

```bash
# Convert and resize PNG/JPG source art to WebP (requires cwebp or ffmpeg)
cwebp -q 85 source.png -o frontend/public/assets/avatars/ssj.webp
# Or with ffmpeg:
ffmpeg -i source.png -vf scale=192:192 -c:v libwebp -quality 85 frontend/public/assets/avatars/ssj.webp
```

Quality 80-90 is the sweet spot for anime art (preserves sharp lines and color blocks).

### How CharacterQuote Gets avatar_path

The `CharacterQuote` component renders `quote.avatar_path` from the `QuoteResponse` API type. This path string comes from the backend — the `Quote` model has an `avatar_path` field.

Check the current seed data and `Quote` model to confirm what paths are stored. The seeded quotes need `avatar_path` values like `/assets/characters/goku.webp`. If the seed data currently has empty or placeholder paths, update `backend/app/database/seed.py` to populate them once the image files are placed.

## Data Flow Changes

### Before (Dev)

```
Browser
  |-- GET /api/habits/today/list
  |     Vite proxy rewrites to http://localhost:8000/api/habits/today/list
  |     No CORS headers needed (same-origin via proxy)
  |
  |-- GET /assets/avatars/ssj.webp
        Served by Vite dev server from frontend/public/assets/avatars/ssj.webp
        (currently 404 — files don't exist yet)
```

### After (Production)

```
Browser
  |-- GET https://saiyan-tracker.vercel.app/
  |     Served by Vercel CDN (index.html)
  |
  |-- GET https://saiyan-tracker.vercel.app/assets/avatars/ssj.webp
  |     Served by Vercel CDN from frontend/public/assets/avatars/ssj.webp
  |     (no JS processing, just static file serving)
  |
  |-- XHR POST https://api.yourdomain.com/api/v1/habits/{id}/check
        Browser sends CORS preflight OPTIONS
        Nginx proxies to FastAPI
        FastAPI CORSMiddleware responds with:
          Access-Control-Allow-Origin: https://saiyan-tracker.vercel.app
          Access-Control-Allow-Methods: *
          Access-Control-Allow-Headers: *
        Browser proceeds with POST
        FastAPI returns CheckHabitResponse JSON
```

## Recommended Build Order

Dependencies drive the ordering. CORS config and env vars must exist before any integration testing.

### Step 1: Backend Deployment Prep (blocks all testing)

**What:** Add CORSMiddleware + env-var-driven config + absolute DB path. No logic changes.

**Files touched:**
- `backend/app/core/config.py` — env var reading
- `backend/app/main.py` — add CORSMiddleware

**Why first:** Every subsequent test (both local integration and production) requires CORS headers to be present. The database path fix is required for VPS deployment to work at all.

### Step 2: Frontend Deployment Prep (blocks Vercel deploy)

**What:** Add `frontend/vercel.json` for SPA routing. Confirm `VITE_API_BASE` env var behavior.

**Files touched:**
- `frontend/vercel.json` — new file, SPA rewrite rule

**Why second:** Vercel deploy without this results in 404 on page refresh. Fast to implement, zero risk.

### Step 3: VPS Infrastructure Setup (blocks live API)

**What:** SSH into Hostinger VPS, install Python 3.14 + nginx, create systemd service, set up Let's Encrypt TLS, configure Nginx reverse proxy.

**Files touched (on VPS, not in repo):**
- `/etc/systemd/system/saiyan-tracker.service`
- `/etc/nginx/sites-available/saiyan-tracker`
- `/home/deploy/saiyan-tracker/backend/.env`

**Why third:** This is infrastructure work that can proceed while art is being gathered. Once done, run integration test: deploy frontend pointing at real API, verify habit check works end-to-end.

### Step 4: Avatar Art Integration (unblocks visual hero section)

**What:** Gather/convert Saiyan transformation images (7 forms), place in `frontend/public/assets/avatars/`. Update CharacterQuote seed data paths.

**Why fourth:** SaiyanAvatar already has fallback to `base.webp` then lucide-react User icon — app is functional without this. Avatar art is the highest-impact visual change (appears on every dashboard load).

**Dependency check:** Step 3 should be done or running in parallel. Art files can be tested locally (Vite dev server serves from `public/` identically to production).

### Step 5: Character Portrait Art Integration (unblocks quote visuals)

**What:** Gather Goku + Vegeta portrait images, place in `frontend/public/assets/characters/`. Update seed data `avatar_path` fields.

**Why fifth:** CharacterQuote toasts already have fallback to a User icon. Portraits enhance the quotes but don't block any functionality. Requires updating seed data and potentially re-seeding.

### Step 6: Optional Art (Dragon Ball orbs, backgrounds)

**What:** Dragon Ball sphere illustrations, background art. These require component changes, unlike avatars/portraits which are drop-in file replacements.

**DragonBallTracker** currently renders CSS circles with star numbers. Replacing with actual orb images requires modifying the component to use `<img>` tags instead of styled divs. This is higher effort for lower impact than avatars.

**Background art** requires adding CSS `background-image` to the HeroSection's gradient div. Low complexity but pure polish.

**Why last:** These are optional enhancements, not the deployment goal. Do after the app is live and the core avatar art is working.

## Integration Points

### New vs Modified (Summary)

| File | Status | What |
|------|--------|------|
| `backend/app/core/config.py` | MODIFY | Read DATABASE_URL and CORS_ORIGINS from env vars |
| `backend/app/main.py` | MODIFY | Add CORSMiddleware |
| `frontend/vercel.json` | NEW | SPA rewrite rule |
| `frontend/public/assets/avatars/*.webp` | NEW (7 files) | Saiyan transformation art |
| `frontend/public/assets/characters/*.webp` | NEW (2-5 files) | Character portraits |
| `backend/app/database/seed.py` | MODIFY | Populate `avatar_path` fields for Quote records |
| `/etc/systemd/system/saiyan-tracker.service` | NEW (VPS only) | Auto-start service |
| `/etc/nginx/sites-available/saiyan-tracker` | NEW (VPS only) | Reverse proxy config |
| `backend/.env` | NEW (VPS only, not in repo) | Production env vars |

### No Frontend Component Changes Required

The existing components already handle the deployment and art scenarios correctly:

| Component | Current State | What Happens |
|-----------|--------------|--------------|
| `SaiyanAvatar` | Loads `/assets/avatars/${transformation}.webp`, falls back to `base.webp`, falls back to User icon | Drop image files in, it works immediately |
| `CharacterQuote` | Loads `quote.avatar_path` from API response, falls back to User icon | Update seed data paths, it works immediately |
| `DragonBallTracker` | CSS circles — no image loading | No change needed for v2.0 core deployment |
| `services/api.ts` | Already reads `VITE_API_BASE` env var | Set env var in Vercel dashboard, done |

## Anti-Patterns to Avoid

### Anti-Pattern 1: Placing Art in src/assets/ for Dynamic Paths

**What people do:** Import images with `import ssj from './assets/avatars/ssj.webp'` and store them in a map object.

**Why it's wrong:** `SaiyanAvatar` builds the image path dynamically from the `transformation` prop string. Static imports require knowing the path at build time. You'd need to import all 7 variants upfront and maintain a manual map.

**Do this instead:** Place all art in `frontend/public/assets/` and use URL strings. The existing component code is already written for this pattern.

### Anti-Pattern 2: Exposing uvicorn Directly on Port 80/443

**What people do:** Run `uvicorn --host 0.0.0.0 --port 80` and skip Nginx.

**Why it's wrong:** uvicorn is not designed to handle TLS, DDoS protection, or request buffering. It lacks the hardening of a production web server. Let's Encrypt certbot also expects Nginx/Apache to issue certificates.

**Do this instead:** Bind uvicorn to `127.0.0.1:8000` only (never externally reachable). Nginx handles port 443 with TLS and proxies to the local uvicorn.

### Anti-Pattern 3: Setting VITE_API_BASE in .env Files Committed to Repo

**What people do:** Create `frontend/.env.production` with `VITE_API_BASE=https://api.yourdomain.com/api/v1` and commit it.

**Why it's wrong:** The API base URL is deployment-environment-specific. If you ever need to change it (different VPS, different domain), it requires a code commit. Also exposes your server address publicly in the repo.

**Do this instead:** Set `VITE_API_BASE` in Vercel's dashboard Environment Variables UI. It gets injected at build time without being in the repo. Keep `.env.production` out of git (add to `.gitignore` if created locally for testing).

### Anti-Pattern 4: allow_credentials=True with allow_origins=["*"]

**What people do:** Copy-paste a CORS config that sets `allow_credentials=True` and `allow_origins=["*"]` simultaneously.

**Why it's wrong:** Browsers reject this combination per the CORS spec. FastAPI will raise a warning and the browser will block the request.

**Do this instead:** Since the app has no auth/cookies, use `allow_credentials=False` (the default). This allows explicit origin lists without the credential restriction.

### Anti-Pattern 5: Optimizing Images Inside the Vite Build

**What people do:** Add `vite-plugin-imagemin` or similar to auto-compress images during build.

**Why it's wrong:** For a personal single-user app with ~10-15 images, build-time image processing adds plugin dependencies, build time, and potential compatibility issues. The payoff is negligible for this scale.

**Do this instead:** Pre-optimize images once before placing them in the repo (using cwebp or ffmpeg). Fixed, known-good file sizes. Zero build pipeline complexity.

### Anti-Pattern 6: Using Relative SQLite Path on VPS

**What people do:** Keep `sqlite:///saiyan_tracker.db` and rely on the working directory being the backend folder.

**Why it's wrong:** systemd `WorkingDirectory` and uvicorn's actual working directory during startup can differ. A relative path creates the DB wherever uvicorn happens to start, which may not be the intended location. After a system restart, a new DB file may be created in a different directory, silently losing all data.

**Do this instead:** Set `DATABASE_URL` to a full absolute path: `sqlite:////home/deploy/saiyan-tracker/saiyan_tracker.db`. Read from environment variable in config.py. Verify the path exists and is writable before starting the service.

## Sources

- [FastAPI CORSMiddleware documentation](https://fastapi.tiangolo.com/tutorial/cors/) — exact parameter semantics, credentials constraint
- [Vite Static Asset Handling](https://vite.dev/guide/assets) — public/ vs src/assets/ behavior, hashing rules, inline limit
- [Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite) — zero-config detection, SPA rewrite pattern, VITE_ env var prefix requirement
- [Vercel Environment Variables](https://vercel.com/docs/environment-variables) — build-time injection, dashboard configuration
- [Deploy FastAPI on Ubuntu VPS guides](https://dev.to/1amkaizen/deploying-a-fastapi-project-to-an-ubuntu-vps-a-complete-guide-for-developers-392) — systemd service file pattern, Nginx proxy config
- [Nginx + uvicorn FastAPI deployment](https://dylancastillo.co/fastapi-nginx-gunicorn/) — port vs socket tradeoffs, binding to 127.0.0.1
- Direct codebase analysis: `SaiyanAvatar.tsx` (dynamic path pattern), `CharacterQuote.tsx` (avatar_path from API), `services/api.ts` (VITE_API_BASE usage), `backend/app/core/config.py` (current hardcoded URL), `backend/app/main.py` (no CORS middleware currently)

---
*Architecture research for: Saiyan Tracker v2.0 Deploy & Visual Overhaul*
*Researched: 2026-03-11*
