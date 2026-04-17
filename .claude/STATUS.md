# saiyan-tracker — Project Status

> Auto-updated at the end of every work session. Whis reads this file for project health.

## Quick Info
- **Last worked on:** 2026-04-18
- **Last session by:** Claude Code (Sergio direct)
- **Current milestone:** v2.0 Deploy & Visual Overhaul (phases 23-25)
- **Current phase:** Visual polish pass — avatar centering fix + Roshi added to StreakBreakCard
- **Overall progress:** 4 milestones shipped (v1.0-v1.3, 52 plans), v2.0 deployment DONE

## Milestones Shipped
- **v1.0 Backend Foundation** — Phases 1-3 (7 plans, shipped 2026-03-04)
- **v1.1 The Dopamine Layer** — Phases 4-10 (16 plans, shipped 2026-03-06)
- **v1.2 PRD Complete** — Phases 11-17 (18 plans, shipped 2026-03-08)
- **v1.3 The Polish Pass** — Phases 18-22 (11 plans, shipped 2026-03-11)

## v2.0 Phase Status
- [x] Phase 23: Deployment Configuration (Vercel frontend) — DONE & LIVE
- [x] Phase 24: VPS Infrastructure (Docker + Traefik backend) — DONE & LIVE
- [ ] Phase 25: Core Visual Assets — in progress (plan 25-01 done, 25-02 done, verification passed with 3 human-needed items)

## Deployment Details
- **Frontend:** https://saiyan-tracker.vercel.app (Vercel, auto-deploys from `main`)
- **Backend:** https://saiyan.srv765588.hstgr.cloud (Hostinger VPS, Docker + Traefik)
- **VPS IP:** 145.223.80.103
- **Backend container:** saiyan-tracker-backend-1 (Docker Compose)
- **Database:** SQLite at /app/data/saiyan_tracker.db (Docker volume: saiyan_data)
- **SSL:** Automatic via Traefik + Let's Encrypt
- **CORS:** saiyan-tracker.vercel.app + saiyan.srv765588.hstgr.cloud
- **Env var:** VITE_API_BASE → https://saiyan.srv765588.hstgr.cloud/api/v1

## What Was Done Last Session (2026-04-18 — Visual Polish Pass)
- **Fixed hero avatar centering:** `process-avatars.mjs` was hardcoded to `position: 'top'` for every image, causing some transformations to render off-center ("half of Goku"). Refactored `FORM_MAP` → `ASSETS` array with per-image `position` config (`'attention'` for entropy-based crop, `'centre'`/`'top'` per image)
- **Better-curated transformation art:** Swapped sources for ssj, ssj3, ssg, ssb, ui to face-cropped variants from `raw/`. Generated `base.webp` (was missing entirely — fallback was hitting 404)
- **Added Roshi character art:** Master Roshi (angry/middle finger) processed to `/assets/characters/roshi-angry.webp`, rendered inline in `StreakBreakCard` to the left of the "X streaks broken" header
- **Belt-and-suspenders centering:** Added `objectPosition: '50% 25%'` to `SaiyanAvatar.tsx` so future raw images don't show torso instead of face
- All 6 `streak-break-card.test.tsx` tests pass; no regressions in DOM contract
- Files touched: `frontend/scripts/process-avatars.mjs`, `frontend/src/components/dashboard/SaiyanAvatar.tsx`, `frontend/src/components/dashboard/StreakBreakCard.tsx`
- Files generated: `frontend/public/assets/avatars/{base,ssj,ssj2,ssj3,ssg,ssb,ui,goku,vegeta}.webp`, `frontend/public/assets/characters/roshi-angry.webp`

## What Was Done Previously (2026-04-09)
- Fixed Vercel build failure: removed `tsc -b` from build script, excluded test files from tsconfig.app.json
- Created new Vercel project "saiyan-tracker" (old "frontend" project was obraLink)
- Deployed backend to Hostinger VPS via Docker Compose with Traefik reverse proxy
- Configured CORS, SQLite data volume, SSL certificates
- Added VITE_API_BASE environment variable in Vercel
- Redeployed frontend — app loads successfully, no "Failed to fetch" errors
- Cleaned 7 stale test tasks from Notion (Whis tasks DB)
- Verified end-to-end: frontend at vercel.app talks to backend on VPS, health check passes

## Visual Verification (2026-04-09 — Krillin)
- ✅ **Avatar images:** Base Saiyan avatar rendering correctly at 256x256 (WebP format)
- ✅ **Dashboard:** All stats, streaks, and UI elements load without errors
- ✅ **Habit creation:** Modal form functional with all attribute/importance/frequency options
- ✅ **Analytics page:** Calendar, stats cards, and trends all rendering correctly
- ✅ **Settings page:** All collapsible sections (Preferences, Categories, Rewards, Wishes, Archived) functional
- ✅ **No console errors:** Zero JavaScript errors, no broken assets, no layout issues
- ✅ **Responsive:** App looks good at mobile viewport (767x826)
- **Detailed report:** `/docs/visual-verification-report.md`

## What's Next
- Create first habits and test the full flow (create habit → complete → XP gain → level up)
- Verify SSJ and higher transformation avatars load correctly when leveling up
- Test persistence: habits created should save to backend
- Remaining v2.0 art work if more phases are planned (Dragon Balls, Shenron, backgrounds, capsules)
- Consider custom domain (optional)

## Blockers
- None — deployment is live and visually verified!
- Phase 25-03 (remaining visual assets) can proceed as needed

## Recent Decisions
- All art assets are WebP format (not PNG/SVG) for size optimization
- Source images stored in `frontend/public/assets/raw/` (gitignored), processed outputs in `frontend/public/assets/avatars/`
- SQLite chosen over PostgreSQL — personal app, no need for complex DB
- Docker deployment shares Traefik network with existing n8n setup on VPS

## Tech Stack
- **Frontend:** React 19 + Vite 7 + TypeScript + Zustand + Motion + Tailwind CSS v4
- **Backend:** Python 3.14 + FastAPI + SQLAlchemy 2.0 + SQLite
- **Deploy:** Vercel (frontend) + Hostinger VPS Docker (backend)
- **Tests:** 231 passing (backend)
