# Roadmap: Saiyan Tracker v3

## Overview

This roadmap delivers a Dragon Ball Z-themed habit tracker optimized for ADHD dopamine loops. The build follows a strict bottom-up dependency chain: database models and game constants first, then service-layer game logic, then API routes, then frontend state/stores, then the data-connected dashboard UI, then audio and animation layered on top, then analytics and settings pages. Every phase delivers a verifiable capability that the next phase builds on. The architectural centerpiece is `check_habit()` -- a single atomic transaction that computes all game-state side effects -- and everything else radiates outward from it.

## Milestones

- ✅ **v1.0 Backend Foundation** — Phases 1-3 (shipped 2026-03-04)
- ✅ **v1.1 The Dopamine Layer** — Phases 4-10 (shipped 2026-03-06)

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
