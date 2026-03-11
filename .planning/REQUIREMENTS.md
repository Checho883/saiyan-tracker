# Requirements: Saiyan Tracker v2.0

**Defined:** 2026-03-11
**Core Value:** Every habit check must feel like something happened — a sound, a visual pulse, a number going up. If the app is silent and still, it has failed.

## v2.0 Requirements

### Deployment — Backend Configuration

- [ ] **DEPLOY-01**: Backend reads DATABASE_URL from environment variable with absolute path (no more relative `sqlite:///saiyan_tracker.db`)
- [ ] **DEPLOY-02**: FastAPI CORSMiddleware configured with explicit Vercel origin allowlist
- [ ] **DEPLOY-03**: Backend reads CORS_ORIGINS from environment variable for flexible origin management
- [ ] **DEPLOY-04**: python-dotenv loads `.env` file for local development, environment variables for production

### Deployment — Frontend Configuration

- [ ] **DEPLOY-05**: `vercel.json` with SPA rewrite rule (all routes → `index.html`)
- [ ] **DEPLOY-06**: `VITE_API_BASE` environment variable set in Vercel dashboard, consumed by API client at build time
- [ ] **DEPLOY-07**: Vercel project configured with Root Directory set to `frontend`

### Deployment — VPS Infrastructure

- [ ] **DEPLOY-08**: systemd unit file for uvicorn/gunicorn auto-start on boot with restart-on-failure
- [ ] **DEPLOY-09**: Nginx reverse proxy forwarding API subdomain to uvicorn on localhost
- [ ] **DEPLOY-10**: Let's Encrypt TLS certificate via Certbot for HTTPS on API subdomain
- [ ] **DEPLOY-11**: SQLite WAL mode enabled with correct file permissions (directory writable for -shm/-wal)
- [ ] **DEPLOY-12**: Environment file (`/etc/saiyan-tracker.env`) for systemd service with DATABASE_URL and CORS_ORIGINS

### Art — Saiyan Avatar Transformations

- [ ] **ART-01**: Base form Goku WebP image at `/assets/avatars/base.webp`
- [ ] **ART-02**: Super Saiyan (SSJ) Goku WebP at `/assets/avatars/ssj.webp`
- [ ] **ART-03**: Super Saiyan 2 (SSJ2) Goku WebP at `/assets/avatars/ssj2.webp`
- [ ] **ART-04**: Super Saiyan 3 (SSJ3) Goku WebP at `/assets/avatars/ssj3.webp`
- [ ] **ART-05**: Super Saiyan God (SSG) Goku WebP at `/assets/avatars/ssg.webp`
- [ ] **ART-06**: Super Saiyan Blue (SSB) Goku WebP at `/assets/avatars/ssb.webp`
- [ ] **ART-07**: Ultra Instinct (UI) Goku WebP at `/assets/avatars/ui.webp`

### Art — Character Portraits

- [ ] **ART-08**: Goku portrait image for quote toasts and welcome cards
- [ ] **ART-09**: Vegeta portrait image for roast cards and quote toasts
- [ ] **ART-10**: Backend seed data `avatar_path` fields updated to match production asset paths

### Art — Shenron & Dragon Balls

- [ ] **ART-11**: Shenron SVG illustration replacing `🐉` emoji in ShenronCeremony animation
- [ ] **ART-12**: Dragon Ball sphere SVGs (1-star through 7-star) replacing styled div circles in DragonBallTracker

### Art — Capsule & Environment

- [ ] **ART-13**: Capsule Corp capsule art for CapsuleDropOverlay (replacing plain `?` boxes)
- [ ] **ART-14**: Dark space/DBZ landscape background art for dashboard backdrop
- [ ] **ART-15**: All sourced SVGs sanitized (no embedded scripts, no external resource calls)

## v3 Requirements (Deferred)

### Progressive Web App
- **PWA-01**: Service worker for offline caching
- **PWA-02**: Web app manifest for installability
- **PWA-03**: Offline habit check with sync-on-reconnect

### Onboarding
- **ONBD-01**: First-run wizard for initial habit setup
- **ONBD-02**: Tutorial overlay explaining game mechanics

## Out of Scope

| Feature | Reason |
|---------|--------|
| Cloud database (Postgres, etc.) | SQLite is perfect for single-user; no migration needed |
| Docker containerization | Direct VPS deployment is simpler for single-user app |
| CI/CD pipeline | Manual deploy is fine for solo project, automate later |
| Image CDN (Cloudflare Images, etc.) | ~20 static files don't need a CDN layer |
| Build-time image optimization plugin | Pre-convert images manually once; not enough images to justify build complexity |
| Custom domain for frontend | Use `*.vercel.app` initially; add custom domain later if desired |
| Multiple environment configs | Single production env is sufficient for solo use |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| DEPLOY-01 | — | Pending |
| DEPLOY-02 | — | Pending |
| DEPLOY-03 | — | Pending |
| DEPLOY-04 | — | Pending |
| DEPLOY-05 | — | Pending |
| DEPLOY-06 | — | Pending |
| DEPLOY-07 | — | Pending |
| DEPLOY-08 | — | Pending |
| DEPLOY-09 | — | Pending |
| DEPLOY-10 | — | Pending |
| DEPLOY-11 | — | Pending |
| DEPLOY-12 | — | Pending |
| ART-01 | — | Pending |
| ART-02 | — | Pending |
| ART-03 | — | Pending |
| ART-04 | — | Pending |
| ART-05 | — | Pending |
| ART-06 | — | Pending |
| ART-07 | — | Pending |
| ART-08 | — | Pending |
| ART-09 | — | Pending |
| ART-10 | — | Pending |
| ART-11 | — | Pending |
| ART-12 | — | Pending |
| ART-13 | — | Pending |
| ART-14 | — | Pending |
| ART-15 | — | Pending |

**Coverage:**
- v2.0 requirements: 27 total
- Mapped to phases: 0
- Unmapped: 27 (awaiting roadmap)

---
*Requirements defined: 2026-03-11*
*Last updated: 2026-03-11 after initial definition*
