# Milestones

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

