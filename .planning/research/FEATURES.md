# Feature Research

**Domain:** Gamified habit tracker v1.2 features (DBZ-themed, ADHD-optimized, 18 new features on existing app)
**Researched:** 2026-03-06
**Confidence:** HIGH

## Feature Landscape

This analysis covers the 18 target v1.2 features. The app already has a full working stack (15 DB models, 9 API routers, React 19 frontend with dashboard, audio, animations, analytics, settings). Many v1.2 features have partial infrastructure already built -- DB models, constants, or API endpoints that exist but lack service logic, frontend UI, or both.

### Table Stakes (Users Expect These)

Features that fill obvious gaps in the shipped v1.1 product. The infrastructure exists but the feature is incomplete or invisible to the user.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Streak milestone badges + notifications** (feat 2) | `STREAK_MILESTONES=[3,7,21,30,60,90,365]` defined in constants.py but unconsumed. Achievement model exists with no service. Users see streak numbers but get zero celebration at milestones. | MEDIUM | Backend: achievement_service.py to detect milestones during check_habit flow. Frontend: badge display + milestone notification overlay. Need GET /achievements endpoint. Standard pattern: detect milestone crossing in streak update, record achievement, return in check response. |
| **Achievement system** (feat 3) | Achievement model in DB since v1.0 with no service, no API, no frontend. Dead infrastructure. | MEDIUM | Backend: achievement service (create, list, check-for-existing) + GET /achievements endpoint. Frontend: achievements display panel. Wire into check_habit for auto-recording transformation unlocks and streak milestones. Standard gamification pattern -- Habitica has 200+ achievements, but even 15-20 covering transformations + streak milestones is sufficient. |
| **Capsule drop history view** (feat 5a) | `GET /analytics/capsule-history` endpoint exists and returns data. Frontend has zero UI for it. | LOW | Pure frontend: scrollable list/cards in Analytics page. Show reward title, rarity badge (color-coded), triggering habit, timestamp. Data already served with reward_title, reward_rarity, habit_title, dropped_at fields. |
| **Wish grant history view** (feat 5b) | `GET /analytics/wish-history` endpoint exists and returns data. Same gap as capsule history. | LOW | Pure frontend: scrollable list in Analytics page. Show wish title + granted_at timestamp. Simpler than capsule history -- just wish_title and granted_at. |
| **Calendar day popover** (feat 8) | PRD explicitly says "Click any day -> popover with per-habit breakdown." CalendarHeatmap exists but days are not interactive. | MEDIUM | Need to fetch per-habit data for a clicked date. Options: (a) extend calendar/all to include habit breakdown, (b) new endpoint GET /habits/calendar/{date} returning per-habit completion list, or (c) reuse today/list endpoint with arbitrary date. Frontend: popover/tooltip component anchored to clicked cell showing habit name + check/miss + XP earned. |
| **Per-habit calendar + stats API** (feat 9) | PRD defines `GET /habits/{id}/calendar` and `GET /habits/{id}/stats`. Neither endpoint exists. Contribution graph exists but monthly calendar and stats do not. | MEDIUM | Backend: two new endpoints. Calendar returns monthly per-habit completion (similar to calendar/all but filtered to one habit). Stats returns completion rate, current/best streak, total completions. Straightforward queries against HabitLog and HabitStreak tables. |
| **Habit drag-and-drop reordering** (feat 7) | `sort_order` field exists on Habit model. PRD defines `PUT /habits/reorder`. Users currently cannot change habit display order at all. | MEDIUM | Backend: `PUT /habits/reorder` endpoint accepting array of `{id, sort_order}` pairs. Frontend: **dnd-kit** with `@dnd-kit/sortable` for vertical list reorder. dnd-kit is the standard React DnD library for 2025-2026 (lightweight, accessible, performant, maintained). New dependency: `@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/utilities`. Touch-friendly with built-in keyboard support. |
| **Archived habits view + restore** (feat 14) | `DELETE /habits/{id}` already soft-deletes (sets `is_active=false`). Archived habits vanish with no way to see or restore them. Standard pattern across Habitica, HabitKit, Habitify, and others. | LOW | Backend: `GET /habits/archived` (filter `is_active=false`), `PUT /habits/{id}/restore` (set `is_active=true`). Frontend: archived habits section in Settings with restore button per habit. Industry standard: archive = "take a break without losing data." |
| **recharts react-is tech debt** (feat 18) | `package.json` has explicit `"react-is": "^19.0.0"` override in `overrides`. Known fragile workaround documented in PROJECT.md. | LOW | Check if recharts v3.8+ has fixed the react-is peer dep for React 19. If fixed, remove override and upgrade. If not, document as accepted debt or evaluate alternatives (lightweight chart components). Low risk either way -- the override works. |
| **Real audio sprite files** (feat 17) | App ships with placeholder audio. The core value is "every interaction must feel like something happened" but the sounds are placeholders. | MEDIUM | Source royalty-free DBZ-style sounds (ki blasts, scouter beeps, power-ups, explosions). Create audio sprite using `audiosprite` CLI tool (ffmpeg wrapper). Output: single WebM file (primary, best quality/size) + MP3 fallback + JSON sprite map with timing offsets. Update Howler.js sprite configuration. ~13 sound slots needed matching existing sprite keys. Freesound.org and similar CC0 sources. |

