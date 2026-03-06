# Phase 12: Backend Detection Services - Context

**Gathered:** 2026-03-06
**Status:** Ready for planning

<domain>
## Phase Boundary

Extend check_habit() to detect and return streak milestones, attribute level-ups, and transformation unlocks as events. Add a separate roast detection endpoint for returning users. Add per-habit calendar/stats endpoints and a habit reorder endpoint. No frontend UI work -- this phase is backend-only.

</domain>

<decisions>
## Implementation Decisions

### Streak Milestone Response
- Quotes pulled from existing Quote DB table filtered by trigger_event='streak_milestone' -- reuse the 118-quote infrastructure
- Milestones fire for BOTH overall streak AND per-habit streak (user gets celebrated for 30-day overall AND 30-day meditation separately)
- Add an 'events' array to CheckHabitResponse containing all triggered events: [{type: 'streak_milestone', tier: '...', streak: 7, quote: {...}}, {type: 'level_up', ...}]. Extensible for future event types
- Each milestone tier gets a DBZ-themed badge name (e.g., 3='First Step', 7='Warrior Spirit', 30='Elite Fighter') -- Claude picks specific names

### Roast Detection Logic
- Tiered severity thresholds: 1-2 missed days = mild, 3-6 = medium, 7+ = savage (uses existing VALID_SEVERITIES)
- Separate app-load endpoint (GET /status or GET /welcome) -- NOT inside check_habit(). Frontend calls on mount
- API returns both quotes together: { welcome_back: {quote...}, roast: {quote..., severity: 'medium'} }. Frontend sequences Goku first, then Vegeta
- Off-days subtract from gap count for severity calculation (consistent with Zenkai recovery logic). All off-days = no roast

### Achievement Recording
- Check-before-insert deduplication: query (user_id, achievement_type, achievement_key) before recording. If exists, skip
- Achievements are permanent -- unchecking a habit does NOT revoke earned achievements
- Attribute level-ups recorded as achievements (type='attribute_level_up', key='str_5') for the achievements UI in Phase 14
- Transformation unlocks also recorded as achievements (type='transformation', key='ssj2') -- all meaningful game events tracked

### Calendar/Stats/Reorder Endpoints
- GET /habits/{id}/calendar: default 90-day range (matches Phase 13 contribution grid). Optional query params for custom range
- Calendar day entries: { date, completed: bool, attribute_xp_awarded: int } -- lightweight, enough for grid color + tooltip
- GET /habits/{id}/stats: total_completions, current_streak, best_streak, completion_rate_30d, total_xp_earned
- PUT /habits/reorder: accepts full ordered list { habit_ids: [id1, id2, id3] }, server assigns sort_order by position

### Claude's Discretion
- Specific DBZ-themed milestone tier names for each threshold
- Internal achievement service architecture
- Roast endpoint naming (GET /status vs GET /welcome vs other)
- Whether to add a unique DB constraint on achievements in addition to check-before-insert
- Attribute level calculation implementation details

</decisions>

<specifics>
## Specific Ideas

- Events array pattern allows frontend to iterate and enqueue animations without knowing all event types upfront
- Roast severity mirrors Zenkai recovery's off-day gap logic -- both subtract off-days from gap count
- Achievement dedup is app-level (check before insert) rather than DB-level constraint
- Milestone badges should feel like real DBZ power-up moments (not generic "7-day streak" labels)

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `check_habit()` (`habit_service.py`): 10-step atomic transaction -- new detection steps slot in after existing streak/power/transform logic
- `Achievement` model (`models/achievement.py`): Ready with achievement_type, achievement_key, milestone_type, metadata_json fields
- `Quote` model + `/quotes` API: 118 seeded quotes across 6 characters, 7 trigger events. Quote severity field exists
- `STREAK_MILESTONES = [3, 7, 21, 30, 60, 90, 365]` in constants.py -- defined but not consumed
- `ATTRIBUTE_TITLES` dict in constants.py -- maps attribute+level to title names (5/10/25/50/100)
- `ATTRIBUTE_LEVEL_FORMULA_EXPONENT = 1.5`, `ATTRIBUTE_LEVEL_BASE_XP = 100` -- leveling formula defined
- `CheckHabitResponse` schema (`check_habit.py`): Has `quote` field already. Needs `events` array added
- `check_zenkai_recovery()` in streak_service.py: Off-day gap subtraction logic to reuse for roast detection

### Established Patterns
- Services flush but don't commit (caller manages transactions)
- Pure functions for math (XP, tiers) -- composable, testable
- Pydantic schemas for all API responses
- SQLAlchemy ORM with explicit UUID primary keys

### Integration Points
- `check_habit()` return dict needs `events` array added
- `CheckHabitResponse` schema needs events list field
- New router needed for `/status` or `/welcome` endpoint
- New router or extension of habits router for `/habits/{id}/calendar`, `/habits/{id}/stats`, `/habits/reorder`
- Existing `habit.sort_order` field ready for reorder endpoint

</code_context>

<deferred>
## Deferred Ideas

None -- discussion stayed within phase scope

</deferred>

---

*Phase: 12-backend-detection-services*
*Context gathered: 2026-03-06*
