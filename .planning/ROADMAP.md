# Roadmap: Saiyan Tracker v3

## Overview

This roadmap delivers a Dragon Ball Z-themed habit tracker optimized for ADHD dopamine loops. The build follows a strict bottom-up dependency chain: database models and game constants first, then service-layer game logic, then API routes, then frontend state/stores, then the data-connected dashboard UI, then audio and animation layered on top, then analytics and settings pages. Every phase delivers a verifiable capability that the next phase builds on. The architectural centerpiece is `check_habit()` -- a single atomic transaction that computes all game-state side effects -- and everything else radiates outward from it.

## Milestones

- ✅ **v1.0 Backend Foundation** — Phases 1-3 (shipped 2026-03-04)
- ✅ **v1.1 The Dopamine Layer** — Phases 4-10 (shipped 2026-03-06)
- ✅ **v1.2 PRD Complete** — Phases 11-17 (shipped 2026-03-08)
- 🚧 **v1.3 The Polish Pass** — Phases 18-22 (in progress)

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

### 🚧 v1.3 The Polish Pass (In Progress)

**Milestone Goal:** Make the existing app feel great on every device, fill feedback gaps, and add the most-wanted views (habit detail, off-day analytics, shareable summary).

- [x] **Phase 18: Dashboard Polish + Responsive Design** - Fix desktop spacing, add mobile breakpoints, audit overlays for mobile safety (completed 2026-03-08)
- [x] **Phase 19: Backend Analytics Endpoints** - New analytics endpoints and data layer to unblock all frontend data views (completed 2026-03-08)
- [x] **Phase 20: Habit Detail View** - Expandable habit detail with completion rates, attribute XP, and metadata (completed 2026-03-08)
- [x] **Phase 21: Enhanced Analytics Views** - Off-day analytics, completion trends, streak leaderboard, best/worst day highlights (completed 2026-03-08)
- [ ] **Phase 22: Feedback Gaps + Shareable Summary** - Uncheck feedback, streak-break notice, milestone celebrations, copy-to-clipboard daily summary

## Phase Details

### Phase 18: Dashboard Polish + Responsive Design
**Goal**: User can use the full app comfortably on a mobile phone with consistent layout on all screen sizes
**Depends on**: Phase 17 (v1.2 complete)
**Requirements**: RESP-01, RESP-02, RESP-03, RESP-04, RESP-05, RESP-06
**Success Criteria** (what must be TRUE):
  1. User sees consistent spacing and alignment across all dashboard sections on a 1440px desktop viewport (no overlapping elements, uniform gaps)
  2. User can navigate the full app on a 375px mobile viewport using a bottom tab bar, with all touch targets at least 44px
  3. User sees the hero section (avatar, aura gauge, power level) collapse to a compact single-row form on mobile without hiding any dopamine feedback elements
  4. User can interact with all Recharts analytics (tooltips, legends) via touch on mobile without horizontal scroll
  5. User can complete all settings forms (capsule rewards, wishes, off-day, preferences) on mobile with thumb-friendly spacing
**Plans**: TBD

Plans:
- [ ] 18-01: TBD
- [ ] 18-02: TBD
- [ ] 18-03: TBD

### Phase 19: Backend Analytics Endpoints
**Goal**: All backend data endpoints are ready so frontend analytics and detail views can fetch pre-aggregated data
**Depends on**: Phase 18
**Requirements**: (enabling infrastructure — no direct requirements; unblocks ANLYT-01, DTAIL-01/02/03, FDBK-03)
**Success Criteria** (what must be TRUE):
  1. GET /analytics/off-day-summary returns total off-days, XP impact estimate, streaks preserved count, and reason breakdown
  2. GET /analytics/completion-trend returns weekly and monthly completion rates with period-over-period deltas using snapshotted daily_log.habits_due denominators
  3. GET /habits/{id}/stats returns weekly/monthly completion rates, total attribute XP, streak history for a specific habit (orphaned endpoint verified or rebuilt)
  4. GET /habits/{id}/calendar returns per-day completion data for a specific habit (orphaned endpoint verified or rebuilt)
  5. Streak-break detection data is available on first dashboard load (which habits broke streak overnight, old streak value, Zenkai halved value)
