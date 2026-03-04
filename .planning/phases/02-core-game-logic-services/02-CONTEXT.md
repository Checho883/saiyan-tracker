# Phase 2: Core Game Logic Services - Context

**Gathered:** 2026-03-04
**Status:** Ready for planning

<domain>
## Phase Boundary

All game mechanics as testable Python functions: XP formulas, Kaio-ken tiers, Zenkai streaks, capsule RNG, Dragon Ball awards, transformations, and the composite check_habit() atomic transaction. No API routes (Phase 3), no frontend (Phase 5+).

</domain>

<decisions>
## Implementation Decisions

### Uncheck/Toggle Behavior
- Full reversal on uncheck: attribute XP is clawed back, daily XP recalculated, completion rate/tier updated
- Dragon Ball is taken back if unchecking drops below 100% Perfect Day
- Capsules stick once dropped — unchecking does NOT remove a capsule drop
- One capsule roll per habit per day — re-checking does NOT re-roll RNG
- Every check/uncheck triggers a full daily XP recalculation (completion count, tier, streak bonus)

### Zenkai Recovery
- Streak break = any day finishing below 80% completion (matches STREAK_MIN_COMPLETION = 0.8)
- Missing multiple consecutive days halves the streak ONCE (on next check-in), not per missed day
- Zenkai +50% bonus XP fires on the first day back regardless of completion % (not only on Perfect Day)
- check_habit() response includes a zenkai_activated flag with the halved streak value for frontend to display welcome-back moment

### Off-Day Edge Cases
- Marking today as off day after completing habits: reverses everything (wipes habit logs, clears XP, pauses streaks)
- Off days are invisible to streaks — streak freezes at its current value, resumes next active day
- Off days are cancellable — removing off day returns the day to normal, can start checking habits
- No limit on off days per week/month — trust the user

### Capsule Drop Mechanics
- Capsule system only activates when rewards exist in the DB; if no rewards configured, skip RNG entirely
- Full assignment on backend: service picks rarity tier, then selects a random reward from that tier; CapsuleDrop stores exact reward_id
- Rarity tier fallback: if rolled tier has no rewards, fall back to next available tier (epic → rare → common); if no rewards at all, no drop
- Service returns full capsule data (reward details) in check_habit() response; frontend handles the "tap to open" reveal UX

### Claude's Discretion
- Service file organization and module structure
- Error handling patterns and exception hierarchy
- Database session management approach within atomic transactions
- Test organization and fixture strategy

</decisions>

<specifics>
## Specific Ideas

- Zenkai should feel like a "welcome back warrior" moment, not a punishment — the service flags it so frontend (Phase 6) can show a Vegeta quote and visual
- Capsule drops are a dopamine reward — once earned, they're yours (even on uncheck). This preserves the slot-machine feeling
- Off days should never feel punishing — clean reversal means "it's like the day didn't happen" not "you lost something"

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `constants.py`: All game values already defined (IMPORTANCE_XP, COMPLETION_TIERS, BASE_DAILY_XP, STREAK_*, CAPSULE_*, TRANSFORMATIONS, ATTRIBUTE_*)
- 15 SQLAlchemy models: User, Habit, HabitLog, DailyLog, Streak, HabitStreak, CapsuleDrop, PowerLevel, etc.
- `database/session.py`: Session management infrastructure
- `database/seed.py`: Seed data loader (100+ quotes already seeded)

### Established Patterns
- Models use SQLAlchemy 2.0 mapped_column style with UUID primary keys
- Date fields store YYYY-MM-DD strings (not DATETIME) per DB-06
- UniqueConstraints on (habit_id, log_date) and (user_id, log_date) prevent duplicate entries
- User model stores cumulative XP per attribute (str_xp, vit_xp, int_xp, ki_xp) and power_level

### Integration Points
- Services will be consumed by API routes in Phase 3 (FastAPI endpoints)
- HabitLog.attribute_xp_awarded and .capsule_dropped fields ready for check_habit() to populate
- DailyLog fields (is_perfect_day, completion_tier, xp_earned, streak_multiplier, zenkai_bonus_applied, dragon_ball_earned) map directly to check_habit() outputs
- User.dragon_balls_collected, .power_level, .current_transformation are the cumulative state check_habit() updates

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-core-game-logic-services*
*Context gathered: 2026-03-04*
