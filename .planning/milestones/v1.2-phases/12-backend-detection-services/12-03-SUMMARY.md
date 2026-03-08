---
phase: 12-backend-detection-services
plan: 03
status: complete
started: 2026-03-06
completed: 2026-03-06
---

# Plan 12-03: Per-Habit Calendar, Stats, Reorder Endpoints

## What was built
Per-habit calendar endpoint (90-day default, custom range), per-habit stats endpoint (completions, streaks, 30-day rate, XP), and habit reorder endpoint for batch sort_order updates.

## Key decisions
- Calendar defaults to 90 days (matches Phase 13 contribution grid)
- Calendar includes ALL days in range (uncompleted days show completed=false, xp=0)
- Stats completion_rate_30d divides by 30.0 (fixed denominator, not dynamic)
- Reorder validates all habit_ids belong to user, returns 400 for invalid

## Key files
- `backend/app/schemas/habit.py` (HabitCalendarDay, HabitStatsResponse, ReorderRequest added)
- `backend/app/api/v1/habits.py` (3 new endpoints added)
- `backend/tests/test_api_habits.py` (9 new tests added)

## Self-Check: PASSED
- [x] GET /habits/{id}/calendar returns per-habit day-by-day completion data
- [x] Calendar supports custom date range via query params
- [x] GET /habits/{id}/stats returns accurate metrics
- [x] PUT /habits/reorder assigns sort_order by array position
- [x] Reorder validates habit ownership
- [x] All endpoints return 404 for nonexistent habits
- [x] All 23 tests pass (14 existing + 9 new)
