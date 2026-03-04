# Phase 2: Core Game Logic Services - Research

**Researched:** 2026-03-04
**Domain:** Python service layer — pure game mechanics with SQLAlchemy ORM transactions
**Confidence:** HIGH

## Summary

Phase 2 implements all game mechanics as testable Python service functions operating on the SQLAlchemy models established in Phase 1. The domain is pure backend logic: XP formulas, completion tiers, streak management, capsule RNG, Dragon Ball awards, transformation thresholds, attribute leveling, and the composite `check_habit()` atomic transaction that orchestrates them all.

The codebase already provides a complete foundation: 15 SQLAlchemy 2.0 models with all required fields, a `constants.py` with every game value, and a test infrastructure with in-memory SQLite, connection-level rollback isolation, and a `sample_user` fixture. The services directory does not yet exist — this phase creates it from scratch.

The primary challenge is getting the `check_habit()` transaction right: it must toggle a habit log, recalculate daily completion stats, award attribute XP, update two streak types, recompute daily XP via the formula, check transformation thresholds, award Dragon Ball on Perfect Day, and roll capsule RNG — all atomically. The uncheck path is equally complex: full reversal of XP and daily stats, Dragon Ball clawback, but capsules stick.

**Primary recommendation:** Build each game mechanic as a small, independently testable pure function or thin-service function, then compose them inside `check_habit()` which owns the single `db.commit()`. No commit inside sub-functions — only `check_habit()` commits.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Full reversal on uncheck: attribute XP is clawed back, daily XP recalculated, completion rate/tier updated
- Dragon Ball is taken back if unchecking drops below 100% Perfect Day
- Capsules stick once dropped — unchecking does NOT remove a capsule drop
- One capsule roll per habit per day — re-checking does NOT re-roll RNG
- Every check/uncheck triggers a full daily XP recalculation (completion count, tier, streak bonus)
- Streak break = any day finishing below 80% completion (matches STREAK_MIN_COMPLETION = 0.8)
- Missing multiple consecutive days halves the streak ONCE (on next check-in), not per missed day
- Zenkai +50% bonus XP fires on the first day back regardless of completion % (not only on Perfect Day)
- check_habit() response includes a zenkai_activated flag with the halved streak value for frontend to display welcome-back moment
- Marking today as off day after completing habits: reverses everything (wipes habit logs, clears XP, pauses streaks)
- Off days are invisible to streaks — streak freezes at its current value, resumes next active day
- Off days are cancellable — removing off day returns the day to normal, can start checking habits
- No limit on off days per week/month — trust the user
- Capsule system only activates when rewards exist in the DB; if no rewards configured, skip RNG entirely
- Full assignment on backend: service picks rarity tier, then selects a random reward from that tier; CapsuleDrop stores exact reward_id
- Rarity tier fallback: if rolled tier has no rewards, fall back to next available tier (epic -> rare -> common); if no rewards at all, no drop
- Service returns full capsule data (reward details) in check_habit() response; frontend handles the "tap to open" reveal UX

