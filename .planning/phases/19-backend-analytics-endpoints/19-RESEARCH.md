# Phase 19: Backend Analytics Endpoints - Research

**Researched:** 2026-03-08
**Domain:** FastAPI backend — analytics aggregation endpoints
**Confidence:** HIGH

## Summary

Phase 19 adds backend data endpoints that downstream frontend phases (20-22) consume. The work spans four files: `analytics.py` (2 new endpoints), `status.py` (augment with streak-break array), `habits.py` (enhance existing stats endpoint), plus their corresponding schemas. All patterns are well-established in the codebase — no new libraries or architectural concepts are needed.

The existing codebase already has: period-filtered analytics (`/analytics/summary`), per-habit calendar with date-range filtering (`/habits/{id}/calendar`), per-habit stats (`/habits/{id}/stats`), streak management with off-day gap detection (`check_zenkai_recovery`), and a test infrastructure using pytest + TestClient + in-memory SQLite with savepoint rollback.

**Primary recommendation:** Implement as two plans — Plan 01 for the analytics router endpoints (off-day summary + completion trends), Plan 02 for habit-level endpoints and status augmentation (streak-break detection + stats enhancement + calendar verification).

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Off-day summary: XP impact = avg daily XP × off-day count; "streaks preserved" counts off-days in streak gaps; reason breakdown dynamically aggregated; period param consistent with /analytics/summary
- Completion trend: rolling 7/30 days; delta = current vs previous same-length period; return habits_due + habits_completed alongside rates; uses DailyLog.habits_due denominator
- Streak-break: add streak_breaks array to existing /status response; per-habit detail with habit_id, habit_title, old_streak, halved_value; compute on each /status call; stateless (no acknowledged flag)
- Habit stats enhancement: add attribute_xp map {"STR": 120, ...}; replace single completion_rate_30d with 7d and 30d; return current_streak and best_streak only
- Habit calendar: verify existing implementation works correctly — no enhancement needed

### Claude's Discretion
- Period-over-period delta format (percentage point change vs percentage change)
- Exact query optimization for off-day summary aggregations
- Error handling and edge cases (no data periods, new users with no history)
- Response schema naming conventions (consistency with existing patterns)

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| (enabling) | Off-day summary endpoint | analytics.py pattern + OffDay model + period filter pattern from /summary |
| (enabling) | Completion trend endpoint | DailyLog model has habits_due/habits_completed fields for aggregation |
| (enabling) | Habit stats enhancement | HabitLog.attribute_xp_awarded + Habit.attribute for XP map; existing stats endpoint as base |
| (enabling) | Habit calendar verification | Existing endpoint at habits.py:543 already returns per-day completed + xp with date range filtering |
| (enabling) | Streak-break detection on /status | check_zenkai_recovery pattern from streak_service.py; HabitStreak.last_completed_date for per-habit detection |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| FastAPI | existing | API framework | Already in use throughout project |
| SQLAlchemy | existing | ORM queries | All models and queries use SA |
| Pydantic | existing | Response schemas | All schemas use Pydantic BaseModel |
| pytest | existing | Testing | Backend test suite in place |

### Supporting
No new libraries needed. All work uses existing imports.

## Architecture Patterns

### Existing Pattern: Analytics Router
```python
# From analytics.py — all new endpoints follow this exact pattern
@router.get("/endpoint-name", response_model=SchemaModel)
def endpoint_name(
    period: Literal["week", "month", "all"] = Query(default="all"),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    # Filter by period using timedelta
    # Aggregate with SQLAlchemy queries
    # Return Pydantic model
```

### Existing Pattern: Period Filtering
```python
# From analytics.py:30-39
if period == "week":
    start = (today - timedelta(days=7)).isoformat()
    query = query.filter(DailyLog.log_date >= start)
elif period == "month":
    start = (today - timedelta(days=30)).isoformat()
    query = query.filter(DailyLog.log_date >= start)
```

### Existing Pattern: Streak Gap Detection
```python
# From streak_service.py:52-93 — check_zenkai_recovery()
# Counts off-days in gap between last_active_date and today
# Returns zenkai_activated, halved_from, new_streak
# KEY: This is per-user overall streak. Phase 19 needs per-HABIT version.
```

### Anti-Patterns to Avoid
- **N+1 queries in streak-break detection:** Don't query HabitStreak one at a time. Batch-load all user's HabitStreaks in one query, then iterate.
- **Hardcoding off-day reasons:** The CONTEXT.md says dynamically aggregate — use GROUP BY, not if/else.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Period filtering | Custom date parser | Existing `timedelta` + `Literal["week","month","all"]` pattern | Already proven in /analytics/summary |
| Off-day gap detection | New gap logic | Adapt `check_zenkai_recovery` pattern | Battle-tested, accounts for off-days correctly |

## Common Pitfalls

### Pitfall 1: Streak-break detection is per-habit, not per-user
**What goes wrong:** Using `check_zenkai_recovery` directly only detects overall streak breaks, not per-habit breaks.
**Why it happens:** The existing function checks `Streak.last_active_date` (overall), not `HabitStreak.last_completed_date` (per-habit).
**How to avoid:** Write new per-habit detection that iterates HabitStreaks, comparing each `last_completed_date` to today minus off-days.
**Warning signs:** Only one streak break returned when multiple habits have broken streaks.

### Pitfall 2: Division by zero in completion rates
**What goes wrong:** New users or empty periods have no DailyLog entries, causing division by zero.
**Why it happens:** `sum(habits_due) = 0` when no logs exist.
**How to avoid:** Always check denominator before dividing; return 0.0 for empty periods.

