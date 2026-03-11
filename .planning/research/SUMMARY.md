# Project Research Summary

**Project:** Saiyan Tracker v2.0 — Deploy & Visual Overhaul
**Domain:** Production deployment (Vercel + Hostinger VPS) with DBZ visual asset integration
**Researched:** 2026-03-11
**Confidence:** HIGH

## Executive Summary

Saiyan Tracker v2.0 is a split-deployment upgrade: the existing Vite 7 + React 19 frontend ships to Vercel's CDN while the FastAPI + SQLite backend runs on a Hostinger VPS behind Nginx + Let's Encrypt TLS. The app's component layer is already production-ready — `SaiyanAvatar`, `CharacterQuote`, and the rest of the dashboard all have graceful fallbacks coded in. The deployment phase is purely infrastructure and configuration: add `CORSMiddleware` to `main.py`, wire `VITE_API_BASE` in Vercel's dashboard, create a `vercel.json` SPA rewrite, set up Nginx + systemd on the VPS, and fix the SQLite path to an absolute env-var-driven value. None of these touch existing component or API logic.

The visual overhaul is an independent track that can run in parallel or after deployment. Seven Saiyan avatar WebP images, Goku and Vegeta portrait images, and optionally Shenron/Dragon Ball art drop into `frontend/public/assets/` with zero component changes required. The key constraint is that all game art must live in `public/` (not `src/assets/`) because existing components reference images via dynamic URL strings, not ES module imports. Pre-optimize all images to WebP at 80-90% quality before committing — the size budget is under 50KB per avatar and under 5MB total for all assets.

The top risks are all deployment-config mistakes rather than code problems: `VITE_API_BASE` baking the localhost fallback into the Vercel build silently breaks all API calls; missing `CORSMiddleware` blocks every browser request from Vercel; and a relative SQLite path creates a phantom database when systemd changes the working directory. All three are easy to prevent if addressed in the correct order — backend CORS and database config first, then Vercel wiring, then VPS infrastructure, then visual assets.

## Key Findings

### Recommended Stack

The existing stack requires only 5 new dependencies across the entire v2.0 scope. On the frontend: `vite-plugin-svgr` (for SVG-as-React-component imports, needed only if Shenron is SVG), `vite-plugin-image-optimizer` + `sharp` (build-time image compression — treat as optional given the recommendation to pre-optimize manually). On the backend: `gunicorn` for production process management with crash recovery, and `python-dotenv` to load `.env` on the VPS. The ARCHITECTURE research confirmed that `frontend/src/services/api.ts` already reads `VITE_API_BASE`, so frontend code needs no changes — only the env var set in Vercel's dashboard. For game art, pre-converting images to WebP with `cwebp` or `ffmpeg` before committing is preferred over build-time plugins for a personal app with ~20 static images.

**Core technologies:**
- `gunicorn` 25.1.0 + uvicorn workers: production process management with crash recovery — bare `uvicorn` lacks worker restart on crash
- `python-dotenv` 1.2.2: loads `.env` on VPS for `DATABASE_URL` and `CORS_ORIGINS` — supports Python 3.14
- `vite-plugin-svgr` 4.5.0: enables `?react` SVG imports — needed only if Shenron illustration is sourced as SVG
- Nginx + Let's Encrypt certbot: TLS termination on VPS — mandatory; Vercel is HTTPS-only and browsers hard-block mixed content
- systemd service unit: auto-start and crash-restart for FastAPI — `Restart=on-failure`, `EnvironmentFile=` for secrets

### Expected Features

**Must have (table stakes — launch blockers):**
- `vercel.json` with SPA rewrite rule — every non-root URL returns 404 on direct load or refresh without it
- `VITE_API_BASE` set in Vercel env vars before first deploy — bakes into JS bundle at build time; missing = localhost shipped to production
- `CORSMiddleware` in `main.py` with Vercel origin — browser blocks all API calls without it; Vite proxy hides this in dev
- HTTPS via Nginx + Let's Encrypt on VPS — mixed content hard-block from Vercel's HTTPS frontend; non-negotiable
- systemd unit file for FastAPI auto-start — process dies on VPS reboot without it
- SQLite absolute path via `DATABASE_URL` env var — relative path creates phantom database under systemd
- SaiyanAvatar images (7 transformation WebPs) — hero section shows generic User icon without them; highest visual impact
- Goku + Vegeta portrait images — quote toasts and roast card lose character identity