### Claude's Discretion
- Service file organization and module structure
- Error handling patterns and exception hierarchy
- Database session management approach within atomic transactions
- Test organization and fixture strategy

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| GAME-01 | XP formula: daily_xp = floor(base_daily_xp * completion_rate * tier_multiplier * (1 + streak_bonus)) | Pure function using constants from `constants.py`; `BASE_DAILY_XP=100`, floor() for integer output |
| GAME-02 | Kaio-ken tier system: <50%=1.0x, >=50%=1.2x, >=80%=1.5x, 100%=2.0x | Lookup against `COMPLETION_TIERS` list (sorted desc by min_rate); returns tier name + multiplier |
| GAME-03 | Per-habit attribute XP: Normal=15, Important=22, Critical=30 | Direct lookup from `IMPORTANCE_XP` dict; XP added to User.{attribute}_xp |
| GAME-04 | Streak bonus: +5%/day on overall streak, capped at +100% | `min(streak * STREAK_BONUS_PER_DAY, STREAK_BONUS_CAP)` = min(streak*0.05, 1.0) |
| GAME-05 | Zenkai recovery: streak halved on break, +50% bonus on first day back | Streak model tracking + DailyLog.zenkai_bonus_applied flag; ZENKAI_BONUS=0.5 |
| GAME-06 | Overall streak requires >=80% daily completion | `STREAK_MIN_COMPLETION=0.8`; streak increments only when habit_completion_rate >= 0.8 |
| GAME-07 | Per-habit streaks track consecutive due-day completions (visual only) | HabitStreak model increment/reset; no XP effect |
| GAME-08 | Capsule drop: 25% chance per habit check, rarity weighted (60/30/10) | `CAPSULE_DROP_CHANCE=0.25`, `CAPSULE_RARITY_WEIGHTS` dict; Python `random` module |
| GAME-09 | Dragon Ball earned on Perfect Day (100%); 7 triggers wish | DailyLog.dragon_ball_earned + User.dragon_balls_collected; `DRAGON_BALLS_REQUIRED=7` |
| GAME-10 | Wish granting resets dragon_balls_collected to 0, increments times_wished | Separate `grant_wish()` service function; creates WishLog entry |
| GAME-11 | Power Level = cumulative total XP (never decreases); 10 transformation thresholds | User.power_level = sum of all daily XP; scan `TRANSFORMATIONS` list for threshold |
| GAME-12 | Attribute leveling: xp_needed = 100 * level^1.5 with title unlocks at 5/10/25/50/100 | Pure function using `ATTRIBUTE_LEVEL_FORMULA_EXPONENT=1.5` and `ATTRIBUTE_TITLES` |
| GAME-13 | Off days pause both streak types — no penalty, no XP | Off-day service: creates OffDay record, wipes habit logs for date, clears DailyLog |
| GAME-14 | check_habit() atomic transaction: toggle log, update daily, award XP, update streaks, recalc daily XP, power level, transformation, Dragon Ball, capsule RNG | Composite function with single db.commit(); orchestrates all sub-functions |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| SQLAlchemy | >=2.0 (installed) | ORM for all DB operations | Already established in Phase 1; mapped_column style |
| Python stdlib `math` | 3.x | `math.floor()` for XP formula | No dependency needed; guarantees integer output |
| Python stdlib `random` | 3.x | Capsule RNG (drop chance + rarity selection) | Standard approach; `random.random()` + `random.choices()` with weights |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| pytest | installed | Test framework | All service tests; existing conftest.py with fixtures |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `random` stdlib | `secrets` module | `secrets` is for cryptographic randomness; capsule drops don't need it — `random` is correct for game mechanics |
| `math.floor()` | `int()` truncation | `int()` truncates toward zero which matches `floor()` for positive numbers; `math.floor()` is more explicit and self-documenting |

**Installation:**
```bash
# No new dependencies needed — all tools already available
```

## Architecture Patterns

### Recommended Project Structure
```
backend/app/services/
├── __init__.py              # Public API exports
├── xp_service.py            # XP formula, tier lookup, daily XP calc
├── streak_service.py         # Overall streak, habit streaks, Zenkai recovery
├── capsule_service.py        # Drop chance, rarity roll, reward selection
├── dragon_ball_service.py    # Dragon Ball award, wish granting
├── power_service.py          # Power level update, transformation check
├── attribute_service.py      # Attribute leveling, title lookup
├── off_day_service.py        # Off-day creation, cancellation, reversal
└── habit_service.py          # check_habit() composite + helpers
```

### Pattern 1: Pure Calculation Functions Separate from DB Operations

**What:** Game formulas are pure functions (no DB, no session) that take values and return values. DB-touching functions call the pure functions and apply results.

**When to use:** Every formula in GAME-01 through GAME-04, GAME-12.