### Differentiators (Competitive Advantage)

Features unique to Saiyan Tracker that no standard habit tracker offers. These deepen the "Dopamine Edition" identity.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Vegeta escalation roast system** (feat 1) | No habit tracker has a character that roasts you harder the longer you're gone. Quote `severity` field (mild/medium/savage) exists in DB. Missed day detection logic is missing. | MEDIUM | Backend: count consecutive missed days (gap between `streak.last_active_date` and today, minus off days). Filter Vegeta quotes by severity matching consecutive missed days. Return escalating roast on dashboard load/today-list when gap detected. Frontend: prominent Vegeta quote display with severity-scaled visual treatment (mild = subtle, medium = warning tone, savage = red-tinted aggressive). Beerus at 3+ missed days per PRD. |
| **Per-habit contribution graphs** (feat 4) | GitHub-style 90-day grids per habit. `GET /habits/{id}/contribution-graph` endpoint already exists and returns daily completion booleans. No habit tracker competitor offers this granularity. | MEDIUM | Build custom SVG grid (no library needed). 90 days = 13 weeks x 7 days. Each cell: green for completed, dark gray for missed. Tooltip on hover with date. Place in Analytics page with habit selector. The API returns `{date, completed}` pairs -- trivially mapped to grid cells. Custom build is better than a library here because the data is binary (not intensity-scaled like GitHub). |
| **Zenkai recovery animation** (feat 6) | Zenkai detection exists in `streak_service.py`. `check_habit` response includes `zenkai_activated=true/false`. Currently triggers zero visual feedback. The comeback mechanic is invisible. | LOW | Frontend only: new animation overlay triggered when `checkHabit` response has `zenkai_activated=true`. Purple/blue energy burst effect (reuse ParticleBurst component pattern). "ZENKAI BOOST!" text with "+50% XP" callout. Brief (1.5s) celebration that says "you came back stronger." Queue in AnimationPlayer after other animations. |
| **Attribute level-up animation + title unlock** (feat 10) | Attribute leveling works in backend (`attribute_service.py` calculates levels from XP using `100 * level^1.5` formula). `ATTRIBUTE_TITLES` defined with 5 tiers per attribute. Zero celebration when user levels up or earns a title. | MEDIUM | Backend: enhance check_habit response to include `attribute_level_changed: {attribute, old_level, new_level, new_title?}` when a level boundary is crossed during XP award. `attribute_service.py` already has `get_level_for_xp()` and `get_title()` -- compare before/after. Frontend: level-up overlay animation ("STR Level 10: Warrior!") with fanfare sound. |
| **Power level milestone celebrations** (feat 11) | Power level is the primary progression number. Crossing round numbers (1K, 5K, 10K, etc.) between transformation thresholds gets zero fanfare. Transformation unlocks celebrate at specific XP amounts, but the journey between them is silent. | LOW | Frontend only: detect round number crossings from check_habit response. Compare `power_level` before and after check (store previous in habitStore or derive from powerStore). Milestone list: 1000, 2500, 5000, 7500, 10000, 25000, 50000, 75000, 100000, 150000. Show brief fanfare banner (1s) with sound. Avoid overlap with transformation animations (skip milestone if transformation also triggered). |
| **"You're close!" nudge banner** (feat 12) | ADHD users need the final push. The PRD highlights the "dopamine cliff" -- jumping from 83% (125 XP) to 100% (200 XP) is a 60% increase. When 1-2 habits remain, the user is closest to the biggest reward and most likely to stop. Nudge UX is an emerging pattern in habit apps -- predictive/anticipatory nudges are trending. | LOW | Pure frontend: derived from `todayHabits` state. When `(total - completed) <= 2 && completed > 0`, show persistent banner below aura gauge: "2 more for Kaio-ken x20!" or "Just 1 left -- go for 100%!" Pulse animation on the banner. Clear when habits are checked or day ends. No backend changes. |
| **Daily summary toast on last check** (feat 13) | Closure even on imperfect days. When the user finishes their last check (whether at 67% or 100%), a summary provides a "you're done" signal. Prevents the "did I do enough?" anxiety loop common with ADHD. | LOW | Frontend: detect when the last unchecked habit gets checked (or all habits are done). Show react-hot-toast summary: "Today: 5/6 habits | 83% | +125 XP | Kaio-ken x10". Already using react-hot-toast in the project. For non-perfect days, this replaces the Perfect Day explosion with a quieter but still positive closure moment. |
| **Temporary habit support** (feat 15) | `is_temporary`, `start_date`, `end_date` fields exist in Habit model and are part of the Pydantic schema. Frontend form does not expose them. Useful for 30-day challenges or seasonal habits. | LOW | Frontend: add `is_temporary` toggle to HabitForm. When toggled on, show start_date and end_date date pickers. Backend already handles these fields in create/update. VERIFY: `get_habits_due_on_date()` in `habit_service.py` must filter by `start_date <= today <= end_date` for temporary habits. If not, add that filter. |
| **Custom frequency day picker** (feat 16) | Frequency "custom" option and `custom_days` field exist. HabitForm.tsx already has `DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']` and `customDays` state. UI may need polish for tappable pill-style day buttons. | LOW | Frontend: verify the existing custom day selector works end-to-end. If it uses checkboxes, upgrade to tappable pill-style buttons (rounded, colored when selected, gray when not). Minimal work -- mostly CSS/styling. |

