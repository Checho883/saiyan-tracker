# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1.0 — Backend Foundation

**Shipped:** 2026-03-04
**Phases:** 3 | **Plans:** 7 | **Sessions:** ~3

### What Was Built
- 15 SQLAlchemy models with full relationship graph, constraints, and FK enforcement
- Complete game engine: XP formulas, Kaio-ken tiers, attribute leveling, Zenkai recovery, capsule RNG, Dragon Ball collection, wish granting, power/transformation system
- check_habit() atomic transaction orchestrating 10 services in one DB commit
- 9 REST API routers with Pydantic schemas covering all backend functionality
- 118 seeded Dragon Ball quotes across 6 characters
- 222 passing tests via TDD

### What Worked
- TDD-first approach: writing failing tests before implementation caught edge cases early and kept velocity high (6.3 min avg per plan)
- Bottom-up phase ordering: DB → Services → API meant each layer had solid foundations
- Pure function extraction for XP math: composable, testable, no DB coupling
- Services don't commit pattern: API layer owns transactions, enabling clean test isolation
- StaticPool + create_savepoint for TestClient SQLite thread safety

### What Was Inefficient
- PowerLevel and Achievement models created but never populated — forward scaffolding that could have waited
- STREAK_MILESTONES constant defined but no consumer — premature abstraction
- Redundant get_habits_due_on_date() call in check_habit flow (once in endpoint, once in service)
- Off-day streak reversal gap discovered late in audit

### Patterns Established
- CRUD router pattern: model_dump(exclude_unset=True) for partial updates, 201/204 status codes
- Connection-level transaction rollback in test conftest for isolation
- Check-before-insert seed pattern for idempotency
- Priority-based quote trigger matching

### Key Lessons
1. Don't scaffold models/constants for future phases — build them when the consumer exists
2. TDD at 6-7 min/plan is sustainable and catches integration issues before they cascade
3. Single-user SQLite with synchronous SQLAlchemy is the right call — no async complexity needed
4. Audit before milestone completion catches semantic gaps (streak reversal, orphaned models)

### Cost Observations
- Model mix: ~70% opus, ~30% sonnet
- Sessions: ~3 (one per phase roughly)
- Notable: Entire backend built in one day — TDD + well-defined PRD = fast execution

---

## Milestone: v1.1 — The Dopamine Layer

**Shipped:** 2026-03-06
**Phases:** 7 | **Plans:** 16 | **Sessions:** ~5

### What Was Built
- React 19 + Vite 7 scaffold with Tailwind v4 dark theme, 43 TypeScript types, typed ky API client, 4 Zustand stores
- Full dashboard: habit list, check/uncheck with optimistic UI, XP popup, aura gauge, saiyan avatar, scouter HUD, attributes, Dragon Balls, streaks, character quotes, habit CRUD
- Howler.js audio system with 13 sound effects, playbackRate variation, global mute toggle
- Animation layer: sequential queue, 5 choreographed overlays (Perfect Day, Capsule, Dragon Ball, Transformation, Shenron)
- Analytics: calendar heatmap, attribute/power charts, stat cards with neon glow
- Settings: preferences, CRUD for rewards/wishes/categories, theme toggle
- Cross-phase integration fixes and full 49/49 requirement verification

### What Worked
- Milestone audit after initial phases caught 3 integration bugs and verification gaps before shipping — Phases 9 and 10 addressed them cleanly
- Zustand with useShallow selector discipline prevented re-render issues from the start
- AnimatePresence mode="wait" queue pattern for sequential animations was clean and maintainable
- Optimistic UI with rollback pattern for habit checks gave instant feedback without complexity
- Parallel phase execution where dependency graphs allowed (Phase 8 parallel to 6/7)

### What Was Inefficient
- Phase 5/6/7 ROADMAP.md checkboxes weren't updated during execution — audit caught stale state
- Phase 7 SUMMARY frontmatter was left empty for requirements_completed — needed Phase 10 to fix
- Audio sprite is still a placeholder file — real sound files deferred
- recharts peer dependency conflict required react-is override hack