**Example:**
```python
# xp_service.py

import math
from app.core.constants import (
    BASE_DAILY_XP, COMPLETION_TIERS, IMPORTANCE_XP,
    STREAK_BONUS_PER_DAY, STREAK_BONUS_CAP,
)

def get_completion_tier(completion_rate: float) -> dict:
    """Return the tier dict for a given completion rate.

    COMPLETION_TIERS is sorted descending by min_rate, so first match wins.
    """
    for tier in COMPLETION_TIERS:
        if completion_rate >= tier["min_rate"]:
            return tier
    return COMPLETION_TIERS[-1]  # base fallback

def calc_streak_bonus(current_streak: int) -> float:
    """Streak bonus: +5% per day, capped at +100%."""
    return min(current_streak * STREAK_BONUS_PER_DAY, STREAK_BONUS_CAP)

def calc_daily_xp(
    completion_rate: float,
    current_streak: int,
    zenkai_active: bool = False,
) -> int:
    """GAME-01: daily_xp = floor(base * rate * tier * (1 + streak_bonus))

    If zenkai_active, applies ZENKAI_BONUS on top.
    """
    tier = get_completion_tier(completion_rate)
    streak_bonus = calc_streak_bonus(current_streak)

    xp = BASE_DAILY_XP * completion_rate * tier["multiplier"] * (1 + streak_bonus)

    if zenkai_active:
        xp *= (1 + ZENKAI_BONUS)

    return math.floor(xp)

def get_attribute_xp(importance: str) -> int:
    """GAME-03: XP value for a habit based on importance."""
    return IMPORTANCE_XP[importance]
```

### Pattern 2: Composite Transaction with Single Commit

**What:** `check_habit()` calls multiple sub-functions that mutate ORM objects via `db.add()`/`db.flush()` but never `db.commit()`. Only `check_habit()` calls `db.commit()` at the end (or `db.rollback()` on error).

**When to use:** GAME-14 — the atomic check_habit() transaction.

**Example:**
```python
# habit_service.py

from sqlalchemy.orm import Session

def check_habit(db: Session, user_id: str, habit_id: str, local_date: str) -> dict:
    """Atomic habit check/uncheck — single commit point."""
    try:
        # 1. Toggle habit log (create or mark uncompleted)
        habit_log, is_checking = _toggle_habit_log(db, user_id, habit_id, local_date)

        # 2. Award/claw back attribute XP
        attribute_xp = _handle_attribute_xp(db, habit_log, is_checking)

        # 3. Update daily completion stats
        daily_log = _update_daily_log(db, user_id, local_date)

        # 4. Update habit streak (visual only)
        _update_habit_streak(db, habit_id, local_date, is_checking)

        # 5. Update overall streak (with Zenkai check)
        streak_info = _update_overall_streak(db, user_id, local_date, daily_log)

        # 6. Recalculate daily XP
        daily_xp = _recalculate_daily_xp(db, daily_log, streak_info)

        # 7. Update power level + transformation check
        transform_info = _update_power_level(db, user_id, daily_log, local_date)

        # 8. Award/claw back Dragon Ball
        dragon_ball_info = _handle_dragon_ball(db, user_id, daily_log)

        # 9. Roll capsule RNG (only on check, once per habit per day)
        capsule_info = _handle_capsule_drop(db, user_id, habit_id, habit_log, is_checking)

        db.commit()

        return {
            "is_checking": is_checking,
            "attribute_xp_awarded": attribute_xp,
            "completion_rate": daily_log.habit_completion_rate,
            "completion_tier": daily_log.completion_tier,
            "capsule_drop": capsule_info,
            "is_perfect_day": daily_log.is_perfect_day,
            "dragon_ball_earned": dragon_ball_info,
            "new_transformation": transform_info,
            "streak": streak_info,
            "daily_xp": daily_log.xp_earned,
            "zenkai_activated": streak_info.get("zenkai_activated", False),
        }
    except Exception:
        db.rollback()
        raise
```

### Pattern 3: Idempotent Capsule Guard

