# Pitfalls Research

**Domain:** Adding 19 features to an existing gamified DBZ habit tracker (v1.2)
**Researched:** 2026-03-06
**Confidence:** HIGH (based on direct codebase analysis of uiStore, AnimationPlayer, habitStore, habit_service.py, streak_service.py, soundMap, HabitCard + ecosystem knowledge)

## Critical Pitfalls

### Pitfall 1: Animation Queue Overload — Single Habit Check Enqueues 8+ Overlays

**What goes wrong:**
A single `checkHabit()` call already enqueues up to 6 animation events: `xp_popup`, `tier_change`, `capsule_drop`, `transformation`, `perfect_day`, and `dragon_ball`. v1.2 adds `streak_milestone`, `attribute_level_up`, `power_level_milestone`, `zenkai_recovery`, and `daily_summary` events. The worst case is the "last habit of a perfect day at a streak milestone that also crosses a power level milestone and triggers an attribute level-up with a capsule drop" -- that is 9-10 queued events. The `AnimationPlayer` uses `AnimatePresence mode="wait"` and processes one overlay at a time. With each overlay taking 2-3 seconds, the user stares at sequential animations for 15-25 seconds before they can interact.

**Why it happens:**
The current `habitStore.checkHabit()` (lines 73-119 of habitStore.ts) enqueues every event independently with zero deduplication, priority, or batching. The `AnimationPlayer` renders the first `QUEUED_TYPES` match from the queue, waits for completion, dequeues, then renders the next. Each new v1.2 feature gets naively added the same way: "if result has X, enqueue X animation."

**How to avoid:**
- Implement animation priority tiers. Events in the same tier batch into one overlay:
  - **Tier 1 (exclusive overlay):** `shenron`, `perfect_day`, `transformation` -- only one plays, highest priority wins
  - **Tier 2 (banner/badge, shown inside Tier 1 overlay or standalone):** `streak_milestone`, `power_level_milestone`, `attribute_level_up`, `zenkai_recovery`
  - **Tier 3 (inline, non-blocking):** `xp_popup`, `tier_change`, `daily_summary`
  - **Tier 4 (deferred notification):** `capsule_drop` -- show as a badge/indicator, user opens it later
- When `perfect_day` fires, embed streak milestone and power milestone badges INSIDE the perfect day overlay instead of as separate overlays.
- Cap total queued overlays to 3. If more would queue, show a single "combo summary" overlay listing all events.
- The `QUEUED_TYPES` set in `AnimationPlayer.tsx` (line 12-18) must be updated to only include Tier 1 events. Tier 2 events render as toast/badge, not full-screen overlays.

**Warning signs:**
- Testing the "last habit of the day" scenario produces 4+ sequential overlays.
- User has to wait more than 5 seconds before they can interact after a habit check.
- The `animationQueue` array length exceeds 5 at any point.

**Phase to address:**
Animation queue refactor must happen FIRST, before any new event types are added. Adding new events to the current unbounded queue is the single highest-risk integration pitfall.

---

### Pitfall 2: Streak Milestone Detection Fires Retroactively on App Load

**What goes wrong:**
The `Achievement` model exists in the DB (table 8.14) but has zero service logic. `STREAK_MILESTONES = [3, 7, 21, 30, 60, 90, 365]` is defined in `constants.py` (line 64) but not consumed by any service. When someone implements milestone detection, the naive approach is: check all streaks against milestones, fire notifications for any met. If Sergio already has a 14-day streak when this ships, he gets bombarded with 3-day and 7-day milestone notifications he already passed. Every page refresh re-triggers because nothing records that the milestone was already acknowledged.

**Why it happens:**
No `achievement_service.py` exists yet. The first implementation checks `streak.current_streak >= milestone` without querying the `achievements` table for already-recorded milestones. The detection logic gets put in `fetchToday()` or app load instead of inside `check_habit()`.

