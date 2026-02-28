# Project Research Summary

**Project:** Saiyan Tracker — Full Stack Audit
**Domain:** Gamified habit tracker (FastAPI + React + SQLite), audit and code quality milestone
**Researched:** 2026-02-28
**Confidence:** HIGH (all findings based on direct codebase analysis)

## Executive Summary

Saiyan Tracker v2 is a feature-complete, single-user habit tracker gamified with a Dragon Ball Z theme. The application runs locally with a FastAPI/SQLAlchemy/SQLite backend and a React 19/Vite 7/Tailwind frontend. All five planned feature phases have shipped: habit CRUD, streak tracking with Zenkai Recovery, tiered Kaio-ken consistency bonuses, Dragon Ball transformations, real anime quotes, analytics with a calendar heatmap, and habit management (edit, reorder, archive, delete). The primary goal of this milestone is a thorough audit — validating correctness, fixing bugs, and hardening the codebase — not adding new features.

The recommended approach is a dependency-ordered audit that works bottom-up: database and models first, then service-layer business logic, then API endpoints, then frontend stores and API client, then UI components, and finally end-to-end flows. This order prevents chasing phantom bugs caused by foundational issues. The testing stack is well-settled for this environment: pytest + httpx for the backend, Vitest + Testing Library + msw for the frontend, and Ruff for Python code quality. No greenfield stack decisions are needed.

The key risks are concentrated in the service layer and data integrity: a foreign key enforcement bug silently allows orphaned records, the consistency bonus can double-apply through a fragile string-flag hack, streak logic breaks for non-daily habits on weekends, and the frontend habit store has zero error handling. These are not cosmetic — they corrupt stored data and break the core gamification loop. Every one of them was found by reading actual source files, not by inference, so confidence in these findings is high.

---

## Key Findings

### Recommended Stack

The stack is fixed — this is an audit, not a greenfield project. The recommended additions are pure tooling for testing and code quality. For the backend: pytest (>=8.3) with pytest-asyncio (>=0.24) and the already-installed httpx as the ASGI test client. For the frontend: Vitest (>=3.0, native Vite integration, zero config) with @testing-library/react (>=16.0, React 19 compatible), @testing-library/user-event, jsdom, and msw (>=2.0) for API mocking. For linting: Ruff on the backend (replaces flake8 + black + isort), ESLint already present on the frontend.

**Core testing and quality technologies:**
- pytest + pytest-asyncio: Backend test runner — FastAPI official recommendation, fixture system handles DB setup/teardown
- httpx AsyncClient: ASGI test client — already in requirements.txt, no install needed
- Vitest: Frontend test runner — shares Vite config, zero additional setup, designed for Vite projects
- @testing-library/react: Component testing — React team's recommendation, tests user behavior not internals
- msw (v2): API mocking — intercepts at network level, tests actual HTTP layer
- Ruff: Python linting and formatting — replaces 3+ tools in one, 10-100x faster

**Version note:** Specific version numbers are training-data estimates. Pin to actual latest after install. Ruff's Python 3.14 compatibility is MEDIUM confidence — verify after install.

### Expected Features

The feature landscape is fully built. The audit must verify all flows work correctly, not implement new ones. See `.planning/research/FEATURES.md` for full details.

