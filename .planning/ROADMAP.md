# Roadmap: Saiyan Tracker v3

## Overview

This roadmap delivers a Dragon Ball Z-themed habit tracker optimized for ADHD dopamine loops. The build follows a strict bottom-up dependency chain: database models and game constants first, then service-layer game logic, then API routes, then frontend state/stores, then the data-connected dashboard UI, then audio and animation layered on top, then analytics and settings pages. Every phase delivers a verifiable capability that the next phase builds on. The architectural centerpiece is `check_habit()` -- a single atomic transaction that computes all game-state side effects -- and everything else radiates outward from it.

## Milestones

- ✅ **v1.0 Backend Foundation** — Phases 1-3 (shipped 2026-03-04)
- ✅ **v1.1 The Dopamine Layer** — Phases 4-10 (shipped 2026-03-06)
- ✅ **v1.2 PRD Complete** — Phases 11-17 (shipped 2026-03-08)
- ✅ **v1.3 The Polish Pass** — Phases 18-22 (shipped 2026-03-11)
- 🚧 **v2.0 Deploy & Visual Overhaul** — Phases 23-26 (in progress)

## Phases

<details>
<summary>✅ v1.0 Backend Foundation (Phases 1-3) — SHIPPED 2026-03-04</summary>

- [x] Phase 1: Database and Model Integrity (2/2 plans) — completed 2026-03-04
- [x] Phase 2: Core Game Logic Services (3/3 plans) — completed 2026-03-04
- [x] Phase 3: API Routes and Schemas (2/2 plans) — completed 2026-03-04

</details>

<details>
<summary>✅ v1.1 The Dopamine Layer (Phases 4-10) — SHIPPED 2026-03-06</summary>

- [x] Phase 4: Project Setup & Foundation (4/4 plans) — completed 2026-03-05
- [x] Phase 5: Dashboard Core & Habit Management (4/4 plans) — completed 2026-03-05
- [x] Phase 6: Audio System (2/2 plans) — completed 2026-03-05
- [x] Phase 7: Animation Layer (2/2 plans) — completed 2026-03-05
- [x] Phase 8: Analytics & Settings (2/2 plans) — completed 2026-03-05
- [x] Phase 9: Cross-Phase Integration Fixes (1/1 plan) — completed 2026-03-05
- [x] Phase 10: Milestone Verification & Housekeeping (1/1 plan) — completed 2026-03-06

</details>

<details>
<summary>✅ v1.2 PRD Complete (Phases 11-17) — SHIPPED 2026-03-08</summary>

- [x] Phase 11: Animation Queue Refactor + Tech Debt (2/2 plans) — completed 2026-03-06
- [x] Phase 12: Backend Detection Services (3/3 plans) — completed 2026-03-06
- [x] Phase 13: Pure Frontend Features (3/3 plans) — completed 2026-03-06
- [x] Phase 14: Animation Overlays + Roast UI (3/3 plans) — completed 2026-03-06
- [x] Phase 15: Drag-and-Drop + Calendar Popover (2/2 plans) — completed 2026-03-06
- [x] Phase 16: Settings, Forms & Audio Polish (3/3 plans) — completed 2026-03-06
- [x] Phase 17: Audio Sound Mapping + Verification Sweep (2/2 plans) — completed 2026-03-08

</details>

<details>
<summary>✅ v1.3 The Polish Pass (Phases 18-22) — SHIPPED 2026-03-11</summary>

- [x] Phase 18: Dashboard Polish + Responsive Design (3/3 plans) — completed 2026-03-08
- [x] Phase 19: Backend Analytics Endpoints (2/2 plans) — completed 2026-03-08
- [x] Phase 20: Habit Detail View (2/2 plans) — completed 2026-03-08
- [x] Phase 21: Enhanced Analytics Views (2/2 plans) — completed 2026-03-08
- [x] Phase 22: Feedback Gaps + Shareable Summary (2/2 plans) — completed 2026-03-11

</details>

### 🚧 v2.0 Deploy & Visual Overhaul (In Progress)

**Milestone Goal:** Deploy the app for real use (Vercel + Hostinger VPS) and replace all CSS/emoji placeholders with anime-faithful Dragon Ball Z art.

- [x] **Phase 23: Deployment Configuration** - Backend env vars, CORS, dotenv, Vercel config, and frontend API base wiring (completed 2026-03-12)
- [ ] **Phase 24: VPS Infrastructure** - systemd, Nginx reverse proxy, TLS, SQLite WAL mode, and production env file
- [ ] **Phase 25: Core Visual Assets** - Saiyan avatar transformations, character portraits, seed data update, and SVG sanitization baseline
- [ ] **Phase 26: Component Art Integration** - Shenron SVG, Dragon Ball orbs, Capsule Corp art, and background theme

## Phase Details

### Phase 23: Deployment Configuration
**Goal**: The codebase is production-ready with environment-driven config so that deploying to Vercel and a VPS requires zero code changes
**Depends on**: Phase 22 (v1.3 complete)
**Requirements**: DEPLOY-01, DEPLOY-02, DEPLOY-03, DEPLOY-04, DEPLOY-05, DEPLOY-06, DEPLOY-07
**Success Criteria** (what must be TRUE):
  1. Backend starts with DATABASE_URL from environment variable pointing to an absolute SQLite path (no hardcoded relative path)
  2. Backend responds with correct CORS headers when called from a different origin (Vercel domain)
  3. Frontend builds with VITE_API_BASE baked in, and all API calls target the configured VPS URL (not localhost)
  4. Navigating directly to any frontend route on Vercel returns the app (not a 404)
**Plans**: TBD

