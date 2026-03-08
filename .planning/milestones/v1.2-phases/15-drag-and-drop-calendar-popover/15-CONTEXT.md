# Phase 15: Drag-and-Drop + Calendar Popover - Context

**Gathered:** 2026-03-06
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can physically arrange their habits in preferred order and drill into any calendar day for detailed breakdown. Habits are reorderable within their category group via drag handle. Calendar heatmap days show a floating popover with per-habit completion status.

</domain>

<decisions>
## Implementation Decisions

### Drag scope & behavior
- Habits only — reorder within their category group (not across categories, not category reordering)
- Touch drag activates immediately on handle touch (no press delay)
- Lift + shadow visual feedback: dragged card elevates with scale and shadow, other cards animate to make room
- Auto-save on drop: optimistic update to backend, rolls back on error
- No reorder mode — drag is always available via handle

### Drag handle design
- Left edge placement: grip dots before the attribute badge and habit name
- Grip dots icon (6-dot pattern, like Linear/Notion)
- Always visible in muted color — no toggle or hover-to-reveal
- Drag start animation: Claude's discretion on transition (handle pulse, card lift, or combined)

### Calendar popover content
- Per-habit breakdown: each habit listed with completion status and XP earned
- Checkmark + XP badge: green check for completed with XP amount, red X or dimmed for missed
- Header summary + habit list: top section shows date, tier badge, total XP; below that the per-habit list
- Off days show scheduled habits marked as "excused" rather than missed

### Popover positioning & interaction
- Floating popover anchored to tapped day cell, positioned with floating-ui, arrow pointing to day
- Dismiss: tap outside or tap same day to toggle off
- Tapping a different day swaps popover content in place (no close-reopen)
- Entrance animation: scale from 95% to 100% + fade in, ~150ms
- Overflow for 6+ habits: Claude's discretion (scrollable max-height or show-more pattern)

### Claude's Discretion
- Drag start animation specifics (handle pulse, card lift behavior, timing)
- Popover overflow strategy for many habits
- Exact spacing, typography, and shadow values
- Error state handling for failed reorder saves
- Popover arrow styling and edge-case positioning

</decisions>

<specifics>
## Specific Ideas

- Drag handle grip dots should feel like Linear/Notion — subtle but unmistakable drag affordance
- Popover layout: date + tier + total XP header, then per-habit rows with check/X + name + XP badge
- Off-day popover should still list scheduled habits but mark them "excused" for transparency

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `CalendarHeatmap` (analytics/CalendarHeatmap.tsx): Already has day click handling and inline detail panel — upgrade to floating popover
- `HabitCard` (dashboard/HabitCard.tsx): Existing card with check, menu, detail interactions — add grip handle on left
- `CategoryGroup` (dashboard/CategoryGroup.tsx): Renders habit list within category — wrap with dnd-kit sortable context
- `HabitList` (dashboard/HabitList.tsx): Groups habits by category with sort_order — orchestrates drag context
- `motion` library already installed — use for drag animations and popover transitions

### Established Patterns
- Habits grouped by category via `CategoryGroup` → `HabitCard` pattern
- Backend has `sort_order` on both `habit` and `category` models (mapped_column default=0)
- No existing store methods or API endpoints for reordering — need to add
- Tailwind + space theme colors (bg-space-700, bg-space-800, text-text-primary, etc.)
- Lucide icons used throughout (GripVertical available in lucide-react)

### Integration Points
- `habitStore` needs reorder action + API call for persisting new sort_order
- `api.ts` needs reorder endpoint (PATCH/PUT habit sort orders)
- `CalendarHeatmap` needs per-habit day data — may need new/enhanced analytics endpoint
- `CalendarDay` type may need extending with per-habit breakdown data
- New dependencies: @dnd-kit/core, @dnd-kit/sortable, @floating-ui/react

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 15-drag-and-drop-calendar-popover*
*Context gathered: 2026-03-06*