### Patterns Established
- Tailwind v4 @theme with CSS custom properties for theming (28 color tokens)
- Zustand store pattern: useShallow for multi-value, cross-store orchestration in habitStore.checkHabit
- Vaul bottom sheet pattern for mobile-friendly CRUD modals
- CollapsibleSection accordion pattern for settings page sections
- Animation dispatcher pattern: uiStore queue → AnimationPlayer consumer → overlay components

### Key Lessons
1. Milestone audit is essential — 3 real integration bugs were caught that would have shipped broken
2. ROADMAP.md and SUMMARY frontmatter must be updated during phase execution, not retroactively
3. Verification documents (VERIFICATION.md) should be created as part of phase execution, not as a separate housekeeping phase
4. Placeholder assets (audio sprites) should be flagged as tech debt immediately, not discovered later
5. 7 phases in 2 days is sustainable with well-defined requirements and bottom-up ordering

### Cost Observations
- Model mix: ~60% opus, ~40% sonnet (more sonnet for straightforward UI phases)
- Sessions: ~5
- Notable: 88 commits, 7,783 LOC TypeScript in 2 days — detailed PRD + GSD workflow = high throughput

---

## Milestone: v1.2 — PRD Complete

**Shipped:** 2026-03-08
**Phases:** 7 | **Plans:** 18 | **Sessions:** ~6

### What Was Built
- Priority-tiered animation queue with combo batching for simultaneous game events
- Achievement service with streak milestones (7 tiers), attribute level-ups, transformation recording
- Roast detection service with Vegeta escalation (mild/medium/savage) + Goku welcome-back
- Frontend features: capsule/wish history, contribution graphs, nudge banner, daily summary toast, power milestones
- Animation overlays: level-up, Zenkai recovery, streak milestone, plus roast/welcome cards and achievements grid
- Drag-and-drop habit reordering with @dnd-kit, calendar day-detail popover with floating-ui
- Settings polish: archived habits, temporary habits, circular day picker, 13 real synthesized audio sounds
- Complete EVENT_SOUND_MAP for all 11 animation event types
- VERIFICATION.md for all 7 phases, 456 tests passing

### What Worked
- Milestone audit (v1.2-MILESTONE-AUDIT) caught 4 missing sound mappings and missing VERIFICATION.md files — Phase 17 closed all gaps cleanly
- Phase ordering: animation queue first → backend detections → frontend features → overlays → polish ensured each layer had foundations
- recharts react-is fix resolved cleanly with explicit react-is@19 install (removed overrides hack)
- ffmpeg-synthesized sounds: 13 sounds generated locally without external downloads, consistent quality
- Gap closure phase pattern (Phase 17) is effective for catching cross-phase wiring issues

### What Was Inefficient
- SUMMARY.md frontmatter missing requirements_completed field across Phases 12-16 — required VERIFICATION.md cross-reference instead
- 2 orphaned API endpoints (GET /habits/{id}/calendar, GET /habits/{id}/stats) — frontend chose different data paths than planned
- Phase details in ROADMAP.md showed stale plan counts (some showed "0/3" when all plans were complete)

### Patterns Established
- Gap closure phase: dedicated phase to close audit findings before milestone completion
- EVENT_SOUND_MAP pattern: Record<AnimationEvent, SoundId> for centralized audio wiring
- Reuse existing SoundIds for similar events (no audio proliferation)
- VERIFICATION.md as formal cross-phase integration verification document
- 3-source requirement cross-reference: VERIFICATION + SUMMARY + REQUIREMENTS traceability

### Key Lessons
1. Gap closure phases work well — creating Phase 17 from audit findings was clean and focused
2. Orphaned endpoints happen when frontend finds better data paths — not a problem, just tech debt
3. SUMMARY.md frontmatter should include requirements_completed during execution, not retroactively
4. 18 plans across 7 phases in 3 days is sustainable with GSD workflow
5. Audio last is correct — sprite must include all sound IDs from completed features

### Cost Observations
- Model mix: ~55% opus, ~45% sonnet
- Sessions: ~6
- Notable: 52 commits, 24 requirements shipped in 3 days, full PRD coverage achieved

---

## Milestone: v1.3 — The Polish Pass

