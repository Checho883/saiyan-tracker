# Phase 12: Backend Detection Services - Research

**Researched:** 2026-03-06
**Status:** Complete

## Phase Goal
check_habit() detects and returns streak milestones, attribute level-ups, power milestones, and roast context so the frontend can react to every meaningful game event.

## Codebase Analysis

### Current check_habit() Architecture
The function in `backend/app/services/habit_service.py` is a 10-step atomic transaction:
1. Toggle habit log
2. Handle attribute XP
3. Update daily log (completion rate, tier)
4. Check Zenkai recovery
5. Update streaks (overall + per-habit)
6. Recalculate daily XP
7. Update power level and transformation
8. Handle Dragon Ball
9. Capsule RNG
10. Flush (no commit)

**Key pattern:** Services flush but don't commit -- caller manages transactions. Pure functions for math. Pydantic schemas for all API responses.

### Existing Assets Ready to Use
- `STREAK_MILESTONES = [3, 7, 21, 30, 60, 90, 365]` in constants.py -- defined but not consumed
- `Achievement` model -- has `achievement_type`, `achievement_key`, `milestone_type`, `metadata_json`
- `ATTRIBUTE_TITLES` dict -- maps attribute+level to title names at thresholds 5/10/25/50/100
- `ATTRIBUTE_LEVEL_FORMULA_EXPONENT = 1.5`, `ATTRIBUTE_LEVEL_BASE_XP = 100` -- formula defined
- `calc_attribute_level()` and `get_attribute_title()` in attribute_service.py -- ready to use
- `VALID_SEVERITIES = ["mild", "medium", "savage"]` -- roast severity levels
- `VALID_TRIGGER_EVENTS` includes "streak_milestone", "roast", "welcome_back"
- Quote model has `trigger_event`, `severity`, `character` fields
- `check_zenkai_recovery()` has off-day gap subtraction logic to reuse for roast
- `Habit.sort_order` field exists (integer, default 0)
- `CheckHabitResponse` schema has `quote` field -- needs `events` array added
- Existing contribution-graph endpoint at `GET /habits/{habit_id}/contribution-graph`

### Integration Points

**check_habit() modifications needed:**
- After step 5 (streaks), detect streak milestones for both overall and habit streaks
- After step 2 (attribute XP), detect attribute level-ups by comparing before/after levels
- After step 7 (transformation), record transformation unlock as achievement
- Build events array from all detected events
- Add events to return dict

**New service needed: achievement_service.py**
- `record_achievement()` -- check-before-insert dedup
- `detect_streak_milestones()` -- compare pre/post streak values against STREAK_MILESTONES
- `detect_attribute_level_up()` -- compare pre/post attribute levels
- `get_milestone_badge_name()` -- map milestone tier to DBZ-themed name

**New service needed: roast_service.py**
- `detect_roast_context()` -- gap detection with off-day subtraction, severity mapping
- `get_welcome_back_data()` -- fetch Goku welcome_back quote + Vegeta roast quote

**New endpoints needed:**
- `GET /api/v1/status` -- welcome-back/roast detection on app load
- `GET /api/v1/habits/{id}/calendar` -- per-habit calendar (different from existing all-habits calendar)
- `GET /api/v1/habits/{id}/stats` -- per-habit statistics
- `PUT /api/v1/habits/reorder` -- batch sort_order update

### Schema Changes

**CheckHabitResponse additions:**
- `events: list[GameEvent]` -- array of detected events

**New schemas needed:**
- `GameEvent` -- base with `type` field
- `StreakMilestoneEvent` -- tier, streak count, badge name, quote
- `LevelUpEvent` -- attribute, old_level, new_level, title
- `TransformationEvent` -- key, name, threshold
- `StatusResponse` -- welcome_back quote, roast data
- `HabitCalendarDay` -- date, completed, attribute_xp_awarded
- `HabitStatsResponse` -- total_completions, current_streak, best_streak, completion_rate_30d, total_xp_earned
- `ReorderRequest` -- habit_ids list

### Test Strategy
- Unit tests for pure detection functions (milestone matching, level calculation, severity mapping)
- Integration tests for check_habit() with events detection
- API tests for new endpoints (status, calendar, stats, reorder)
- Edge case: unchecking does NOT trigger milestone events
- Edge case: existing streak on app load does NOT trigger retroactive achievements
- Edge case: all off-days in gap = no roast

## Validation Architecture

### Dimension 1: Requirements Coverage
All 7 requirement IDs mapped to specific implementation tasks:
- ACHV-01: Achievement recording in check_habit() transaction
- ACHV-02: Streak milestone detection at 3/7/21/30/60/90/365
- ACHV-04: Events only fire inside check_habit(), never on load
- CHAR-01: Roast detection with escalating severity
- CHAR-02: Welcome_back Goku quote shown first, roast as secondary
- ANLT-05: Per-habit calendar and stats endpoints
- HMGT-02: PUT /habits/reorder endpoint

### Dimension 8: Goal-Backward Verification
Phase goal: "check_habit() detects and returns streak milestones, attribute level-ups, power milestones, and roast context"
- Must verify events array in CheckHabitResponse contains milestone/level-up/transform events
- Must verify roast endpoint returns data on app load (not in check_habit)
- Must verify achievements are recorded in DB within check_habit transaction

## Risk Assessment

### Low Risk
- Achievement model already exists with correct fields
- STREAK_MILESTONES constant already defined
- Attribute level calculation functions already exist
- Quote infrastructure (118 quotes, trigger_event filtering) already works
- sort_order field on Habit model already exists

### Medium Risk
- check_habit() is complex (10 steps) -- adding 3 more detection steps increases complexity
- Need to capture attribute level BEFORE XP update for comparison (ordering matters)
- Events array needs to be backward-compatible (existing frontend ignores unknown fields)

### Mitigations
- Keep detection logic in separate service functions, not inline in check_habit()
- Capture pre-state snapshots at the top of check_habit() before mutations
- Events array defaults to empty list -- existing clients unaffected

## RESEARCH COMPLETE
