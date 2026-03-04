---
phase: 02-core-game-logic-services
plan: 02
subsystem: services
tags: [python, sqlalchemy, rng, game-mechanics, tdd]

requires:
  - phase: 01-database-and-model-integrity
    provides: "SQLAlchemy models (User, Reward, CapsuleDrop, Wish, WishLog, DailyLog, Habit)"
provides:
  - "Capsule drop RNG with rarity fallback (roll_capsule_drop, select_rarity_tier)"
  - "Dragon Ball award/revoke/wish granting (award_dragon_ball, revoke_dragon_ball, grant_wish)"
  - "Power level calculation and transformation lookup (recalculate_power_level, get_transformation_for_power, check_transformation_change)"
  - "Extended test fixtures (sample_habit, sample_reward, sample_wish)"
affects: [02-03-check-habit-orchestrator, api-endpoints, frontend-state]

tech-stack:
  added: []
  patterns: ["Service functions receive db session and model instances, caller manages transaction", "Pure functions for transformation lookup (no DB)", "Rarity fallback order for capsule drops"]

key-files:
  created:
    - backend/app/services/capsule_service.py
    - backend/app/services/dragon_ball_service.py
    - backend/app/services/power_service.py
    - backend/tests/test_capsule_service.py
    - backend/tests/test_dragon_ball_service.py
    - backend/tests/test_power_service.py
  modified:
    - backend/tests/conftest.py
    - backend/app/services/__init__.py

key-decisions:
  - "Services do NOT commit or add to session -- caller manages transaction boundaries"
  - "Capsule drop uses fallback order (epic -> rare -> common) when rolled tier has no rewards"
  - "Power level is purely additive (sum of all DailyLog.xp_earned), never decreases"

patterns-established:
  - "Session management: service functions mutate model objects but leave commit/add to caller"
  - "RNG mocking: patch the random module at the service module level for deterministic testing"
  - "Rarity fallback: iterate RARITY_FALLBACK_ORDER from rolled tier downward"

requirements-completed: [GAME-08, GAME-09, GAME-10, GAME-11]

duration: 5min
completed: 2026-03-04
---

# Phase 02 Plan 02: Game Mechanic Services Summary

**Capsule drop RNG with weighted rarity fallback, Dragon Ball award/wish granting, and power level/transformation services with 33 TDD tests**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-04T15:12:30Z
- **Completed:** 2026-03-04T15:17:57Z
- **Tasks:** 1
- **Files modified:** 8

## Accomplishments
- Capsule service with 25% drop chance, weighted rarity (60% common / 30% rare / 10% epic), and tier fallback when rolled rarity has no rewards
- Dragon Ball service with award/revoke/grant_wish flow that resets balls to 0 and creates WishLog entries
- Power service with cumulative XP summation, 10-threshold transformation lookup, and change detection
- 33 tests all passing covering edge cases (no rewards, threshold boundaries, wish validation)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create capsule_service.py, dragon_ball_service.py, and power_service.py with tests** - `9f5f06c` (feat)

**Plan metadata:** (pending)

_Note: TDD task -- tests written first (RED confirmed via import error), then services implemented (GREEN confirmed with 33/33 pass)_

## Files Created/Modified
- `backend/app/services/__init__.py` - Services package init
- `backend/app/services/capsule_service.py` - Capsule drop RNG with rarity fallback
- `backend/app/services/dragon_ball_service.py` - Dragon Ball awards and wish granting
- `backend/app/services/power_service.py` - Power level calculation and transformation lookup
- `backend/tests/conftest.py` - Extended with sample_habit, sample_reward, sample_wish fixtures
- `backend/tests/test_capsule_service.py` - 9 tests for capsule RNG and fallback
- `backend/tests/test_dragon_ball_service.py` - 12 tests for Dragon Ball and wish flow
- `backend/tests/test_power_service.py` - 12 tests for power level and transformations

## Decisions Made
- Services do NOT call db.add() or db.commit() -- the caller (check_habit orchestrator in Plan 02-03) manages transaction boundaries
- Capsule drop short-circuits entirely when no active rewards exist (skips RNG)
- grant_wish validates both Dragon Ball count >= 7 AND wish is active before proceeding
- Power level uses func.coalesce to handle zero-log edge case cleanly

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All three game mechanic services ready for composition in Plan 02-03 (check_habit orchestrator)
- Test fixtures extended for downstream tests
- Service functions follow consistent pattern: receive db session, mutate models, return dicts

## Self-Check: PASSED

All 8 files verified present. Commit 9f5f06c verified in git log.

---
*Phase: 02-core-game-logic-services*
*Completed: 2026-03-04*
