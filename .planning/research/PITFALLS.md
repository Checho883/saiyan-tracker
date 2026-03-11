# Pitfalls Research

**Domain:** Deploying a Vite 7 + React 19 frontend to Vercel and a FastAPI + SQLite backend to Hostinger VPS, plus integrating real image assets into an existing DBZ-themed habit tracker
**Researched:** 2026-03-11
**Confidence:** HIGH (based on direct codebase analysis + official documentation verification for Vercel, Vite, SQLite WAL, systemd, and image format browser support)

## Critical Pitfalls

### Pitfall 1: VITE_API_BASE Is Baked in at Build Time — Wrong Value Silently Ships

**What goes wrong:**
`VITE_API_BASE` in `frontend/src/services/api.ts` line 42 falls back to `http://localhost:8000/api/v1`. Vite replaces `import.meta.env.VITE_API_BASE` at BUILD time — not runtime. If the Vercel project does not have `VITE_API_BASE` set in its Environment Variables before the first deployment, the build bakes in the localhost fallback. Every API call silently hits `localhost:8000` (which is the user's own machine — unreachable from the deployed app). The app renders but every API call fails with a network error. This looks identical to a CORS error on the surface.

**Why it happens:**
Developers test locally where `VITE_API_BASE` is unset and the localhost fallback works. They push to Vercel assuming the env var is already configured, or configure it AFTER the first deployment without triggering a redeploy. Vercel does not warn you that a `VITE_` variable is missing — it silently builds without it.

**How to avoid:**
- Set `VITE_API_BASE=https://your-vps-domain.com/api/v1` in Vercel's Settings → Environment Variables BEFORE the first deployment.
- After adding or changing any `VITE_` variable on Vercel, you MUST trigger a new deployment (push a commit or manually redeploy) — adding the variable alone does not rebuild.
- In the Vite config, consider making the fallback a clearly broken value (`import.meta.env.VITE_API_BASE ?? 'MISSING_API_BASE'`) so tests immediately fail instead of silently hitting localhost.
- Verify the baked value after deployment: open DevTools → Sources → find the built `api.ts` chunk → search for `MISSING_API_BASE` or `localhost:8000`.

**Warning signs:**
- App renders but all API calls return `ERR_CONNECTION_REFUSED` or `ERR_NAME_NOT_RESOLVED`.
- Network tab shows requests to `localhost:8000` from the deployed Vercel app.
- Dashboard shows the loading spinner permanently.

**Phase to address:**
Deployment configuration phase (Phase 1). Must be verified before any other deployment testing.

---

### Pitfall 2: CORS Is Not Configured on the FastAPI Backend — Every Request Fails

**What goes wrong:**
The current `backend/app/main.py` does not include `CORSMiddleware`. In development, the Vite proxy (`vite.config.ts` lines 9-14) proxies `/api` requests through to `localhost:8000`, so CORS is never encountered. In production, the Vercel frontend (`https://saiyan-tracker.vercel.app`) makes direct requests to the VPS backend (`https://your-vps.com/api/v1`). These are different origins. Without `CORSMiddleware`, the browser blocks every request with "CORS policy: No 'Access-Control-Allow-Origin' header."

**Why it happens:**
The Vite dev proxy completely hides CORS in development. The developer never sees a CORS error locally, assumes it is fine, deploys, and then every API call fails in production. The error message is generic enough that developers often spend time debugging the wrong thing.

**How to avoid:**
- Add `CORSMiddleware` to `main.py` in the same phase as deployment:
  ```python
  from fastapi.middleware.cors import CORSMiddleware
  app.add_middleware(
      CORSMiddleware,
      allow_origins=["https://your-vercel-app.vercel.app"],
      allow_credentials=False,
      allow_methods=["*"],
      allow_headers=["*"],
  )
  ```
- Do NOT use `allow_origins=["*"]` — be specific. For a single-user app on a known Vercel domain, hardcode the exact origin or load it from an env var.
- OPTIONS preflight requests must return 200. FastAPI's CORSMiddleware handles this automatically, but verify it with `curl -X OPTIONS https://your-vps.com/api/v1/habits/ -H "Origin: https://your-vercel-app.vercel.app" -v`.
- If using a custom domain on Vercel, configure CORS for BOTH the `.vercel.app` subdomain AND the custom domain.

**Warning signs:**
- DevTools Console shows: "Access to fetch at 'https://your-vps.com' from origin 'https://your-vercel-app.vercel.app' has been blocked by CORS policy."
- API calls fail in the deployed app but work perfectly in local dev.
- `curl https://your-vps.com/api/v1/health` succeeds but browser requests fail.

**Phase to address:**
Deployment configuration phase (Phase 1). CORS must be configured and verified before calling the deployment "working."

---

### Pitfall 3: HTTP Backend + HTTPS Frontend = Mixed Content Block

**What goes wrong:**
If the VPS backend is accessible over HTTP only (no SSL/TLS), and Vercel serves the frontend over HTTPS (mandatory — Vercel always uses HTTPS), browsers block all requests from the HTTPS page to the HTTP API as "mixed content." The browser silently drops the request — no network call is made, no error in the response. It only appears as a console error: "Mixed Content: The page at 'https://...' was loaded over HTTPS, but requested an insecure resource 'http://...'."

**Why it happens:**
Setting up SSL on a VPS is an extra step. Developers test the API via HTTP locally or with `curl`, it works, they ship it as HTTP and configure `VITE_API_BASE=http://...`. The Vercel deployment is HTTPS by default and immediately blocks all mixed content.

**How to avoid:**
- The VPS backend MUST be served over HTTPS. Use Let's Encrypt (Certbot) with nginx as a reverse proxy in front of uvicorn.
- `VITE_API_BASE` must use `https://` in the Vercel environment variable.
- Never expose uvicorn directly on port 80 or 443 — put nginx in front. Uvicorn listens on `127.0.0.1:8000` (localhost only), nginx proxies `/api/` to it.
- Verify with: `curl https://your-vps.com/health` should return `{"status": "ok"}`.

**Warning signs:**
- Console shows "Mixed Content" error.
- `VITE_API_BASE` starts with `http://` not `https://`.
- Network tab shows the request not being sent at all (not even a failed request).

**Phase to address:**
Deployment configuration phase (Phase 1). SSL must be set up on VPS before frontend deployment.

---

### Pitfall 4: SQLite Database Path Is Relative — Breaks When systemd Changes Working Directory

**What goes wrong:**
`backend/app/core/config.py` sets `DATABASE_URL = "sqlite:///saiyan_tracker.db"`. The `///` means the path is RELATIVE to the current working directory. When uvicorn runs from the terminal in development, the CWD is the `backend/` directory, so the file ends up at `backend/saiyan_tracker.db`. When systemd runs the same command, the working directory depends on the `WorkingDirectory` setting in the service unit. If `WorkingDirectory` is omitted or set to `/`, the database file is created at `/saiyan_tracker.db` (root of the filesystem), which is unwritable, or at an unexpected location. The result: either the app fails to start, or it creates a new empty database and the user loses all data.

**Why it happens:**
SQLite relative paths work transparently in development because the developer always runs `uvicorn` from the project directory. systemd does not inherit the shell's working directory — it starts from the `WorkingDirectory` specified in the unit file, defaulting to `/` if omitted.

**How to avoid:**
- Change `config.py` to use an ABSOLUTE path loaded from an environment variable:
  ```python
  import os
  DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:////opt/saiyan-tracker/saiyan_tracker.db")
  ```
- Use 4 slashes (`////`) for absolute SQLite paths: `sqlite:////absolute/path/file.db`.
- Set `WorkingDirectory=/opt/saiyan-tracker/backend` in the systemd unit file as a belt-and-suspenders fallback.
- Confirm the database path on startup: add a log line in `lifespan()` that prints the resolved absolute path of the database file.

**Warning signs:**
- App starts but the database is empty (new file created at wrong path).
- `journalctl -u saiyan-tracker` shows `OperationalError: unable to open database file`.
- The database file appears at `/saiyan_tracker.db` instead of the expected project directory.

**Phase to address:**
VPS deployment phase (Phase 2). Must be verified before running the app with real data.

---

### Pitfall 5: SQLite Without WAL Mode Locks Under uvicorn's Async Workers

**What goes wrong:**
The current `session.py` uses synchronous SQLAlchemy with `create_engine(settings.DATABASE_URL)`. SQLite's default journal mode is DELETE, which uses exclusive write locks. When two API requests arrive simultaneously (which uvicorn with multiple workers can cause), one gets a `sqlite3.OperationalError: database is locked` error. For a single-user app this is rare but not impossible — the frontend makes parallel API calls on startup (power, habits, status, analytics all fetch concurrently in `useInitApp`).

**Why it happens:**
Single-user apps "never have concurrency issues" — until the frontend initialization fires 4-5 API calls in parallel. The dev server with a single Vite HMR connection never surfaces this. On the deployed app with production uvicorn, parallel requests trigger simultaneous SQLite writes.

**How to avoid:**
- Enable WAL mode in `session.py` alongside the existing foreign key pragma:
  ```python
  cursor.execute("PRAGMA journal_mode=WAL")
  cursor.execute("PRAGMA busy_timeout=5000")  # wait up to 5s instead of immediate error
  ```
- WAL mode allows concurrent readers + 1 writer, eliminating read/write lock conflicts.
- The `-wal` and `-shm` files that WAL creates require the DATABASE directory (not just the file) to be writable by the app user. Verify with: `ls -la /opt/saiyan-tracker/` — the directory must be owned by the service user.
- Do NOT use multiple uvicorn workers (`--workers 4`) with SQLite — that creates true multi-process concurrency that SQLite cannot safely handle. Single worker is correct for this stack.

**Warning signs:**
- `sqlite3.OperationalError: database is locked` in API logs during app startup.
- Intermittent 500 errors on the first few seconds after opening the app.
- Frontend shows partial data on initial load (some stores populate, others stay empty).

**Phase to address:**
VPS deployment phase (Phase 2). Apply WAL mode at the same time as deploying the database.

---

### Pitfall 6: systemd Unit File Missing EnvironmentFile — Secrets Leak into Shell History or Are Absent in Production

**What goes wrong:**
The backend needs configuration values in production: `DATABASE_URL` (absolute path), `CORS_ORIGINS` (Vercel domain), potentially a `SECRET_KEY` for future use. Developers often set these by exporting them in the shell (`export DATABASE_URL=...`) or hardcoding them in `config.py`. Shell exports do not survive reboots. Hardcoding secrets in source files is a security risk even for personal apps.

**Why it happens:**
systemd's `Environment=` directive in the unit file requires exact syntax and is visible to anyone who reads the unit file. The `EnvironmentFile=` directive is less well-known but cleaner — it reads key=value pairs from a file that can be `chmod 600` (readable only by root and the service user).

**How to avoid:**
- Create `/etc/saiyan-tracker/env` with `chmod 600` ownership by the service user:
  ```
  DATABASE_URL=sqlite:////opt/saiyan-tracker/saiyan_tracker.db
  CORS_ORIGINS=https://saiyan-tracker.vercel.app
  ```
- Reference it in the unit file: `EnvironmentFile=/etc/saiyan-tracker/env`
- Never commit the `.env` file or the systemd env file to git.
- Add `/etc/saiyan-tracker/env` to `.gitignore` documentation (and note it in deployment runbook).
- After any change to the env file, restart the service: `systemctl restart saiyan-tracker`.

**Warning signs:**
- Environment variables are `None` in the running app even though they were set in the terminal.
- `systemctl status saiyan-tracker` shows the service running but API config looks like development defaults.
- `DATABASE_URL` is hardcoded in `config.py` (it should be read from env).

**Phase to address:**
VPS deployment phase (Phase 2). Configure env file before starting the service.

---

### Pitfall 7: Large Image Assets Committed to Git Bloat the Repo and Slow Vite Builds

**What goes wrong:**
The v2.0 visual overhaul involves sourcing 20+ images: 7 Saiyan avatar transformations, 7 Dragon Ball sphere illustrations, Shenron, character portraits (Goku, Vegeta), capsule visuals, and background art. If these are added as raw PNG/JPG files sourced from Pinterest or Vecteezy (typically 500KB–5MB each), the git repository grows by 10–80MB in a single commit. Vite 7 processes files in `src/` at build time — large images imported via `import` statements get processed and fingerprinted, making cold builds significantly slower. Large images in `public/` bypass Vite processing but do not get cache-busting hashes.

**Why it happens:**
The developer downloads reference images, optimizes "manually" by reducing quality in an image editor, and drops them in the repo. What feels like "already small" (200KB per image) adds up to megabytes across the full set. git history keeps all previous versions — even after deleting a file, the history still holds the original size.

**How to avoid:**
- Target file sizes BEFORE committing: avatars ≤ 50KB (WebP), Dragon Balls ≤ 30KB each, backgrounds ≤ 150KB. Run through Squoosh or `cwebp` before adding to the repo.
- Commit images once, already optimized. Do not "optimize later" — git history bloat is permanent without a git filter-branch rewrite.
- Store avatar/sprite images in `frontend/public/assets/` (not `src/assets/`) so they bypass Vite's module graph and are served as static files. The existing `SaiyanAvatar.tsx` already expects `/assets/avatars/${transformation}.webp` — this matches the `public/` path convention.
- Images that need no dynamic import logic (backgrounds, character portraits) all go in `public/`. Only images needing cache-busting hashes in CSS/imports go in `src/assets/`.
- Add a pre-commit note: "No image file > 200KB in this repo."

**Warning signs:**
- `git diff --stat` shows a commit adding 10MB+.
- Vite build time increases from ~3s to 30s+ after adding images.
- `du -sh frontend/public/` exceeds 5MB.

**Phase to address:**
Asset preparation phase (before visual integration). Establish size budgets before sourcing images.

---

### Pitfall 8: Vite `public/` vs `src/assets/` Confusion Breaks Image Paths at Runtime

**What goes wrong:**
The existing `SaiyanAvatar.tsx` uses `src="/assets/avatars/base.webp"` — a public-root-relative path. This works in development because Vite serves `frontend/public/` at `/`. In production (Vite build output in `dist/`), Vite copies `public/` contents to `dist/` root, so `/assets/avatars/base.webp` maps to `dist/assets/avatars/base.webp`. This works on Vercel with the default output directory. BUT: if any image is added via ES module import (`import avatarUrl from './avatars/base.webp'`), Vite processes it differently — it gets a hash in the filename (`base.Xk3mN.webp`) and moves it to `dist/assets/`. The hardcoded `/assets/avatars/base.webp` path in `SaiyanAvatar.tsx` will then NOT find the imported-and-hashed image.

**Why it happens:**
Two valid patterns exist in Vite (public-path strings vs. ES module imports), and mixing them for the same image breaks the fallback logic. `SaiyanAvatar.tsx` uses the string-path pattern with a two-level fallback (`transformation.webp` → `base.webp` → User icon). If someone adds an image via import, the string-path fallback chain stops working.

**How to avoid:**
- Commit to ONE pattern for all game art assets: public path strings (`/assets/avatars/${name}.webp`). All images go in `frontend/public/assets/`.
- Never import game art images with ES module `import` syntax in components. The fallback logic in `SaiyanAvatar.tsx`, `DragonBallTracker.tsx`, and `ShenronCeremony.tsx` all depend on string paths.
- Document this decision in a comment in `SaiyanAvatar.tsx`: "// Images must be in public/assets/ — do not import via ES module."
- Verify path structure: `frontend/public/assets/avatars/base.webp`, `frontend/public/assets/avatars/ssj.webp`, etc.
- After `vite build`, run `ls dist/assets/avatars/` to confirm images are present and NOT hashed.

**Warning signs:**
- Images load in dev but return 404 in the Vercel-deployed build.
- File appears in `dist/assets/` with a hash (`base.Xk3mN.webp`) but component requests `base.webp`.
- Fallback to `base.webp` also returns 404, triggering the User icon fallback for all transformations.

**Phase to address:**
Visual asset integration phase (Phase 3). Establish path convention before adding any images.

---

### Pitfall 9: Vercel Output Directory Misconfiguration Serves the Wrong Folder

**What goes wrong:**
Vercel auto-detects Vite projects and sets the output directory to `dist`. But this repo has a monorepo structure: the frontend is in `frontend/`, not the repo root. Vercel may try to build from the repo root, fail to find `package.json`, or build the wrong thing. Without explicit configuration, the deployed site shows a blank page or a 404.

**Why it happens:**
Vercel's auto-detection works for single-package repos. When `package.json` is in a subdirectory (`frontend/`), auto-detection either fails or uses incorrect paths. The repo root `package.json` and `package-lock.json` visible in the git status are likely a side effect — Vercel will be confused about which one to use.

**How to avoid:**
- In Vercel project settings, explicitly set:
  - Root Directory: `frontend`
  - Build Command: `npm run build` (or `vite build`)
  - Output Directory: `dist`
- Alternatively, add a `vercel.json` at the repo root:
  ```json
  {
    "buildCommand": "cd frontend && npm run build",
    "outputDirectory": "frontend/dist",
    "installCommand": "cd frontend && npm install"
  }
  ```
- After the first deployment, verify the build logs show `vite build` running inside `frontend/`, not the repo root.
- Test with a simple `vercel --prod` CLI deployment locally before relying on git-push auto-deploy.

**Warning signs:**
- Vercel build log shows "No package.json found" or attempts to install from the wrong directory.
- Deployed site returns a blank page with no network requests.
- Vercel deploys successfully but serves `index.html` that doesn't load any JS (wrong dist folder).

**Phase to address:**
Deployment configuration phase (Phase 1). Must be confirmed on the first Vercel deployment.

---

### Pitfall 10: WebP Fallback Chain Fails Silently on the First Real Image Error

**What goes wrong:**
`SaiyanAvatar.tsx` has a two-level fallback: `${transformation}.webp` → `base.webp` → `<User icon>`. This is well-designed but the fallback only helps if SOME images exist. If zero WebP files are present in `public/assets/avatars/` (e.g., Phase 3 images haven't been deployed yet), the component falls back to the User icon for ALL transformations. The visual overhaul milestone has phases — if deployment (Phase 1-2) ships before images (Phase 3), users will see the plain User icon during the interim. That is fine for the developer, but it means the fallback error handler silently "succeeds" (shows the icon) making it easy to forget to verify that actual images loaded when Phase 3 ships.

**Why it happens:**
The fallback works correctly so no error is thrown. The developer deploys Phase 3 images, checks one transformation, sees the image, and ships. But if image file naming does not exactly match the `transformation` values from the backend (e.g., backend sends `"ssj"` but image file is named `"super_saiyan.webp"`), the `transformation.webp` path fails, falls to `base.webp`, and the user always sees the base form — silently.

**How to avoid:**
- The transformation values returned by the backend (`base`, `ssj`, `ssj2`, `ssj3`, `ssg`, `ssb`, `ui`) must EXACTLY match the filenames in `public/assets/avatars/`. Verify this by checking the glowColorMap in `SaiyanAvatar.tsx` (lines 9-17) — these are the exact expected keys: `base`, `ssj`, `ssj2`, `ssj3`, `ssg`, `ssb`, `ui`.
- Add a one-time console assertion in `SaiyanAvatar.tsx` (dev-only, removed for prod) that warns if both `imgError` AND `fallbackError` are true.
- After deploying Phase 3 images: open DevTools → Network tab → filter for `img` requests → verify every avatar request returns 200, not 404 followed by fallback.

**Warning signs:**
- Dashboard always shows the User icon regardless of transformation level.
- Network tab shows `404` on `ssj.webp` followed by `404` on `base.webp`, resulting in the fallback icon.
- An `imgError=true, fallbackError=true` state occurs unexpectedly often.

**Phase to address:**
Visual asset integration phase (Phase 3). Verification checklist must include direct Network tab inspection.

---

### Pitfall 11: SVG Files Inlined Unsanitized Allow Script Injection

**What goes wrong:**
If any of the Dragon Ball art is sourced as SVG (Vecteezy commonly offers SVG format) and the SVG is inlined into React components (e.g., via `dangerouslySetInnerHTML` or by importing as a React component), SVG can contain `<script>` tags, `javascript:` URLs in `href` attributes, or event handlers (`onclick="..."`) that execute as JavaScript. Even from "trusted" sources like Vecteezy, commercial vector assets may include metadata scripts or analytics beacons from the source site.

**Why it happens:**
SVG looks like an image but is XML markup — it can execute code when rendered inline. Developers treat SVG the same as WebP/PNG and inline it without sanitization. The threat is real: CVE-2025-68461 (Roundcube SVG XSS) and multiple recent 2025 disclosures demonstrate that SVG animation tags can silently execute JavaScript.

**How to avoid:**
- Prefer WebP/PNG over SVG for all game art assets. The visual quality difference is negligible for raster-style anime art.
- If SVG is used (e.g., for the Shenron illustration where SVG scaling is needed), use it via `<img src="shenron.svg">` — this isolates the SVG from the DOM's script context. DO NOT use `dangerouslySetInnerHTML`.
- Never import SVG files as React components (`import Shenron from './shenron.svg?react'`) unless the SVG source is fully audited and trusted.
- If inline SVG is required for animation paths, sanitize with DOMPurify before rendering:
  ```typescript
  import DOMPurify from 'dompurify';
  <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(svgContent) }} />
  ```
- This is a personal-use app so XSS risk is low (no other users). But sourceed SVGs could call home to third-party analytics — strip `<script>` and `<a>` tags regardless.

**Warning signs:**
- Network tab shows unexpected requests to external domains when an SVG image is displayed.
- SVG import causes `eslint-plugin-react` to warn about `dangerouslySetInnerHTML`.
- Browser console shows script errors originating from SVG element context.

**Phase to address:**
Visual asset integration phase (Phase 3). Applies to any SVG asset, regardless of source.

---

### Pitfall 12: log rotation Not Configured — VPS Disk Fills Up Over Months

**What goes wrong:**
A systemd service running uvicorn without log rotation sends all stdout/stderr to the systemd journal. By default, the journal is capped at a fraction of disk space, but uvicorn can be verbose. If the service is configured to write to a log FILE instead of the journal (e.g., `ExecStart=... >> /var/log/saiyan-tracker/app.log`), that file grows unbounded. A personal VPS on Hostinger typically has 20-40GB disk — an uncapped log file can fill it over months of daily use. When the disk fills, SQLite writes fail and the app crashes silently.

**Why it happens:**
Log rotation is an operational concern that feels distant during initial deployment. Developers configure logging to a file for easier `tail -f` debugging and forget to configure `logrotate`.

**How to avoid:**
- Use the systemd journal by default (do not redirect to file). Access logs with `journalctl -u saiyan-tracker -f`.
- Set journal size limits in `/etc/systemd/journald.conf`:
  ```
  SystemMaxUse=200M
  SystemKeepFree=1G
  ```
- If file logging is preferred, add a logrotate config at `/etc/logrotate.d/saiyan-tracker`:
  ```
  /var/log/saiyan-tracker/*.log {
      daily
      rotate 7
      compress
      missingok
      notifempty
  }
  ```
- Monitor disk usage monthly with `df -h` — at least until log behavior is confirmed stable.

**Warning signs:**
- `df -h` shows `/` partition at 90%+ usage.
- `du -sh /var/log/` shows unexpected size.
- API calls start returning 500 with `disk I/O error` or `database or disk is full`.

**Phase to address:**
VPS deployment phase (Phase 2). Configure at deploy time, not reactively.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| `allow_origins=["*"]` in CORS | No need to update when Vercel URL changes | Any site can make API calls (low risk for no-auth app, but bad habit) | Never — hardcode the Vercel domain |
| Relative SQLite path in config.py | Works in dev without changes | Breaks in systemd; creates phantom databases at unexpected paths | Never — use absolute paths from env vars |
| HTTP (no SSL) for VPS backend | Faster initial setup, no cert management | Mixed content blocks all browser requests from Vercel HTTPS frontend | Never — mixed content is a hard browser block |
| PNG instead of WebP for game art | No conversion step | 3-5x larger files, slower load times on mobile; still visible on first open | Only for temporary placeholder assets during Phase 2 |
| Images in `src/assets/` instead of `public/` | Vite hash-busts them automatically | Breaks the string-path fallback pattern in `SaiyanAvatar.tsx` and `DragonBallTracker.tsx` | Never — existing components expect public/ paths |
| Hardcoding CORS origin in Python source | One less env var to configure | Must redeploy backend to change Vercel URL | Acceptable for v2.0 (Vercel URL is stable), but use env var for future-proofing |
| Single uvicorn worker (no Gunicorn) | Simpler service unit | Less resilient (worker crash = app crash); fine for single-user | Acceptable for this stack — multiple workers cause SQLite issues anyway |

## Integration Gotchas

| Integration Point | Common Mistake | Correct Approach |
|-------------------|----------------|------------------|
| Vercel + VPS CORS | Adding CORS middleware after deployment and testing from browser | Add CORSMiddleware to main.py before first deployment; test with curl OPTIONS request from a different origin |
| Vite build + Vercel | Not setting Root Directory to `frontend/` in Vercel project settings | Explicitly configure Root Directory, Build Command, and Output Directory in Vercel dashboard or vercel.json |
| VITE_ env vars + Vercel | Adding env vars after first deploy without redeploying | Always add env vars before the first deploy; any change requires a new build (push commit or manual redeploy) |
| SQLite + systemd | Relative database path with no WorkingDirectory set | Use absolute path from DATABASE_URL env var; set WorkingDirectory in unit file as fallback |
| WebP images + SaiyanAvatar | Naming image files differently from the transformation values expected by the component | Map backend transformation strings exactly: base, ssj, ssj2, ssj3, ssg, ssb, ui |
| SVG assets + React | Importing SVGs as React components from sourced art files | Use `<img src="...svg">` for sourced SVGs; only use inline SVG for hand-written, audited SVGs |
| public/ assets + Vite build | Assuming public/ files are processed by Vite (they are not — copied as-is) | Use public/ for all image assets that need stable paths; accept they have no cache-busting hash |
| systemd + Python venv | ExecStart pointing to system python instead of venv python | Use full path to venv: `ExecStart=/opt/saiyan-tracker/venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000` |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Unoptimized images committed to git | Vite build takes 30s+; Vercel build minutes; first page load 5s+ on mobile | Optimize all images before first commit: WebP, ≤50KB for avatars, ≤150KB for backgrounds | Immediately — first production build |
| All images loading on dashboard mount | Page feels slow; LCP metric poor; low-end phones stall | Use `loading="lazy"` on non-hero images; only the active transformation avatar loads eagerly | On slow connections and low-end Android phones |
| AVIF without WebP fallback | Older iOS Safari shows broken images (AVIF support <13 iOS) | Use `<picture>` with AVIF + WebP sources or stick to WebP only (near-universal support) | iOS < 16 and Safari < 16 users |
| Committing SQLite WAL files (`-wal`, `-shm`) to git | git repo grows unexpectedly; conflicts on checkout | Add `*.db-wal` and `*.db-shm` to `.gitignore` (note: `saiyan_tracker.db-journal` is already deleted per git status) | Every deployment push if not gitignored |
| uvicorn with `--reload` in production | Unnecessary CPU usage watching file changes on VPS | systemd unit uses `uvicorn app.main:app --host 127.0.0.1 --port 8000` with no `--reload` flag | From first production deployment |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Exposing uvicorn directly on public port 8000 | VPS firewall rules can be misconfigured; port 8000 may be accessible publicly; no TLS | Put nginx in front; uvicorn binds to `127.0.0.1:8000` (loopback only); nginx handles TLS and port 443 |
| Committing `.env` or systemd env file to git | Secrets (even non-critical ones like database paths) become public if repo is pushed to GitHub | `.env` files must be in `.gitignore`; systemd env file lives in `/etc/`, not the project directory |
| Inline SVG from sourced assets without sanitization | SVG can contain `<script>` tags or external resource references; analytics beacons call home | Use `<img src>` for all sourced SVGs; use DOMPurify if inline SVG is unavoidable |
| CORS `allow_origins=["*"]` | Any page on the internet can make requests to the VPS API (low impact for no-auth app, but bad pattern) | Whitelist only the specific Vercel domain |
| Database file world-readable | sqlite file contains all user habit data; if VPS is compromised, data is immediately readable | `chmod 600 saiyan_tracker.db`; owned by the service user only |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| App shows loading spinner forever if VITE_API_BASE is wrong | User sees a broken app with no error message | Add a connection error state to `useInitApp` that shows "Cannot reach server" after 10s timeout |
| Images load one-by-one causing cumulative layout shift | Dashboard "jumps" as each image loads, especially on first visit | Provide explicit `width` and `height` on all `<img>` elements; use CSS placeholders (gradient boxes) while loading |
| Transformation images missing silently fall back to User icon | User never knows there are supposed to be images; no visual reward for transforming | Keep the User icon fallback BUT add a brief console.warn in dev to signal missing files |
| Background art makes text unreadable | Anime landscapes have bright areas that wash out white text | Darken backgrounds with CSS overlay: `bg-black/60` or `bg-gradient-to-b from-transparent to-space-900` |
| High-res art slows mobile first load | ADHD user waits 3-5 seconds; motivation to open app drops | Apply `loading="lazy"` to non-critical art; critical art (active avatar) must be ≤50KB WebP |

## "Looks Done But Isn't" Checklist

- [ ] **CORS:** Test from actual browser on Vercel domain — `curl` does not simulate CORS; must test via browser DevTools Network tab showing `Access-Control-Allow-Origin` header in response
- [ ] **VITE_API_BASE baked value:** After deployment, inspect the built JS bundle (DevTools → Sources → search chunk files for the API base URL) — confirm it is the VPS URL, not `localhost:8000`
- [ ] **HTTPS end-to-end:** Both Vercel URL and VPS URL use `https://`; no mixed content warnings in browser console
- [ ] **Database absolute path:** `journalctl -u saiyan-tracker | grep database` shows the expected absolute path; `ls -la /opt/saiyan-tracker/` confirms `saiyan_tracker.db` exists and is owned by service user
- [ ] **WAL mode active:** `sqlite3 saiyan_tracker.db "PRAGMA journal_mode;"` returns `wal` (not `delete`)
- [ ] **Service auto-starts:** After `sudo reboot`, `systemctl status saiyan-tracker` shows `active (running)` without manual start
- [ ] **Image paths match transformation values:** Network tab after full page load shows 200 responses for each avatar WebP (`base.webp`, `ssj.webp`, etc.) — no 404s that silently trigger fallback
- [ ] **Image file sizes:** `du -sh frontend/public/assets/` — total should be under 5MB for all game art
- [ ] **SVG via `<img>` not inline:** `grep -r "dangerouslySetInnerHTML" frontend/src/components/` — returns nothing SVG-related
- [ ] **Vercel build uses correct directory:** Vercel deployment logs show `vite build` running inside `frontend/`, output in `frontend/dist/`
- [ ] **No WAL files in git:** `git ls-files | grep "\.db-"` — returns nothing (WAL and SHM files are gitignored)

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Wrong VITE_API_BASE baked into Vercel build | LOW | Add/correct env var in Vercel dashboard → trigger redeploy (push empty commit or click "Redeploy") |
| CORS blocking API calls | LOW | Add CORSMiddleware to main.py → push to VPS → restart service |
| HTTP/HTTPS mixed content | MEDIUM | Install Certbot on VPS → configure nginx for SSL → update VITE_API_BASE to https:// → redeploy Vercel |
| SQLite at wrong path (empty database) | HIGH | Identify where phantom DB was created → copy real DB to correct path → update config → restart service; data may be lost if phantom DB was being written to |
| systemd service not restarting after reboot | LOW | `systemctl enable saiyan-tracker` was forgotten → run it → verify with reboot |
| Oversized images committed to git | MEDIUM | Optimize images → force-push or add replacement commit; git history still holds originals (acceptable for private repo) |
| SVG inline with embedded scripts | LOW | Replace with `<img src>` pattern — no backend change needed, UI-only fix |
| log files filling disk | MEDIUM | Configure journald limits or logrotate → delete/truncate existing large log files → monitor disk |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| VITE_API_BASE baked wrong | Phase 1: Vercel deployment config | Inspect built bundle for correct API URL |
| CORS not configured | Phase 1: FastAPI CORS middleware | Browser network tab shows `Access-Control-Allow-Origin` header |
| Mixed content (HTTP backend) | Phase 1: VPS nginx + SSL setup | `https://your-vps.com/health` returns 200 |
| Vercel output directory wrong | Phase 1: Vercel project settings | Vercel build log shows vite building from `frontend/` |
| SQLite relative path breaks | Phase 2: VPS database config | journalctl confirms absolute DB path |
| SQLite no WAL mode | Phase 2: VPS session.py pragmas | `PRAGMA journal_mode` returns `wal` |
| systemd env file missing | Phase 2: VPS service unit config | Env vars present in running service |
| Log rotation not configured | Phase 2: VPS operational setup | journald size limits set; disk usage stable |
| Oversized images in git | Phase 3 pre-work: asset optimization | All images ≤200KB; `du -sh public/assets/` under 5MB |
| Wrong Vite path convention (src vs public) | Phase 3: asset integration | `dist/` contains images without hash in filenames |
| SVG XSS from sourced assets | Phase 3: asset integration | No `dangerouslySetInnerHTML` with SVG in any component |
| Image name/transformation mismatch | Phase 3: asset integration | Network tab shows 200 for all avatar requests |
| WebP fallback chain fails silently | Phase 3: verification | DevTools confirms each transformation loads the correct image |

## Sources

- Direct codebase analysis: `backend/app/core/config.py` (relative DATABASE_URL), `backend/app/database/session.py` (synchronous SQLAlchemy, foreign key pragma but no WAL pragma), `backend/app/main.py` (no CORSMiddleware), `frontend/vite.config.ts` (dev proxy only), `frontend/src/services/api.ts` (VITE_API_BASE fallback to localhost), `frontend/src/components/dashboard/SaiyanAvatar.tsx` (string-path image convention, two-level fallback)
- Vercel environment variables documentation: build-time evaluation, redeploy requirement — [Vercel Env Vars](https://vercel.com/docs/environment-variables) — HIGH confidence
- Vercel Vite deployment guide — [Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite) — HIGH confidence
- Vite static asset handling (public/ vs src/assets/) — [Vite Asset Handling](https://vite.dev/guide/assets) — HIGH confidence
- SQLite WAL mode and file permission requirements — [SQLite WAL Documentation](https://sqlite.org/wal.html) — HIGH confidence
- SQLite WAL requires directory write permissions for -shm/-wal files — [SQLite Forum: WAL permissions](https://sqlite.org/forum/info/87824f1ed837cdbb) — HIGH confidence
- WebP/AVIF browser support status 2025-2026 — [AVIF Browser Support 2026](https://orquitool.com/en/blog/avif-browser-support-2026-compatibility-webp-switch/) — MEDIUM confidence
- SVG XSS via inline rendering (CVE-2025-68461 and related) — [SVG XSS via Roundcube](https://cyberwarzone.com/2026/01/04/roundcube-cve-2025-68461-svg-xss-vulnerability-enables-silent-email-account-takeover-through-malicious-animate-tags/) — HIGH confidence
- FastAPI systemd deployment patterns — [nginx + Uvicorn + FastAPI + systemd](https://miltschek.de/article_2023-10-21_nginx+++Uvicorn+++FastAPI+++systemd.html) — MEDIUM confidence
- CORS community discussions on Vercel — [Vercel CORS community](https://github.com/vercel/community/discussions/65) — MEDIUM confidence

---
*Pitfalls research for: Saiyan Tracker v2.0 — Deploy & Visual Overhaul (Vercel + VPS + image assets)*
*Researched: 2026-03-11*
