# Architecture Research: v1.2 Feature Integration

**Domain:** Feature integration into existing DBZ habit tracker (v1.2 milestone)
**Researched:** 2026-03-06
**Confidence:** HIGH (based on direct codebase analysis of all touchpoints)

## Existing Architecture Overview

```
Frontend (React 19 + Zustand + Motion)
 +---------------------------------------------------------+
 |  Pages: Dashboard | Analytics | Settings                |
 |  +---------+  +-----------+  +-----------+              |
 |  |HeroSect.|  |CalHeatmap |  |RewardSect.|              |
 |  |HabitList|  |AttrChart  |  |WishSect.  |              |
 |  |StatsPane|  |PowerChart |  |CategoryS. |              |
 |  |HabitCard|  |StatCards  |  |PrefsS.    |              |
 |  +---------+  +-----------+  +-----------+              |
 |                                                         |
 |  Stores: habitStore | powerStore | rewardStore | uiStore|
 |                                                         |
 |  AnimationPlayer (queue consumer, root-level)           |
 |   -> PerfectDay | CapsuleDrop | DragonBall | Transform  |
 |   -> Shenron | XpPopup | TierChange                     |
 +---------------------------------------------------------+
          |  ky HTTP client (services/api.ts)
          v
 Backend (FastAPI + SQLAlchemy 2.0 + SQLite)
 +---------------------------------------------------------+
 |  9 API Routers:                                         |
 |   habits | analytics | power | quotes | rewards         |
 |   wishes | off-days | categories | settings             |
 |                                                         |
 |  Services Layer (pure functions, no session.add):       |
 |   habit_service.check_habit() orchestrates:             |
 |    -> xp_service     (calc_daily_xp, get_attribute_xp)  |
 |    -> streak_service  (update_overall, update_habit)     |
 |    -> capsule_service (roll_capsule_drop)                |
 |    -> dragon_ball_service (award/revoke)                 |
 |    -> power_service   (recalculate, check_transform)    |
 |                                                         |
 |  15 SQLAlchemy Models (Achievement model exists but     |
 |   has NO service, NO endpoints)                         |
 +---------------------------------------------------------+
          |
          v
 SQLite (saiyan_tracker.db)
```

### Critical Data Flow: check_habit()

This is the architectural centerpiece. Every habit tap flows through:

```
User tap -> habitStore.checkHabit() [optimistic toggle]
  -> POST /habits/{id}/check
    -> habit_service.check_habit() [10-step atomic transaction]
      1. Toggle HabitLog
      2. Award/claw-back attribute XP
      3. Update DailyLog (completion rate, tier)
      4. Check Zenkai recovery (first log of day)
      5. Update overall + habit streaks
      6. Recalculate daily XP
      7. Update power level + transformation
      8. Handle Dragon Ball award/revoke
      9. Roll capsule RNG
     10. Flush (no commit - caller commits)
    -> API layer: enrich capsule, select quote, shape response
  <- CheckHabitResponse (18 fields including nested objects)
  -> habitStore: update local habit state from server
  -> powerStore.updateFromCheck()
  -> uiStore.enqueueAnimation() [0-N events queued]
  -> AnimationPlayer: consume queue sequentially (AnimatePresence mode="wait")
```

## Integration Analysis: All Features

### Group 1: Backend Service Additions (Hook into check_habit())

These features require new services that plug into the existing `check_habit()` orchestration pipeline.

#### 1. Achievement Service + API

**What exists:** `Achievement` model with `achievement_type`, `achievement_key`, `milestone_type`, `unlocked_at`, `metadata_json`. No service, no endpoints, no relationship used.

**Integration points:**
- NEW: `backend/app/services/achievement_service.py` -- `check_achievements(db, user_id, result_dict) -> list[Achievement]`
- MODIFY: `habit_service.check_habit()` -- add Step 10.5: call `check_achievements()` after flush, return new achievements in response
- MODIFY: `CheckHabitResponse` schema -- add `achievements: list[AchievementDetail] | None`
- NEW: `backend/app/api/v1/achievements.py` -- `GET /achievements/` (list all unlocked), `GET /achievements/recent` (last 7 days)
- NEW: `backend/app/schemas/achievement.py` -- `AchievementResponse`, `AchievementDetail`
- MODIFY: API router registration in `__init__.py`

