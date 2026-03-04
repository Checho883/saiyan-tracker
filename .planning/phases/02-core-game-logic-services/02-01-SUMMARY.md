---
phase: 02-core-game-logic-services
plan: 01
subsystem: game-logic
tags: [python, pure-functions, xp-system, kaio-ken-tiers, attribute-leveling, tdd, pytest]

# Dependency graph
requires:
  - phase: 01-01
    provides: "Game constants (BASE_DAILY_XP, COMPLETION_TIERS, IMPORTANCE_XP, ATTRIBUTE_TITLES, etc.)"
provides:
  - "XP calculation: calc_daily_xp, get_completion_tier, get_attribute_xp, calc_streak_bonus"
  - "Attribute leveling: calc_attribute_level, get_attribute_title, get_xp_for_next_level"
  - "44 unit tests covering all formula edge cases and boundary conditions"
affects: [02-02-power-transformation-services, 02-03-check-habit-orchestrator, 03-api-routes]

# Tech tracking
tech-stack:
  added: []
  patterns: [pure-function-services, parametrized-test-vectors, tdd-red-green]

key-files:
  created:
    - backend/app/services/__init__.py
    - backend/app/services/xp_service.py
    - backend/app/services/attribute_service.py
    - backend/tests/test_xp_service.py
    - backend/tests/test_attribute_service.py

key-decisions:
  - "Pure functions with no DB dependency -- composable by check_habit orchestrator in Plan 02-03"
  - "KeyError propagation for invalid importance -- validation responsibility stays at API layer"
  - "math.floor for all XP outputs -- consistent integer XP throughout the system"

patterns-established:
  - "Pure service functions: import constants, compute, return -- no side effects"
  - "Parametrized test vectors: known inputs/outputs as pytest.mark.parametrize tables"

requirements-completed: [GAME-01, GAME-02, GAME-03, GAME-04, GAME-12]

# Metrics
duration: 6min
completed: 2026-03-04
---

# Phase 02 Plan 01: XP and Attribute Service Summary

**Pure XP formula engine (daily XP, Kaio-ken tiers, streak bonus) and attribute leveling system (level-from-XP, title lookup) with 44 TDD-verified tests**

## Performance

- **Duration:** 6 min
- **Started:** 2026-03-04T15:12:21Z
- **Completed:** 2026-03-04T15:18:41Z
- **Tasks:** 2
- **Files created:** 5

## Accomplishments
- Four XP pure functions covering daily XP formula, Kaio-ken tier lookup, per-habit attribute XP, and streak bonus
- Three attribute leveling functions covering level-from-XP calculation, title lookup by attribute/level, and XP cost for next level
- 44 parametrized tests verifying exact integer outputs for all formula combinations including Zenkai, capped streaks, and boundary thresholds

## Task Commits

Each task was committed atomically (TDD: test then feat):

1. **Task 1: XP service** - `43117d3` (test: RED), `02dba69` (feat: GREEN)
2. **Task 2: Attribute service** - `a0369e8` (test: RED), `a85d8d5` (feat: GREEN)

_TDD flow: failing tests committed first, then implementation passing all tests._

## Files Created/Modified
- `backend/app/services/__init__.py` - Service package init with docstring
- `backend/app/services/xp_service.py` - calc_daily_xp, get_completion_tier, get_attribute_xp, calc_streak_bonus
- `backend/app/services/attribute_service.py` - calc_attribute_level, get_attribute_title, get_xp_for_next_level
- `backend/tests/test_xp_service.py` - 21 tests for XP formulas and tier system
- `backend/tests/test_attribute_service.py` - 23 tests for attribute leveling and titles

## Decisions Made
- Pure functions with no DB dependency -- composable by check_habit orchestrator in Plan 02-03
- KeyError propagation for invalid importance -- validation responsibility stays at API layer
- math.floor for all XP outputs -- consistent integer XP throughout the system

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- pytest not installed in the project's Python environment; installed via pip as blocking dependency (Rule 3 auto-fix, no deviation from plan scope)

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- XP and attribute services ready for composition by power/transformation service (Plan 02-02) and check_habit orchestrator (Plan 02-03)
- All exported functions match the interfaces specified in plan frontmatter

---
*Phase: 02-core-game-logic-services*
*Completed: 2026-03-04*