**Should have (visual completeness — add after deployment is verified):**
- Shenron illustration (SVG preferred for per-path Motion animation) — wish ceremony visual drama
- Dragon Ball orb images (7 spheres) — collection loop authenticity
- Capsule Corp capsule illustration — flip card front face identity
- Remaining character portraits (Piccolo, Gohan, etc.) — completes the quote system visually
- Background space/nebula art overlay — atmospheric depth, purely aesthetic

**Defer (v2+):**
- AVIF + `<picture>` format upgrade — defer until LCP profiling identifies image loading as bottleneck
- Per-transformation background art — high artistic effort, low functional impact
- CDN image hosting (Cloudinary, Imgix) — overkill for ~20 static images already served by Vercel's edge CDN

### Architecture Approach

The production architecture is a strict separation: Vercel CDN serves all static assets, and all API calls cross origins via HTTPS XHR to the VPS. The Vite dev proxy that hides CORS in development does not exist in production — this is the single most important mental model shift for this deployment. The VPS stack is Nginx (port 443, TLS) → uvicorn (127.0.0.1:8000, never public) → FastAPI → SQLite (absolute path, WAL mode). No component code changes are required for deployment; only two backend files (`config.py`, `main.py`) and two new frontend config items (`vercel.json`, `public/assets/**`) are needed. The optional Phase 4 Dragon Ball tracker component is the only item that requires touching component code.

**Major components:**
1. Vercel CDN — serves `index.html` + all static files; SPA routing via `vercel.json` rewrite rule
2. Nginx reverse proxy — TLS termination, `proxy_pass 127.0.0.1:8000`, never serves static files
3. uvicorn (systemd-managed) — FastAPI ASGI app, bound to loopback only, `Restart=on-failure`
4. SQLite at absolute path — WAL mode + `busy_timeout=5000` to handle parallel startup requests from the frontend
5. `frontend/public/assets/` — all game art as static WebP files served by Vercel CDN; Vite copies verbatim, no processing

### Critical Pitfalls

1. **VITE_API_BASE bakes localhost into the Vercel build** — set the env var in Vercel dashboard BEFORE first deploy; any env var change requires a new build trigger; verify by searching the built JS bundle in DevTools for the expected VPS URL
2. **CORS not configured on FastAPI** — add `CORSMiddleware` to `main.py` before deployment; test with `curl -X OPTIONS` from the Vercel origin; `curl GET` does not simulate CORS and will give a false positive
3. **Relative SQLite path silently creates phantom database under systemd** — change `config.py` to read `DATABASE_URL` from env with absolute path using 4-slash SQLite format (`sqlite:////absolute/path/db`); verify via `journalctl` on first service start
4. **Images placed in `src/assets/` instead of `public/`** — existing components use dynamic URL strings (`/assets/avatars/${transformation}.webp`); `src/assets/` imports get content-hash filenames that break the string-path fallback chain at runtime
5. **Image filename mismatch with backend transformation values** — backend sends exact strings `base`, `ssj`, `ssj2`, `ssj3`, `ssg`, `ssb`, `ui`; WebP filenames must match exactly; verify via Network tab after deploy (all 200s, no silent 404 fallbacks)

## Implications for Roadmap

The project has a clear three-phase dependency chain: deployment config must come before VPS infrastructure setup (CORS config must be committed before the VPS can be tested end-to-end), and VPS setup should come before final visual asset verification (though assets can be added and tested locally at any time). The two tracks — infrastructure and visual art — are largely independent and can proceed in parallel.

### Phase 1: Deployment Configuration

**Rationale:** CORS, `VITE_API_BASE`, `vercel.json`, and the SQLite env-var fix are all hard blocking dependencies — the app cannot function at a production URL without any of them. These are pure configuration changes with no risk of breaking existing functionality. They must be done and verified before VPS infrastructure work begins.

**Delivers:** A committed codebase where backend is CORS-enabled, database path is env-driven, and the Vercel config is ready for deployment.

**Addresses:** `vercel.json` SPA rewrite, `VITE_API_BASE` env var wiring in `api.ts`, `CORSMiddleware` addition to `main.py`, `DATABASE_URL` env var in `config.py`

**Avoids:** VITE_API_BASE-bakes-localhost pitfall, CORS blocking pitfall, relative SQLite path pitfall, Vercel output directory misconfiguration pitfall

**Research flag:** Standard patterns — no deeper research needed; all steps are documented with exact code in STACK.md, ARCHITECTURE.md, and PITFALLS.md

### Phase 2: VPS Infrastructure Setup

**Rationale:** VPS setup (systemd, Nginx, SSL, database path verification, WAL mode, env file, log rotation) depends on Phase 1's config changes being committed. Infrastructure work is independent of visual assets and can be parallelized with art sourcing.

