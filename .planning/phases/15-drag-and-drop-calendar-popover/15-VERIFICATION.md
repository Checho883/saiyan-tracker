---
phase: 15-drag-and-drop-calendar-popover
status: passed
verified: 2026-03-08
---

# Phase 15: Drag-and-Drop + Calendar Popover - Verification

## Phase Goal
Users can physically arrange their habits in preferred order and drill into any calendar day for detailed breakdown.

## Success Criteria Verification

### 1. Drag-and-drop habit reorder with dedicated handle, persists across reload
**Status:** PASSED
- Drag-and-drop reordering using @dnd-kit within category groups
- GripVertical drag handle on left edge of each HabitCard with useSortable
- New order persists via PUT /habits/reorder with optimistic updates + rollback
- Habits sorted by sort_order within each category group in HabitList
- restrictToVerticalAxis modifier prevents horizontal drift
- Evidence: 15-01-SUMMARY.md, frontend/src/components/dashboard/CategoryGroup.tsx, frontend/src/components/dashboard/HabitCard.tsx

### 2. Drag handle visually distinct from check target, no accidental checks
**Status:** PASSED
- Drag handle has `{...listeners}` only on the GripVertical button element
- Handle onClick calls stopPropagation() to prevent check trigger
- Drag interaction isolated from tap-to-check behavior
- Evidence: 15-01-SUMMARY.md, frontend/src/components/dashboard/HabitCard.tsx

### 3. Calendar day click shows popover with per-habit breakdown and XP
**Status:** PASSED
- DayDetailPopover component with per-habit rows, tier badge, XP, excused markers
- Backend endpoint GET /habits/calendar/day-detail?date=YYYY-MM-DD returns per-habit data
- CalendarHeatmap uses @floating-ui/react with useFloating (offset, flip, shift, arrow)
- Click outside or same day dismisses popover
- Off-day habits show "EXC" label
- Popover enters with scale 95%->100% + fade in (150ms) via motion
- Verified: calendar-heatmap.test.tsx (7 tests pass, including popover toggle test)
- Evidence: 15-02-SUMMARY.md, frontend/src/components/analytics/DayDetailPopover.tsx

## Requirement Coverage

| Requirement | Status | Covered By |
|-------------|--------|------------|
| HMGT-01 | PASSED | Plan 01: Drag-and-drop with dnd-kit, dedicated GripVertical handle, persists via API |
| ANLT-04 | PASSED | Plan 02: DayDetailPopover with per-habit breakdown, XP, floating-ui positioning |

## Test Results
- calendar-heatmap.test.tsx: 7 tests pass
- All 172 frontend tests pass at phase completion
- All 23 backend habit tests pass

## Verification: PASSED
All 3 success criteria met. All 2 requirements covered. Tests green.
