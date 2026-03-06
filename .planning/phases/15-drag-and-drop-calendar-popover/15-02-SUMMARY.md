# Plan 15-02: Calendar Day Detail Popover - Summary

**Status:** Complete
**Duration:** ~5 min
**Commits:** 2

## What Was Built

Floating popover for calendar day detail showing per-habit completion breakdown and XP. New backend endpoint returns per-habit data for any date. CalendarHeatmap upgraded from inline detail panel to floating popover via @floating-ui/react.

## Key Changes

### Dependencies Added
- @floating-ui/react

### Backend
- **backend/app/schemas/habit.py** -- Added `DayDetailHabit` and `DayDetailResponse` schemas
- **backend/app/api/v1/habits.py** -- Added `GET /habits/calendar/day-detail?date=YYYY-MM-DD` endpoint

### Frontend
- **frontend/src/types/index.ts** -- Added `DayDetailHabit` and `CalendarDayDetail` types
- **frontend/src/services/api.ts** -- Added `habitsApi.calendarDayDetail()` method
- **frontend/src/components/analytics/DayDetailPopover.tsx** -- New component with per-habit rows, tier badge, XP, excused markers
- **frontend/src/components/analytics/CalendarHeatmap.tsx** -- Replaced inline panel with floating popover via useFloating

### Tests
- **frontend/src/__tests__/calendar-heatmap.test.tsx** -- Updated for async popover behavior, added popover toggle test

## Verification

- TypeScript compiles cleanly (`tsc --noEmit` passes)
- All 172 frontend tests pass (including 2 new calendar popover tests)
- All 23 backend habit tests pass
- Backend route `/habits/calendar/day-detail` exists and returns DayDetailResponse
- Popover positioned with floating-ui (offset, flip, shift, arrow)
- Click outside or same day dismisses popover
- Off-day habits show "EXC" label
- Popover enters with scale 95%->100% + fade in (150ms) via motion

## Self-Check: PASSED

- [x] ANLT-04: Calendar day click shows per-habit breakdown and XP
- [x] Floating popover anchored to day cell
- [x] Off-day habits marked as excused
- [x] Tap different day swaps content in place
- [x] Tap outside or same day dismisses