**What:** Capsule roll uses the HabitLog.capsule_dropped flag to ensure one roll per habit per day. If the flag is already True (from a previous check), re-checking does not re-roll.

**When to use:** GAME-08 capsule drop logic.

**Example:**
```python
def _handle_capsule_drop(db, user_id, habit_id, habit_log, is_checking):
    """Roll capsule only on check, only once per habit per day."""
    if not is_checking:
        # Unchecking — capsules stick, don't remove
        return None

    if habit_log.capsule_dropped:
        # Already rolled for this habit today — don't re-roll
        return None

    # Check if any rewards exist
    reward_count = db.query(Reward).filter(Reward.user_id == user_id, Reward.is_active == True).count()
    if reward_count == 0:
        return None

    # Roll the dice
    if random.random() > CAPSULE_DROP_CHANCE:
        return None

    # Pick rarity tier with fallback
    capsule_drop = _roll_rarity_and_select_reward(db, user_id, habit_id)
    if capsule_drop:
        habit_log.capsule_dropped = True
        db.add(capsule_drop)
        db.flush()

    return capsule_drop
```

### Anti-Patterns to Avoid
- **Committing inside sub-functions:** If `_update_streak()` commits and then `_handle_dragon_ball()` fails, you have an inconsistent state. Only `check_habit()` commits.
- **Using server time instead of local_date:** All date logic must use the client-supplied `local_date` string (DB-06). Never call `datetime.now()` or `date.today()` in service logic.
- **Floating-point comparison for tiers:** Use `>=` comparisons against exact constants (0.5, 0.8, 1.0). The completion_rate is `completed/due` which can produce repeating decimals — compare after rounding or use the stored float directly.
- **Mutating User.power_level on uncheck:** Power Level "never decreases" (GAME-11). Even on uncheck, recalculate from cumulative daily XP totals, do not subtract.
- **Resetting streak to 0:** Zenkai halves streak, never resets to 0 (GAME-05). Guard: `max(current_streak // 2, 1)` if streak was > 0.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Weighted random selection | Manual cumulative probability math | `random.choices(population, weights=weights, k=1)` | Handles edge cases, well-tested |
| Transaction management | Manual try/commit/rollback wrapper | SQLAlchemy Session's built-in transaction with explicit commit/rollback | Session already tracks dirty objects |
| Date arithmetic (gap detection) | String parsing + manual math | `datetime.strptime` + `timedelta` for date gaps | Date edge cases (month boundaries, leap years) |

**Key insight:** The game logic itself IS the custom code — formulas, tiers, streaks. But the infrastructure around it (RNG, transactions, date math) should use standard library tools.

## Common Pitfalls

### Pitfall 1: Power Level Decreasing on Uncheck
**What goes wrong:** Naively subtracting XP from User.power_level on uncheck can make it go below the correct value if the daily XP was recalculated.
**Why it happens:** Daily XP depends on completion_rate and tier — unchecking one habit changes the tier multiplier for ALL habits that day.
**How to avoid:** On every check/uncheck, recalculate the day's XP from scratch. Then recompute User.power_level as the sum of ALL daily_logs.xp_earned. Power level = cumulative total, never decremented directly.
**Warning signs:** Power level going negative or decreasing below a previous transformation threshold.

### Pitfall 2: Zenkai Bonus Applied Multiple Times
**What goes wrong:** If `zenkai_bonus_applied` is not tracked per-day, checking multiple habits on the comeback day applies +50% each time.
**Why it happens:** The Zenkai check runs on every `check_habit()` call.
**How to avoid:** Use `DailyLog.zenkai_bonus_applied` as a flag. The first `check_habit()` call on a comeback day sets it; subsequent calls on the same day see it is already set and skip the Zenkai multiplier. But since daily XP is recalculated fully each time, the Zenkai bonus should be applied to the daily XP formula (not per-habit).
**Warning signs:** XP values 50% higher than expected on days with multiple habit checks.

