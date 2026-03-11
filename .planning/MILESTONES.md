# Milestones

## v1.3 The Polish Pass (Shipped: 2026-03-11)

**Phases completed:** 5 phases, 11 plans
**Requirements:** 18/18 complete

**Key accomplishments:**
- Full responsive design: mobile-first hero, 48px+ touch targets, bottom tab bar, touch-friendly chart tooltips, mobile-optimized settings and forms
- Backend analytics pipeline: off-day summary, completion trends, habit stats enhancement, streak-break detection on /status endpoint
- Habit detail bottom sheet: tap any habit for weekly/monthly completion rates, attribute XP, metadata, ProgressRing and CalendarGrid components
- Enhanced analytics: off-day impact card with pie chart, completion trend cards with delta arrows, streak power rankings, best/worst day highlights
- Negative feedback loop: XP popup with red downward animation on uncheck, AuraGauge real-time shrink, StreakBreakCard with Zenkai acknowledgment
- Shareable daily summary: one-tap clipboard copy with DBZ theme, 10 escalating milestone celebration tiers (100 to 100K)

**Stats:**
- Commits: 53
- Timeline: 4 days (2026-03-08 → 2026-03-11)
- Git range: feat(18-01) → feat(22-02)
- Tests: 231 passing (frontend + backend)
- Tech debt: 7 documentation items (all resolved during completion)

---

## v1.2 PRD Complete (Shipped: 2026-03-08)

**Phases completed:** 7 phases, 18 plans
**Requirements:** 24/24 complete

**Key accomplishments:**
- Priority-tiered animation queue with combo batching — prevents overload from simultaneous game events
- Backend detection services: achievement recording, streak milestones (3/7/21/30/60/90/365), attribute level-ups, Vegeta roast escalation with welcome-back quotes
- Pure frontend features: capsule/wish history lists, per-habit contribution graphs, nudge banner, daily summary toast, power milestone celebrations
- Animation overlays: level-up, Zenkai recovery, streak milestone overlays plus roast/welcome cards and achievements grid
- Drag-and-drop habit reordering with @dnd-kit and calendar day-detail popover with floating-ui
- Settings polish: archived habits view/restore, temporary habits with date ranges, circular day-of-week picker, 13 real synthesized audio sprite sounds
- Full audio mapping: all 11 AnimationEvent types wired to SoundIds, 176 frontend + 280 backend tests passing

**Stats:**
- Commits: 52
- Timeline: 3 days (2026-03-06 → 2026-03-08)
- Git range: feat(11-01) → feat(17-01)
- Tests: 176 frontend + 280 backend = 456 total
- Tech debt: 3 non-blocking items (2 orphaned API endpoints, missing SUMMARY frontmatter fields)

---

## v1.1 The Dopamine Layer (Shipped: 2026-03-06)

**Phases completed:** 7 phases, 16 plans

**Key accomplishments:**
- React 19 + Vite 7 scaffold with Tailwind v4 dark theme, 43 TypeScript types, typed ky API client for 9 endpoints, 4 Zustand stores with selector discipline
- Full dashboard: habit list grouped by category, check/uncheck with optimistic UI, XP popup, aura gauge with tier labels, saiyan avatar with scouter HUD, 4 attribute bars, Dragon Ball tracker, streaks, character quotes
- Howler.js audio system with 13 sound effects, playbackRate variation, global mute toggle, and SoundEffectListener for animation events
- Animation layer: sequential queue with AnimatePresence, 5 choreographed overlays (Perfect Day explosion, Capsule drop/reveal, Dragon Ball trajectory, Transformation, Shenron ceremony with wish enforcement)
- Analytics page: calendar heatmap (4-color coding), attribute progression chart, power level chart, scouter-style stat cards with neon glow SVG filters
- Settings page: sound/theme/name preferences, off-day management, CRUD for capsule rewards, Shenron wishes, and categories
- Cross-phase integration fixes: SoundProvider settings sync, powerStore transformation name propagation, capsule reveal chime wiring

**Stats:**
- Frontend code: 7,783 LOC TypeScript
- Files changed: 182
- Net change: +24,616 / -5,778 lines
- Timeline: 2 days (2026-03-04 → 2026-03-06)
- Git range: v1.0..b862480 (88 commits)
- Requirements: 49/49 verified complete

---

## v1.0 Backend Foundation (Shipped: 2026-03-04)

**Phases completed:** 3 phases, 7 plans, 0 tasks

**Key accomplishments:**
- 15 SQLAlchemy models with relationships, constraints, indexes, and FK enforcement
- Complete game logic: XP formulas, Kaio-ken tiers, attribute leveling, Zenkai recovery
- Capsule RNG, Dragon Ball collection, wish granting, power/transformation system
- check_habit() atomic transaction orchestrating 10 services in one commit
- 9 REST API routers with full Pydantic schemas, testable via Swagger
- 222 passing tests with TDD across all 3 phases
- 118 seeded Dragon Ball quotes across 6 characters and 7 trigger events

**Stats:**
- App code: 3,292 LOC Python | Test code: 2,675 LOC Python
- Timeline: 1 day (2026-03-04)
- Git range: 885f0ef → afda331 (36 commits)

### Known Gaps
- 47 frontend requirements (STATE-01–06, DASH-01–10, ANIM-01–12, ANLYT-01–07, SET-01–07, QUOTE-01–05) deferred to next milestone
- PowerLevel and Achievement models created but unused (scaffolding for future phases)
- STREAK_MILESTONES constant defined but not consumed by any service
- Quote triggers streak_milestone, roast, welcome_back seeded but unreachable (Phase 8)
- Off-day marking doesn't reverse streak counters (semantic gap, not runtime break)

---