**Shipped:** 2026-03-11
**Phases:** 5 | **Plans:** 11 | **Sessions:** ~5

### What Was Built
- Full responsive design: mobile-first hero, 48px+ touch targets, bottom tab bar, touch-friendly charts, mobile-optimized settings
- Backend analytics pipeline: off-day summary, completion trends, habit stats enhancement, streak-break detection on /status endpoint
- Habit detail bottom sheet with ProgressRing, CalendarGrid, completion rates, attribute XP, metadata tabs
- Enhanced analytics cards: off-day impact pie chart, completion trend with delta arrows, streak power rankings, best/worst days
- Negative feedback loop: red downward XP popup on uncheck, AuraGauge real-time shrink, StreakBreakCard with dismiss
- Shareable daily summary with clipboard copy, 10 escalating milestone celebration tiers (100 to 100K)

### What Worked
- Milestone audit caught only tech debt (documentation staleness), not functional gaps — v1.2's gap closure pattern paid off
- Research phases identified orphaned endpoints early — Phase 19 rebuilt them correctly instead of discovering issues mid-phase
- All 18 requirements verified in a single audit pass — no gap closure phases needed for v1.3
- Phase ordering: responsive first → backend → detail views → analytics → feedback ensured each phase had clean foundations

### What Was Inefficient
- REQUIREMENTS.md traceability table not updated during phase execution — 9 requirements showed "Pending" despite completion
- ANLYT-01–04 checkboxes not checked during Phase 21 execution — discovered by audit
- SUMMARY.md frontmatter inconsistent across phases — some used different structures, extraction tool failed
- Phase 19 VERIFICATION.md never created (enabling infrastructure phase with no direct requirements)

### Patterns Established
- Bottom sheet drill-down pattern: HabitCard tap → HabitDetailSheet → API fetch → render
- Clipboard share pattern: buildDailySummary() → navigator.clipboard → toast feedback
- Negative variant prop pattern: XpPopup accepts variant="negative" for red downward animation
- Dismissible card pattern: StreakBreakCard with dismiss button, mirrors RoastWelcomeCard UX

### Key Lessons
1. Documentation updates (checkboxes, traceability) must happen during phase execution, not after — this is the 3rd milestone with this issue
2. Phase 19 (enabling infrastructure) should still get a VERIFICATION.md — downstream verification doesn't replace local verification
3. SUMMARY.md frontmatter format should be standardized — inconsistency breaks extraction tools
4. Tech-debt-only audit results mean the process is working — no functional gaps at v1.3

### Cost Observations
- Model mix: ~50% opus, ~50% sonnet
- Sessions: ~5
- Notable: 53 commits, 18 requirements in 4 days — polishing existing code is slower than greenfield

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Sessions | Phases | Key Change |
|-----------|----------|--------|------------|
| v1.0 | ~3 | 3 | Established TDD-first, bottom-up build pattern |
| v1.1 | ~5 | 7 | Added milestone audit as gate, verification docs as standard |
| v1.2 | ~6 | 7 | Added gap closure phase pattern, 3-source requirement verification |
| v1.3 | ~5 | 5 | Tech-debt-only audit — no gap closure phases needed |

### Cumulative Quality

| Milestone | Tests | Coverage | Zero-Dep Additions |
|-----------|-------|----------|-------------------|
| v1.0 | 222 | ~95% | 0 |
| v1.1 | 222 (backend) + frontend tests | N/A | 0 |
| v1.2 | 280 (backend) + 176 (frontend) = 456 | N/A | 0 |
| v1.3 | 231 (frontend + backend) | N/A | 0 |

### Top Lessons (Verified Across Milestones)

1. TDD-first with well-defined requirements enables ~6 min/plan velocity
2. Bottom-up dependency chains prevent rework cascades
3. Milestone audit before shipping catches integration gaps that phase-level verification misses
4. Detailed PRD → GSD phases → execution delivers full milestones in 1-3 days
5. Gap closure phases cleanly address cross-phase wiring issues found by audit
6. Documentation updates (checkboxes, traceability) during phase execution — not after — is a recurring lesson (v1.1, v1.2, v1.3)
