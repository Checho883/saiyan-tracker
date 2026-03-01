# Codebase Concerns

**Analysis Date:** 2026-03-01

---

## Tech Debt

**No authentication — hardcoded single user:**
- Issue: Every API endpoint and query is hardcoded to `DEFAULT_USER_ID = "default-user"`. The constant is re-declared in each router file (`completions.py`, `habits.py`, etc.) instead of imported from one place.
- Files: `backend/app/api/v1/completions.py` line 15, `backend/app/api/v1/habits.py`, `backend/app/api/v1/tasks.py`, `backend/app/api/v1/analytics.py`, `backend/app/api/v1/power.py`, `backend/app/api/v1/settings.py`, `backend/app/api/v1/off_days.py`
- Impact: Any future multi-user support requires touching every router. The duplication also risks typos diverging the constant value.
- Fix approach: Move `DEFAULT_USER_ID` to `backend/app/core/constants.py` (already has other constants) and import it everywhere.

**N+1 query pattern in completions endpoint:**
- Issue: `GET /completions/today` loops over all completions and issues individual `db.query(Task)` and `db.query(TaskCategory)` calls inside the loop.
- Files: `backend/app/api/v1/completions.py` lines 95–106
- Impact: Degrades linearly with number of completions. On a day with 20+ task completions, this fires 40+ extra queries.
- Fix approach: Use a SQLAlchemy join or `joinedload` to fetch tasks and categories in one query before the loop.

**Inline imports inside route handlers:**
- Issue: Several route handlers do `from app.models.streak import Streak` and `from app.models.power_level import PowerLevel` inside the function body rather than at module top.
- Files: `backend/app/api/v1/completions.py` lines 27, 61
- Impact: Hides dependencies, complicates static analysis and testing, adds minor per-call overhead.
- Fix approach: Move all model imports to the top of each module.

**`@app.on_event("startup")` is deprecated:**
- Issue: FastAPI deprecated `on_event("startup")` in favor of lifespan context managers.
- Files: `backend/app/main.py` line 20
- Impact: Will generate deprecation warnings on newer FastAPI versions; will break on a future major version.
- Fix approach: Migrate to `@asynccontextmanager` lifespan pattern.

**Seed data embedded in `main.py`:**
- Issue: The `seed_default_data()` function in `main.py` is 130+ lines containing all 55 quotes hardcoded as Python objects. This couples startup logic with data content.
- Files: `backend/app/main.py` lines 25–147
- Impact: Any quote addition requires editing the app entrypoint; makes unit testing startup logic harder.
- Fix approach: Extract quotes to a JSON/YAML fixture file in `backend/app/data/` and load from there in a dedicated seeder module.

**Tasks subsystem is legacy / partially orphaned:**
- Issue: The v2 redesign introduced a full habits system, but the original tasks system (`models/task.py`, `api/v1/tasks.py`, `store/taskStore.ts`) still exists and is wired up. Both systems contribute to power points via different calculation paths.
- Files: `backend/app/api/v1/tasks.py`, `backend/app/api/v1/completions.py`, `frontend/src/store/taskStore.ts`, `frontend/src/components/dashboard/TaskCard.tsx`
- Impact: Two competing point-earning systems create balance/exploit risk and add maintenance surface. UI shows both habits and tasks.
- Fix approach: Decide whether tasks are intentionally kept (document it in PRD) or should be fully removed. Phase 6 (PRD update) should resolve this.

---

## Security Considerations

**Wildcard CORS origin:**
- Risk: `allow_origins` includes `"*"` alongside specific localhost origins. The wildcard grants any origin full API access.
- Files: `backend/app/main.py` lines 13–14
- Current mitigation: App is localhost-only in development; no deployment yet.
- Recommendations: Remove `"*"` from the list. For production, enumerate allowed origins explicitly via environment variable.

**No input validation on free-text fields:**
- Risk: Fields like task notes, habit names, and category names accept arbitrary string input with no length or content sanitization beyond Pydantic type checking.
- Files: `backend/app/schemas/habit.py`, `backend/app/api/v1/tasks.py`
- Current mitigation: SQLite parameterized queries prevent SQL injection.
- Recommendations: Add `max_length` constraints to Pydantic string fields.