**Delivers:** A live, HTTPS-accessible FastAPI backend that auto-restarts on reboot, reads config from an env file, uses SQLite WAL mode, and has log rotation configured.

**Implements:** systemd service unit, Nginx reverse proxy config, Let's Encrypt TLS cert via certbot, `EnvironmentFile=` for `DATABASE_URL` and `CORS_ORIGINS`, WAL mode pragma in `session.py`, journald size limits

**Avoids:** Mixed content block pitfall, SQLite relative path pitfall, SQLite WAL locking pitfall, systemd env file missing pitfall, log rotation disk-fill pitfall

**Research flag:** Standard patterns — systemd + Nginx + certbot is well-documented on Ubuntu; WAL mode is a one-liner; exact config templates are provided in ARCHITECTURE.md

### Phase 3: Visual Asset Integration (Core)

**Rationale:** The app is fully functional after Phase 2 (all components fall back gracefully to icons). The core visual assets — 7 avatar transformation WebPs and 2 character portraits — are the highest-impact visual change and should be delivered as a coherent unit. Asset naming conventions must be established before any art is sourced.

**Delivers:** SaiyanAvatar showing accurate DBZ transformation art on the hero section; CharacterQuote toasts and RoastWelcomeCard showing character portraits. `seed.py` updated with correct `avatar_path` values.

**Addresses:** Avatar images (`base`, `ssj`, `ssj2`, `ssj3`, `ssg`, `ssb`, `ui` in `public/assets/avatars/`), character portraits (Goku + Vegeta minimum in `public/assets/characters/`)

**Avoids:** `public/` vs `src/assets/` path confusion, image filename/transformation value mismatch, oversized images bloating git (budget: ≤50KB per avatar, ≤5MB total), SVG XSS from inline unsanitized sourced assets

**Research flag:** Art sourcing is MEDIUM confidence — file conventions and path patterns are fully specified, but the actual sourcing step (Vecteezy or equivalent) requires manual evaluation of available art

### Phase 4: Visual Polish (Optional Art)

**Rationale:** After deployment is verified and core avatar art is working, lower-priority visual enhancements complete the DBZ aesthetic. The Dragon Ball tracker is the only item that requires touching a component (changing CSS circles to `<img>` tags).

**Delivers:** Shenron SVG illustration with Motion animation potential, Dragon Ball orb images, Capsule Corp capsule illustration on flip card front face, background space art overlay, `loading="lazy"` audit on non-hero images.

**Note:** DragonBallTracker requires a component modification (CSS circles → `<img>` tags) — this is the only component code change in the entire v2.0 scope.

**Research flag:** Standard patterns — no deeper research needed. Dragon Ball component change is low risk with existing fallback pattern.

### Phase Ordering Rationale

- Phase 1 before Phase 2: CORS and env-var config must be in committed code before VPS can be tested end-to-end; the backend `.env` file on the VPS references these env var names
- Phase 2 before Phase 3 final verification: avatar images can be added locally and tested with Vite dev server any time, but full verification (including `avatar_path` from the seeded DB matching file paths) requires the live VPS
- Phase 3 before Phase 4: deliver highest-impact visual assets (avatar forms, character portraits) before lower-impact optional art
- Phases 2 and 3 are parallelizable: infrastructure work and art sourcing/optimization can proceed simultaneously; coordination point is only at the `avatar_path` seed data update step

### Research Flags

Phases needing no additional research (exact specs documented in research files):
- **Phase 1:** All config changes have exact code snippets in ARCHITECTURE.md; Vercel dashboard steps are in STACK.md; pitfall prevention steps are in PITFALLS.md
- **Phase 2:** systemd + Nginx + certbot templates are fully documented; WAL mode is a single pragma; env file format and permissions are specified
- **Phase 4:** Standard `<img>` component change, `loading="lazy"` is a one-line attribute; no new patterns required

Phases with open items requiring judgment during execution:
- **Phase 3 (art sourcing):** Finding anime-inspired art at the correct dimensions from Vecteezy or equivalent requires manual evaluation; the patterns and licensing approach are confirmed but specific files must be found
- **Phase 3 (seed data):** Current state of `avatar_path` fields in the seeded SQLite quotes table is unknown; requires inspecting the database before finalizing the seed update approach

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All new dependencies confirmed against official PyPI/npm docs; version compatibility verified against existing stack; gunicorn UvicornWorker package split noted as a verification step |
| Features | HIGH (deployment) / MEDIUM (art specifics) | Deployment features from official Vercel + FastAPI docs; art integration patterns from community conventions and direct component analysis |
| Architecture | HIGH | Based on direct codebase analysis (`SaiyanAvatar.tsx`, `api.ts`, `config.py`, `main.py`, `session.py`, `vite.config.ts`) plus official docs for each integration point |
| Pitfalls | HIGH | 12 pitfalls identified from direct code analysis + official documentation; all have specific, actionable prevention steps and recovery strategies |

