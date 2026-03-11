# Phase 20: Habit Detail View - Context

**Gathered:** 2026-03-08
**Status:** Ready for planning

<domain>
## Phase Boundary

User can tap any habit to see its full history, performance stats, and metadata in a detail view. This enhances the existing `HabitDetailSheet` bottom sheet with completion rate percentages, attribute XP breakdown, habit metadata, and a calendar view alongside the existing contribution grid. Creating/editing habits and analytics dashboards are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Stats Presentation
- Completion rates displayed as circular progress rings with percentage in center — two rings side by side for 7-day and 30-day rates
- Trend indicators (↑/↓ arrows) next to each percentage comparing current period vs previous period
- Attribute XP shown as a single prominent stat with attribute color and icon (e.g., "STR ██ 1,240 XP") — each habit maps to one attribute
- Existing stats row (current streak, best streak, total completions) stays as-is — progress rings are a NEW section below it

### Metadata Layout
- 2-column info grid showing: target time, category badge, importance level, creation date, attribute
- Importance shown as colored dot + text label (reuses existing importance dot colors: red=critical, yellow=important, gray=normal)
- Creation date shows both absolute date AND relative time (e.g., "Jan 15, 2026 (3mo ago)")
- Metadata grid placed below stats, above history section

### Sheet Structure
- Section order: Header (emoji + title + close) → Stats row (streaks/completions) → Progress rings (7d/30d) + XP → Metadata grid → Tabbed history → Legend
- History section uses toggle tabs: "Grid" (90-day contribution heatmap) and "Calendar" (monthly calendar view using existing /calendar endpoint)
- Sheet max height stays at 85vh with overflow-y-auto scroll
- Both contribution grid and calendar view available via tab toggle (not stacked)

### Calendar View
- Completed days shown with filled dot in attribute color
- Missed days shown as empty/gray
- Uses existing `/{habit_id}/calendar` backend endpoint

### Visual Polish
- Progress rings use the habit's attribute color (STR red, VIT green, INT blue, KI yellow) for fill
- Subtle aura glow/gradient at top of sheet in the attribute color — Saiyan-themed but not overpowering
- Keep current spring slide-up animation (stiffness 300, damping 30) — no staggering needed
- Calendar dots use attribute color, consistent with contribution grid's color system

### Claude's Discretion
- Exact progress ring SVG implementation and sizing
- Tab component styling for grid/calendar toggle
- Spacing and typography within metadata grid
- Loading states for stats and calendar data
- Error handling for failed API calls

</decisions>

<specifics>
## Specific Ideas

- Progress rings should feel like "power meters" — circular, clean, attribute-colored
- The aura glow at the top should be similar to the existing AuraGauge aesthetic in the app
- Calendar view should feel lightweight — not a full calendar component, just a simple month grid with completion dots

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `HabitDetailSheet` (frontend/src/components/dashboard/HabitDetailSheet.tsx): Existing bottom sheet with header, stats row, contribution grid, and legend — this is the component to enhance
- `ContributionGrid` (frontend/src/components/dashboard/ContributionGrid.tsx): Existing 90-day heatmap grid component
- `HabitCard` (frontend/src/components/dashboard/HabitCard.tsx): Already has BarChart3 icon button that opens the detail sheet
- Attribute color maps: `borderColorMap`, `badgeColorMap` in HabitCard — reuse for progress ring and metadata colors
- `importanceDotMap` in HabitCard — reuse for importance level display

### Established Patterns
- Bottom sheet pattern: Framer Motion with backdrop overlay, spring animation (stiffness 300, damping 30)
- Stats display: bg-space-700 rounded-lg cards with text-text-muted labels and text-text-primary values
- Attribute colors: attr-str, attr-vit, attr-int, attr-ki CSS custom properties
- Data fetching: useEffect with cancelled flag pattern for cleanup

### Integration Points
- Backend `GET /habits/{habit_id}/stats`: Returns completion_rate_7d, completion_rate_30d, total_completions, current_streak, best_streak, total_xp, attribute_xp map
- Backend `GET /habits/{habit_id}/calendar`: Returns monthly calendar data with completion status
- Backend `GET /habits/{habit_id}/contribution-graph`: Already consumed by existing ContributionGrid
- Frontend API service (frontend/src/services/api.ts): Needs new methods for stats and calendar endpoints
- HabitDetailSheet props: Currently receives habitId, habitTitle, habitEmoji, streakCurrent, streakBest — may need habit object for metadata (attribute, importance, category, target_time, created_at)

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 20-habit-detail-view*
*Context gathered: 2026-03-08*
