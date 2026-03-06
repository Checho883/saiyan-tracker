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

## Cross-Milestone Trends

### Process Evolution

| Milestone | Sessions | Phases | Key Change |
|-----------|----------|--------|------------|
| v1.0 | ~3 | 3 | Established TDD-first, bottom-up build pattern |
| v1.1 | ~5 | 7 | Added milestone audit as gate, verification docs as standard |

### Cumulative Quality

| Milestone | Tests | Coverage | Zero-Dep Additions |
|-----------|-------|----------|-------------------|
| v1.0 | 222 | ~95% | 0 |
| v1.1 | 222 (backend) + frontend tests | N/A | 0 |

### Top Lessons (Verified Across Milestones)

1. TDD-first with well-defined requirements enables ~6 min/plan velocity
2. Bottom-up dependency chains prevent rework cascades
3. Milestone audit before shipping catches integration gaps that phase-level verification misses
4. Detailed PRD → GSD phases → execution delivers full milestones in 1-2 days
