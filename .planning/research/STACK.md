# Stack Research: v2.0 Deploy & Visual Overhaul

**Domain:** Deploying Vite+FastAPI app to Vercel+VPS with SVG/PNG/WebP asset integration
**Researched:** 2026-03-11
**Confidence:** HIGH

---

## Existing Stack (DO NOT change)

React 19.2 + Vite 7.3 + TypeScript 5.9 + Zustand 5 + Motion 12 + Tailwind CSS v4.2 + Recharts 3.7 + Howler.js 2.2.4 + ky + react-hot-toast + vaul 1.1 + lucide-react + react-router 7.13 + @floating-ui/react 0.27 + @dnd-kit 6.3 + Vitest 4

Python 3.14 + FastAPI (standard) + SQLAlchemy 2.0 + SQLite + uvicorn[standard]

---

## New Additions Required for v2.0

### Frontend (npm)

| Package | Version | Purpose | Why |
|---------|---------|---------|-----|
| `vite-plugin-svgr` | 4.5.0 | Import SVG files as React components via `?react` suffix | Standard Vite approach for SVG-as-component. Required to colorize/animate SVG assets (Shenron, Dragon Balls, character portraits) with Tailwind class props. Peer dep: Vite >=2.6.0, satisfies Vite 7. |
| `vite-plugin-image-optimizer` | 2.0.3 | Compress PNG/WebP/AVIF at build time via Sharp and SVGO | Peer dep: Vite >=5, Sharp >=0.34.0, svgo >=4. DBZ art from Vecteezy is typically 500KB-2MB per file; compression to WebP keeps LCP under 2.5s on mobile. |
| `sharp` | 0.34.5 | Node image processing engine (required by vite-plugin-image-optimizer) | Libvips-based, fastest Node image processor. Converts PNG→WebP, resizes, compresses. Must be explicitly installed (not auto-pulled as a dep). |

### Backend (pip)

| Package | Version | Purpose | Why |
|---------|---------|---------|-----|
| `gunicorn` | 25.1.0 | Production process manager wrapping uvicorn workers | Bare uvicorn has no worker restart on crash. `gunicorn -k uvicorn.workers.UvicornWorker` gives multi-process restart, graceful reload, signal handling. Required for VPS systemd deployment. |
| `python-dotenv` | 1.2.2 | Load `.env` file in backend for DATABASE_URL, CORS_ORIGINS | Supports Python 3.14. `fastapi[standard]` does NOT auto-load `.env`; python-dotenv is the standard approach. Pydantic BaseSettings can use it. |

### Dev Tools (optional, npm)

| Tool | Version | Purpose | Why |
|------|---------|---------|-----|
| `vercel` CLI | 50.x (global) | Deploy frontend via `vercel --prod` from CI or terminal | Zero-config Vite detection. Handles build, CDN deploy, env var injection in one command. Install globally: `npm i -g vercel`. |
| `svgo` | 4.0.1 (global) | Pre-process SVG files before adding to `src/assets/` | Strip Vecteezy metadata, editor artifacts, and invisible layers. SVGO reduces SVG size 30-70% and removes `id` clashes that break CSS scoping. Use online GUI at svgomg.net for one-off files. |

---

## Configuration Required (Not Libraries)

### 1. Vite Environment Variables

Vite exposes only `VITE_`-prefixed variables to the client via `import.meta.env`. No additional library needed.

**Files to create:**

```
frontend/.env.development   # VITE_API_URL=http://localhost:8000
frontend/.env.production    # VITE_API_URL=https://api.yourdomain.com
frontend/.env.local         # gitignored overrides (personal dev only)
```

**Usage in code:**

```typescript
// Replace hardcoded localhost URLs with:
const API_BASE = import.meta.env.VITE_API_URL;
```

**Vercel env var injection:** Set `VITE_API_URL` in Vercel project dashboard under Settings > Environment Variables. Vercel injects them at build time — no runtime `.env` file needed on Vercel.

### 2. vercel.json (SPA routing)

The app uses React Router (`react-router` 7.13). Without this file, direct URL navigation (e.g. `https://yourapp.vercel.app/analytics`) returns 404 from Vercel's CDN.

**Create `frontend/vercel.json`:**

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This tells Vercel: serve `index.html` for any path that isn't a static file. React Router then handles client-side routing.

**No `vercel.json` at repo root** — Vercel must be configured to use `frontend/` as the root directory in project settings (or pass `--root frontend` in CLI).