**Must verify (P0 — data integrity):**
- Point calculation accuracy — formulas for base x multiplier, streak bonus, Zenkai boost, consistency tier
- Streak increment/decrement — consecutive day detection, halving on gap (not reset), best_streak updates
- Consistency bonus application — tier thresholds, applies to all logs for the day, no double-apply on toggle
- Zenkai Recovery — triggers on comeback after gap only, halves streak to max(1, old//2), +100% bonus
- Transformation threshold detection — old_total vs new_total comparison, exact threshold values

**Must verify (P1 — user experience):**
- Today's habits filtering — correct habits by frequency, custom days, date range, is_active status
- Habit check/uncheck toggle — points update both directions, UI updates immediately
- Calendar heatmap accuracy — completion rates match log data, month navigation, today highlighted
- Power level display — total power matches all completions, progress to next transformation is correct
- Habit form modal — create with all field combos, edit pre-fills correctly, validation prevents bad data

**Defer (out of scope for audit):**
- Social features, notifications, data export, multi-user support — all intentionally excluded

### Architecture Approach

The architecture is a clean layered stack: SQLite database accessed only via SQLAlchemy ORM, service layer containing all business logic, thin FastAPI route handlers delegating to services, Zustand stores on the frontend calling a centralized API service, and React components reading from stores. The audit order follows this dependency chain bottom-up. The architecture is appropriate for a single-user local app and should not be over-engineered (no caching, no message queues, no microservices).

**Major components:**
1. Service layer (HabitService, PowerService, QuoteService, AnalyticsService) — all business logic, point calculation, streak math; this is where most audit bugs live
2. API route handlers (9 modules under /api/v1) — currently bypass Pydantic response_model serialization, build response dicts manually; four identical dict construction blocks in habits.py
3. Zustand stores (habitStore, taskStore, powerStore, uiStore) — habitStore has no error handling, unlike taskStore which does; Dashboard.tsx fires 7+ parallel requests on mount

### Critical Pitfalls

These are verified bugs found in actual source files, not theoretical risks.

1. **Foreign keys disabled on file-based SQLite** — `PRAGMA foreign_keys=ON` is inside an `if ":memory:"` conditional in `session.py`, so it never fires for the real database. Fix: move the pragma outside the conditional. Run `PRAGMA foreign_key_check` to find existing orphaned rows.

2. **Consistency bonus double-application** — `_apply_consistency_bonus` uses a string prefix on the `notes` field (`log.notes.startswith("consistency_bonus_applied")`) as a state flag. This breaks if `notes` is None (AttributeError) and stacks multiplicatively when a user toggles a habit off and on within the same day. Fix: add a `consistency_bonus_applied` boolean column to HabitLog; requires a migration strategy since there is no Alembic setup.

3. **Streak breaks for non-daily habits on weekends** — `_increment_streak` checks if `last_completed_date == yesterday` without awareness of the habit's frequency. A weekday-only habit completed Friday and then Monday correctly will trigger Zenkai Recovery because Monday is not "yesterday." Fix: make `_increment_streak` find the previous *scheduled* day based on the habit's frequency before comparing.

4. **habitStore has no error handling** — zero try/catch blocks; any backend 500 or network drop leaves `loading: true` forever and breaks the dashboard silently. Fix: add try/catch with `finally { set({ loading: false }) }` and an `error` state field matching taskStore's pattern.

5. **datetime.utcnow() deprecation and timezone mismatch** — all models use `datetime.utcnow` (deprecated since Python 3.12), while `date.today()` in habit_service.py uses local time. On a non-UTC machine (this is Windows), habits completed near midnight could be logged with the wrong date, breaking streaks. Fix: use `datetime.now(timezone.utc)` for timestamps and be consistent about local vs UTC throughout.

---

## Implications for Roadmap

Based on the architecture's dependency order and the pitfalls found, the audit should proceed in 6 phases.

### Phase 1: Database and Model Integrity

**Rationale:** Everything downstream depends on the database layer being correct. The foreign key bug (Pitfall 1) and timezone issue (Pitfall 5) must be fixed before any other checks, or bugs in services could be caused by corrupt underlying data.
**Delivers:** Enforced foreign key constraints, correct timestamps, verified schema consistency between models / Pydantic schemas / TypeScript types, a migration strategy before any column additions.
**Addresses:** Data integrity table-stakes for all gamification features.
**Avoids:** Silent orphaned records (Pitfall 1), midnight date boundary errors (Pitfall 5), data destruction from schema changes (Pitfall 9).

### Phase 2: Service Layer and Business Logic

**Rationale:** The service layer is where all gamification math lives. Bugs here corrupt stored data and cascade into every UI element. This is the highest-risk phase and must come before API or UI verification.
**Delivers:** Verified point calculation formulas, correct streak increment/decrement, working Zenkai Recovery, consistency bonus that cannot double-apply, frequency-aware streak logic for non-daily habits, unified power total calculation.
**Addresses:** P0 audit priorities — point accuracy, streak integrity, consistency bonus, Zenkai, transformation thresholds.
**Avoids:** Consistency bonus double-application (Pitfall 2), streak breaks for weekday habits (Pitfall 7), power total mismatch between task and habit code paths (Pitfall 6).

### Phase 3: API Endpoints

**Rationale:** With the service layer verified, API contracts can be confirmed. This phase checks that every endpoint responds correctly, error codes are appropriate, and response shapes match what the frontend expects.
**Delivers:** All 9 route modules verified, Pydantic response_model used instead of manual dict construction, N+1 query problem resolved with eager loading, consistent DEFAULT_USER_ID usage.
**Addresses:** P1 audit priorities — today's habits filtering, API error handling.
**Avoids:** Dict construction drift from TypeScript types (Anti-Pattern 1), N+1 query sluggishness (Pitfall 3 / Anti-Pattern 2).

### Phase 4: Frontend API Client and Stores

**Rationale:** With a verified backend, the frontend can be tested in isolation. This phase fixes the error handling gap in habitStore and verifies that stores re-fetch the right data after mutations.
**Delivers:** habitStore with full error handling (try/catch, error state, loading reset), verified store re-fetch patterns, TypeScript interface alignment with actual API responses, HabitToday type updated with sort_order and frequency fields.
**Addresses:** Dashboard loading states, type safety.
**Avoids:** Infinite spinner on backend error (Pitfall 4), reorder index vs sort_order mismatch (Pitfall 10), missing fields causing runtime errors (Pitfall 12).

### Phase 5: UI Components and Interactions

**Rationale:** With data layer and state management verified, UI correctness can be checked meaningfully. Component bugs are now isolated from data bugs.
**Delivers:** All HabitCard interactions working (check, edit, archive, delete, move up/down), HabitFormModal create and edit flows verified, theme consistency (no hardcoded colors), animation triggers correct.
**Addresses:** P2 polish priorities — ki-burst, quotes, theme, reorder.
**Avoids:** Empty catch blocks hiding UI errors (Pitfall 11), edit habit unnecessary full-list fetch (Pitfall 13).

### Phase 6: End-to-End Flow Verification

**Rationale:** Unit and integration checks can pass while integration breaks. This phase walks the complete user journeys to confirm the full stack works together.
**Delivers:** Verified core loop (create habit → check → streak increments → transformation unlocks), consistency bonus tier system working across a full day, calendar heatmap reflecting real completions, all P3 edge cases.
**Addresses:** Full gamification loop integrity.
**Avoids:** Cross-phase integration issues that only appear at runtime (Pitfall 8 — 7+ parallel requests may be addressed here or deferred).

### Phase Ordering Rationale

- Bottom-up order (DB → services → API → stores → UI → E2E) prevents phantom bugs: a corrupted model would make service bugs impossible to distinguish from model bugs.
- Pitfalls 1, 5, and 9 (foreign keys, timezone, no migrations) are prerequisites for Phase 1 because any schema change made without addressing them risks data loss.
- Pitfalls 2, 6, and 7 (consistency bonus, power total, weekday streaks) are grouped in Phase 2 because they all live in the service layer and interact with each other.
- Pitfalls 4, 10, 12 (habitStore error handling, reorder index, missing types) are grouped in Phase 4 because they share the same frontend state management layer.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 2 (Service Layer):** Point calculation formulas should be cross-referenced against PRD.md v2.0 for every scenario before writing tests. The consistency bonus fix requires a migration approach to be settled first.
- **Phase 1 (Database):** The migration strategy (Alembic vs manual backup script) needs a decision before any model column additions. Alembic with SQLite has known limitations worth reviewing.

Phases with standard patterns (skip research-phase):
- **Phase 3 (API Endpoints):** FastAPI + pytest + httpx patterns are well-documented. Standard route testing with no unusual requirements.
- **Phase 4 (Frontend Stores):** Adding try/catch and error state to Zustand stores is straightforward — taskStore.ts is the reference implementation already in the codebase.
- **Phase 5 (UI Components):** Vitest + Testing Library patterns are well-established. The test targets (HabitCard, HabitFormModal, context menu) are standard React component testing.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | MEDIUM | Tool recommendations are well-established consensus; specific version numbers are training-data estimates (up to Aug 2025 / May 2025 for some packages). Pin after install. Ruff + Python 3.14 is LOW confidence specifically. |
| Features | HIGH | Based on direct codebase analysis + PRD.md v2.0. Feature status (built/not built) is verified by reading source files. |
| Architecture | HIGH | Based entirely on direct source file reads. Component responsibilities and data flows are documented from actual code, not inference. |
| Pitfalls | HIGH | Every pitfall includes a specific file and line number verified by reading source. These are not theoretical — they are confirmed bugs. |

**Overall confidence:** HIGH

### Gaps to Address

- **Ruff compatibility with Python 3.14:** Could not verify against live PyPI. Install and run before committing to Ruff as the linter — if it fails on 3.14 syntax, fall back to flake8 + black.
- **Migration strategy for schema changes:** No Alembic setup exists. Before Phase 2 fixes that require adding columns (e.g., `consistency_bonus_applied`), decide whether to set up Alembic or use a manual backup-and-recreate approach. This decision gates Phase 2 work.
- **Timezone behavior on this machine:** The UTC vs local time bug (Pitfall 5) has varying severity depending on the server timezone. Verify with `import time; print(time.tzname)` before deciding fix priority.
- **Existing database state:** Run `PRAGMA foreign_key_check` on `backend/data/saiyan_tracker.db` to determine if orphaned rows already exist from the foreign key bug. If they do, a cleanup script is needed before re-enabling enforcement.

---

## Sources

### Primary (HIGH confidence)

- Direct codebase analysis — `backend/app/services/habit_service.py`, `backend/app/api/v1/completions.py`, `backend/app/database/session.py`, `backend/app/core/constants.py`, `backend/app/models/`, `frontend/src/store/habitStore.ts`, `frontend/src/store/taskStore.ts`, `frontend/src/pages/Dashboard.tsx`, `frontend/src/types/index.ts`, `frontend/src/services/api.ts`, `backend/app/schemas/habit.py`
- PRD.md v2.0 (February 28, 2026) — feature specifications and point formulas
- SQLite foreign key enforcement docs — per-connection PRAGMA required (well-established SQLite behavior)
- FastAPI official docs — pytest + httpx test pattern recommendation

### Secondary (MEDIUM confidence)

- Training data knowledge of Vitest/Testing Library/msw ecosystem — version numbers approximate
- Training data knowledge of Ruff adoption in Python ecosystem — Python 3.14 compatibility unverified
- ADHD gamification patterns — behavioral psychology basis, not 2026-specific research
- Competitor feature analysis (Habitica, Streaks, HabitBear) — products may have changed since training cutoff

### Tertiary (LOW confidence)

- Specific npm/PyPI version numbers — based on training data up to May/Aug 2025; verify with actual package registries before pinning

---

*Research completed: 2026-02-28*
*Ready for roadmap: yes*