### Pitfall 3: Off-Day Reversal Missing Cascading Effects
**What goes wrong:** Marking today as off day wipes habit logs but forgets to update User attribute XP, power level, or Dragon Ball count.
**Why it happens:** Off-day logic only deletes HabitLogs without reversing their side effects.
**How to avoid:** Off-day service must: (1) iterate all habit logs for the date, (2) claw back attribute XP for each, (3) delete the DailyLog, (4) recalculate User.power_level from remaining daily logs, (5) claw back Dragon Ball if one was earned, (6) delete the habit logs, (7) freeze streak at last_active_date before today.
**Warning signs:** Attribute XP or power level remaining elevated after marking off day.

### Pitfall 4: Streak Gap Detection Ignoring Off Days
**What goes wrong:** User takes a day off, comes back next day, and streak is broken because the gap between last_active_date and today is > 1.
**Why it happens:** Gap detection counts calendar days without checking for intervening off days.
**How to avoid:** When checking for streak breaks, query OffDay records between last_active_date and today's local_date. If all gap days are off days, streak continues unbroken.
**Warning signs:** Streaks breaking despite only having off days in between.

### Pitfall 5: Capsule Rarity Fallback Infinite Loop
**What goes wrong:** If the rolled rarity tier has no rewards and the fallback logic is not careful, it can loop forever.
**Why it happens:** Fallback from epic -> rare -> common, but what if rare also has no rewards?
**How to avoid:** Use a defined fallback order `["epic", "rare", "common"]`. Starting from the rolled tier, iterate downward. If no tier has rewards, return None (no drop). This is a bounded loop of at most 3 iterations.
**Warning signs:** Timeouts or hangs during capsule drop.

### Pitfall 6: Completion Rate Division by Zero
**What goes wrong:** If a user has zero habits due today, `completed / due` divides by zero.
**Why it happens:** No habits exist, or all habits are inactive/not scheduled for today.
**How to avoid:** Guard: if `habits_due == 0`, completion_rate = 0.0, tier = "base", daily_xp = 0. No streak update either.
**Warning signs:** ZeroDivisionError crashes.

## Code Examples

### Daily XP Calculation (GAME-01 + GAME-02 + GAME-04)
```python
import math
from app.core.constants import BASE_DAILY_XP, COMPLETION_TIERS, STREAK_BONUS_PER_DAY, STREAK_BONUS_CAP, ZENKAI_BONUS

def calc_daily_xp(completion_rate: float, current_streak: int, zenkai_active: bool = False) -> int:
    """Compute daily XP using the master formula.

    daily_xp = floor(base_daily_xp * completion_rate * tier_multiplier * (1 + streak_bonus))
    If zenkai_active, multiply by additional (1 + 0.5).
    """
    # Tier lookup (COMPLETION_TIERS sorted desc by min_rate)
    tier_multiplier = 1.0
    for tier in COMPLETION_TIERS:
        if completion_rate >= tier["min_rate"]:
            tier_multiplier = tier["multiplier"]
            break

    streak_bonus = min(current_streak * STREAK_BONUS_PER_DAY, STREAK_BONUS_CAP)

    xp = BASE_DAILY_XP * completion_rate * tier_multiplier * (1 + streak_bonus)

    if zenkai_active:
        xp *= (1 + ZENKAI_BONUS)

    return math.floor(xp)

# Test vectors:
# 100% completion, 0 streak, no zenkai: floor(100 * 1.0 * 2.0 * 1.0) = 200
# 80% completion, 10 streak, no zenkai: floor(100 * 0.8 * 1.5 * 1.5) = 180
# 50% completion, 0 streak, no zenkai: floor(100 * 0.5 * 1.2 * 1.0) = 60
# 100% completion, 20 streak (capped), zenkai: floor(100 * 1.0 * 2.0 * 2.0 * 1.5) = 600
```