### Anti-Features (Commonly Requested, Often Problematic)

Features to explicitly avoid during v1.2 implementation.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Push/browser notifications** | "Remind me to do habits" | Single-user local app, no service worker. Browser notification permission UX is hostile. Sergio opens the app intentionally. ADHD users experience external notifications as nagging, not motivation. | Vegeta roast on return handles "you forgot" with charm. "You're close!" nudge works in-app when already engaged. |
| **Undo streak break / manual streak edit** | "I forgot to mark yesterday" | Undermines Zenkai recovery (the forgiveness mechanic). Manual editing breaks trust in the progression system. If streaks can be edited, they lose meaning. | Zenkai halving IS the forgiveness. Off-days handle planned absences. Two mechanisms is enough. |
| **Batch "complete all" button** | "Let me check everything at once" | Destroys the entire dopamine loop. Each check = sound + visual + XP popup + capsule chance. Batching kills the drip feed that makes the app work. | The sequential check experience IS the product. Each check must be its own moment. |
| **Complex per-habit trend charts** | "Show me a line graph for each habit" | Scope creep into analytics platform. Contribution grid + calendar covers the use case. Full trend charts per habit is over-engineering for one user. | Contribution graph (90-day grid) + per-habit calendar + stats endpoint provide sufficient per-habit insight. |
| **Streak freeze / streak protection items** | Common in Duolingo/gamified apps | Competes with off-day system AND Zenkai recovery. Three streak-protection mechanisms creates confusion and undermines the Saiyan "come back stronger" narrative. | Off-days for planned breaks, Zenkai for unplanned breaks. The duality is intentional. |
| **Global reminder/scheduling system** | Standard in habit tracker apps | Over-engineered for single-user. Adds notification permission complexity with no value for someone who opens the app by choice. | Make app so rewarding that dopamine IS the reminder. |
| **Achievement sharing / social export** | "Share my progress" | Solo tracker by design. Social features add complexity for zero users. Sharing screenshots works fine organically. | Defer to v2+ if ever needed. |

