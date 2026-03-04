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

## Cross-Milestone Trends

### Process Evolution

| Milestone | Sessions | Phases | Key Change |
|-----------|----------|--------|------------|
| v1.0 | ~3 | 3 | Established TDD-first, bottom-up build pattern |

### Cumulative Quality

| Milestone | Tests | Coverage | Zero-Dep Additions |
|-----------|-------|----------|-------------------|
| v1.0 | 222 | ~95% | 0 |

### Top Lessons (Verified Across Milestones)

1. TDD-first with well-defined requirements enables ~6 min/plan velocity
2. Bottom-up dependency chains prevent rework cascades
