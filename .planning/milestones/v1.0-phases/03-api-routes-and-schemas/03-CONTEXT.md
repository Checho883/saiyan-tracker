# Phase 3: API Routes and Schemas - Context

**Gathered:** 2026-03-04
**Status:** Ready for planning

<domain>
## Phase Boundary

REST endpoints wrapping all game logic services with Pydantic request/response schemas. Covers 15 endpoints (API-01 through API-15): habit CRUD + check, power/attributes, rewards, wishes, categories, off-days, analytics, quotes, and settings. Testable via Swagger UI and curl before any frontend exists.

</domain>

<decisions>
## Implementation Decisions

### Response Shaping
- Pass check_habit() service dict through mostly as-is, wrapped in Pydantic schemas for validation and OpenAPI docs
- Capsule drops include full reward details inline (name, rarity, description) — no second API call needed for the capsule popup animation
- No pagination on list endpoints — data sets are small (habits, rewards, wishes, categories). Return all items
- GET /power/current returns full attribute breakdown per attribute: raw XP, calculated level, title, xp_for_current_level, xp_for_next_level, progress_percent — frontend renders attribute bars directly

### Error Handling
- Block habit checks on off days with 409 Conflict and clear message — prevents accidental state corruption
- Use FastAPI's built-in HTTPException format ({"detail": "message"}) — standard pattern, no custom error schema
- Soft delete for habits — set is_active=false, preserve historical logs/streaks/XP for analytics
- Validate that check_habit only works for habits due on the provided local_date — return 422 if not due

### Route Organization
- Domain routers in backend/app/api/v1/: habits.py, power.py, rewards.py, wishes.py, categories.py, off_days.py, analytics.py, settings.py, quotes.py
- All endpoints under /api/v1/ prefix (e.g., /api/v1/habits, /api/v1/power)
- Default user dependency: get_current_user() returns the single default user. Routes don't accept user_id. Auth can be swapped in later by changing only the dependency
- local_date required on date-sensitive endpoints (check_habit, today/list, off-days) as query param or body field — prevents timezone/midnight bugs

### Quote Integration
- check_habit response includes a context-appropriate quote embedded (habit_complete, perfect_day, transformation, etc.) — one response feeds the entire animation queue
- Separate GET /quotes/random?trigger_event=X also exists for other contexts (welcome screen, etc.)
- Backend tracks Vegeta roast severity based on consecutive missed days — single source of truth for game state
- Trigger event only for filtering (no character filter) — backend picks the right character based on context
- Quote response includes character name, avatar path, source_saga alongside the text — frontend renders quote bar directly

### Claude's Discretion
- Exact Pydantic schema field names and nesting details
- Swagger UI tags and descriptions
- Request body vs query param decisions for non-date fields
- Analytics endpoint response structures (summary, capsule-history, wish-history, contribution-graph)

</decisions>

<specifics>
## Specific Ideas

- check_habit is the architectural centerpiece — its API response must carry everything the animation queue needs in one call (XP, tier, capsule, dragon ball, transformation, quote)
- Swagger UI should be usable for manual testing of the full game loop before frontend exists
- Off-day blocking at the API level (not just service level) gives clearer error messages

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `check_habit()` in habit_service.py: Returns comprehensive dict with all game state changes — Pydantic schema wraps this directly
- `get_habits_due_on_date()`: Already filters by frequency/schedule — reuse for today/list endpoint
- `get_db()` dependency in session.py: Standard FastAPI session dependency, ready to use
- All service functions in services/__init__.py: Clean public API for XP, attributes, capsules, dragon balls, power, streaks, off days
- `calc_attribute_level()`, `get_attribute_title()`, `get_xp_for_next_level()`: Ready for building the /power/current attribute breakdown

### Established Patterns
- Services accept `db: Session` and `user_id: UUID` — routes will follow this pattern via dependencies
- All date logic uses `local_date: str` (YYYY-MM-DD format) from external input — routes must enforce this
- UUIDs used for all entity IDs
- Services do `db.flush()` not `db.commit()` — routes must commit after calling services

### Integration Points
- main.py has FastAPI app with lifespan — needs router includes added
- No existing router structure — api/ directory and v1/ subdirectory need to be created from scratch
- 15 SQLAlchemy models in backend/app/models/ — Pydantic schemas will mirror these for request/response

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-api-routes-and-schemas*
*Context gathered: 2026-03-04*
