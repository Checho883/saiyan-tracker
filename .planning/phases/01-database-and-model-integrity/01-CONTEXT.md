# Phase 1: Database and Model Integrity - Context

**Gathered:** 2026-03-01
**Status:** Ready for planning
**Source:** PRD Express Path (PRD.md)

<domain>
## Phase Boundary

This phase fixes the database foundation: foreign key enforcement on file-based SQLite, timezone-safe datetime handling, correct cascade behavior on model relationships, and cleanup of any orphaned rows from past operations without FK enforcement.

This phase does NOT touch business logic, API endpoints, or frontend. It only ensures the data layer is correct before higher layers are audited.

</domain>

<decisions>
## Implementation Decisions

### Database Engine
- SQLite (local dev), accessed via SQLAlchemy 2.0
- Database file at `backend/data/saiyan_tracker.db`
- Single user: DEFAULT_USER_ID = "default-user"
- No migration system — delete and rebuild DB when schema changes

### Schema (from PRD Section 5)
- **Habits**: id (UUID PK), user_id (FK), category_id (FK), title, description, icon_emoji, base_points, frequency, custom_days (JSON), target_time, is_temporary, start_date, end_date, sort_order, is_active, created_at
- **Habit Logs**: id (UUID PK), user_id (FK), habit_id (FK), log_date (unique per habit per day), completed, completed_at, points_awarded, notes
- **Habit Streaks**: id (UUID PK), user_id (FK), habit_id (FK), current_streak, best_streak, last_completed_date
- **Other models**: Users, Task Categories, Tasks, Task Completions, Daily Logs, Streaks, Power Levels, Off Days, Achievements, Quotes

### Foreign Key Requirements
- habit.user_id -> users.id
- habit.category_id -> task_categories.id
- habit_log.habit_id -> habits.id
- habit_log.user_id -> users.id
- habit_streak.habit_id -> habits.id
- habit_streak.user_id -> users.id
- All task/completion/daily_log/streak/power_level FKs must also be enforced

### Cascade Behavior
- Deleting a habit should cascade to its logs and streaks (soft delete via is_active=false is the normal path, but hard delete must not leave orphans)

### Claude's Discretion
- How to enable PRAGMA foreign_keys for file-based SQLite (currently only fires for in-memory)
- Whether to use `datetime.now(timezone.utc)` or `func.now()` for timezone-safe timestamps
- Strategy for detecting and cleaning orphaned rows
- Whether to add SQLAlchemy event listeners or connection-level hooks for FK enforcement

</decisions>

<specifics>
## Specific Ideas

- Research identified that PRAGMA foreign_keys only fires for in-memory databases currently — the file-based DB has FKs silently disabled
- `datetime.utcnow()` is deprecated in Python 3.12+ — should use `datetime.now(timezone.utc)` instead
- Need to check all model files for naive datetime usage
- Off Days model referenced in PRD Section 5.4 — verify FK relationships

</specifics>

<deferred>
## Deferred Ideas

- Alembic migrations — user chose to keep delete-and-rebuild approach
- PostgreSQL migration — future consideration per PRD Section 11

</deferred>

---

*Phase: 01-database-and-model-integrity*
*Context gathered: 2026-03-01 via PRD Express Path*