**Pattern:** Achievement service receives the full `check_habit()` result dict and checks against rules (streak milestones, transformation unlocks, attribute level-ups, perfect day counts). Returns list of newly unlocked achievements. This is a read-then-write pattern: query existing achievements, compare against thresholds, insert new ones.

**Frontend:**
- MODIFY: `habitStore.checkHabit()` -- read `result.achievements`, enqueue animation events
- MODIFY: `uiStore.AnimationEvent` type union -- add `{ type: 'achievement'; title: string; description: string }`
- NEW: `components/animations/AchievementOverlay.tsx`
- MODIFY: `AnimationPlayer.renderOverlay()` -- add achievement case
- NEW: `components/analytics/AchievementList.tsx` or `components/settings/AchievementSection.tsx`

#### 2. Vegeta Roast Detection Service

**What exists:** Quote model has `severity` field (mild/medium/savage). `trigger_event` includes "roast". Constants define `VALID_SEVERITIES`. No logic to detect missed days or select severity-scaled roasts.

**Integration points:**
- NEW: `backend/app/services/roast_service.py` -- `detect_roast_context(db, user_id, local_date) -> RoastContext | None`
  - Logic: count consecutive missed days (gap between last_active_date and today, minus off-days)
  - Severity mapping: 1 day = mild, 2-3 days = medium, 4+ days = savage
- MODIFY: `habits.py` router `select_quote_for_context()` -- add roast priority check (if returning after gap AND is first check of day)
- MODIFY: Quote query in `select_quote_for_context()` -- filter by `severity` when trigger is "roast"
- MODIFY: `CheckHabitResponse` -- the existing `quote` field already supports this, no schema change needed

**Pattern:** Roast detection happens at the API layer (not in `check_habit()` service) because it only affects quote selection, not game state. The Zenkai recovery info already computed in Step 4 provides the gap detection data -- reuse `zenkai_info` to determine if a roast is appropriate.

**Frontend:**
- MODIFY: `CharacterQuote.tsx` -- add Vegeta-specific styling/animation when quote character is "vegeta" and trigger is "roast"
- No new store changes needed -- quote is already in CheckHabitResponse

#### 3. Streak Milestone Detection

**What exists:** `STREAK_MILESTONES = [3, 7, 21, 30, 60, 90, 365]` constant defined but unused. `streak_service.update_overall_streak()` returns current/best streak. `trigger_event` includes "streak_milestone".

**Integration points:**
- MODIFY: `streak_service.update_overall_streak()` -- after incrementing streak, check if `new_value in STREAK_MILESTONES`, return `milestone_reached: int | None` in result dict
- MODIFY: `habit_service.check_habit()` -- pass streak milestone info through to response
- MODIFY: `CheckHabitResponse` -- add `streak_milestone: int | None`
- This feeds into Achievement service (streak milestones create achievements)

**Frontend:**
- MODIFY: `habitStore.checkHabit()` -- check `result.streak_milestone`, enqueue animation
- MODIFY: `uiStore.AnimationEvent` -- add `{ type: 'streak_milestone'; days: number }`
- NEW: `components/animations/StreakMilestoneOverlay.tsx`
- MODIFY: `AnimationPlayer.renderOverlay()` -- add streak_milestone case

#### 4. Attribute Level-Up Detection

**What exists:** `ATTRIBUTE_TITLES` with level thresholds per attribute. `ATTRIBUTE_LEVEL_FORMULA_EXPONENT = 1.5`. XP is awarded in `check_habit()` Step 2. No level-up detection occurs.

**Integration points:**
- NEW or MODIFY: `backend/app/services/attribute_service.py` -- add `check_attribute_level_up(old_xp, new_xp, attribute) -> LevelUpInfo | None`
  - Uses formula: `level = floor((xp / 100) ^ (1/1.5))`
  - Compare old_level vs new_level
  - Check if new_level matches any `ATTRIBUTE_TITLES` threshold
- MODIFY: `habit_service.check_habit()` Step 2 -- capture old_xp before award, call `check_attribute_level_up()`, include in response
- MODIFY: `CheckHabitResponse` -- add `attribute_level_up: AttributeLevelUp | None` with fields `attribute`, `new_level`, `title_unlocked`

**Frontend:**
- MODIFY: `habitStore.checkHabit()` -- check `result.attribute_level_up`, enqueue animation
- MODIFY: `uiStore.AnimationEvent` -- add `{ type: 'attribute_level_up'; attribute: string; level: number; title?: string }`
- NEW: `components/animations/AttributeLevelUpOverlay.tsx`