## Feature Dependencies

```
[Achievement System (3)]
    Foundation for recording milestones and unlocks.
    Must be built first among the gamification features.
    |
    +--<-- [Streak Milestones (2)] depends on Achievement System
    |       Milestone detection during check_habit needs
    |       achievement service to persist badges.
    |
    +--<-- [Transformation unlock recording]
            Already happens in power_service but not
            persisted as achievements.

[Per-habit Calendar + Stats API (9)]
    |
    +--<-- [Calendar Day Popover (8)] depends on per-habit data
            Popover needs to show which habits were
            completed/missed on a clicked date.

[PUT /habits/reorder API (7 backend)]
    |
    +--<-- [Habit Drag-and-Drop UI (7 frontend)]
            dnd-kit work is wasted without persistence.

[Backend check_habit response enhancement (10 backend)]
    |
    +--<-- [Attribute Level-Up Animation (10 frontend)]
            Frontend can't celebrate what it doesn't know about.

[Vegeta Escalation (1)]
    Independent -- needs missed day detection logic.
    Uses existing streak.last_active_date + off_day data.
    Uses existing quote severity field.

[Capsule History View (5a)] -- uses existing API, no backend work
[Wish History View (5b)] -- uses existing API, no backend work
[Contribution Graphs (4)] -- uses existing API, no backend work
[Zenkai Animation (6)] -- uses existing response flag, no backend work
["You're Close" Nudge (12)] -- pure frontend derived state
[Daily Summary Toast (13)] -- pure frontend, uses react-hot-toast
[Power Level Milestones (11)] -- pure frontend comparison
[Archived Habits (14)] -- leverages existing soft-delete, needs 2 endpoints
[Temporary Habits (15)] -- model fields exist, frontend form update + verify backend filter
[Custom Frequency Picker (16)] -- UI polish on existing selector
[Real Audio Sprites (17)] -- asset work, no code logic changes
[recharts tech debt (18)] -- dependency management only
```

### Dependency Notes

- **Streak Milestones (2) requires Achievement System (3):** Milestone badges need to be persisted as achievements. Build achievement service first, then add milestone detection hook in the streak update flow.
- **Calendar Popover (8) requires Per-habit API (9):** The popover needs per-habit breakdown data for a specific date. Without the API, the popover has nothing to show.
- **Attribute Level-Up (10) requires backend changes:** The current check_habit response does not indicate whether an attribute level changed. The `attribute_service.py` already has `get_level_for_xp()` and title lookup -- it just needs to compare before/after and include the delta in the response.
- **Habit Drag-and-Drop (7) is split:** Backend endpoint must exist before frontend dnd-kit integration. The sort_order field is already in the model.
- **6 features need zero backend work:** Features 4, 5a, 5b, 6, 11, 12, 13 all use existing API data or local state. These can be built in parallel with backend work.

## Build Priority and Phasing Recommendation

### Phase A: Backend Foundation (APIs that unblock frontend work)

| Feature | What to Build | Why First |
|---------|---------------|-----------|
| Achievement service + API (3) | `achievement_service.py`, GET /achievements endpoint | Unblocks streak milestones and transformation recording |
| Streak milestone detection (2 backend) | Hook into `update_overall_streak` to detect milestone crossings | Depends on achievement service |
| Vegeta escalation logic (1 backend) | Missed day detection + severity-filtered quote selection | Independent, high-value |
| PUT /habits/reorder (7 backend) | Batch sort_order update endpoint | Unblocks drag-and-drop UI |
| Per-habit calendar + stats API (9) | Two new endpoints | Unblocks calendar popover |
| Archived habits endpoints (14 backend) | GET /habits/archived + PUT /habits/{id}/restore | Unblocks archive UI |
| Attribute level-up in response (10 backend) | Enhance check_habit to return level change info | Unblocks level-up animation |