Plans:
- [ ] 23-01: TBD
- [ ] 23-02: TBD

### Phase 24: VPS Infrastructure
**Goal**: The FastAPI backend runs as a persistent HTTPS service on the Hostinger VPS that survives reboots and serves the production database
**Depends on**: Phase 23
**Requirements**: DEPLOY-08, DEPLOY-09, DEPLOY-10, DEPLOY-11, DEPLOY-12
**Success Criteria** (what must be TRUE):
  1. After a VPS reboot, the API is reachable at the HTTPS subdomain without manual intervention
  2. Browser requests from the Vercel frontend succeed over HTTPS with no mixed-content warnings
  3. SQLite database persists across service restarts with WAL mode enabled (no phantom databases, no lock errors)
  4. Environment secrets (DATABASE_URL, CORS_ORIGINS) are read from a protected file, not hardcoded in service config
**Plans**: TBD

Plans:
- [ ] 24-01: TBD
- [ ] 24-02: TBD

### Phase 25: Core Visual Assets
**Goal**: The dashboard hero section shows anime-faithful Saiyan transformation art, and character quotes display real Goku/Vegeta portraits instead of placeholders
**Depends on**: Phase 23 (can proceed in parallel with Phase 24; full verification requires live VPS)
**Requirements**: ART-01, ART-02, ART-03, ART-04, ART-05, ART-06, ART-07, ART-08, ART-09, ART-10, ART-15
**Success Criteria** (what must be TRUE):
  1. SaiyanAvatar displays a distinct, anime-faithful image for each of the 7 transformation forms (Base, SSJ, SSJ2, SSJ3, SSG, SSB, UI)
  2. Goku quote toasts and welcome cards show a Goku portrait image instead of a generic icon
  3. Vegeta roast cards and quote toasts show a Vegeta portrait image instead of a generic icon
  4. Backend seed data avatar_path fields match the actual file paths in public/assets/ so portraits load from the live database
  5. All sourced SVG files pass sanitization check (no embedded scripts, no external resource references)
**Plans**: TBD

Plans:
- [ ] 25-01: TBD
- [ ] 25-02: TBD

### Phase 26: Component Art Integration
**Goal**: The remaining visual placeholders are replaced -- Shenron ceremony shows a real dragon, Dragon Ball tracker shows real orbs, capsules have styled art, and the dashboard has atmospheric depth
**Depends on**: Phase 25
**Requirements**: ART-11, ART-12, ART-13, ART-14
**Success Criteria** (what must be TRUE):
  1. ShenronCeremony animation displays an SVG Shenron illustration instead of the dragon emoji
  2. DragonBallTracker shows 7 distinct sphere images (1-star through 7-star) instead of styled CSS circles
  3. CapsuleDropOverlay displays a Capsule Corp capsule illustration instead of a plain question-mark box
  4. Dashboard background shows a dark space/DBZ landscape art layer that enhances atmosphere without obscuring content
**Plans**: TBD

Plans:
- [ ] 26-01: TBD
- [ ] 26-02: TBD

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Database and Model Integrity | v1.0 | 2/2 | Complete | 2026-03-04 |
| 2. Core Game Logic Services | v1.0 | 3/3 | Complete | 2026-03-04 |
| 3. API Routes and Schemas | v1.0 | 2/2 | Complete | 2026-03-04 |
| 4. Project Setup & Foundation | v1.1 | 4/4 | Complete | 2026-03-05 |
| 5. Dashboard Core & Habit Management | v1.1 | 4/4 | Complete | 2026-03-05 |
| 6. Audio System | v1.1 | 2/2 | Complete | 2026-03-05 |
| 7. Animation Layer | v1.1 | 2/2 | Complete | 2026-03-05 |
| 8. Analytics & Settings | v1.1 | 2/2 | Complete | 2026-03-05 |
| 9. Cross-Phase Integration Fixes | v1.1 | 1/1 | Complete | 2026-03-05 |
| 10. Milestone Verification & Housekeeping | v1.1 | 1/1 | Complete | 2026-03-06 |
| 11. Animation Queue Refactor + Tech Debt | v1.2 | 2/2 | Complete | 2026-03-06 |
| 12. Backend Detection Services | v1.2 | 3/3 | Complete | 2026-03-06 |
| 13. Pure Frontend Features | v1.2 | 3/3 | Complete | 2026-03-06 |
| 14. Animation Overlays + Roast UI | v1.2 | 3/3 | Complete | 2026-03-06 |
| 15. Drag-and-Drop + Calendar Popover | v1.2 | 2/2 | Complete | 2026-03-06 |
| 16. Settings, Forms & Audio Polish | v1.2 | 3/3 | Complete | 2026-03-06 |
| 17. Audio Sound Mapping + Verification Sweep | v1.2 | 2/2 | Complete | 2026-03-08 |
| 18. Dashboard Polish + Responsive Design | v1.3 | 3/3 | Complete | 2026-03-08 |
| 19. Backend Analytics Endpoints | v1.3 | 2/2 | Complete | 2026-03-08 |
| 20. Habit Detail View | v1.3 | 2/2 | Complete | 2026-03-08 |
| 21. Enhanced Analytics Views | v1.3 | 2/2 | Complete | 2026-03-08 |
| 22. Feedback Gaps + Shareable Summary | v1.3 | 2/2 | Complete | 2026-03-11 |
| 23. Deployment Configuration | 2/2 | Complete   | 2026-03-12 | - |
| 24. VPS Infrastructure | v2.0 | 0/? | Not started | - |
| 25. Core Visual Assets | v2.0 | 0/? | Not started | - |
| 26. Component Art Integration | v2.0 | 0/? | Not started | - |