**No rate limiting:**
- Risk: The completions endpoint can be called repeatedly to farm power points with no throttle.
- Files: `backend/app/api/v1/completions.py`
- Current mitigation: None — the single-user design means only the owner uses the app.
- Recommendations: Add duplicate-completion guard (e.g., check if task was already completed today) or accept the risk given single-user scope.

---

## Performance Bottlenecks

**Power total recalculated via full table scan on every completion:**
- Problem: `old_total` is computed with `func.sum(TaskCompletion.points_awarded)` over all completions for the user — an unbounded aggregation that grows forever.
- Files: `backend/app/api/v1/completions.py` lines 37–39
- Cause: No cached or incrementally updated power total; always re-summed from raw rows.
- Improvement path: Store a running `total_power` on the `User` or a dedicated `PowerSummary` model, updated incrementally on each completion.

**SQLite as production database:**
- Problem: SQLite is used for all persistence including analytics queries.
- Files: `backend/app/database/session.py`, `backend/data/saiyan_tracker.db`
- Cause: Chosen for simplicity in a single-user local app.
- Improvement path: Acceptable at current scale. Would need migration to PostgreSQL if app becomes multi-user or cloud-hosted.

---

## Fragile Areas

**Database schema migrations via `create_all` only:**
- Files: `backend/app/main.py` line 22, `backend/app/database/base.py`
- Why fragile: `Base.metadata.create_all()` only adds new tables; it does not apply column additions, renames, or deletions to existing tables. The workaround is manually deleting `backend/data/saiyan_tracker.db` on schema changes (destroying all data).
- Safe modification: Adding entirely new tables is safe. Changing existing models requires the DB delete workaround.
- Fix approach: Introduce Alembic for proper migrations. This is blocking for any future schema evolution without data loss.

**Vite binary workaround required:**
- Files: `frontend/` (dev startup)
- Why fragile: The npm `dev` script cannot use the standard `vite` command — it must be invoked as `node node_modules/vite/bin/vite.js`. This is a Windows PATH issue and will confuse any developer who runs `npm run dev` normally.
- Safe modification: Document the workaround (already in memory). Consider adding a `vite.js` wrapper script or fixing the npm script in `frontend/package.json`.

**Phase 6 (PRD update) not started:**
- Files: `PRD.md`
- Why fragile: The PRD describes a pre-v2 feature set. Any planning tool reading PRD.md gets stale requirements. New phases planned from the PRD will conflict with the implemented v2 design.
- Fix approach: Complete Phase 6 — update PRD.md to reflect the habits-first v2 architecture.

---

## Test Coverage Gaps

**No test suite exists:**
- What's not tested: All backend API endpoints, service logic (`power_service.py`, `habit_service.py`), point calculation math, streak logic, Zenkai boost, consistency tiers.
- Files: Entire `backend/` directory — no `tests/` folder detected.
- Risk: Point calculation bugs (streak bonuses, TASK_POINT_MULTIPLIER, CONSISTENCY_TIERS) can silently corrupt power totals with no regression safety net.
- Priority: High — the core game mechanic (power points) has zero test coverage.

**No frontend tests:**
- What's not tested: Zustand store actions, API service calls, component rendering.
- Files: Entire `frontend/src/` — no `.test.ts` or `.spec.ts` files detected.
- Risk: UI regressions go undetected; store state logic (habit completion toggling, streak display) unverified.
- Priority: Medium — acceptable for a personal project but should be added before any public release.

---

## Missing Critical Features

**No data export or backup mechanism:**
- Problem: All data lives in `backend/data/saiyan_tracker.db` with no export, backup, or sync feature.
- Blocks: Users cannot migrate data if the machine is lost or the DB must be deleted for schema changes.

**Undo completion not recalculating power total correctly:**
- Problem: `DELETE /completions/{id}` removes the completion row and calls `update_daily_log`, but does NOT update the `PowerLevel` history table or recalculate the running total used for transformation checks.
- Files: `backend/app/api/v1/completions.py` lines 109–124
- Risk: Undoing a completion leaves a stale power total in `PowerLevel`, causing the displayed transformation level to be wrong until the next completion is recorded.

---

*Concerns audit: 2026-03-01*