**Plans**: TBD

Plans:
- [ ] 19-01: TBD
- [ ] 19-02: TBD

### Phase 20: Habit Detail View
**Goal**: User can tap any habit to see its full history, performance stats, and metadata in a detail view
**Depends on**: Phase 19 (backend endpoints for stats and calendar)
**Requirements**: DTAIL-01, DTAIL-02, DTAIL-03
**Success Criteria** (what must be TRUE):
  1. User can tap a habit card to open a detail bottom sheet showing weekly and monthly completion rates as percentages
  2. User can see total attribute XP earned for the tapped habit, broken down by attribute (STR/VIT/INT/KI)
  3. User can see target time, creation date, category badge, importance level, and attribute tags in the detail view
  4. The detail view works correctly on both desktop and mobile viewports (responsive from Phase 18)
**Plans**: TBD

Plans:
- [ ] 20-01: TBD
- [ ] 20-02: TBD

### Phase 21: Enhanced Analytics Views
**Goal**: User can see deeper analytics with off-day impact, completion trends, streak rankings, and day pattern highlights
**Depends on**: Phase 19 (backend endpoints for analytics data)
**Requirements**: ANLYT-01, ANLYT-02, ANLYT-03, ANLYT-04
**Success Criteria** (what must be TRUE):
  1. User can see an off-day analytics card showing total off-days taken, estimated XP missed, streaks preserved, and a reason breakdown chart
  2. User can see weekly and monthly completion rate cards with arrows showing period-over-period improvement or decline
  3. User can see habits ranked by current streak length in a "power rankings" leaderboard style list
  4. User can see their best and worst performing days highlighted in the analytics view (highest/lowest completion rate days)
**Plans**: 2 plans

Plans:
- [ ] 21-01-PLAN.md — Types, API methods, hook, OffDayAnalyticsCard, CompletionTrendCards
- [ ] 21-02-PLAN.md — StreakRankings, BestWorstDays, wire into Analytics page

### Phase 22: Feedback Gaps + Shareable Summary
**Goal**: User gets clear feedback on negative events (uncheck, streak break) and can share their daily progress with one tap
**Depends on**: Phase 19 (streak-break detection data)
**Requirements**: FDBK-01, FDBK-02, FDBK-03, FDBK-04, SHAR-01
**Success Criteria** (what must be TRUE):
  1. User hears a distinct sound and sees a negative XP popup (e.g., "-15 XP") when unchecking a previously completed habit
  2. User sees the aura gauge visually shrink in real-time when unchecking a habit
  3. User sees a streak-break acknowledgment card on first dashboard load after a streak breaks, showing the old streak value and Zenkai halved value
  4. User sees a celebration overlay when passing power level milestones that were previously unnoticed (milestones beyond the existing round-number set)
  5. User can tap a share button on the dashboard to copy a DBZ-themed daily summary to clipboard, with a success/failure toast confirmation
**Plans**: TBD

Plans:
- [ ] 22-01: TBD
- [ ] 22-02: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 18 → 19 → 20 → 21 → 22

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
| 18. Dashboard Polish + Responsive Design | 3/3 | Complete    | 2026-03-08 | - |
| 19. Backend Analytics Endpoints | 2/2 | Complete    | 2026-03-08 | - |
| 20. Habit Detail View | 2/2 | Complete    | 2026-03-08 | - |
| 21. Enhanced Analytics Views | 2/2 | Complete    | 2026-03-08 | - |
| 22. Feedback Gaps + Shareable Summary | v1.3 | 0/? | Not started | - |