### 3. FastAPI CORS Middleware

The frontend (Vercel URL, e.g. `https://saiyan-tracker.vercel.app`) will make cross-origin requests to the VPS backend. Without CORS headers the browser blocks all API calls.

**Add to `backend/app/main.py`:**

```python
import os
from fastapi.middleware.cors import CORSMiddleware

# Load from environment — never hardcode in source
allowed_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,   # No auth cookies, so False is correct
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Content-Type", "Accept"],
)
```

**`.env` on VPS:**

```
CORS_ORIGINS=https://saiyan-tracker.vercel.app
```

**Development `.env`:**

```
CORS_ORIGINS=http://localhost:5173
```

Do NOT use `allow_origins=["*"]` in production. Even without credentials, wildcards bypass referer-based abuse protection.

### 4. systemd Service Unit File

The VPS runs FastAPI as a persistent service. No library required — this is OS configuration.

**Create `/etc/systemd/system/saiyan-tracker.service`:**

```ini
[Unit]
Description=Saiyan Tracker FastAPI backend
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/saiyan-tracker/backend
ExecStart=/home/ubuntu/saiyan-tracker/backend/.venv/bin/gunicorn \
    app.main:app \
    --workers 2 \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind 127.0.0.1:8000 \
    --access-logfile /var/log/saiyan-tracker/access.log \
    --error-logfile /var/log/saiyan-tracker/error.log
Restart=on-failure
RestartSec=5
EnvironmentFile=/home/ubuntu/saiyan-tracker/backend/.env

[Install]
WantedBy=multi-user.target
```

**Activate:**

```bash
sudo systemctl daemon-reload
sudo systemctl enable saiyan-tracker
sudo systemctl start saiyan-tracker
sudo systemctl status saiyan-tracker
```

**Logs:**

```bash
journalctl -u saiyan-tracker -f
```

Workers = 2 is appropriate for a single-user SQLite app on a small VPS. SQLite has serialized writes; more workers don't help and add overhead.

### 5. Nginx Reverse Proxy (VPS)

Nginx sits in front of gunicorn to handle TLS termination and expose port 443. No Python library needed.

**Create `/etc/nginx/sites-available/saiyan-tracker`:**

```nginx
server {
    listen 443 ssl;
    server_name api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    server_name api.yourdomain.com;
    return 301 https://$host$request_uri;
}
```

**TLS cert (free, auto-renews):**

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

---

## Asset Integration Strategy

### SVG Assets (Shenron, Dragon Balls, UI icons)

Use `vite-plugin-svgr` with the `?react` suffix. SVGs become React components with styleable props.

**vite.config.ts update:**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  plugins: [react(), tailwindcss(), svgr()],
  // ... existing server/proxy config
});
```

**TypeScript support** — add to `frontend/src/vite-env.d.ts`:

```typescript
/// <reference types="vite-plugin-svgr/client" />
```

**Usage:**

```typescript
import ShenronSvg from '@/assets/shenron.svg?react';
// Then: <ShenronSvg className="w-48 h-48 text-saiyan-gold" />
```

Why SVG over PNG for Shenron/Dragon Balls: SVGs scale infinitely (crisp on Retina), can be colored with Tailwind's `text-*` utilities (via `currentColor` fill), animate well with Motion, and compress to <10KB each.

### PNG/WebP Assets (character portraits, backgrounds, avatar transformations)

Large raster assets (DBZ backgrounds, character art) use standard Vite static import. `vite-plugin-image-optimizer` compresses them at build time.

**vite.config.ts update (adding optimizer):**

```typescript
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    svgr(),
    ViteImageOptimizer({
      png: { quality: 85 },
      webp: { lossless: false, quality: 85 },
      jpg: { quality: 85 },
    }),
  ],
});
```

**Asset structure:**

```
frontend/src/assets/
  avatars/
    base.webp         # Goku base form
    super-saiyan.webp
    ssj2.webp
    ssj3.webp
    ssj4.webp         # if sourced
    ssj-god.webp
    ssj-blue.webp
    beast.webp
  dragon-balls/
    star1.svg         # Use SVG for orbs so star count can be rendered programmatically
    star2.svg
    ...
  characters/
    goku-portrait.webp
    vegeta-portrait.webp
  backgrounds/
    space-bg.webp
  capsule/
    capsule-corp-box.webp
