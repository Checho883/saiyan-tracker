# Plan 15-01: Drag-and-Drop Habit Reordering - Summary

**Status:** Complete
**Duration:** ~5 min
**Commits:** 1

## What Was Built

Drag-and-drop habit reordering within category groups using @dnd-kit. Users drag habits via a GripVertical handle on the left edge of each HabitCard. Drag never triggers a habit check. New order persists via PUT /habits/reorder with optimistic updates.

## Key Changes

### Dependencies Added
- @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, @dnd-kit/modifiers

### Files Modified
- **frontend/src/services/api.ts** -- Added `habitsApi.reorder()` method
- **frontend/src/store/habitStore.ts** -- Added `reorderHabits()` action with optimistic update + rollback
- **frontend/src/components/dashboard/HabitCard.tsx** -- Added GripVertical drag handle with useSortable, stopPropagation on handle
- **frontend/src/components/dashboard/CategoryGroup.tsx** -- Wrapped in DndContext + SortableContext, added handleDragEnd
- **frontend/src/components/dashboard/HabitList.tsx** -- Sort habits by sort_order within each category group

## Verification

- TypeScript compiles cleanly (`tsc --noEmit` passes)
- All 172 frontend tests pass
- Drag handle has `{...listeners}` only on button element
- Handle `onClick` calls `stopPropagation()` to prevent check trigger
- `restrictToVerticalAxis` modifier prevents horizontal drift

## Self-Check: PASSED

- [x] HMGT-01: Drag-and-drop reorder with dedicated handle
- [x] Sort order persists via API
- [x] Drag does not trigger habit check
- [x] Habits sorted by sort_order within categories