**How to avoid:**
- Milestone detection MUST ONLY fire inside `check_habit()` in `habit_service.py`, specifically between step 5 (update streaks) and step 6 (recalculate XP). Never on app load, never in `fetchToday()`.
- Before enqueuing any milestone animation, query: `SELECT id FROM achievements WHERE achievement_type = 'streak_milestone' AND achievement_key = 'streak_7' AND user_id = ?`. If a row exists, skip.
- Create `achievement_service.py` with `check_and_record_milestones(db, user_id, current_streak) -> list[dict]` that atomically checks + inserts in the same transaction.
- On first deploy: run a one-time migration that seeds the `achievements` table with already-passed milestones based on `streak.current_streak` and `streak.best_streak`.

**Warning signs:**
- Achievement notifications appear on page refresh.
- Same achievement fires multiple times.
- User opens app after feature deploy and sees 3+ celebration overlays immediately.

**Phase to address:**
Achievement system phase. The achievement service and migration must be built BEFORE streak milestone UI, and streak milestone detection must be added INSIDE `check_habit()`, not alongside it.

---

### Pitfall 3: Temporary Habits Corrupt Daily Completion Percentage

**What goes wrong:**
The completion rate calculation in `check_habit()` (lines 131-148 of habit_service.py) uses `get_habits_due_on_date()` to count habits due and completed. Temporary habits with `end_date` boundaries create three failure modes:

1. **Off-by-one:** A habit with `end_date = "2026-03-05"` -- is it due on March 5th? The current filter `habit.end_date < local_date` (line 55) excludes it on March 5th. This means the LAST day set by the user is NOT included, which is counterintuitive. A user who creates a "7-day challenge ending March 5th" expects it to appear on March 5th.

2. **Denominator shift:** Expired temporary habits no longer count in `habits_due_count`, which changes the completion rate formula. If the user had 6 habits (5 permanent + 1 temporary), checking 5/6 = 83%. After the temporary habit expires: 5/5 = 100%. The user's historical analytics show 83% for that day, but the current calculation says 100%. Which is truth?

3. **Phantom habit:** Frontend shows the temporary habit (fetched from active habits list) but backend does not count it as due (because end_date passed). User checks it, but it does not affect completion %.

**Why it happens:**
The `end_date` semantics are ambiguous. The current code uses `<` (strictly before), making end_date the first day the habit is NOT due. But users think of end_date as "last active day" (inclusive). The `daily_log` table already snapshots `habits_due` and `habits_completed` at check time, which is correct -- but if the frontend recalculates locally, it will drift.

**How to avoid:**
- Change the filter to `habit.end_date < local_date` -> `habit.end_date is not None and habit.end_date < local_date`. The current code already does this (line 55-56), but the comparison should be inclusive: the habit IS due on its end_date. Change to `habit.end_date < local_date` (strictly before today, meaning end_date is the last active day). Actually the current behavior IS correct for "end_date = last active day" IF we document it.
- Document the semantic explicitly: `end_date` is the LAST day the habit is due (inclusive). The filter `end_date < local_date` means "skip if end_date is before today" which correctly includes end_date itself.
- Write explicit boundary test cases: `end_date = today` -> IS due. `end_date = yesterday` -> NOT due.
- Frontend habit form must display end_date as "Last active day" not "End date" to avoid ambiguity.
- NEVER recalculate historical daily_log values. The snapshot is truth.

**Warning signs:**
- Completion % shows 4/5 when user sees 5 habits on screen.
- Temporary habit appears on dashboard but checking it does not change the aura bar.
- Historical calendar heatmap changes colors after a temporary habit expires.

**Phase to address:**
Temporary habit phase. Must include boundary date tests and frontend label clarity.

---

### Pitfall 4: Drag-and-Drop vs. Checkbox Tap Conflict on HabitCard

**What goes wrong:**
`HabitCard` (line 81-89 of HabitCard.tsx) uses the entire card as a click target with `role="button"` and `onClick={handleTap}`. Adding drag-and-drop makes the card a drag source. On touch devices, a tap and a drag start identically (touchstart). Without disambiguation: (a) every drag attempt also toggles the habit completion, or (b) every tap has a 200ms+ delay while the library determines intent, violating the "every interaction must feel instant" core value.

