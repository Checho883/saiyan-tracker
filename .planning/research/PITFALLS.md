# Domain Pitfalls

**Domain:** Gamified habit tracker (FastAPI + React + SQLite) full stack audit
**Researched:** 2026-02-28

## Critical Pitfalls

Mistakes that cause rewrites, data corruption, or broken core flows.

### Pitfall 1: Foreign Keys Disabled on File-Based SQLite

**What goes wrong:** The `PRAGMA foreign_keys=ON` listener in `session.py` only fires for in-memory databases (`if ":memory:" in DATABASE_URL`), but the app uses a file-based SQLite database at `backend/data/saiyan_tracker.db`. This means foreign key constraints are silently never enforced. Deleting a category that habits reference, or a habit that logs reference, will leave orphaned rows instead of raising errors.
**Why it happens:** The conditional was likely copied from a template or written for tests and never updated for file-based SQLite.
**Consequences:** Orphaned `HabitLog`, `HabitStreak`, and `TaskCompletion` rows when parent records are deleted. Data inconsistencies accumulate silently. Queries that join on these relationships return unexpected results or crash.
**Prevention:** Move the `foreign_keys=ON` pragma outside the `if ":memory:"` conditional so it applies to all SQLite connections. Test by attempting to delete a category that has habits referencing it.
**Detection:** Run `PRAGMA foreign_key_check;` on the existing database. Any output means orphaned rows already exist. Also check `PRAGMA foreign_keys;` at runtime -- if it returns 0, enforcement is off.
**Audit phase:** Backend API audit -- verify and fix in the first phase.
**Confidence:** HIGH (verified by reading `session.py` lines 13-18 and `config.py`)

### Pitfall 2: Consistency Bonus Applied Multiple Times or Incorrectly

**What goes wrong:** The `_apply_consistency_bonus` method in `habit_service.py` uses a `notes` field hack (`log.notes.startswith("consistency_bonus_applied")`) to track whether the bonus was already applied. This is brittle: (1) if a log has no `notes` attribute or `notes` is None, the `startswith` check will fail with AttributeError, (2) the bonus modifies `points_awarded` in-place on existing logs, making it impossible to audit what the original points were, (3) toggling habits off and on within the same day can cause the bonus to be recalculated on already-boosted values, compounding multiplicatively.
**Why it happens:** Using a data field as a state flag instead of a proper boolean column or separate tracking record.
**Consequences:** Points inflation over time. Once a user toggles habits on/off during the same day, the bonus can stack, making the gamification feel unfair and undermining trust in the point system.
**Prevention:** Add a `consistency_bonus_applied` boolean column to `HabitLog` or a `daily_bonus` table. Store original base points separately from boosted points. Recalculate from base on every toggle rather than modifying in-place.
**Detection:** Compare `points_awarded` values in `habit_logs` against what `base_points * multiplier` should produce. If any log's points are more than 1.5x the expected base (the max tier), the bonus was double-applied.
**Audit phase:** Backend API audit -- this is a data integrity issue in the core point calculation.
**Confidence:** HIGH (verified by reading `habit_service.py` lines 297-313)

### Pitfall 3: N+1 Query Problem in get_today_habits

**What goes wrong:** `get_today_habits` loops through every active habit and issues 3 separate queries per habit (category, log, streak). With 10 habits, that is 30+ queries per dashboard load. No eager loading (`joinedload`, `selectinload`) is used anywhere in the codebase.
**Why it happens:** SQLAlchemy defaults to lazy loading, and the service builds dict results manually rather than using relationship attributes.
**Consequences:** For a single-user local app this causes ~50-100ms delays that feel sluggish, especially on the dashboard which is the most-visited page. The same pattern exists in `get_today_completions` (queries task + category per completion) and `get_habit_stats` (queries a log per day for 90 days in a loop).
**Prevention:** Batch-load categories, logs, and streaks with 3 bulk queries using `in_()` filters, then build the response from in-memory dicts. Or use SQLAlchemy `joinedload`/`selectinload` on the relationships.
**Detection:** Add SQLAlchemy query logging (`echo=True` on engine) and count queries on a dashboard load. Anything over 5-6 queries for a single endpoint is a red flag.
**Audit phase:** Backend API audit -- performance fix.
**Confidence:** HIGH (verified by reading `habit_service.py` lines 47-90 and confirmed no eager loading exists via grep)