### Attribute Level Calculation (GAME-12)
```python
import math
from app.core.constants import ATTRIBUTE_LEVEL_BASE_XP, ATTRIBUTE_LEVEL_FORMULA_EXPONENT, ATTRIBUTE_TITLES

def calc_attribute_level(total_xp: int) -> int:
    """Calculate attribute level from cumulative XP.

    xp_needed for level N = 100 * N^1.5 (cumulative from level 1).
    """
    level = 0
    xp_consumed = 0
    while True:
        next_level = level + 1
        xp_for_next = math.floor(ATTRIBUTE_LEVEL_BASE_XP * (next_level ** ATTRIBUTE_LEVEL_FORMULA_EXPONENT))
        if xp_consumed + xp_for_next > total_xp:
            break
        xp_consumed += xp_for_next
        level = next_level
    return level

def get_attribute_title(attribute: str, level: int) -> str | None:
    """Return title for attribute at given level, or None."""
    titles = ATTRIBUTE_TITLES.get(attribute, {})
    current_title = None
    for threshold in sorted(titles.keys()):
        if level >= threshold:
            current_title = titles[threshold]
    return current_title

# Test: STR at level 10 -> "Warrior", at level 25 -> "Elite Warrior"
```

### Zenkai Recovery Logic (GAME-05)
```python
from datetime import datetime, timedelta
from app.core.constants import ZENKAI_BONUS, STREAK_MIN_COMPLETION

def check_zenkai_recovery(db, user_id: str, local_date: str, streak) -> dict:
    """Detect streak break and apply Zenkai halving.

    Returns: {"zenkai_activated": bool, "halved_from": int, "new_streak": int}
    """
    if not streak or not streak.last_active_date:
        return {"zenkai_activated": False, "halved_from": 0, "new_streak": 0}

    # Check for gap days (excluding off days)
    last_date = datetime.strptime(streak.last_active_date, "%Y-%m-%d").date()
    today = datetime.strptime(local_date, "%Y-%m-%d").date()
    gap_days = (today - last_date).days

    if gap_days <= 1:
        # No gap or consecutive day — no Zenkai
        return {"zenkai_activated": False, "halved_from": 0, "new_streak": streak.current_streak}

    # Check if all gap days are off days
    off_day_count = _count_off_days_in_range(db, user_id, streak.last_active_date, local_date)

    if off_day_count >= gap_days - 1:
        # All gap days are off days — streak continues
        return {"zenkai_activated": False, "halved_from": 0, "new_streak": streak.current_streak}

    # Streak break detected — halve once (never to 0)
    old_streak = streak.current_streak
    new_streak = max(old_streak // 2, 0)  # Can reach 0 only if was 0 or 1

    return {
        "zenkai_activated": True,
        "halved_from": old_streak,
        "new_streak": new_streak,
    }
```

### Capsule Drop with Rarity Fallback (GAME-08)
```python
import random
from app.core.constants import CAPSULE_DROP_CHANCE, CAPSULE_RARITY_WEIGHTS

RARITY_FALLBACK_ORDER = ["epic", "rare", "common"]

def roll_capsule_drop(db, user_id, habit_id):
    """Roll for capsule drop. Returns CapsuleDrop or None."""
    # Step 1: 25% chance check
    if random.random() > CAPSULE_DROP_CHANCE:
        return None

    # Step 2: Pick rarity via weighted random
    rarities = list(CAPSULE_RARITY_WEIGHTS.keys())
    weights = list(CAPSULE_RARITY_WEIGHTS.values())
    rolled_rarity = random.choices(rarities, weights=weights, k=1)[0]

    # Step 3: Find reward with fallback
    # Start from rolled rarity, fall back down
    start_idx = RARITY_FALLBACK_ORDER.index(rolled_rarity)
    for rarity in RARITY_FALLBACK_ORDER[start_idx:]:
        rewards = db.query(Reward).filter(
            Reward.user_id == user_id,
            Reward.rarity == rarity,
            Reward.is_active == True,
        ).all()
        if rewards:
            chosen_reward = random.choice(rewards)
            return CapsuleDrop(
                user_id=user_id,
                reward_id=chosen_reward.id,
                habit_id=habit_id,
            )

    return None  # No rewards in any tier
```