```

**Loading pattern for avatars** (conditional on transformation level):

```typescript
// Use dynamic import or a map, not 7 static imports
const AVATAR_SRCS: Record<TransformationTier, string> = {
  base:       new URL('@/assets/avatars/base.webp', import.meta.url).href,
  super_saiyan: new URL('@/assets/avatars/super-saiyan.webp', import.meta.url).href,
  // ...
};
```

`new URL(..., import.meta.url)` is Vite's native static asset resolution — it works correctly in both dev and production builds, no plugin needed.

**Why WebP over PNG for large art:** WebP is 25-35% smaller than PNG at equivalent quality, supported in all browsers since 2020, and Vite's optimizer can convert PNG→WebP at build time. Avoids shipping 1-2MB PNG files that slow first load.

---

## Installation Summary

### Frontend

```bash
# New runtime deps (in frontend/)
npm install vite-plugin-svgr

# New dev deps (in frontend/)
npm install -D vite-plugin-image-optimizer sharp

# Global tools (developer machine, not in package.json)
npm install -g vercel
npm install -g svgo
```

### Backend (VPS)

```bash
# In backend/ on VPS, after activating .venv
pip install gunicorn python-dotenv

# Or add to requirements.txt:
# gunicorn>=25.1.0
# python-dotenv>=1.2.2
```

---

## Alternatives Considered

| Recommended | Alternative | Why Not |
|-------------|-------------|---------|
| `vite-plugin-svgr` | Inline SVG strings in TypeScript | vite-plugin-svgr gives React component API with className/props; raw strings require manual cleanup and no prop passing |
| `vite-plugin-svgr` | `@svgr/webpack` | Wrong bundler — this is a Vite project |
| `vite-plugin-image-optimizer` | Manual `sharp` CLI pre-processing | One-time manual step gets stale when assets change; plugin runs automatically on every build |
| `vite-plugin-image-optimizer` | `vite-plugin-vsharp` | vite-plugin-image-optimizer handles both raster (via sharp) and SVG (via svgo) in one plugin; vsharp is raster-only |
| `gunicorn` + uvicorn workers | Bare `uvicorn` with `--workers` flag | Gunicorn provides proper SIGTERM handling, graceful restarts, and restart-on-crash that systemd ExecStart + bare uvicorn cannot match cleanly |
| `python-dotenv` | `pydantic-settings` with env_file | python-dotenv is simpler for this use case (no auth, no complex settings model); pydantic-settings is overkill for 2-3 env vars |
| Nginx + certbot | Caddy | Nginx is universal knowledge on Ubuntu VPS; Caddy auto-TLS is elegant but less commonly documented for Hostinger environments |
| Nginx + certbot | Cloudflare Tunnel | Overkill for a personal single-user app; adds a runtime dependency on Cloudflare infra |
| WebP assets | PNG assets | WebP is 25-35% smaller; supported everywhere since 2020; no downside for this use case |

---

## What NOT to Add

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `@vercel/static-build` adapter | This is a pure Vite SPA, not a meta-framework. Vercel detects Vite automatically with zero adapter needed. | Nothing — Vercel auto-detects |
| `next-sitemap` or `react-snap` | No SEO needed for a personal single-user app; SSR/prerendering adds complexity with zero benefit | Nothing |
| Docker on VPS | Adds container management overhead with no benefit for a single-service personal app | systemd + virtualenv directly on Ubuntu |
| `pm2` | pm2 is for Node processes; gunicorn with systemd is the Python equivalent and integrates better with Ubuntu | systemd + gunicorn |
| `Pillow` (Python imaging) | Python-side image processing is wrong layer; images should be pre-processed at build time | `vite-plugin-image-optimizer` + `sharp` at build time |
| SVG sprites | Modern Vite + svgr handles SVG-as-component without sprite generation; sprites are a pre-bundler workaround | `vite-plugin-svgr` with `?react` suffix |
| `cloudinary` or `imgix` | Image CDN is overkill for <50 static art assets; Vercel CDN already serves static files with edge caching | Vercel's built-in static file CDN |
| `lottie-react` for DBZ animations | Motion 12 (already installed) handles all transform/scale/opacity animations; Lottie files for DBZ don't exist in standard libraries | Motion 12 (existing) |

---

## Version Compatibility

| Package | Version | Compatible With | Notes |
|---------|---------|-----------------|-------|
| `vite-plugin-svgr` | 4.5.0 | Vite >=2.6.0 (including Vite 7.3) | Uses `?react` suffix; add `/// <reference types="vite-plugin-svgr/client" />` to vite-env.d.ts |
| `vite-plugin-image-optimizer` | 2.0.3 | Vite >=5, sharp >=0.34.0, svgo >=4 | Vite 7.3 satisfies >=5; must install `sharp` explicitly |
| `sharp` | 0.34.5 | Node 18+ (LTS), Windows/Linux/macOS | Prebuilt binaries for all platforms; no C++ compile required |
| `gunicorn` | 25.1.0 | Python 3.10+, uvicorn 0.41.0 | uvicorn-worker is now in separate `uvicorn-worker` package; check if `gunicorn -k uvicorn.workers.UvicornWorker` still works or needs `pip install uvicorn-worker` |
| `python-dotenv` | 1.2.2 | Python 3.10+ including 3.14 | Explicitly supports Python 3.14 and free-threaded 3.14t |
| `uvicorn[standard]` | 0.41.0 | Python 3.10+ | Already in requirements.txt; `[standard]` includes uvloop + httptools |

