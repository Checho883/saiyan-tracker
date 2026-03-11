# Phase 19: Backend Analytics Endpoints - Context

**Gathered:** 2026-03-08
**Status:** Ready for planning

<domain>
## Phase Boundary

All backend data endpoints ready so frontend analytics and detail views can fetch pre-aggregated data. New endpoints: off-day summary, completion trends. Enhanced endpoints: habit stats, streak-break detection on /status. Verified endpoints: habit calendar. No frontend work in this phase.

</domain>

<decisions>
## Implementation Decisions

### Off-day summary endpoint (GET /analytics/off-day-summary)
- XP impact estimate: multiply user's average daily XP by number of off-days in the period
- "Streaks preserved": count off-days that fell in a gap between two active streak days (the streak would have broken without them) — reuse existing streak_service gap logic
- Reason breakdown: dynamically aggregate counts by whatever reason values exist in OffDay.reason — no hardcoded categories
- Accept period param (week/month/all) consistent with existing /analytics/summary endpoint pattern

### Completion trend endpoint (GET /analytics/completion-trend)
- "Weekly" = rolling last 7 days from today; "monthly" = rolling last 30 days
- Delta compares current period vs the previous period of same length (last 7 days vs the 7 days before that)
- Return aggregated rates only: weekly_rate, weekly_delta, monthly_rate, monthly_delta
- Include habits_due and habits_completed denominators alongside rates so frontend can show "42/56 habits completed this week (75%)"
- Uses snapshotted DailyLog.habits_due as the denominator (per success criteria)

### Streak-break detection (augment GET /status)
- Add streak_breaks array to the existing /status response — no new endpoint needed
- Per-habit detail: each entry contains habit_id, habit_title, old_streak, halved_value (Zenkai)
- Compute on each /status call by comparing each HabitStreak.last_completed_date to today, accounting for off-days
- Stateless — no acknowledged/dismissed flag needed (Phase 22 frontend handles dismissal state)

### Existing endpoint enhancement (GET /habits/{id}/stats)
- Add attribute_xp map: {"STR": 120, "VIT": 80, "INT": 45, "KI": 60} — aggregate HabitLog.attribute_xp_awarded grouped by the habit's attribute
- Replace completion_rate_30d with completion_rate_7d and completion_rate_30d (rolling 7-day and 30-day)
- Streak data: return current_streak and best_streak only (no historical timeline)

### Existing endpoint verification (GET /habits/{id}/calendar)
- Current implementation returns per-day completed + attribute_xp_awarded with date range filtering
- Verify it works correctly and matches Phase 20 needs — no enhancement needed

### Claude's Discretion
- Period-over-period delta format (percentage point change vs percentage change)
- Exact query optimization for off-day summary aggregations
- Error handling and edge cases (no data periods, new users with no history)
- Response schema naming conventions (consistency with existing patterns)

</decisions>

<specifics>
## Specific Ideas

- Off-day summary period filter should use the same param name and values as /analytics/summary for API consistency
- Streak-break detection reuses check_zenkai_recovery logic pattern from streak_service.py
- The /habits/{id}/stats endpoint is a rebuild of the orphaned endpoint — verify it against Phase 20 success criteria before shipping

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `backend/app/api/v1/analytics.py`: Existing analytics router with /summary, /capsule-history, /wish-history — add new endpoints here
- `backend/app/api/v1/habits.py`: Already has /{id}/stats and /{id}/calendar endpoints to enhance/verify
- `backend/app/services/streak_service.py`: check_zenkai_recovery() detects streak gaps accounting for off-days — reuse pattern for streak-break detection
- `backend/app/api/v1/status.py`: Existing /status endpoint to augment with streak_breaks array

### Established Patterns
- Period filtering: /analytics/summary uses `period: Literal["week", "month", "all"]` query param
- Auth: All endpoints use `get_current_user` and `get_db` dependencies
- Response schemas: Pydantic models in `app/schemas/` directory
- Date handling: Dates stored as ISO strings (YYYY-MM-DD) in String(10) columns

### Integration Points
- DailyLog model: Has habits_due, habits_completed, habit_completion_rate, xp_earned — ready for trend aggregation
- OffDay model: Has reason (String(20)) for breakdown aggregation
- HabitStreak model: Has current_streak, best_streak, last_completed_date — ready for break detection
- HabitLog model: Has attribute_xp_awarded for per-habit XP breakdown
- Habit model: Has attribute field to map XP to attribute categories

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 19-backend-analytics-endpoints*
*Context gathered: 2026-03-08*