### Pitfall 4: Habit Store Has No Error Handling

**What goes wrong:** `habitStore.ts` has zero try/catch blocks. Every function (`fetchHabits`, `fetchTodayHabits`, `createHabit`, `checkHabit`, etc.) directly awaits the API call with no error handling. If the backend returns a 500 or the network drops, the promise rejects unhandled, `loading` stays `true` forever (set to true in `fetchTodayHabits` but never set back to false on error), and the UI shows an infinite spinner.
**Why it happens:** `taskStore.ts` has error handling with try/catch and an `error` state field. `habitStore.ts` was added later and the pattern was not carried over.
**Consequences:** Any backend error on habit endpoints permanently breaks the dashboard until page refresh. No user feedback about what went wrong. The `loading: true` state never resets.
**Prevention:** Add try/catch with `set({ loading: false })` in finally blocks. Add an `error` state field matching the pattern in `taskStore.ts`. Surface errors to the user via toast or inline messages.
**Detection:** Kill the backend server and try to load the dashboard. The habit section will show a spinner indefinitely.
**Audit phase:** Frontend UI audit.
**Confidence:** HIGH (verified by reading `habitStore.ts` -- no try/catch blocks present)

### Pitfall 5: datetime.utcnow() Deprecation and Timezone Naivety

**What goes wrong:** Every model in the backend uses `datetime.utcnow` as the default for `created_at` and `updated_at` columns. `datetime.utcnow()` has been deprecated since Python 3.12 and produces timezone-naive datetimes. The entire app treats all times as naive UTC, but `date.today()` in `habit_service.py` uses the server's local timezone, creating a mismatch: streak calculations and "today's habits" use local time, while `completed_at` timestamps are in UTC.
**Why it happens:** `datetime.utcnow()` was the standard pattern for years. The deprecation is relatively new.
**Consequences:** If the server timezone is not UTC (likely, since this is a local Windows dev machine), habits completed near midnight could be logged with a different date than expected. Streaks could break or double-count across the date boundary. The frontend displays `completed_at` times that are offset from the user's actual local time.
**Prevention:** Use `datetime.now(timezone.utc)` for timestamps. Use a consistent `get_today()` utility that explicitly uses the user's timezone (or at minimum, be consistent about UTC everywhere). For a solo local app, using local time everywhere is simpler than UTC.
**Detection:** Check the system timezone (`time.tzname`). If it is not UTC, complete a habit at 11:55 PM local time and verify the log date matches expectations.
**Audit phase:** Backend API audit -- affects streak calculation correctness.
**Confidence:** HIGH (verified: 12 files use `datetime.utcnow`, habit service uses `date.today()` which is local time)

## Moderate Pitfalls

### Pitfall 6: Total Power Calculation Ignores Habit Points in Task Completions

**What goes wrong:** In `completions.py` (line 37-38), `old_total` only sums `TaskCompletion.points_awarded` when checking for transformations, but `_get_total_power` in `habit_service.py` sums both task completions AND habit log points. This means the task completion endpoint uses a lower `old_total` than reality, potentially re-triggering transformation events that already fired from habit completions.
**Prevention:** Use the same `_get_total_power` method (or equivalent) in the task completion endpoint. Extract power calculation to a single shared utility.
**Detection:** Accumulate points from habits until near a transformation threshold, then complete a task. If the transformation fires when total power was already past the threshold, this bug is confirmed.
**Audit phase:** Backend API audit.
**Confidence:** HIGH (verified by comparing `completions.py` lines 37-38 with `habit_service.py` lines 224-237)

### Pitfall 7: Streak Logic Does Not Account for Non-Daily Habits

