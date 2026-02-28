# Feature Research

**Domain:** Gamified habit tracker (Dragon Ball Z themed, solo user, ADHD-optimized)
**Researched:** 2026-02-28
**Confidence:** HIGH (based on existing codebase analysis, competitor knowledge, and ADHD/gamification domain expertise)

## Context: Audit-Oriented Feature Landscape

This is NOT a greenfield build. Saiyan Tracker v2 is built and feature-complete through 5 phases. This research defines what "working correctly" looks like for each feature area, identifies critical user flows that must be bulletproof, and flags where existing gamified habit trackers commonly break down.

The audit milestone should verify every feature below works end-to-end, not add new ones.

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing or broken = the app feels broken and trust erodes.

| Feature | Why Expected | Complexity | Saiyan Tracker Status | Audit Focus |
|---------|--------------|------------|----------------------|-------------|
| **Habit CRUD** | Core product loop; creating/editing/deleting habits is foundational | LOW | Built (API + UI) | Verify create with all field combos, edit preserves data, delete is soft-delete, archived habits don't appear in today list |
| **Daily habit check/uncheck toggle** | The primary daily action; must be instant and reliable | LOW | Built (toggle endpoint + ki-burst animation) | Verify toggle idempotency, double-tap safety, uncheck correctly reverses points, streak adjusts on uncheck |
| **Streak tracking (per-habit)** | Streaks are THE motivational mechanic for habit apps; broken streaks = user churns | MEDIUM | Built (HabitStreak model) | Verify streak increments on consecutive days, resets/halves on gaps, best_streak updates correctly, timezone edge cases |
| **Daily summary / progress indicator** | Users need to see "how am I doing today?" at a glance | LOW | Built (Today's Summary card, X/Y habits counter) | Verify counts are accurate, update in real-time after check/uncheck |
| **Calendar/history view** | Users need to see past performance; "don't break the chain" visualization | MEDIUM | Built (CalendarHeatmap with month nav) | Verify correct day coloring, month navigation doesn't break, future days not shown, today highlighted |
| **Points/scoring system** | Core gamification; earning points must feel fair and consistent | MEDIUM | Built (base_points x multiplier + streak bonus) | Verify point calculations match PRD formulas exactly, no rounding errors, category multipliers applied correctly |
| **Habit scheduling (daily/weekdays/custom)** | Not all habits are daily; flexible scheduling is expected | MEDIUM | Built (frequency field + custom_days) | Verify weekday-only habits don't appear on weekends, custom day habits appear on correct days only |
| **Dark/light theme** | Modern UI expectation, especially for a "dark space" themed app | LOW | Built (CSS variables + ThemeContext) | Verify all components respect theme, no white flashes on load, toggle persists across sessions |
| **Off-day support** | Life happens; users need a "skip today" that doesn't destroy streaks | LOW | Built (off_day API + modal) | Verify off days don't count as missed for streaks, off days reflected in analytics |
| **Settings/configuration** | Users need to adjust daily minimum, view categories | LOW | Built (Settings page) | Verify daily minimum saves and persists, slider range is appropriate |

### Differentiators (Competitive Advantage)

Features that set Saiyan Tracker apart from Habitica, Streaks, HabitBear, etc.

| Feature | Value Proposition | Complexity | Saiyan Tracker Status | Audit Focus |
|---------|-------------------|------------|----------------------|-------------|
| **Dragon Ball transformations** | Permanent visible progression (Base -> SSJ -> ... -> UI) creates long-term goal structure that generic "levels" don't match | MEDIUM | Built (7 levels, TransformationAnimation) | Verify transformation triggers at exact thresholds, animation fires on level-up, unlocked transformations persist, power level bar shows correct progress % |
| **Zenkai Recovery (streak halving)** | Most habit apps reset streaks to 0 on miss, which is devastating and causes abandonment. Halving + comeback bonus is ADHD-friendly and forgiving | HIGH | Built (streak halving + ZENKAI_BOOST) | **CRITICAL:** Verify streaks halve (not reset) on gap, Zenkai +100% applies on comeback day only, Zenkai message displays, edge case: what happens on 1-day streak miss? |
| **Tiered Kaio-ken consistency bonus** | Rewards partial completion (50%+), not just perfection. ADHD users rarely hit 100% -- rewarding 80% keeps them engaged | HIGH | Built (CONSISTENCY_TIERS, applied to all habit logs) | **CRITICAL:** Verify tier calculation is correct (100%/80%/50%/below), bonus applies to ALL habit logs for the day, bonus doesn't stack across multiple checks, banner message matches tier |
| **Real anime quotes (contextual)** | 55 real quotes create emotional connection. Vegeta roasts on missed days, Goku encourages on completion. Themed by saga | MEDIUM | Built (quote_service + UI components) | Verify contextual quote selection works (roasts on miss, motivation on complete), quotes display with source_saga, quotes auto-dismiss |
| **Ki-burst animation on check** | Micro-dopamine hit on every completion; makes checking off a habit feel powerful | LOW | Built (HabitCard animation) | Verify animation fires on check (not uncheck), doesn't block UI interaction, performs well with many habits |
| **Scouter-style power display** | Iconic DBZ visual that makes the power level feel real, not just a number | LOW | Built (PowerLevelBar) | Verify power level updates after each action, progress bar % is accurate, "points to next" calculation is correct |
| **Category multipliers** | Side Business (1.5x) > Work (1.0x) > Personal (0.7x) > Recreational (0.5x) -- rewards habits that align with goals | LOW | Built (CATEGORY_MULTIPLIERS) | Verify multipliers apply correctly to point calculations, category shown on habit cards |
| **Task point nerf (0.5x)** | Prevents hyperfocus exploits where ADHD users binge one-off tasks instead of doing daily habits | LOW | Built (TASK_POINT_MULTIPLIER) | Verify tasks award 0.5x points compared to equivalent habit, one-off tasks don't affect consistency bonus |
| **Habit reordering** | Personal priority ordering creates intentional daily flow | LOW | Built (sort_order + reorder API) | Verify reorder persists, move up/down swaps correctly, order maintained across refreshes |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems, especially for ADHD users.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Social/leaderboard features** | "Compete with friends" | Solo user app; social comparison creates anxiety for ADHD users; the Dragon Ball theme IS the competition (beat your own transformation level) | Keep it single-player; the transformation ladder provides all needed goal structure |
| **Detailed habit time tracking** | "Track how long I meditate" | Time tracking adds friction to the check-off action. The whole point is a quick toggle -- not a timesheet. ADHD users will skip habits if checking them off feels like work | Target time field exists for scheduling, but completion is binary (done/not done) |
| **Habit chains/dependencies** | "Only show habit B after habit A is done" | Over-engineering the daily flow; ADHD users need flexibility, not rigid sequences. A bad morning shouldn't block evening habits | Sort order provides suggested flow without enforcement |
| **Punitive streak mechanics** | "Lose points on missed days" | ADHD users already feel shame about missed habits. Punishment accelerates abandonment. Zenkai Recovery exists specifically to counter this | Zenkai halving + comeback bonus is the correct pattern |
| **Complex achievement system** | "Badges for 30 days, 100 days, etc." | Achievement fatigue; too many dopamine sources dilutes each one. The transformation system IS the achievement system | Transformations serve as the achievement ladder. Adding badges would create noise |
| **Notification/reminder system** | "Remind me to do habits" | Local-only SQLite app with no push infrastructure; would require PWA/mobile build. Target time field is aspirational, not alarm-based | Target time exists as self-reference; reminders are a deployment-era feature |
| **Data export/import** | "Backup my data" | Solo local app; SQLite file IS the backup. Export adds complexity for near-zero value at current scale | Copy the SQLite file directly: `backend/data/saiyan_tracker.db` |
| **Multi-user support / auth** | "Let others use it" | Massive scope increase (auth, user isolation, session management) for a solo-user tool. DEFAULT_USER_ID pattern is intentional | Keep single-user; if needed later, it's a v3 concern |

---

## Critical User Flows

These flows MUST work flawlessly. A bug in any of these is a P0 for the audit.

### Flow 1: Daily Habit Completion (The Core Loop)

```
Open app
  -> See today's habits (filtered by frequency/schedule)
  -> Tap checkbox on habit
  -> Ki-burst animation fires
  -> POST /habits/{id}/check
  -> Points calculated (base x multiplier + streak bonus)
  -> PointsPopup shows "+X"
  -> Streak increments (or Zenkai triggers)
  -> If all completed: consistency bonus applied, Kaio-ken banner
  -> If transformation threshold crossed: TransformationAnimation
  -> Power level bar updates
  -> Quote displays (Goku motivation)
  -> Tap checkbox again to uncheck
  -> Points reversed, streak decremented
  -> Power level bar updates downward
```

**Why critical:** This is the ENTIRE product. Every other feature is secondary to this 10-second interaction working perfectly every single time.

### Flow 2: Habit Create/Edit

```
Click "+ Add Habit"
  -> HabitFormModal opens
  -> Fill: title, emoji, category, frequency, custom days, points, target time
  -> Submit -> POST /habits/
  -> Habit appears in today's list (if due today)
  -> Click "..." context menu on habit -> Edit
  -> HabitFormModal opens with pre-filled data
  -> Modify fields -> Save -> PUT /habits/{id}
  -> Changes reflected immediately
```

**Why critical:** If users can't create or modify habits, the app is useless. Form validation, field pre-filling on edit, and immediate UI updates are all trust-building.

### Flow 3: Streak Integrity

```
Day 1: Complete habit -> streak = 1
Day 2: Complete habit -> streak = 2
Day 3: Complete habit -> streak = 3
Day 4: Miss habit -> (no action)
Day 5: Complete habit -> streak = max(1, 3 // 2) = 1 (Zenkai triggered)
  -> Zenkai +100% bonus applied
  -> Zenkai message displayed
Day 6: Complete habit -> streak = 2
```

**Why critical:** Streak math must be exact. If streaks reset to 0 instead of halving, the entire Zenkai differentiator is broken. If best_streak doesn't update, users lose trust in their records.

### Flow 4: Point Calculation Accuracy

```
Habit: base_points=10, category=Side Business (1.5x), streak=5
  -> effective = floor(10 * 1.5) = 15
  -> streak_bonus = floor(15 * min(5 * 0.02, 0.30)) = floor(15 * 0.10) = 1
  -> total = 15 + 1 = 16
  -> If Zenkai: total = 16 + floor(16 * 1.0) = 32
  -> If consistency tier 100% (1.5x): applied to log -> floor(16 * 1.5) = 24
```

**Why critical:** Point calculations are the trust foundation. If the math doesn't match what users expect from the rules, the gamification feels arbitrary and demotivating.

### Flow 5: Archive/Delete Habit

```
Click "..." on habit -> Archive
  -> PUT /habits/{id} with is_active=false
  -> Habit disappears from today's list
  -> Habit's historical data (logs, streaks) preserved
  -> Habit visible via ?include_inactive=true

Click "..." on habit -> Delete
  -> DELETE /habits/{id} (soft-delete = set is_active=false)
  -> Same behavior as archive
```

**Why critical:** Users must be able to remove habits without losing historical data. Accidentally deleting a 90-day streak would be devastating.

### Flow 6: Analytics Accuracy

```
Navigate to Analytics page
  -> Calendar heatmap shows correct completion rates per day
  -> Colors match completion rate (0% -> empty, <50% -> light, <100% -> medium, 100% -> gold)
  -> Month navigation works (prev/next)
  -> Today highlighted with orange ring
  -> Weekly chart matches actual daily points
  -> Category breakdown sums to 100%
  -> Power history shows cumulative growth
```

**Why critical:** If analytics show wrong data, users lose trust in the entire system. Seeing a "0%" on a day they completed all habits would be demoralizing.

---

## Feature Dependencies

```
[Habit CRUD]
    |--requires--> [Categories] (habits have category_id FK)
    |--enables---> [Daily Habit Check]
                       |--enables---> [Streak Tracking]
                       |                   |--enables---> [Zenkai Recovery]
                       |--enables---> [Point Calculation]
                       |                   |--requires--> [Category Multipliers]
                       |                   |--enables---> [Consistency Bonus (Kaio-ken)]
                       |                   |--enables---> [Transformation Level-ups]
                       |--enables---> [Calendar Heatmap]
                       |--enables---> [Analytics Charts]

[Habit Scheduling]
    |--enhances--> [Daily Habit Check] (filters which habits appear today)

[Off Days]
    |--enhances--> [Streak Tracking] (protects streaks on rest days)

[Theme System]
    |--independent-- (affects all components but no data dependencies)

[Quotes System]
    |--enhances--> [Daily Habit Check] (contextual feedback)
    |--enhances--> [Streak Tracking] (Vegeta roasts on miss)
```

### Dependency Notes

- **Habit CRUD requires Categories:** Every habit has a category_id. If categories don't exist or aren't seeded, habit creation fails.
- **Point Calculation requires Category Multipliers:** Points are floor(base * multiplier). Wrong multiplier = wrong points everywhere downstream.
- **Consistency Bonus requires all habits checked for the day:** This is recalculated on every check. The bonus retroactively modifies ALL habit logs for that day -- if this is buggy, it could corrupt point totals.
- **Transformation Level-ups require accurate cumulative power:** If _get_total_power() returns wrong values, transformations trigger at wrong times.

---

## Audit Priority (Not MVP -- Audit Verification Order)

### P0: Must Verify First (Data Integrity)

These affect stored data. Bugs here corrupt the database.

- [ ] **Point calculation accuracy** -- verify formulas match PRD for all scenarios (base, with streak, with Zenkai, with consistency bonus)
- [ ] **Streak increment/decrement logic** -- verify consecutive day detection, halving on gap, best_streak updates
- [ ] **Consistency bonus application** -- verify tier thresholds, bonus applies to ALL logs, doesn't double-apply on re-check
- [ ] **Zenkai Recovery** -- verify triggers only on comeback after gap, +100% applied correctly, streak halves to max(1, old//2)
- [ ] **Transformation threshold detection** -- verify old_total vs new_total comparison crosses exact threshold values

### P1: Must Verify Second (User Experience)

These affect what the user sees. Bugs here erode trust.

- [ ] **Today's habits filtering** -- correct habits appear based on frequency, custom days, date range, is_active
- [ ] **Habit check toggle** -- check works, uncheck works, points update both directions, UI updates immediately
- [ ] **Calendar heatmap accuracy** -- completion rates match actual log data, month navigation works, today highlighted
- [ ] **Power level display** -- total power matches sum of all completions, progress % to next transformation is correct
- [ ] **Habit form modal** -- create works with all field combos, edit pre-fills correctly, validation prevents bad data

### P2: Should Verify (Polish)

These affect feel but not correctness.

- [ ] **Ki-burst animation** -- fires on check only, doesn't block interaction
- [ ] **Quote display** -- contextual selection works, auto-dismiss timing, saga attribution shown
- [ ] **Theme consistency** -- all components use CSS variables, no hardcoded colors, no white flash on dark mode load
- [ ] **Reorder functionality** -- move up/down swaps correctly, persists across refresh
- [ ] **Points popup animation** -- shows correct amount, dismisses cleanly

### P3: Nice to Verify (Edge Cases)

- [ ] **Empty state handling** -- no habits created yet, no completions yet, no analytics data
- [ ] **Rapid toggling** -- quickly checking/unchecking same habit doesn't corrupt data
- [ ] **Month boundary** -- streaks that cross month boundaries track correctly
- [ ] **Year boundary** -- calendar navigation across year boundary works
- [ ] **Database deletion recovery** -- app handles missing DB gracefully on restart

---

## Competitor Feature Analysis

| Feature | Habitica | Streaks (iOS) | HabitBear | Saiyan Tracker |
|---------|----------|---------------|-----------|----------------|
| Gamification theme | Generic RPG | Minimal (ring completion) | Bear avatars | Dragon Ball Z (unique) |
| Streak forgiveness | None (harsh) | None (resets to 0) | None | Zenkai halving + comeback bonus (ADHD-friendly) |
| Partial completion reward | None | None | None | Tiered Kaio-ken (50%/80%/100%) |
| Point system depth | Complex (HP/XP/GP) | None | Simple stars | Moderate (multipliers, streak bonus, consistency bonus) |
| Calendar visualization | Party quest focus | Ring view per habit | Simple calendar | Heatmap with month navigation |
| Custom scheduling | Daily only | Daily/weekly | Daily only | Daily/weekdays/custom days |
| Offline support | No (online-only) | Yes (local) | Yes (local) | Yes (SQLite local) |
| Social features | Core (parties, guilds) | None | None | None (intentionally solo) |
| Multi-platform | Web + mobile | iOS only | iOS only | Web (localhost only currently) |

**Key competitive advantages of Saiyan Tracker:**
1. Zenkai Recovery is genuinely unique -- no major habit app does forgiving streak mechanics
2. Tiered consistency bonus rewards partial effort, which is critical for ADHD users
3. The Dragon Ball theme creates deeper emotional connection than generic gamification
4. Category-based point multipliers align incentives with goal priority

---

## Sources

- Saiyan Tracker codebase analysis (all source files read directly) -- HIGH confidence
- PRD.md v2.0 (February 28, 2026) -- HIGH confidence
- Competitor knowledge based on training data (Habitica, Streaks, HabitBear) -- MEDIUM confidence (products may have added features since training cutoff)
- ADHD gamification patterns -- MEDIUM confidence (based on established behavioral psychology, not verified against 2026 research)

---
*Feature research for: Gamified habit tracker (Dragon Ball Z themed)*
*Researched: 2026-02-28*
