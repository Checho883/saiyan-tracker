# Roadmap: Saiyan Tracker v3

## Overview

This roadmap delivers a Dragon Ball Z-themed habit tracker optimized for ADHD dopamine loops. The build follows a strict bottom-up dependency chain: database models and game constants first, then service-layer game logic, then API routes, then frontend state/stores, then the data-connected dashboard UI, then audio and animation layered on top, then analytics and settings pages. Every phase delivers a verifiable capability that the next phase builds on. The architectural centerpiece is `check_habit()` -- a single atomic transaction that computes all game-state side effects -- and everything else radiates outward from it.

## Milestones

- ✅ **v1.0 Backend Foundation** — Phases 1-3 (shipped 2026-03-04)
- ✅ **v1.1 The Dopamine Layer** — Phases 4-10 (shipped 2026-03-06)
- 🚧 **v1.2 PRD Complete** — Phases 11-16 (in progress)

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

### 🚧 v1.2 PRD Complete (In Progress)

**Milestone Goal:** Close every remaining gap between the PRD and the shipped product, plus dopamine and UX polish additions beyond the original spec.

- [x] **Phase 11: Animation Queue Refactor + Tech Debt** - Priority-tiered animation system with batching to prevent overload, plus recharts stability fix (completed 2026-03-06)
- [x] **Phase 12: Backend Detection Services** - Extend check_habit() with achievement, streak, roast, and milestone detection; add new API endpoints (completed 2026-03-06)
- [ ] **Phase 13: Pure Frontend Features** - History views, contribution graphs, nudge banner, daily summary, and power milestone celebrations using existing APIs
- [ ] **Phase 14: Animation Overlays + Roast UI** - Zenkai recovery, attribute level-up, and achievement overlays plus Vegeta escalation roast display
- [ ] **Phase 15: Drag-and-Drop + Calendar Popover** - Habit reordering with dnd-kit and calendar day detail popover with floating-ui
- [ ] **Phase 16: Settings, Forms & Audio Polish** - Archived habits, temporary habit support, day picker UX, and real audio sprite files

## Phase Details

### Phase 11: Animation Queue Refactor + Tech Debt
**Goal**: Animation system handles multiple simultaneous events without overwhelming the user, and recharts dependency is clean
**Depends on**: Phase 10
**Requirements**: FEED-06, TECH-01
**Success Criteria** (what must be TRUE):
  1. When a habit check triggers multiple animation events simultaneously, they play in priority order (exclusive overlays first, then banners, then inline) without stacking or clipping
  2. When more than 3 animation events queue at once, excess events are batched into a combo summary instead of playing sequentially
  3. The recharts charts render without a react-is override hack in package.json
**Plans**: TBD

Plans:
- [ ] 11-01: TBD
- [ ] 11-02: TBD

### Phase 12: Backend Detection Services
**Goal**: check_habit() detects and returns streak milestones, attribute level-ups, power milestones, and roast context so the frontend can react to every meaningful game event
**Depends on**: Phase 11
**Requirements**: ACHV-01, ACHV-02, ACHV-04, CHAR-01, CHAR-02, ANLT-05, HMGT-02
**Success Criteria** (what must be TRUE):
  1. When a habit check crosses a streak milestone (3/7/21/30/60/90/365), the API response includes the milestone tier and a character quote
  2. When a habit check triggers an attribute level-up or transformation unlock, the achievement is recorded in the database and returned in the response
  3. When a user opens the app after consecutive missed days, the API provides Vegeta roast data with severity scaled to gap length, preceded by a Goku welcome_back quote
  4. Achievements only fire inside the check_habit() transaction -- loading the app with an existing 30-day streak does not retroactively trigger milestone badges
  5. Per-habit calendar and stats endpoints return completion history and habit-level statistics, and PUT /habits/reorder accepts batch sort_order updates
**Plans**: TBD

Plans:
- [ ] 12-01: TBD
- [ ] 12-02: TBD
- [ ] 12-03: TBD