**Why it happens:**
The existing card is designed as a single large tap target. Drag-and-drop libraries wrap items in drag containers that also capture pointer events. The click handler and drag handler fight over the same gesture. Using `activationConstraint` with a distance or delay threshold makes taps feel sluggish.

**How to avoid:**
- Add a dedicated drag handle (3-line grip icon) to the left side of the HabitCard. Only the handle initiates drag. The rest of the card continues to work as a tap-to-check target.
- Only show drag handles in "reorder mode" toggled by a button in the habit list header. In normal mode, the card works exactly as today -- zero changes to the existing tap behavior.
- Use `@hello-pangea/dnd` for the drag library -- it is purpose-built for vertical list reordering, has excellent touch support, and its `DragHandleProps` isolate the drag zone.
- NEVER use delay-based activation (`activationConstraint: { delay: 200 }`) -- it makes every interaction feel broken for an ADHD user who expects instant feedback.

**Warning signs:**
- Habit check takes >100ms to respond after adding drag-and-drop.
- Dragging a card also toggles its completion state.
- Mobile users report they "can't check habits" or "can't reorder."

**Phase to address:**
Drag-and-drop reorder phase. Must be tested on mobile touch with both tap and drag gestures.

---

### Pitfall 5: Vegeta Roast System Feels Punishing — ADHD User Avoids the App

**What goes wrong:**
The PRD says "No punishment -- only positive reinforcement + Vegeta verbal roasts." But a Vegeta quote saying "You call yourself a Saiyan? Disgraceful" after 3 missed days IS punishment. If the roast is the first thing Sergio sees when he opens the app after missing days, it creates negative emotional association with the app. For ADHD users, this is the death spiral: miss days -> feel bad -> avoid the app -> miss more days.

**Why it happens:**
The quote `severity` field (mild/medium/savage) exists in the database but no escalation logic exists yet. The developer implements the escalation spec literally (1 day = mild, 2 days = medium, 3+ days = savage) without testing the emotional impact. The "savage" quotes read as insulting rather than motivating.

**How to avoid:**
- Roasts must NEVER be the first thing the user sees when returning. Show a `welcome_back` Goku quote first ("You came back! That's what makes you a true Saiyan!"). Only show Vegeta on the SECOND interaction or as a small character quote bar, not a modal.
- Add a "Vegeta mode" toggle in Settings (default: ON, but can be turned off or set to "mild only").
- Review ALL roast quotes for tone. Reframe from insults to challenges: "A true Saiyan wouldn't stay down" (pride-based) instead of "Disgraceful" (shame-based).
- Never show roasts mid-session while the user is actively checking habits.
- The `check_zenkai_recovery()` function (streak_service.py, line 52-93) already detects gaps. Use its `zenkai_activated` flag to trigger roasts -- do not add a second gap-detection system.

**Warning signs:**
- Vegeta quote appears as a modal dialog blocking the dashboard.
- Roast is the first UI element visible after returning from absence.
- No Settings toggle to control roast behavior.
- Analytics show longer gaps after missed days (user avoidance pattern).

**Phase to address:**
Vegeta roast system phase. Must include a Settings toggle, tone review, and UX flow that shows welcome_back first.

---

### Pitfall 6: Audio Sprite Replacement Breaks All 13 Existing Sound Mappings

**What goes wrong:**
The current `soundMap.ts` has 13 sounds with hardcoded `[offset_ms, duration_ms]` sprite coordinates (lines 20-34). The sprite file at `/audio/sprite.webm` and `/audio/sprite.mp3` is a placeholder. Replacing it with real audio files means every single offset changes. If even one offset is wrong, the wrong sound plays (`explosion` sound plays for `scouter_beep`), or sounds clip/overlap. v1.2 also adds new sounds (achievement fanfare, streak chime, Vegeta grunt, zenkai whoosh, nudge tone) -- these must be integrated into the same sprite.