**What goes wrong:** `_increment_streak` checks if `last_completed_date == yesterday` to continue a streak. But for a weekday-only habit (Mon-Fri), completing on Friday and then Monday means `last_completed_date` is Friday, and Monday is not "yesterday." The streak resets (or halves via Zenkai) even though the user completed every scheduled day.
**Prevention:** `_increment_streak` needs to check the habit's schedule: find the previous *scheduled* day, not just yesterday. Only break the streak if the user missed a day the habit was actually due.
**Detection:** Create a weekday-only habit, complete it Friday, skip Saturday/Sunday, complete it Monday. Check if the streak incremented or reset.
**Audit phase:** Backend API audit -- this is a core gamification correctness issue.
**Confidence:** HIGH (verified by reading `_increment_streak` in `habit_service.py` lines 240-257 -- no frequency awareness)

### Pitfall 8: Dashboard Fires 7+ Parallel API Calls on Mount

**What goes wrong:** `Dashboard.tsx` `useEffect` fires `fetchCategories`, `fetchTasks`, `fetchTodayCompletions`, `fetchTodayHabits`, `fetchPower`, `fetchTransformations`, and `loadContextualQuote` all simultaneously on mount. Each of these is an independent HTTP request. Combined with the N+1 backend queries, a single dashboard load produces 30-50 database queries.
**Prevention:** Consider a single `/api/v1/dashboard` endpoint that returns all needed data in one request: today's habits, power level, transformations, and contextual quote. This reduces 7 HTTP round-trips to 1.
**Detection:** Open browser DevTools Network tab. Count the requests fired on dashboard load. If it is more than 3-4, consolidation is warranted.
**Audit phase:** End-to-end flow verification -- but may be deferred to a future optimization milestone if "audit only, no new features" is strict.
**Confidence:** HIGH (verified by reading `Dashboard.tsx` lines 40-48)

### Pitfall 9: SQLite Database Must Be Deleted on Schema Changes

**What goes wrong:** Per project notes, the database file must be manually deleted when schema changes occur. There is no migration system (Alembic or otherwise). This means any audit fix that touches models will destroy all existing habit data, streaks, and points.
**Prevention:** Before making any model changes, export the current database contents. Better: set up Alembic migrations even for SQLite so schema changes can be applied incrementally. At minimum, write a backup script that dumps data before any schema change.
**Detection:** Check if `alembic/` directory exists (it does not). Any model change during the audit that requires a schema alteration will trigger data loss.
**Audit phase:** Must be addressed before any backend model changes. If the audit adds columns (e.g., `consistency_bonus_applied` boolean), this is a prerequisite.
**Confidence:** HIGH (confirmed in PROJECT.md: "Database must be deleted when schema changes")

### Pitfall 10: Reorder Logic Uses Array Index Not sort_order

**What goes wrong:** In `Dashboard.tsx` `handleMoveHabit`, the reorder payload sends array indices as `sort_order` values (lines 164-167). But the `todayHabits` array only contains habits due today, not all habits. If a user has 5 habits but only 3 are due today, swapping two of them sets `sort_order` to 0, 1, or 2, potentially conflicting with the sort_orders of habits not shown today.
**Prevention:** Use the actual `sort_order` values from the habit objects when computing new positions, not the array indices of the filtered `todayHabits` list.
**Detection:** Create 5 habits, make 2 of them weekday-only, then reorder on a weekend when those 2 are hidden. Check if their sort_order values got overwritten.
**Audit phase:** Frontend UI audit.
**Confidence:** HIGH (verified by reading `Dashboard.tsx` lines 157-172 -- uses `idx`/`swapIdx` not habit.sort_order)

## Minor Pitfalls

### Pitfall 11: Empty Catch Blocks Swallow Errors Silently

**What goes wrong:** `Dashboard.tsx` has multiple `catch {}` blocks (lines 54, 73, 79, 85) that silently swallow quote API errors. While quote failures are non-critical, the pattern normalizes error swallowing and makes debugging harder.
**Prevention:** At minimum log errors with `console.warn` in catch blocks. For the audit, add structured error logging so issues surface during testing.
**Audit phase:** Frontend UI audit -- low priority but easy to fix.
**Confidence:** HIGH (verified in source)