### Group 2: New API Endpoints (No check_habit() Changes)

#### 5. Drag-and-Drop Reordering

**What exists:** `Habit.sort_order` field (default=0). No reorder endpoint. Frontend `HabitList` renders habits but has no DnD.

**Integration points:**
- NEW: `PUT /habits/reorder` endpoint in `habits.py` router
  - Body: `{ habit_ids: list[UUID] }` -- ordered list, index becomes sort_order
  - Updates `sort_order` for each habit in one transaction
- MODIFY: `today_list` endpoint -- add `.order_by(Habit.sort_order)` to query
- NEW: `HabitReorderRequest` schema

**Frontend:**
- MODIFY: `services/api.ts` -- add `habitsApi.reorder(ids: string[])`
- MODIFY: `habitStore` -- add `reorderHabits(ids: string[])` action with optimistic reorder
- MODIFY: `HabitList.tsx` -- integrate `@dnd-kit/core` + `@dnd-kit/sortable` for drag handles
- NEW dependency: `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`

**Pattern:** Use `@dnd-kit` because it is the standard React DnD library with excellent touch support (critical for mobile-first habit tracker). Optimistic reorder: update local sort order immediately, PUT to API, rollback on failure.

#### 6. Per-Habit Calendar + Stats API

**What exists:** `GET /habits/{id}/contribution-graph` returns daily booleans. No per-habit calendar with detailed stats.

**Integration points:**
- NEW: `GET /habits/{id}/calendar` endpoint -- returns per-habit daily data for a month (completed dates, streak at each point)
- NEW: `GET /habits/{id}/stats` endpoint -- returns habit-specific stats (total completions, current streak, best streak, completion rate by weekday)
- NEW schemas: `HabitCalendarDay`, `HabitStats`

**Frontend:**
- MODIFY: `services/api.ts` -- add `habitsApi.calendar()`, `habitsApi.stats()`
- These feed the per-habit contribution graph and calendar popover features

#### 7. Calendar Day Popover (Per-Habit Breakdown)

**What exists:** `CalendarHeatmap` has `selectedDay` state and a basic tooltip showing tier/XP/off-day. No per-habit breakdown.

**Integration points:**
- NEW: `GET /habits/calendar/day-detail?date=YYYY-MM-DD` endpoint -- returns list of habits due that day with completion status
- NEW schema: `CalendarDayDetail` with `habits: list[HabitDayStatus]`
- MODIFY: `CalendarHeatmap.tsx` -- on day click, fetch day detail, render expanded popover with per-habit list
- NEW: `components/analytics/CalendarDayPopover.tsx` -- shows habit-by-habit breakdown for selected day

**Pattern:** Lazy-load day detail on click (not preloaded for every day). Show loading spinner in popover while fetching. Cache fetched days in component state to avoid refetch.

#### 8. Archived Habits Endpoints

**What exists:** `DELETE /habits/{id}` soft-deletes (sets `is_active = false`). No way to view or restore archived habits.

**Integration points:**
- NEW: `GET /habits/archived` endpoint -- returns habits where `is_active == False`
- NEW: `PUT /habits/{id}/restore` endpoint -- sets `is_active = True`
- NEW schema: `HabitArchivedResponse`
- MODIFY: `services/api.ts` -- add `habitsApi.archived()`, `habitsApi.restore()`

### Group 3: New Animation Types (Frontend Queue Extension)

These add new animation event types to the existing queue system. Backend detection logic from Group 1 feeds data; these are the visual consumers.

#### 9. Power Level Milestone Celebrations

**Integration points:**
- MODIFY: `habit_service.check_habit()` -- after Step 7 (power level update), check if power level crossed a milestone (1K, 5K, 10K, 50K, 100K)
- MODIFY: `CheckHabitResponse` -- add `power_milestone: int | None`
- MODIFY: `uiStore.AnimationEvent` -- add `{ type: 'power_milestone'; level: number }`
- NEW: `components/animations/PowerMilestoneOverlay.tsx`
- MODIFY: `habitStore.checkHabit()` -- enqueue power_milestone animation

#### 10. Zenkai Recovery Animation

**What exists:** `zenkai_activated` field already in `CheckHabitResponse`. `habitStore.checkHabit()` does NOT currently enqueue any animation for Zenkai.