### Phase 13: Pure Frontend Features
**Goal**: Users get immediate visual feedback for milestones, closure signals on every session, and can explore their history -- all using existing API data
**Depends on**: Phase 11
**Requirements**: ANLT-01, ANLT-02, ANLT-03, FEED-04, FEED-05, FEED-02
**Success Criteria** (what must be TRUE):
  1. User can view a scrollable list of past capsule drops with rarity, date, and reward name on the Analytics page
  2. User can view a scrollable list of past Shenron wishes with date and wish description on the Analytics page
  3. User can view a GitHub-style 90-day contribution grid for any individual habit showing daily completion
  4. When only 1-2 habits remain unchecked for the day, a nudge banner appears showing which habits are left
  5. After checking the last habit of the day (whether or not it reaches 100%), a summary toast shows daily %, tier, and XP earned
  6. When the user's power level crosses a round-number milestone (1K, 5K, 10K, 50K), a celebration animation plays
**Plans**: TBD

Plans:
- [ ] 13-01: TBD
- [ ] 13-02: TBD
- [ ] 13-03: TBD

### Phase 14: Animation Overlays + Roast UI
**Goal**: Every meaningful game event discovered by backend detection has a visible, audible celebration or notification in the UI
**Depends on**: Phase 11, Phase 12
**Requirements**: FEED-01, FEED-03, ACHV-03
**Success Criteria** (what must be TRUE):
  1. When an attribute reaches a new level, the user sees a level-up animation with the attribute name, new level, and title
  2. When the user achieves their first Perfect Day after a streak break, a Zenkai recovery animation plays acknowledging the comeback
  3. User can view a grid of all earned achievements and badges (streak milestones, transformation unlocks) in a dedicated UI section
  4. Achievement and milestone overlays flow through the priority-tiered animation queue without blocking higher-priority events
**Plans**: TBD

Plans:
- [ ] 14-01: TBD
- [ ] 14-02: TBD

### Phase 15: Drag-and-Drop + Calendar Popover
**Goal**: Users can physically arrange their habits in preferred order and drill into any calendar day for detailed breakdown
**Depends on**: Phase 12
**Requirements**: HMGT-01, ANLT-04
**Success Criteria** (what must be TRUE):
  1. User can drag habits via a dedicated handle to reorder them, and the new order persists across page reloads
  2. Dragging a habit does not accidentally trigger a habit check (drag handle is visually distinct from the check target)
  3. Clicking any day on the calendar heatmap shows a popover with per-habit completion status and XP earned for that day
**Plans**: TBD

Plans:
- [ ] 15-01: TBD
- [ ] 15-02: TBD

### Phase 16: Settings, Forms & Audio Polish
**Goal**: Habit management forms expose all model capabilities and the audio system uses real sound files
**Depends on**: Phase 12
**Requirements**: HMGT-03, HMGT-04, HMGT-05, TECH-02
**Success Criteria** (what must be TRUE):
  1. User can view a list of archived habits and restore any of them to active status
  2. User can create a habit with start and end dates, and the habit automatically stops appearing after its end date
  3. User can select which days of the week a habit is active using tappable day-of-week buttons instead of a raw number input
  4. All 13+ sound effects play real audio files (not placeholder silence or generic beeps)
**Plans**: TBD

Plans:
- [ ] 16-01: TBD
- [ ] 16-02: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 11 → 12 → 13 → 14 → 15 → 16
Note: Phase 13 depends only on Phase 11 and can execute in parallel with Phase 12.

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
| 11. Animation Queue Refactor + Tech Debt | 2/2 | Complete    | 2026-03-06 | - |
| 12. Backend Detection Services | 0/3 | Complete    | 2026-03-06 | - |
| 13. Pure Frontend Features | v1.2 | 0/3 | Not started | - |
| 14. Animation Overlays + Roast UI | v1.2 | 0/2 | Not started | - |
| 15. Drag-and-Drop + Calendar Popover | v1.2 | 0/2 | Not started | - |
| 16. Settings, Forms & Audio Polish | v1.2 | 0/2 | Not started | - |
