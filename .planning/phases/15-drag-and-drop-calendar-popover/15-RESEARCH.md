# Phase 15: Drag-and-Drop + Calendar Popover - Research

**Researched:** 2026-03-06
**Status:** Complete

## Phase Goal

Users can physically arrange their habits in preferred order and drill into any calendar day for detailed breakdown.

## Requirements

- **HMGT-01**: User can drag-and-drop to reorder habits (with dedicated drag handle, not conflicting with tap-to-check)
- **ANLT-04**: User can click any calendar day to see popover with per-habit breakdown and XP earned

## Existing Backend Infrastructure

### Reorder Endpoint (Already Exists)
- `PUT /api/v1/habits/reorder` accepts `ReorderRequest { habit_ids: UUID[] }` — position in array = sort_order value
- Returns updated `list[HabitResponse]` with new sort_order values
- Backend tests exist: `test_reorder_assigns_sort_order`, `test_reorder_persists`, `test_reorder_invalid_id_returns_400`
- Habit model has `sort_order: Mapped[int] = mapped_column(default=0)`

### Per-Habit Calendar Endpoint (Already Exists)
- `GET /api/v1/habits/{id}/calendar` returns `list[HabitCalendarDay]` with `{ date, completed, attribute_xp_awarded }`
- Supports optional `start_date` and `end_date` query params (defaults to 90 days)
- `GET /api/v1/habits/{id}/stats` returns `HabitStatsResponse` with total_completions, streaks, completion_rate_30d, total_xp_earned

### Aggregate Calendar Endpoint (Already Exists)
- `GET /api/v1/habits/calendar/all?month=YYYY-MM` returns `list[CalendarDay]` with `{ date, is_perfect_day, completion_tier, xp_earned, is_off_day }`
- Used by existing `CalendarHeatmap` component

### Today List Endpoint
- `GET /api/v1/habits/today/list?local_date=YYYY-MM-DD` returns `list[HabitTodayResponse]` with sort_order, category_id, completed status
- HabitList groups by category_id and sorts by category sort_order

## Existing Frontend Architecture

### Habit Rendering Chain
1. `HabitList` — Groups `todayHabits` by `category_id`, sorts groups by category `sort_order`
2. `CategoryGroup` — Renders category header + list of `HabitCard` components
3. `HabitCard` — Full card with tap-to-check, menu, detail sheet. Click handler on entire card div triggers `checkHabit()`

### Key Design Consideration: Drag vs Tap Conflict
- HabitCard's entire div is a click target (`role="button"`, `onClick={handleTap}`)
- Drag handle must be a separate element that prevents click propagation
- dnd-kit handles this naturally: `useSortable` provides `listeners` that attach only to the handle element

### CalendarHeatmap Component
- Currently uses inline detail panel below the grid (`selectedDay` state)
- Day buttons call `setSelectedDay()` on click
- Shows: date, tier, XP earned, off-day status, perfect day status
- **Missing**: per-habit breakdown data — needs new API call or enriched data

### Store Architecture
- `habitStore` — Zustand store with `todayHabits[]`, `fetchToday()`, `checkHabit()`, CRUD methods
- No `reorderHabits()` action exists yet — needs adding
- `habitsApi` in `api.ts` — no `reorder()` method yet

### Current Dependencies
- `motion` (v12.35) — for animations, already installed
- `lucide-react` — includes `GripVertical` icon for drag handle
- No `@dnd-kit/*` or `@floating-ui/*` installed

## Technical Decisions

### Drag-and-Drop Library: @dnd-kit
- `@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/utilities`
- Best React DnD library for sortable lists
- Supports keyboard and screen reader accessibility
- `restrictToVerticalAxis` modifier prevents horizontal drift
- `closestCenter` collision strategy for vertical lists
- Touch support works immediately on drag handle without delay

### Floating Popover Library: @floating-ui/react
- `@floating-ui/react` for popover positioning
- Provides `useFloating`, `offset`, `flip`, `shift`, `arrow` middleware
- Handles viewport edge cases automatically
- Much lighter than headless-ui or radix for a single popover

### Calendar Day Detail Data
- Need new endpoint or enriched data: when user clicks a calendar day, show per-habit breakdown
- **Approach**: New frontend API method to fetch per-habit data for a specific date
- Backend already has `GET /habits/today/list?local_date=DATE` which returns completion status per habit
- Can call `todayList` with any date to get per-habit completion for that day
- XP per habit available from `HabitLog` but not exposed per-date — use `GET /habits/{id}/calendar?start_date=DATE&end_date=DATE` for single-day lookup
- **Better approach**: Create a new lightweight backend endpoint `GET /habits/calendar/day-detail?date=YYYY-MM-DD` that returns per-habit completion and XP for a specific date in one call

### Drag Within Category Only
- Per CONTEXT.md: "reorder within their category group (not across categories)"
- Each `CategoryGroup` gets its own `SortableContext`
- Drag constraints prevent moving habits between categories
- DndContext wraps each CategoryGroup independently (not the entire HabitList)

## Implementation Strategy

### Plan 1: Drag-and-Drop Habit Reordering (Wave 1)
- Install `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`
- Add `reorder()` to `habitsApi` and `reorderHabits()` to `habitStore`
- Add drag handle (GripVertical icon) to HabitCard left edge
- Wrap CategoryGroup with DndContext + SortableContext
- Make HabitCard a sortable item with handle-only listeners
- Optimistic reorder + persist via PUT /habits/reorder
- Sort todayHabits by sort_order within each category group

### Plan 2: Calendar Day Popover (Wave 1, parallel)
- Install `@floating-ui/react`
- Create backend endpoint for day detail (per-habit breakdown for a date)
- Add frontend types and API client for day detail
- Replace CalendarHeatmap's inline detail panel with floating popover
- Popover shows: date, tier badge, total XP header; then per-habit rows with check/X + name + XP
- Off-day habits marked as "excused"
- Animate with motion: scale 95%->100% + fade in, ~150ms

## Risk Assessment

- **Low risk**: Backend reorder endpoint already exists and is tested
- **Low risk**: dnd-kit is mature, well-documented, handles accessibility
- **Medium risk**: Calendar popover needs per-habit data for arbitrary dates — may need new backend endpoint
- **Low risk**: floating-ui handles edge positioning well

## Validation Architecture

### Dimension 1: Goal Alignment
- Drag-and-drop directly satisfies HMGT-01 (reorder habits)
- Calendar popover directly satisfies ANLT-04 (per-habit day breakdown)

### Dimension 2: Success Criteria Coverage
- SC1: Drag via handle + persist sort_order across reloads
- SC2: Drag handle visually distinct from check target (GripVertical left edge vs card body click)
- SC3: Calendar day click shows popover with per-habit completion + XP

### Dimension 8: Testability
- Drag reorder: verify sort_order changes in store after drag, verify API call made
- Calendar popover: verify popover appears on day click, verify per-habit data displayed

---

*Research completed: 2026-03-06*
*Phase: 15-drag-and-drop-calendar-popover*