**Integration points:**
- MODIFY: `habitStore.checkHabit()` -- add Zenkai animation enqueue when `result.zenkai_activated === true`
- MODIFY: `uiStore.AnimationEvent` -- add `{ type: 'zenkai_recovery'; halvedFrom: number; newStreak: number }`
- MODIFY: `CheckHabitResponse` -- add `zenkai_halved_from: int | None` (currently only in streak_result, not surfaced to response)
- NEW: `components/animations/ZenkaiRecoveryOverlay.tsx`

### Group 4: New UI Components (Frontend Only, No Backend Changes)

#### 11. Capsule Drop History View

**What exists:** `GET /analytics/capsule-history` API endpoint returns `CapsuleHistoryItem[]`. `analyticsApi.capsuleHistory()` exists in `services/api.ts`. No UI component renders this data.

**Integration points:**
- NEW: `components/analytics/CapsuleHistoryList.tsx` -- scrollable list with rarity color coding
- MODIFY: Analytics page -- add tab or section for capsule history
- No backend changes needed

#### 12. Wish Grant History View

**What exists:** `GET /analytics/wish-history` API endpoint. `analyticsApi.wishHistory()` exists. No UI.

**Integration points:**
- NEW: `components/analytics/WishHistoryList.tsx` -- timeline of granted wishes
- MODIFY: Analytics page -- add tab or section
- No backend changes needed

#### 13. Per-Habit Contribution Graphs

**What exists:** `GET /habits/{id}/contribution-graph` API endpoint returns `ContributionDay[]` (date + completed boolean). `habitsApi.contributionGraph()` exists. No UI renders it.

**Integration points:**
- NEW: `components/analytics/ContributionGraph.tsx` -- GitHub-style 90-day grid
- MODIFY: Analytics page -- add per-habit contribution section with habit selector dropdown
- No backend changes needed

#### 14. Nudge Banner ("You're Close!")

**Integration points:**
- NEW: `components/dashboard/NudgeBanner.tsx` -- derived from `habitStore.todayHabits`
  - Logic: `remaining = todayHabits.filter(h => !h.completed).length`
  - Show when `remaining === 1 || remaining === 2` AND `todayHabits.length >= 3`
  - Display: "Just {remaining} more! You got this!" with pulsing animation
- MODIFY: `Dashboard.tsx` -- render NudgeBanner between StatsPanel and HabitList
- Pure frontend derivation, no API needed

#### 15. Daily Summary Toast

**Integration points:**
- MODIFY: `habitStore.checkHabit()` -- after processing, check if all habits are now completed
  - If `todayHabits.every(h => h.completed)` after update: perfect day (already handled by animation)
  - If this is a non-perfect final check: summary toast with XP/streak info
- NEW: `components/dashboard/DailySummaryToast.tsx` -- custom toast with XP earned, streak info, completion rate
- Uses existing `react-hot-toast` for positioning

#### 16. Temporary Habit UI (Start/End Date)

**What exists:** `Habit` model has `is_temporary`, `start_date`, `end_date` fields. Backend fully supports them. Frontend `HabitForm` sets `start_date` to today on create but does NOT expose `is_temporary` or `end_date`.

**Integration points:**
- MODIFY: `HabitForm.tsx` -- add "Temporary Habit" toggle in "More options" section
  - When toggled: show date pickers for start_date and end_date
  - Set `is_temporary: true` in create/update payload
- MODIFY: `HabitCard.tsx` -- show visual indicator (badge/icon) for temporary habits
  - Show remaining days: `end_date - today` countdown
- No backend changes needed

#### 17. Custom Frequency Day Picker Enhancement

**What exists:** `HabitForm.tsx` already has custom day picker with `DAY_LABELS` and `toggleCustomDay()`. The UI shows Mon-Sun buttons when frequency is "custom".

**Assessment:** The basic UI is ALREADY IMPLEMENTED. However, there is a potential index mismatch bug (see Potential Bugs section). The enhancement needed is visual polish and UX improvements to the existing picker.

#### 18. Archived Habits View + Restore (Frontend)

**Integration points:**
- NEW: `components/settings/ArchivedHabitsSection.tsx` -- list archived habits with restore button
- MODIFY: Settings page -- add Archived Habits collapsible section
- Depends on Group 2 archived habits endpoints

#### 19. Achievement Display (Frontend)