### Transformation Check (GAME-11)
```python
from app.core.constants import TRANSFORMATIONS

def get_transformation_for_power(power_level: int) -> dict:
    """Return the highest transformation unlocked at given power level."""
    current = TRANSFORMATIONS[0]  # base
    for t in TRANSFORMATIONS:
        if power_level >= t["threshold"]:
            current = t
        else:
            break
    return current

def check_transformation_change(old_transformation: str, new_power_level: int) -> dict | None:
    """Return new transformation info if threshold crossed, else None."""
    new_transform = get_transformation_for_power(new_power_level)
    if new_transform["key"] != old_transformation:
        return {"key": new_transform["key"], "name": new_transform["name"], "threshold": new_transform["threshold"]}
    return None
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| SQLAlchemy 1.x `Column()` | SQLAlchemy 2.0 `mapped_column()` | Already adopted Phase 1 | Services use `Mapped[]` type hints consistently |
| Session.commit() in each function | Single commit in orchestrator | Best practice | Atomic transactions, rollback safety |

**Deprecated/outdated:**
- Legacy `Query` API (`db.query(Model)`) still works in SQLAlchemy 2.0 but the newer `select()` statement style is preferred. However, `db.query()` is simpler for straightforward lookups and is still fully supported. Either style is acceptable for this phase.

## Open Questions

1. **Power Level Recalculation Strategy**
   - What we know: Power level = cumulative total XP, never decreases (GAME-11)
   - What's unclear: On uncheck, do we recompute from ALL daily_logs ever, or just update the delta for today? Full recomputation is safer but slower.
   - Recommendation: For a single-user SQLite app, full recomputation (SUM of all daily_logs.xp_earned) is fast enough and eliminates drift. Use `db.query(func.sum(DailyLog.xp_earned))` for accuracy.

2. **Zenkai Bonus in XP Formula Placement**
   - What we know: Zenkai +50% fires on first day back. Daily XP is recalculated on every check.
   - What's unclear: Does Zenkai multiply the entire daily XP formula, or is it additive? The CONTEXT says "bonus XP" suggesting multiplicative on top.
   - Recommendation: Apply as multiplicative factor: `daily_xp * (1 + ZENKAI_BONUS)` when `DailyLog.zenkai_bonus_applied` is True for the day. This means it applies to ALL habit checks that day, not just the first one, since daily XP is recalculated each time.

3. **"Habits Due Today" Determination**
   - What we know: Habits have frequency (daily/weekdays/custom) and custom_days (JSON list).
   - What's unclear: The service needs to know which habits are due on a given date to calculate completion_rate.
   - Recommendation: Create a helper `get_habits_due_on_date(db, user_id, local_date)` that filters by frequency + custom_days + is_active + start_date/end_date. This is a prerequisite for daily_log computation.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | pytest (installed in requirements.txt) |
| Config file | `backend/pyproject.toml` [tool.pytest.ini_options] |
| Quick run command | `cd backend && python -m pytest tests/ -x -q` |
| Full suite command | `cd backend && python -m pytest tests/ -v` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| GAME-01 | XP formula produces exact integers for known inputs | unit | `cd backend && python -m pytest tests/test_xp_service.py -x` | No - Wave 0 |
| GAME-02 | Kaio-ken tier returns correct multiplier for each bracket | unit | `cd backend && python -m pytest tests/test_xp_service.py::test_completion_tiers -x` | No - Wave 0 |
| GAME-03 | Attribute XP matches importance values (15/22/30) | unit | `cd backend && python -m pytest tests/test_xp_service.py::test_attribute_xp -x` | No - Wave 0 |
| GAME-04 | Streak bonus +5%/day, capped at +100% | unit | `cd backend && python -m pytest tests/test_streak_service.py::test_streak_bonus -x` | No - Wave 0 |
| GAME-05 | Zenkai halves streak, +50% bonus, zenkai_activated flag | integration | `cd backend && python -m pytest tests/test_streak_service.py::test_zenkai -x` | No - Wave 0 |
| GAME-06 | Overall streak only increments at >=80% | integration | `cd backend && python -m pytest tests/test_streak_service.py::test_streak_threshold -x` | No - Wave 0 |
| GAME-07 | Habit streak increments on check, resets on miss | unit | `cd backend && python -m pytest tests/test_streak_service.py::test_habit_streak -x` | No - Wave 0 |
| GAME-08 | Capsule 25% chance, rarity weighted, tier fallback | unit | `cd backend && python -m pytest tests/test_capsule_service.py -x` | No - Wave 0 |
| GAME-09 | Dragon Ball on Perfect Day, 7 triggers wish-available | integration | `cd backend && python -m pytest tests/test_dragon_ball_service.py -x` | No - Wave 0 |
| GAME-10 | Wish grant resets dragon_balls to 0, increments times_wished | integration | `cd backend && python -m pytest tests/test_dragon_ball_service.py::test_wish_grant -x` | No - Wave 0 |
| GAME-11 | Power level = cumulative XP, transformation thresholds | unit | `cd backend && python -m pytest tests/test_power_service.py -x` | No - Wave 0 |
| GAME-12 | Attribute level formula, title unlocks | unit | `cd backend && python -m pytest tests/test_attribute_service.py -x` | No - Wave 0 |
| GAME-13 | Off days pause streaks, wipe logs, no XP | integration | `cd backend && python -m pytest tests/test_off_day_service.py -x` | No - Wave 0 |
| GAME-14 | check_habit() atomic: toggle, XP, streaks, dragon ball, capsule | integration | `cd backend && python -m pytest tests/test_habit_service.py -x` | No - Wave 0 |

### Sampling Rate
- **Per task commit:** `cd backend && python -m pytest tests/ -x -q`
- **Per wave merge:** `cd backend && python -m pytest tests/ -v`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `backend/app/services/__init__.py` — service package init
- [ ] `backend/tests/test_xp_service.py` — covers GAME-01, GAME-02, GAME-03
- [ ] `backend/tests/test_streak_service.py` — covers GAME-04, GAME-05, GAME-06, GAME-07
- [ ] `backend/tests/test_capsule_service.py` — covers GAME-08
- [ ] `backend/tests/test_dragon_ball_service.py` — covers GAME-09, GAME-10
- [ ] `backend/tests/test_power_service.py` — covers GAME-11
- [ ] `backend/tests/test_attribute_service.py` — covers GAME-12
- [ ] `backend/tests/test_off_day_service.py` — covers GAME-13
- [ ] `backend/tests/test_habit_service.py` — covers GAME-14
- [ ] Extended `conftest.py` fixtures: `sample_habit`, `sample_streak`, `sample_daily_log`, `sample_reward`

## Sources

### Primary (HIGH confidence)
- Existing codebase: `backend/app/core/constants.py` — all game constants verified
- Existing codebase: `backend/app/models/*.py` — all 15 model schemas verified
- Existing codebase: `backend/tests/conftest.py` — test infrastructure verified
- Existing codebase: `backend/app/database/session.py` — session management verified
- Python stdlib docs — `math.floor()`, `random.choices()`, `datetime.strptime()`

### Secondary (MEDIUM confidence)
- SQLAlchemy 2.0 patterns — session transaction management, `db.flush()` vs `db.commit()` semantics are well-established

### Tertiary (LOW confidence)
- None — all findings based on existing codebase and Python stdlib

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new dependencies, pure Python + existing SQLAlchemy
- Architecture: HIGH — service layer patterns are straightforward; all models and constants already exist
- Pitfalls: HIGH — based on direct analysis of the data model and game rules from CONTEXT.md

**Research date:** 2026-03-04
**Valid until:** 2026-04-04 (stable — no external library dependencies to go stale)