**Why it happens:**
Audio sprite compilation tools generate new offset maps. The developer updates the audio file but manually edits `SPRITE_MAP` offsets -- one typo silently misaligns every subsequent sound. Or: the developer compiles the sprite in a different order than the `SPRITE_MAP` expects.

**How to avoid:**
- Use an automated sprite compilation pipeline that outputs BOTH the audio file and a JSON manifest of offsets. Parse the JSON to generate the TypeScript `SPRITE_MAP`.
- Keep individual source sound files in a `/audio/sources/` directory. The sprite is compiled from these, never hand-edited.
- Define ALL new v1.2 sound IDs before compiling: `achievement_fanfare`, `streak_chime`, `vegeta_grunt`, `zenkai_whoosh`, `nudge_tone`. Compile the sprite ONCE with all sounds.
- Write a smoke test: load the Howler sprite, play each sound ID, verify the duration matches the expected range (within 100ms tolerance).
- Update `EVENT_SOUND_MAP` in `useSoundEffect.ts` (lines 8-16) for all new animation event types at the same time.

**Warning signs:**
- One sound plays but it is the wrong sound for the event.
- Some sounds are silent (offset points to gap between sounds).
- New sounds play correctly but existing sounds are now broken.

**Phase to address:**
Audio sprite phase. Must happen AFTER all new sound IDs for v1.2 are defined (so the sprite is compiled once) but BEFORE other features that need those sounds.

---

### Pitfall 7: recharts react-is Override Removal Breaks Chart Rendering

**What goes wrong:**
The `package.json` has `"overrides": { "react-is": "^19.0.0" }` (line 26-28). This forces recharts' `react-is` dependency to use the React 19 version. Removing this override to "fix" the tech debt without verifying recharts has internalized the fix causes `Cannot read properties of undefined` errors in recharts components. Charts silently fail or crash during render, breaking the existing calendar heatmap and attribute progression charts.