### Pitfall 12: HabitToday Type Missing sort_order and frequency

**What goes wrong:** The `HabitToday` TypeScript interface does not include `sort_order` or `frequency` fields, even though the backend returns habits in sort_order and the frontend uses ordering logic. The reorder and move-up/move-down features work on index position without knowing the actual `sort_order`.
**Prevention:** Add `sort_order` and `frequency` to the `HabitTodayResponse` schema and `HabitToday` TypeScript type. Use `sort_order` values for reorder calculations.
**Audit phase:** End-to-end flow verification.
**Confidence:** HIGH (verified: `HabitToday` in `types/index.ts` lacks sort_order; backend `HabitTodayResponse` in `schemas/habit.py` also lacks it)

### Pitfall 13: Edit Habit Fetches Full Habit List Just to Find One

**What goes wrong:** `handleEditHabit` in `Dashboard.tsx` (lines 126-137) calls `habitApi.list()` to fetch ALL habits, then filters by ID client-side. This is wasteful when there is already a `habitApi.stats(id)` endpoint and the habit data is likely already in the store.
**Prevention:** Either use the already-fetched `habits` from the habit store, or add a `habitApi.get(id)` endpoint that returns a single habit.
**Detection:** Click edit on a habit and check Network tab -- a full list fetch fires unnecessarily.
**Audit phase:** Frontend UI audit -- minor optimization.
**Confidence:** HIGH (verified in source)

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Backend API audit | Foreign keys disabled (Pitfall 1) | Fix pragma before any other changes; run `PRAGMA foreign_key_check` to find existing orphans |
| Backend API audit | Consistency bonus double-application (Pitfall 2) | Add proper tracking column; requires migration strategy (Pitfall 9) |
| Backend API audit | Streak breaks on weekends for weekday habits (Pitfall 7) | Make `_increment_streak` frequency-aware; test with weekday and custom schedules |
| Backend API audit | Power total mismatch between task/habit code paths (Pitfall 6) | Extract `_get_total_power` to a shared utility used by both endpoints |
| Backend API audit | UTC vs local time mismatch (Pitfall 5) | Decide on one approach (local time recommended for solo app) and apply consistently |
| Frontend UI audit | Habit store has no error handling (Pitfall 4) | Add try/catch and error state matching taskStore pattern |
| Frontend UI audit | Reorder uses array index not sort_order (Pitfall 10) | Pass actual sort_order values in reorder payload |
| End-to-end flow | Schema changes destroy data (Pitfall 9) | Set up Alembic or at least a backup script before any model changes |
| End-to-end flow | Dashboard fires 7+ parallel requests (Pitfall 8) | Consider a combined dashboard endpoint (may be out of audit scope) |

## Sources

- Direct codebase analysis (PRIMARY):
  - `backend/app/database/session.py` -- foreign keys conditional
  - `backend/app/services/habit_service.py` -- streak logic, consistency bonus, N+1 queries
  - `backend/app/api/v1/completions.py` -- power total calculation mismatch
  - `backend/app/core/config.py` -- database URL configuration
  - `backend/app/models/habit.py` -- datetime.utcnow usage
  - `frontend/src/store/habitStore.ts` -- missing error handling
  - `frontend/src/store/taskStore.ts` -- error handling pattern (reference)
  - `frontend/src/pages/Dashboard.tsx` -- reorder logic, parallel requests, empty catches
  - `frontend/src/types/index.ts` -- missing fields on HabitToday
  - `frontend/src/services/api.ts` -- API client structure
  - `backend/app/schemas/habit.py` -- response schemas
- Python 3.12 deprecation of `datetime.utcnow()`: [Python docs](https://docs.python.org/3/library/datetime.html#datetime.datetime.utcnow) -- MEDIUM confidence (training data, aligns with Python 3.14 being used)
- SQLite foreign key enforcement requires per-connection pragma: [SQLite docs](https://www.sqlite.org/foreignkeys.html) -- HIGH confidence (well-established SQLite behavior)
