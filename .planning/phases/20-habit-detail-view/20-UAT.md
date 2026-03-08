---
status: testing
phase: 20-habit-detail-view
source: [20-01-SUMMARY.md, 20-02-SUMMARY.md]
started: 2026-03-08T12:00:00Z
updated: 2026-03-08T12:00:00Z
---

## Current Test

number: 1
name: Habit Detail Sheet Opens from HabitCard
expected: |
  Tapping a HabitCard opens the HabitDetailSheet bottom sheet with the habit's name visible at the top.
awaiting: user response

## Tests

### 1. Habit Detail Sheet Opens from HabitCard
expected: Tapping a HabitCard opens the HabitDetailSheet bottom sheet with the habit's name visible at the top.
result: [pending]

### 2. Completion Rate Progress Rings
expected: The detail sheet shows two circular progress rings labeled "7d" and "30d" displaying completion percentages (e.g., "71%"). The rings fill proportionally to the percentage.
result: [pending]

### 3. Attribute XP Display
expected: The detail sheet shows the habit's attribute XP (e.g., "1,240 XP") with color-coded styling matching the habit's attribute color.
result: [pending]

### 4. Metadata Grid
expected: A 2-column grid displays metadata: target time, importance level, creation date, and attribute name.
result: [pending]

### 5. Tabbed History - Grid View
expected: A "Grid" tab is selected by default, showing a completion history grid (dots or squares representing completed/missed days).
result: [pending]

### 6. Tabbed History - Calendar View
expected: Switching to the "Calendar" tab shows a monthly calendar view with dots on completed days. Month navigation arrows allow browsing previous/next months.
result: [pending]

### 7. Aura Glow Effect
expected: A subtle color gradient glow appears at the top of the detail sheet, tinted in the habit's attribute color.
result: [pending]

## Summary

total: 7
passed: 0
issues: 0
pending: 7
skipped: 0

## Gaps

[none yet]
