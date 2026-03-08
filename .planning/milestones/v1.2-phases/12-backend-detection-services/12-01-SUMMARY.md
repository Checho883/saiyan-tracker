---
phase: 12-backend-detection-services
plan: 01
status: complete
started: 2026-03-06
completed: 2026-03-06
---

# Plan 12-01: Achievement & Event Detection Services

## What was built
Achievement service with streak milestone detection (3/7/21/30/60/90/365), attribute level-up detection, and transformation achievement recording. Integrated into check_habit() via an events array in the response.

## Key decisions
- DBZ-themed badge names: First Step, Warrior Spirit, Saiyan Pride, Elite Fighter, Super Saiyan, Ascended Warrior, Legend
- Events array uses dict union pattern (extensible for future event types)
- Attribute XP captured before mutation for accurate level comparison
- Achievements use check-before-insert dedup (app-level, not DB constraint)

## Key files
- `backend/app/services/achievement_service.py` (new)
- `backend/app/core/constants.py` (MILESTONE_BADGE_NAMES added)
- `backend/app/schemas/check_habit.py` (events field added)
- `backend/app/services/habit_service.py` (event detection integrated)
- `backend/app/api/v1/habits.py` (milestone quotes enrichment)
- `backend/tests/test_achievement_service.py` (26 tests)

## Self-Check: PASSED
- [x] Achievement service functions work correctly
- [x] Events array returned in check_habit response
- [x] Streak milestones detected for overall AND habit streaks
- [x] Attribute level-ups detected with title lookup
- [x] Transformation achievements recorded
- [x] Deduplication prevents duplicate achievements
- [x] Unchecking returns empty events
- [x] All 48 tests pass (26 achievement + 22 habit service)