### Phase B: Pure Frontend Features (existing APIs, no backend needed)

| Feature | What to Build | Complexity |
|---------|---------------|------------|
| Capsule history view (5a) | Scrollable list in Analytics | LOW |
| Wish history view (5b) | Scrollable list in Analytics | LOW |
| Per-habit contribution graphs (4) | Custom SVG 90-day grid | MEDIUM |
| "You're close!" nudge (12) | Conditional banner from todayHabits state | LOW |
| Daily summary toast (13) | react-hot-toast on last check | LOW |
| Power level milestones (11) | Before/after comparison + fanfare | LOW |

### Phase C: Animations + Visual Polish

| Feature | What to Build | Complexity |
|---------|---------------|------------|
| Zenkai recovery animation (6) | Animation overlay on zenkai_activated | LOW |
| Attribute level-up animation (10 frontend) | Level-up overlay + title reveal | MEDIUM |
| Streak milestone notifications (2 frontend) | Badge reveal + character quote animation | MEDIUM |
| Vegeta escalation UI (1 frontend) | Severity-scaled roast display on dashboard | LOW |

### Phase D: UI Enhancements

| Feature | What to Build | Complexity |
|---------|---------------|------------|
| Habit drag-and-drop (7 frontend) | dnd-kit sortable list + persist via reorder API | MEDIUM |
| Calendar day popover (8) | Clickable calendar cells + popover with per-habit data | MEDIUM |
| Archived habits view (14 frontend) | Settings section with archived list + restore | LOW |
| Temporary habit date pickers (15) | HabitForm toggle + date inputs | LOW |
| Custom frequency day picker (16) | Pill-style tappable day buttons | LOW |

### Phase E: Tech Debt + Assets

| Feature | What to Build | Complexity |
|---------|---------------|------------|
| Real audio sprites (17) | Source sounds, build sprite, update config | MEDIUM |
| recharts react-is (18) | Check upstream fix, remove override if possible | LOW |

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority | Existing Infrastructure |
|---------|------------|---------------------|----------|------------------------|
| Achievement system (3) | HIGH | MEDIUM | P1 | DB model exists, needs service + API |
| Streak milestones + badges (2) | HIGH | MEDIUM | P1 | Constants defined, achievement model ready |
| Vegeta escalation roasts (1) | HIGH | MEDIUM | P1 | Quote severity field exists, needs detection |
| Capsule history view (5a) | MEDIUM | LOW | P1 | API endpoint exists and returns data |
| Wish history view (5b) | MEDIUM | LOW | P1 | API endpoint exists and returns data |
| "You're close!" nudge (12) | HIGH | LOW | P1 | Pure frontend, todayHabits state |
| Per-habit contribution graphs (4) | MEDIUM | MEDIUM | P1 | API endpoint exists and returns data |
| Daily summary toast (13) | MEDIUM | LOW | P1 | react-hot-toast already in project |
| Calendar day popover (8) | MEDIUM | MEDIUM | P2 | Needs API extension for per-habit data |
| Per-habit calendar + stats API (9) | MEDIUM | MEDIUM | P2 | Standard queries, enables popover |
| Zenkai recovery animation (6) | MEDIUM | LOW | P2 | Response flag exists, needs overlay |
| Attribute level-up animation (10) | MEDIUM | MEDIUM | P2 | Backend response enhancement needed |
| Habit drag-and-drop (7) | MEDIUM | MEDIUM | P2 | sort_order field exists, needs API + dnd-kit |
| Power level milestones (11) | LOW | LOW | P2 | Pure frontend comparison |
| Archived habits (14) | LOW | LOW | P2 | Soft delete exists, needs list + restore |
| Real audio sprites (17) | HIGH | MEDIUM | P2 | Howler.js sprite system in place |
| Temporary habits (15) | LOW | LOW | P3 | Model fields exist, form update only |
| Custom frequency picker (16) | LOW | LOW | P3 | Partial UI exists, polish only |
| recharts tech debt (18) | LOW | LOW | P3 | Override works, check for upstream fix |