**Critical compatibility note on gunicorn workers:** As of gunicorn 21+, the `UvicornWorker` class moved to the separate `uvicorn-worker` package. Verify by running `gunicorn -k uvicorn.workers.UvicornWorker` after install. If it fails with an import error, add `pip install uvicorn-worker` and use `-k uvicorn_worker.UvicornWorker` instead.

---

## Deployment Flow Summary

```
FRONTEND DEPLOYMENT (Vercel)
  1. Set VITE_API_URL env var in Vercel dashboard
  2. Set build command: npm run build  (in frontend/ dir)
  3. Set output directory: dist
  4. Create frontend/vercel.json with SPA rewrite rule
  5. Push to main branch → Vercel auto-deploys

BACKEND DEPLOYMENT (Hostinger VPS)
  1. SSH into VPS
  2. Clone repo + cd backend/
  3. python3 -m venv .venv && source .venv/bin/activate
  4. pip install -r requirements.txt (includes gunicorn, python-dotenv)
  5. Create .env with CORS_ORIGINS=https://saiyan-tracker.vercel.app
  6. Create /etc/systemd/system/saiyan-tracker.service
  7. sudo systemctl enable --now saiyan-tracker
  8. Configure Nginx + certbot for TLS

ASSET INTEGRATION (once per art batch)
  1. Run svgo on SVG files before adding to src/assets/
  2. Drop PNG/WebP/SVG into src/assets/ subdirectories
  3. Import SVGs with ?react suffix for animatable components
  4. Import raster assets via new URL(..., import.meta.url).href
  5. vite build compresses and emits optimized assets automatically
```

---

## Sources

- [Vercel: Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite) — SPA rewrite rule, VITE_ env var prefix, zero-config deployment — HIGH
- [Vite: Env Variables and Modes](https://vite.dev/guide/env-and-mode) — VITE_ prefix, import.meta.env, .env.production — HIGH
- [vite-plugin-svgr npm (v4.5.0)](https://www.npmjs.com/package/vite-plugin-svgr) — `?react` syntax, Vite >=2.6.0 peer dep — HIGH
- [vite-plugin-image-optimizer npm (v2.0.3)](https://www.npmjs.com/package/vite-plugin-image-optimizer) — Vite >=5, sharp >=0.34.0, svgo >=4 peer deps — HIGH
- [sharp npm (v0.34.5)](https://sharp.pixelplumbing.com/) — Node image processing — HIGH
- [FastAPI: CORS Middleware](https://fastapi.tiangolo.com/tutorial/cors/) — CORSMiddleware params, production origin list — HIGH
- [uvicorn PyPI (v0.41.0)](https://pypi.org/project/uvicorn/) — latest version, Python 3.10+ — HIGH
- [gunicorn PyPI (v25.1.0)](https://pypi.org/project/gunicorn/) — latest version, uvicorn workers — HIGH
- [python-dotenv PyPI (v1.2.2)](https://pypi.org/project/python-dotenv/) — Python 3.14 support confirmed — HIGH
- [systemd FastAPI deployment pattern](https://dev.to/1amkaizen/deploying-a-fastapi-project-to-an-ubuntu-vps-a-complete-guide-for-developers-392) — unit file structure, journalctl logging — MEDIUM
- [SVGO](https://svgo.dev/) — SVG optimization CLI, v4.0.1 — HIGH

---

*Stack additions research for: Saiyan Tracker v2.0 — Deploy & Visual Overhaul*
*Researched: 2026-03-11*