**Integration points:**
- NEW: `components/analytics/AchievementGrid.tsx` or section -- display unlocked achievements with icons
- MODIFY: Analytics page -- add achievements section
- Depends on Group 1 achievement service + API

## Component Responsibilities (New + Modified)

| Component | Type | Responsibility | Communicates With |
|-----------|------|----------------|-------------------|
| `achievement_service` | NEW backend | Detect achievements from check_habit result | check_habit(), Achievement model |
| `roast_service` | NEW backend | Detect missed-day gap, map to severity | streak data, Quote model |
| `AchievementOverlay` | NEW frontend | Full-screen achievement unlock animation | AnimationPlayer, uiStore |
| `StreakMilestoneOverlay` | NEW frontend | Streak milestone celebration | AnimationPlayer, uiStore |
| `AttributeLevelUpOverlay` | NEW frontend | Attribute level-up with title reveal | AnimationPlayer, uiStore |
| `PowerMilestoneOverlay` | NEW frontend | Power level round-number celebration | AnimationPlayer, uiStore |
| `ZenkaiRecoveryOverlay` | NEW frontend | Zenkai recovery visual feedback | AnimationPlayer, uiStore |
| `NudgeBanner` | NEW frontend | "Almost there" motivational banner | habitStore (derived) |
| `DailySummaryToast` | NEW frontend | End-of-day closure toast | habitStore, react-hot-toast |
| `CapsuleHistoryList` | NEW frontend | Render capsule drop timeline | analyticsApi |
| `WishHistoryList` | NEW frontend | Render wish grant timeline | analyticsApi |
| `CalendarDayPopover` | NEW frontend | Per-habit day breakdown | new API endpoint |
| `ContributionGraph` | NEW frontend | Per-habit 90-day grid | habitsApi.contributionGraph() |
| `ArchivedHabitsSection` | NEW frontend | View/restore archived habits | new API endpoints |
| `AchievementGrid` | NEW frontend | Display unlocked achievements | new API endpoints |

## Modified Data Flows

### Enhanced check_habit() Response Flow

```
check_habit() existing 10 steps
  + Step 2.5: Check attribute level-up (old_xp vs new_xp)
  + Step 5.5: Check streak milestone (current_streak in STREAK_MILESTONES)
  + Step 7.5: Check power milestone (crossed 1K/5K/10K/50K/100K)
  + Step 10.5: Check achievements (pass full result to achievement_service)

Enhanced CheckHabitResponse adds:
  + achievements: list[AchievementDetail] | None
  + streak_milestone: int | None
  + attribute_level_up: AttributeLevelUp | None
  + power_milestone: int | None
  + zenkai_halved_from: int | None

habitStore.checkHabit() animation enqueue additions:
  + if result.achievements -> enqueue per achievement
  + if result.streak_milestone -> enqueue streak_milestone
  + if result.attribute_level_up -> enqueue attribute_level_up
  + if result.power_milestone -> enqueue power_milestone
  + if result.zenkai_activated -> enqueue zenkai_recovery
```

### Animation Queue Extension

```
Existing AnimationEvent types (7):
  tier_change | perfect_day | capsule_drop | dragon_ball |
  transformation | xp_popup | shenron

New AnimationEvent types (5):
  achievement | streak_milestone | attribute_level_up |
  power_milestone | zenkai_recovery

QUEUED_TYPES set in AnimationPlayer must include new overlay types.
AnimationPlayer.renderOverlay() switch must handle new cases.
```

### New Independent Data Flows

```
Drag-and-drop reorder:
  User drag -> habitStore.reorderHabits() [optimistic] -> PUT /habits/reorder -> confirm/rollback

Calendar day detail:
  Day click -> CalendarHeatmap -> fetch GET /habits/calendar/day-detail?date=X -> CalendarDayPopover

Archived habits:
  Settings -> ArchivedHabitsSection -> GET /habits/archived -> render list
  Restore click -> PUT /habits/{id}/restore -> refetch list

Nudge banner (pure derived state):
  habitStore.todayHabits -> NudgeBanner derives remaining count -> conditional render
```

## Suggested Build Order (Dependency-Aware)

### Phase 1: Backend Detection Services

Build order within phase:

1. **Streak milestone detection** -- modify `streak_service.update_overall_streak()`, simplest change (1 constant lookup)
2. **Attribute level-up detection** -- new function in `attribute_service`, requires XP math
3. **Power milestone detection** -- add to `power_service`, simple threshold crossing check
4. **Achievement service** -- depends on all above detections to populate achievement types
5. **Roast detection service** -- independent, reuses Zenkai gap detection data
6. **Reorder endpoint** -- independent, new `PUT /habits/reorder`
7. **Calendar day-detail endpoint** -- independent, new query endpoint
8. **Archived habits endpoints** -- independent, `GET /habits/archived` + `PUT /habits/{id}/restore`
9. **Per-habit calendar/stats endpoints** -- independent, new query endpoints

**Rationale:** Detection services must exist before frontend can consume their data. Achievement service depends on streak/attribute/power detections being in the response. Roast and CRUD endpoints are independent.

### Phase 2: check_habit() Response Extension

1. **Extend CheckHabitResponse schema** -- add all new optional fields
2. **Wire detections into check_habit()** -- insert new steps (2.5, 5.5, 7.5, 10.5)
3. **Update API layer** -- shape new response fields in `check_habit_endpoint()`
4. **Update roast logic in quote selection** -- modify `select_quote_for_context()`

**Rationale:** All backend detections feed through one response. Extending the schema and wiring in one phase prevents partial integration states.

### Phase 3: Animation Overlays (frontend)

1. **Extend `AnimationEvent` type union** -- add 5 new event types
2. **Update `QUEUED_TYPES` set** in AnimationPlayer
3. **Build overlay components** in dependency order:
   - `ZenkaiRecoveryOverlay` (simplest, single message)
   - `StreakMilestoneOverlay` (number + message)
   - `PowerMilestoneOverlay` (number + celebration)
   - `AttributeLevelUpOverlay` (attribute + level + optional title)
   - `AchievementOverlay` (title + description + icon)
4. **Update `renderOverlay()` switch** in AnimationPlayer
5. **Update `habitStore.checkHabit()`** -- add enqueue calls for new event types

**Rationale:** Animation components are independent of each other but all depend on the extended AnimationEvent type. Build simplest first to validate the pattern.

### Phase 4: Dashboard Enhancements

1. **NudgeBanner** -- pure derived state, no API dependency
2. **DailySummaryToast** -- hooks into existing checkHabit flow
3. **HabitForm enhancements** -- temporary habit toggle + date pickers
4. **HabitCard badges** -- temporary habit indicator, streak milestone badges

**Rationale:** Dashboard features are independent and user-facing. NudgeBanner is trivial. Form enhancements use existing backend fields.

### Phase 5: Drag-and-Drop + Analytics Views

1. **Install @dnd-kit** -- add dependency
2. **HabitList DnD** -- integrate sortable with optimistic reorder
3. **CapsuleHistoryList** -- render existing API data
4. **WishHistoryList** -- render existing API data
5. **ContributionGraph** -- render existing API data
6. **CalendarDayPopover** -- depends on Phase 1 day-detail endpoint

**Rationale:** DnD is the highest-complexity frontend feature. History views are data-display-only (API already exists). Group them because they are all independent UI additions.

### Phase 6: Settings + Achievement Display + Polish

1. **ArchivedHabitsSection** -- depends on Phase 1 endpoints
2. **AchievementGrid** -- display unlocked achievements
3. **Custom frequency day picker bug fix** -- verify 0-indexed vs 1-indexed day mapping
4. **Audio sprites** for new animation types
5. **Tech debt: recharts react-is resolution**

## Anti-Patterns to Avoid

### Anti-Pattern 1: Bloating check_habit() With Inline Feature Logic

**What people do:** Put achievement checking, roast detection, milestone checking directly inside `check_habit()` as inline code.
**Why it is wrong:** `check_habit()` is already 180+ lines orchestrating 10 services. Adding inline logic makes it untestable and unmaintainable.
**Do this instead:** Create discrete service functions (`check_achievements()`, `check_streak_milestone()`) that receive the result dict and return additional data. Keep `check_habit()` as an orchestrator that calls composable functions.

### Anti-Pattern 2: Fetching Day Detail for Every Calendar Cell

**What people do:** Preload per-habit breakdown for every day in the calendar month.
**Why it is wrong:** 30 API calls on calendar render. Most days will never be clicked.
**Do this instead:** Lazy-load day detail on click. Cache fetched days in component state. Show a loading indicator in the popover.

### Anti-Pattern 3: Bypassing the Animation Queue