**Priority key:**
- P1: High-value features or low-hanging fruit with existing infrastructure
- P2: Important features that require more work or depend on P1
- P3: Low-value polish, defer to end

## Competitor Feature Analysis

| Feature | Habitica | Streaks (iOS) | Atoms (Atomic Habits) | Saiyan Tracker v1.2 Approach |
|---------|----------|---------------|----------------------|------------------------------|
| Streak milestones | Generic level-up notification | Streak count only | Simple streaks | DBZ-themed badges with character quotes per milestone (Piccolo at 21, Whis at 60) |
| Achievement system | 200+ achievements, deep RPG system | None | Minimal | Focused set: transformation unlocks + streak milestones. Quality over quantity. |
| Missed day feedback | HP loss (punitive) | Streak resets (punitive) | None | Vegeta escalating roasts (humorous, escalating severity). Entertaining, never punishing. |
| Contribution graph | None | None | None | GitHub-style per-habit 90-day grid. Unique in habit tracker space. |
| History views | Basic task logs | Calendar only | Minimal | Capsule drop history + wish grant history. Unique gamification artifacts. |
| Drag-and-drop | Yes | Limited | No | dnd-kit vertical list reorder. Touch + keyboard accessible. |
| Nudge/motivation | Party pressure (social) | Streak fear | Push notifications | In-app "You're close!" banner + daily summary toast. Positive, not punitive. |
| Archive/restore | Yes (soft delete) | Yes | No | Soft-delete with archived view + one-click restore. |
| Temporary habits | No (habits/dailies/todos) | No | No | Start/end date for time-boxed challenges. Unique feature. |
| Level-up celebrations | Basic "Level X!" toast | None | None | Attribute-specific level-up animation with title reveal ("STR Level 10: Warrior!") |
| Round number celebrations | None | None | None | Power level milestone fanfare at 1K, 5K, 10K, etc. Unique dopamine moments between transformations. |
| Audio on every interaction | None | None | None | Full audio sprite with 13+ real sounds. No competitor does this. |

## Sources

- [Reclaim: 10 Best Habit Tracker Apps 2026](https://reclaim.ai/blog/habit-tracker-apps) -- feature expectations and market patterns
- [Trophy: 20 Productivity App Gamification Examples 2025](https://trophy.so/blog/productivity-gamification-examples) -- gamification design patterns
- [Habitica](https://habitica.com) -- RPG habit tracker, achievement system and HP-based punishment model reference
- [dnd-kit](https://dndkit.com/) -- recommended React drag-and-drop library (modular, lightweight, accessible)
- [dnd-kit sortable preset docs](https://docs.dndkit.com/presets/sortable) -- vertical list reorder pattern
- [Puck: Top 5 DnD Libraries for React 2026](https://puckeditor.com/blog/top-5-drag-and-drop-libraries-for-react) -- confirms dnd-kit as top choice
- [@uiw/react-heat-map](https://github.com/uiwjs/react-heat-map) -- heatmap component reference
- [Knock: Top 9 React Notification Libraries 2026](https://knock.app/blog/the-top-notification-libraries-for-react) -- confirms react-hot-toast and sonner as top choices
- [LogRocket: React Toast Libraries 2025](https://blog.logrocket.com/react-toast-libraries-compared-2025/) -- react-hot-toast already in project, sufficient for daily summary toast
- [Howler.js](https://howlerjs.com/) -- audio sprite documentation and best practices
- [audiosprite GitHub](https://github.com/tonistiigi/audiosprite) -- sprite generation tool for Howler.js
- [Cohorty: Best Habit Tracker Apps with Reminders 2025](https://www.cohorty.app/blog/best-habit-tracker-apps-with-reminders-smart-notifications-2025) -- nudge patterns and smart reminders
- [Freesound.org](https://freesound.org/) -- CC0 sound effects source
- [HabitKit](https://www.habitkit.app/) -- archive/restore UX pattern reference
- [Habitify](https://habitify.me/) -- nudge timing and smart reminder patterns

---
*Feature research for: Saiyan Tracker v1.2 PRD Complete*
*Researched: 2026-03-06*