**Overall confidence:** HIGH

### Gaps to Address

- **Current `avatar_path` values in seeded quotes DB:** Unknown without inspecting the database. Resolution: early in Phase 3, run `sqlite3 saiyan_tracker.db "SELECT DISTINCT avatar_path FROM quotes LIMIT 20;"` to determine whether a re-seed or targeted UPDATE is needed.
- **Vercel project configuration state:** The repo has `package.json` and `package-lock.json` at the root alongside `frontend/`. Vercel auto-detection may target the wrong root. Resolution: explicitly set Root Directory to `frontend` in Vercel project settings on first login — do not rely on auto-detection.
- **gunicorn UvicornWorker package split:** As of gunicorn 21+, `UvicornWorker` may have moved to the separate `uvicorn-worker` package. Resolution: after `pip install gunicorn`, run `gunicorn -k uvicorn.workers.UvicornWorker --version` to verify; if it fails, `pip install uvicorn-worker` and update the systemd `ExecStart` command.
- **Root-level package.json in git status:** There are untracked `package.json` and `package-lock.json` at the repo root. These may interfere with Vercel's build detection. Resolution: decide before Phase 1 whether these should be committed, gitignored, or removed.

## Sources

### Primary (HIGH confidence)
- [Vercel: Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite) — SPA rewrite rule, VITE_ env var prefix, zero-config deployment
- [Vite: Env Variables and Modes](https://vite.dev/guide/env-and-mode) — VITE_ prefix, import.meta.env, build-time evaluation
- [Vite: Static Asset Handling](https://vite.dev/guide/assets) — public/ vs src/assets/ behavior, hashing rules, inline limit
- [FastAPI: CORS Middleware](https://fastapi.tiangolo.com/tutorial/cors/) — CORSMiddleware params, credentials constraint
- [SQLite WAL Documentation](https://sqlite.org/wal.html) — WAL mode semantics, -wal/-shm file permissions
- [Vercel Environment Variables](https://vercel.com/docs/environment-variables) — build-time injection, dashboard configuration, redeploy requirement
- [vite-plugin-svgr npm (v4.5.0)](https://www.npmjs.com/package/vite-plugin-svgr) — Vite >=2.6.0 peer dep confirmed
- [gunicorn PyPI (v25.1.0)](https://pypi.org/project/gunicorn/) — latest version, uvicorn workers
- [python-dotenv PyPI (v1.2.2)](https://pypi.org/project/python-dotenv/) — Python 3.14 support confirmed
- Direct codebase analysis: `SaiyanAvatar.tsx`, `api.ts`, `config.py`, `main.py`, `session.py`, `vite.config.ts`

### Secondary (MEDIUM confidence)
- [Deploy FastAPI with Gunicorn and Nginx on Ubuntu 24.04 — Vultr Docs](https://docs.vultr.com/how-to-deploy-a-fastapi-application-with-gunicorn-and-nginx-on-ubuntu-2404) — unit file structure, nginx proxy pattern
- [FastAPI async deployment on Hostinger VPS — GeekyShows](https://geekyshows.com/blog/post/deploy-fas/) — Hostinger-specific notes
- [SVG XSS via Roundcube CVE-2025-68461](https://cyberwarzone.com/2026/01/04/roundcube-cve-2025-68461-svg-xss-vulnerability-enables-silent-email-account-takeover-through-malicious-animate-tags/) — SVG inline risk confirmation
- [AVIF Browser Support 2026](https://orquitool.com/en/blog/avif-browser-support-2026-compatibility-webp-switch/) — WebP vs AVIF status
- [DBZ copyright and fan use — Kanzenshuu](https://kanzenshuu.com/forum/viewtopic.php?t=38853) — personal-use risk posture for sourced art

### Tertiary (LOW confidence — confirm during execution)
- Fan project conventions for WebP-per-character file organization — inferred from community patterns, not a single authoritative source
- Vecteezy availability of anime-inspired art at required dimensions for each transformation form — needs manual sourcing validation

---
*Research completed: 2026-03-11*
*Ready for roadmap: yes*