**What people do:** Fire new animations (achievement, streak milestone) directly from components instead of going through `uiStore.enqueueAnimation()`.
**Why it is wrong:** The existing system uses `AnimatePresence mode="wait"` for sequential playback. Bypassing creates visual chaos where overlays stack.
**Do this instead:** All new animation types go through `uiStore.enqueueAnimation()`. Add new types to `QUEUED_TYPES` set. The AnimationPlayer handles sequencing automatically.

### Anti-Pattern 4: Separate API Calls for Each Detection

**What people do:** Add `GET /achievements/check`, `GET /streaks/milestone-check` as separate endpoints called after each habit check.
**Why it is wrong:** Creates race conditions, N+1 API calls, and the frontend must coordinate multiple responses.
**Do this instead:** All detections happen inside the `check_habit()` transaction. The single `CheckHabitResponse` carries all new data. One request, one response, one source of truth.

### Anti-Pattern 5: Global Store for Transient UI State

**What people do:** Add `nudgeBannerVisible`, `dailySummaryShown` to Zustand stores.
**Why it is wrong:** These are derived from existing state (`todayHabits`). Duplicating derivable state creates sync bugs.
**Do this instead:** Derive in the component: `const remaining = todayHabits.filter(h => !h.completed).length`. Use component-local state for dismiss behavior.

### Anti-Pattern 6: Putting DnD State in Zustand

**What people do:** Store drag-in-progress state, drag handle positions, and overlay coordinates in the global store.
**Why it is wrong:** Drag state changes at 60fps during active drag. Zustand updates trigger React re-renders. This creates jank.
**Do this instead:** Let `@dnd-kit` manage its own drag state internally. Only commit the final order to Zustand + API on `onDragEnd`.

## Potential Bug: Custom Day Index Mismatch

The frontend `HabitForm.tsx` uses 0-indexed days (Mon=0 through Sun=6 based on array index in `DAY_LABELS`). The backend `get_habits_due_on_date()` uses `target.isoweekday()` which returns Mon=1 through Sun=7. If a user selects Monday (index 0) in the frontend, the backend checks `0 in custom_days` against `isoweekday() == 1`, which will never match.

**This must be verified and fixed** before adding any frequency-related features. Either:
- Frontend should save 1-indexed values (Mon=1) -- align with `isoweekday()`
- Or backend should convert to 0-indexed before comparison

## Summary of Touchpoints

| Existing File | Modifications Needed |
|---------------|---------------------|
| `backend/app/services/habit_service.py` | Add steps 2.5, 5.5, 7.5, 10.5 for new detections |
| `backend/app/services/streak_service.py` | Return `milestone_reached` from `update_overall_streak()` |
| `backend/app/api/v1/habits.py` | Add reorder/archived/day-detail endpoints, modify quote selection for roasts |
| `backend/app/schemas/check_habit.py` | Add 5 new optional fields to CheckHabitResponse |
| `frontend/src/store/uiStore.ts` | Add 5 new AnimationEvent types |
| `frontend/src/store/habitStore.ts` | Add reorder action, enqueue new animation types in checkHabit |
| `frontend/src/components/animations/AnimationPlayer.tsx` | Add 5 new overlay cases to renderOverlay(), update QUEUED_TYPES |
| `frontend/src/services/api.ts` | Add reorder, archived, restore, day-detail, achievements API functions |
| `frontend/src/components/habit/HabitForm.tsx` | Add temporary habit toggle + date pickers |
| `frontend/src/components/analytics/CalendarHeatmap.tsx` | Enhanced popover with per-habit breakdown |
| `frontend/src/pages/Dashboard.tsx` | Add NudgeBanner rendering |
| `frontend/src/pages/Analytics.tsx` | Add capsule/wish history, contribution graph, achievements sections |
| `frontend/src/pages/Settings.tsx` | Add archived habits section |

## Sources

- Direct codebase analysis of all files listed in integration points
- Existing architecture patterns established in v1.0 and v1.1
- `STREAK_MILESTONES`, `ATTRIBUTE_TITLES`, `TRANSFORMATIONS` constants in `backend/app/core/constants.py`
- Achievement model schema in `backend/app/models/achievement.py`
- Quote model severity field in `backend/app/models/quote.py`

---
*Architecture research for: Saiyan Tracker v1.2 feature integration*
*Researched: 2026-03-06*