**Why it happens:**
recharts 3.7.x still lists `react-is` as a peer dependency. Per the [recharts discussion #5701](https://github.com/recharts/recharts/discussions/5701), the maintainers moved react-is to peerDependencies. The override forces npm to resolve it to v19. Removing the override lets npm resolve to whatever recharts requests (v18), which is incompatible with React 19 internals.

**How to avoid:**
- Check if a newer recharts version (3.8+) has dropped `react-is` entirely before attempting removal. If not, KEEP the override.
- If keeping the override, add a comment in `package.json`: `// REQUIRED: recharts 3.7.x needs react-is override for React 19 compat`.
- If upgrading recharts, test ALL chart components (calendar heatmap, attribute charts, any new contribution graphs) with both empty and populated datasets.
- Evaluate honestly: if the override causes zero runtime issues, mark this tech debt as "acceptable, documented" and move on. The override is a single line with no real cost.

**Warning signs:**
- Charts render in development but crash in production build.
- `npm install` shows peer dependency warnings after override removal.
- Charts work for some data shapes but crash for empty datasets.

**Phase to address:**
Tech debt phase. Attempt early so charts are stable for new analytics features. Must include immediate rollback plan (restore override).

---

### Pitfall 8: Calendar Day Popover Fails on Mobile Touch

**What goes wrong:**
Calendar day cells in the heatmap are dense and small (typically 16-20px). A popover positioned absolutely relative to a clicked cell renders off-screen on narrow mobile viewports. On touch devices, there is no hover state -- the user does not know cells are tappable. Closing the popover requires a click-outside handler that conflicts with the calendar grid's own tap handlers (tapping another day should close the current popover AND open a new one, not just close).

**Why it happens:**
Calendar heatmaps are designed for information display, not interaction. The click-to-detail requirement is being retrofitted onto a component that was built for passive viewing. Popover positioning libraries assume desktop viewport widths.

**How to avoid:**
- Use `vaul` (already in `package.json`, line 22) as a bottom drawer on mobile viewports (<768px). Use a positioned popover only on desktop.
- Switch between the two presentations using a `window.matchMedia('(min-width: 768px)')` check.
- Make calendar cells at least 28x28px with 2px gap on mobile for adequate touch targets.
- Popover/drawer content: date, completion %, list of habits with check/miss icons, XP earned. No charts inside -- keep it scannable.
- Tapping a different day while popover is open: close current, open new. Do not require explicit dismiss first.

**Warning signs:**
- Calendar day tap does nothing on iOS Safari.
- Popover renders off the right edge on iPhone SE viewport.
- Popover opens but tapping outside does not close it.

**Phase to address:**
Calendar popover phase. Must be tested on actual mobile device or Safari/Chrome emulator.

---

### Pitfall 9: Archived Habit Restore Creates sort_order Conflicts

**What goes wrong:**
When a habit is archived (`is_active = false`), its `sort_order` value is preserved. While archived, the user reorders remaining active habits via drag-and-drop. Habit B now occupies archived Habit A's `sort_order` position. Restoring Habit A creates a collision: two active habits with the same `sort_order`. The habit list renders in unpredictable order or, if there is a unique constraint, the restore fails.

**Why it happens:**
Archive is currently a soft delete (`is_active = false`) that preserves all fields including `sort_order`. The restore path is just `is_active = true`. Nobody checks for collisions. The drag-and-drop reorder feature (new in v1.2) makes this worse because `sort_order` values are now actively user-managed.

**How to avoid:**
- On restore: always assign `sort_order = MAX(sort_order of active habits) + 1`. The restored habit goes to the bottom of the list. The user can drag it to their preferred position.
- The restore API response should include the new `sort_order` so the frontend inserts correctly.
- Archived habits view should sort by archive date (or original created_at), not by sort_order -- sort_order is meaningless for inactive habits.
- The `PUT /habits/reorder` endpoint should only accept active habit IDs. Validate that all submitted IDs are `is_active = true`.

**Warning signs:**
- After restoring a habit, two habits appear at the same position.
- Drag-and-drop reorder saves, but the restored habit jumps to an unexpected position on refresh.
- Reorder endpoint accepts archived habit IDs and silently corrupts sort_order.

**Phase to address:**
Archived habits phase. Must coordinate with drag-and-drop reorder to ensure sort_order management is consistent.

---

### Pitfall 10: History Views Load Unbounded Data Without Pagination

**What goes wrong:**
The capsule history and wish history API endpoints (`/analytics/capsule-history`, `/analytics/wish-history`) return ALL records. After 6 months: ~540 capsule drops (6 habits x 25% rate x 180 days x avg 2 checks/habit = ~540). The frontend renders all items in a single list, causing scroll jank and slow initial render on the Analytics page.

**Why it happens:**
The existing analytics endpoints have no `limit`/`offset` parameters. This works fine for month 1 but degrades linearly. The contribution graph is naturally bounded (90 days) but history lists grow unbounded.

**How to avoid:**
- Add `?limit=50&offset=0` pagination to both history endpoints from the start.
- Frontend uses "load more" button or infinite scroll, never renders the full list.
- Default to showing most recent 50 items, sorted by date descending.
- Contribution graphs and calendar are naturally bounded -- no pagination needed.

**Warning signs:**
- Analytics page takes >500ms to load after 3+ months.
- Capsule history list scrolls endlessly with no performance concern addressed.
- Browser DevTools shows 500+ DOM nodes for history list.

**Phase to address:**
Analytics history views phase. Pagination must be part of initial API design.

---

### Pitfall 11: Custom Frequency Day Picker — JavaScript vs ISO Weekday Mismatch

**What goes wrong:**
The backend uses Python's `date.isoweekday()` (1=Monday through 7=Sunday) in `get_habits_due_on_date()` (line 65 of habit_service.py): `target.isoweekday() in habit.custom_days`. The existing `custom_days` JSON stores isoweekday integers. A new frontend day picker component might use JavaScript's `Date.getDay()` (0=Sunday through 6=Saturday). If the frontend sends JavaScript indices, a habit set to "Monday" (JS getDay=1, ISO=1) works by coincidence, but "Sunday" (JS getDay=0, ISO=7) becomes "no valid day" or the wrong day.

**Why it happens:**
Python and JavaScript use different weekday numbering with different zero points and different start days. The existing data format uses ISO convention, but a new UI component may default to JS convention. The off-by-one-and-different-start confusion is a classic date handling bug.

**How to avoid:**
- The day picker component MUST emit isoweekday values (1-7, Mon=1, Sun=7) to match the existing backend convention and stored data.
- Define a mapping constant: `const ISO_WEEKDAY = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 } as const`.
- Display the day picker starting with Monday (not Sunday) to match ISO convention visually.
- Write an integration test: create habit with `custom_days: [1, 3, 5]`, verify it appears on Monday, Wednesday, Friday and NOT on Tuesday, Thursday, Saturday, Sunday.
- Test Sunday specifically: `custom_days: [7]` must match `isoweekday() == 7`.

**Warning signs:**
- Habit set to "Mon/Wed/Fri" appears on wrong days.
- Habit set to "Sun" never appears as due (0 is not in the 1-7 range check).
- Day picker shows Sunday first (American convention) but backend starts weeks on Monday (ISO).

**Phase to address:**
Custom frequency day picker phase. Must include backend integration test.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Adding new AnimationEvent types without priority system | Each feature ships faster | Animation queue becomes a 15-25 second slideshow on combo events | Never -- add priority in the same PR as new event types |
| Keeping recharts override without documenting | Avoids investigation | Next developer removes it and breaks charts | Acceptable if documented with inline comment |
| Hardcoding streak milestone values in frontend AND backend | Quick milestone badge display | Lists drift when one is updated but not the other | Never -- single source of truth in constants.py, frontend fetches from API |
| Skipping pagination on history endpoints | Faster initial development | Analytics page degrades after 3 months | Only if pagination is committed to within this milestone |
| Using inline `animate` props for new animations instead of variants | Faster prototyping | Animation definitions scattered, inconsistent durations/easings | Acceptable for one-off animations; use variants for any animation used in 2+ components |

## Integration Gotchas

| Integration Point | Common Mistake | Correct Approach |
|-------------------|----------------|------------------|
| New AnimationEvent type in uiStore | Adding to `AnimationEvent` union but forgetting `QUEUED_TYPES` set, `renderOverlay` switch, AND `EVENT_SOUND_MAP` | Checklist: update all 4 locations (type union, QUEUED_TYPES if overlay, renderOverlay, EVENT_SOUND_MAP) |
| Achievement service + check_habit() | Calling achievement check AFTER transaction commits, creating race condition or missed recording | Add achievement check INSIDE `check_habit()` between steps 5 and 6, within the same flush |
| New CheckHabitResponse fields + habitStore | Adding fields to backend response but not consuming them in `habitStore.checkHabit()` distribution logic | Update `habitStore.checkHabit()` to distribute new fields (achievement, milestone) to the correct stores |
| New SoundId + sprite | Adding ID to `SoundId` type but not to `SPRITE_MAP` offsets or `EVENT_SOUND_MAP` | Update all 3: `SoundId` union, `SPRITE_MAP` with correct offset, `EVENT_SOUND_MAP` for the event type |
| Drag-and-drop + optimistic reorder | Reordering in UI state but not calling `PUT /habits/reorder`, so refresh reverts | Send reorder API call on dragEnd; only update local state after API success (or optimistic with rollback) |
| Vegeta roast + streak service | Adding a second gap-detection system for roasts when `check_zenkai_recovery()` already detects gaps | Reuse `zenkai_info["zenkai_activated"]` from check_habit() to determine if roast should trigger |
| Archived habit restore + sort_order | Restoring with original sort_order that now conflicts with active habits | Assign `MAX(sort_order) + 1` on restore; let user drag to desired position |
| Temporary habit + fetchToday | Frontend shows expired temp habit because `is_active` is still true | `fetchToday` must use the same `get_habits_due_on_date()` filtering logic (which checks end_date) |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Contribution graph (90 days x N habits) re-rendering on every habit check | Analytics page stutters when navigated to after a check | Memoize with `React.memo` + stable data reference via `useMemo` | When contribution graphs share a page with reactive components |
| Unbounded capsule history query | Analytics page load time grows linearly | `LIMIT 50 OFFSET 0` with pagination in API | After ~200 capsule drops (3 months of use) |
| Multiple achievement checks per habit check | Each check queries achievements table for each milestone type | Batch query: `SELECT achievement_key FROM achievements WHERE achievement_type = 'streak_milestone'` once, then compare in Python | Unlikely to be a real performance issue for single-user, but clean code practice |
| Drag-and-drop with all HabitCards as Motion components | Drag causes all cards to re-render during position animation | Use `layoutId` on Motion components for smooth reorder; avoid animating non-moving cards | With 8+ habits in the list |
| Calendar heatmap rendering 12 months eagerly | Analytics initial load takes 2+ seconds | Render only visible month; lazy-load adjacent months on navigation | After 6+ months of tracked data |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Achievement popups for all past milestones on feature deploy | User closes 5+ dialogs before using the app | Seed achievements table with migration; only notify on NEW milestones earned after deploy |
| Vegeta roast as first UI element after absence | User feels punished for returning; avoidance spiral | Show welcome_back Goku quote first; Vegeta appears as secondary quote bar text, not modal |
| "You're close!" nudge banner that never goes away | Nag banner stays visible during active checking; feels pushy | Auto-dismiss when user checks the next habit; only show after 30+ seconds of inactivity with 1-2 habits remaining |
| Daily summary toast blocks habit cards | Toast covers the area where user taps habits | Use non-blocking bottom toast with auto-dismiss in 3 seconds; position below the habit list |
| Drag handle too small on mobile | User cannot grab the handle to initiate drag | Handle must be at least 44x44px touch target; use visible grip lines affordance |
| Calendar popover with too much info | Information overload on a small popover surface | Show only: date, %, habit names with check/miss icon, total XP. No charts or graphs inside |
| Capsule drop overlay interrupts habit-checking flow | User is in "rapid check" mode; overlay forces them to wait | Change capsule to notification badge; user opens capsule drawer when they choose to |

## "Looks Done But Isn't" Checklist

- [ ] **Streak milestones:** Achievement row inserted in DB, not just animation fired -- `SELECT * FROM achievements WHERE achievement_type = 'streak_milestone'` has rows
- [ ] **Drag-and-drop reorder:** `PUT /habits/reorder` called on dragEnd -- sort_order persists across page refresh
- [ ] **Vegeta roasts:** Severity matches consecutive missed days accurately -- 1 missed = mild (not savage); 0 missed = no roast
- [ ] **Temporary habits:** End date is inclusive (last active day) -- habit with `end_date = today` IS in today's list
- [ ] **Audio sprite:** All 13+ sounds play the CORRECT sound for their event -- trigger each event type and verify the right audio plays
- [ ] **Calendar popover:** Works on mobile touch -- tested on actual phone or device emulator, not just desktop Chrome
- [ ] **Archived restore:** sort_order recalculated to MAX+1 -- restored habit appears at bottom, not overlapping existing habits
- [ ] **Achievement dedup:** Same milestone cannot fire twice -- check habit, uncheck, re-check: milestone fires only once
- [ ] **Animation queue cap:** Perfect day scenario does not produce 5+ sequential overlays -- test "last habit + capsule + streak milestone + dragon ball"
- [ ] **recharts override:** Charts render after any package.json changes -- test all chart components with real data AND empty data
- [ ] **Day picker mapping:** Sunday selection produces `custom_days: [7]` not `custom_days: [0]` -- verify habit is due on actual Sunday
- [ ] **History pagination:** Capsule history returns max 50 items per page -- API returns `limit`/`offset` params, frontend shows "load more"
- [ ] **Nudge banner dismissal:** Banner disappears when user checks a habit, does not persist after reaching 100%

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Animation queue overload | MEDIUM | Add priority system and batching to AnimationPlayer + habitStore enqueue logic; 1-2 day refactor |
| Retroactive milestone spam | LOW | Run migration to seed achievements table; add dedup check to achievement service; 2-4 hour fix |
| Temporary habit % corruption | HIGH | Audit all daily_logs for days with active temp habits; if snapshots are wrong, must recalculate and UPDATE; 1+ day investigation |
| Drag-tap conflict | LOW | Add dedicated drag handle; change from full-card drag to handle-only; 2-4 hour refactor |
| Vegeta roast too punishing | LOW | Change from modal to inline quote bar; add Settings toggle; review quote tone; UI-only changes |
| Audio sprite desync | LOW | Recompile sprite from source files; regenerate SPRITE_MAP from manifest; 1-2 hours with automation |
| recharts breakage | LOW | Restore override in package.json; 30-second fix; document with inline comment |
| sort_order collision | LOW | Run `UPDATE habits SET sort_order = (ROW_NUMBER()) WHERE is_active = true ORDER BY sort_order`; add MAX+1 logic to restore endpoint |
| Day picker weekday mismatch | MEDIUM | Fix frontend mapping constant; audit all existing habits with custom_days; may need to convert stored values if wrong convention was used |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Animation queue overload | Phase 1: Animation queue refactor (MUST be first) | "Last habit of perfect day" test produces max 3 overlays |
| recharts override | Phase 2: Tech debt (early, stabilizes charts) | All chart components render; override has inline comment |
| Audio sprite desync | Phase 3: Audio sprite (after all new sounds defined) | Each sound ID plays correct sound; automated manifest |
| Retroactive milestone spam | Phase 4: Achievement system | No retroactive notifications; migration seeds existing milestones |
| Streak milestone in check_habit | Phase 4: Achievement system | Milestone fires only on the check that crosses the threshold |
| Vegeta roast tone | Phase 5: Vegeta roast system | Settings toggle exists; welcome_back shows before roast |
| Drag-tap conflict | Phase 6: Drag-and-drop reorder | Mobile test: tap checks, drag handle reorders, zero delay |
| sort_order collision | Phase 7: Archived habits (after drag-and-drop) | Restore archived habit; verify it appears at list bottom |
| Calendar popover mobile | Phase 8: Calendar popover | Works on iPhone Safari and Android Chrome |
| Temporary habit % corruption | Phase 9: Temporary habits | End date boundary tests pass; % snapshot is correct |
| Day picker weekday mismatch | Phase 10: Custom frequency picker | Mon/Wed/Fri habit is due on correct days; Sunday works |
| History pagination | Phase 11: Analytics history views | API returns paginated results; frontend shows "load more" |

## Sources

- Direct codebase analysis: `uiStore.ts`, `AnimationPlayer.tsx`, `habitStore.ts`, `habit_service.py`, `streak_service.py`, `soundMap.ts`, `useSoundEffect.ts`, `HabitCard.tsx`, `constants.py`, `package.json`
- [recharts react-is peer dependency discussion](https://github.com/recharts/recharts/discussions/5701) -- HIGH confidence
- [recharts React 19 support issue #4558](https://github.com/recharts/recharts/issues/4558) -- HIGH confidence
- [@hello-pangea/dnd GitHub](https://github.com/hello-pangea/dnd) -- recommended for vertical list reordering -- MEDIUM confidence
- [Top drag-and-drop libraries for React 2026](https://puckeditor.com/blog/top-5-drag-and-drop-libraries-for-react) -- MEDIUM confidence

---
*Pitfalls research for: Saiyan Tracker v1.2 — 19 new features integration*
*Researched: 2026-03-06*