### Pitfall 3: "Streaks preserved" off-day count requires understanding streak gaps
**What goes wrong:** Simply counting off-days is wrong — only off-days that fell BETWEEN two active streak days count as "preserved."
**Why it happens:** An off-day when user had no active streak doesn't "preserve" anything.
**How to avoid:** For each off-day in period, check if the user had an active streak (current_streak > 0) on the day before the off-day. Only count those.

### Pitfall 4: Schema backward compatibility on /status
**What goes wrong:** Adding streak_breaks to StatusResponse breaks frontend if it doesn't expect the field.
**Why it happens:** Pydantic models are strict by default.
**How to avoid:** Add `streak_breaks` with default empty list `[]` so existing frontend gets the field but ignores it.

## Code Examples

### Off-day reason breakdown (dynamic aggregation)
```python
from sqlalchemy import func
reason_counts = (
    db.query(OffDay.reason, func.count(OffDay.id))
    .filter(OffDay.user_id == user.id, OffDay.off_date >= start)
    .group_by(OffDay.reason)
    .all()
)
reason_breakdown = {reason: count for reason, count in reason_counts}
```

### Completion trend with delta
```python
today = date.today()
week_start = (today - timedelta(days=7)).isoformat()
prev_week_start = (today - timedelta(days=14)).isoformat()

# Current week
current_logs = db.query(DailyLog).filter(..., DailyLog.log_date >= week_start).all()
current_due = sum(dl.habits_due for dl in current_logs)
current_completed = sum(dl.habits_completed for dl in current_logs)
weekly_rate = current_completed / current_due if current_due > 0 else 0.0

# Previous week
prev_logs = db.query(DailyLog).filter(..., DailyLog.log_date >= prev_week_start, DailyLog.log_date < week_start).all()
prev_due = sum(dl.habits_due for dl in prev_logs)
prev_completed = sum(dl.habits_completed for dl in prev_logs)
prev_rate = prev_completed / prev_due if prev_due > 0 else 0.0

weekly_delta = weekly_rate - prev_rate  # percentage point change
```

### Per-habit streak-break detection
```python
from app.models.habit_streak import HabitStreak
from app.models.habit import Habit

streaks = (
    db.query(HabitStreak, Habit)
    .join(Habit, HabitStreak.habit_id == Habit.id)
    .filter(HabitStreak.user_id == user.id, HabitStreak.current_streak > 0)
    .all()
)

breaks = []
for hs, habit in streaks:
    if hs.last_completed_date is None:
        continue
    last = date.fromisoformat(hs.last_completed_date)
    gap = (today_date - last).days
    if gap <= 1:
        continue
    # Count off-days in gap
    off_count = db.query(OffDay).filter(
        OffDay.user_id == user.id,
        OffDay.off_date > hs.last_completed_date,
        OffDay.off_date < today_str,
    ).count()
    if off_count < gap - 1:  # Not all gap days are off-days
        old_streak = hs.current_streak
        halved = max(old_streak // 2, 0)
        breaks.append({
            "habit_id": str(habit.id),
            "habit_title": habit.title,
            "old_streak": old_streak,
            "halved_value": halved,
        })
```

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | pytest (existing) |
| Config file | `backend/pyproject.toml` |
| Quick run command | `cd backend && python -m pytest tests/test_api_analytics.py -x` |
| Full suite command | `cd backend && python -m pytest tests/ -x` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SC-1 | Off-day summary returns totals + breakdown | integration | `pytest tests/test_api_analytics.py::TestOffDaySummary -x` | ❌ Wave 0 |
| SC-2 | Completion trend returns rates + deltas | integration | `pytest tests/test_api_analytics.py::TestCompletionTrend -x` | ❌ Wave 0 |
| SC-3 | Habit stats returns rates + XP map + streaks | integration | `pytest tests/test_api_habits.py::TestHabitStatsEnhanced -x` | ❌ Wave 0 |
| SC-4 | Habit calendar returns per-day data | integration | `pytest tests/test_api_habits.py::TestHabitCalendar -x` | ✅ verify |
| SC-5 | Streak-break detection in /status | integration | `pytest tests/test_api_status.py::TestStreakBreaks -x` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `cd backend && python -m pytest tests/test_api_analytics.py tests/test_api_habits.py tests/test_api_status.py -x`
- **Per wave merge:** `cd backend && python -m pytest tests/ -x`
- **Phase gate:** Full suite green before verify

### Wave 0 Gaps
- [ ] `tests/test_api_analytics.py::TestOffDaySummary` — covers SC-1
- [ ] `tests/test_api_analytics.py::TestCompletionTrend` — covers SC-2
- [ ] `tests/test_api_habits.py::TestHabitStatsEnhanced` — covers SC-3
- [ ] `tests/test_api_status.py::TestStreakBreaks` — covers SC-5

## Sources

### Primary (HIGH confidence)
- Codebase analysis: `backend/app/api/v1/analytics.py` — existing analytics patterns
- Codebase analysis: `backend/app/api/v1/habits.py` — existing stats/calendar endpoints
- Codebase analysis: `backend/app/api/v1/status.py` — existing status endpoint
- Codebase analysis: `backend/app/services/streak_service.py` — zenkai recovery pattern
- Codebase analysis: `backend/app/models/` — all model schemas verified

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - no new libraries, all existing patterns
- Architecture: HIGH - extending existing routers and schemas
- Pitfalls: HIGH - identified from direct code analysis

**Research date:** 2026-03-08
**Valid until:** 2026-04-08
