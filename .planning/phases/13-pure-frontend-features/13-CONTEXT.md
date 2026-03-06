# Phase 13: Pure Frontend Features - Context

**Gathered:** 2026-03-06
**Status:** Ready for planning

<domain>
## Phase Boundary

Users get immediate visual feedback for milestones, closure signals on every session, and can explore their history -- all using existing API data. Specifically: capsule/wish history lists, per-habit contribution graphs, nudge banner, daily summary toast, and power milestone celebrations. No backend changes.

</domain>

<decisions>
## Implementation Decisions

### History Lists (Capsule Drops & Shenron Wishes)
- Placed below existing charts on the Analytics page (after PowerLevelChart), scrollable inline
- Each capsule drop displayed as a small card with rarity color-coded pill badge (common=gray, rare=blue, epic=purple), reward name, habit that triggered it, and date
- Wish history uses similar card style with wish title and grant date
- Rarity indicator: colored pill badge, not glow effects

### Claude's Discretion: History Lists
- Pagination approach (show 10 + "Show more" vs scrollable container) -- pick based on typical data volume
- Wish card exact layout

### Contribution Graph (Per-Habit)
- Accessed by tapping a habit card on the Dashboard -- opens a detail sheet
- Detail sheet shows: 90-day GitHub-style contribution grid, current streak, best streak, total completions
- No attribute XP in this view (avoid overlap with Analytics page)

### Claude's Discretion: Contribution Graph
- Color scheme for grid cells (green shades like GitHub vs attribute-themed)
- Sheet interaction pattern (bottom sheet vs modal)

### Nudge Banner
- DBZ motivational tone: "Almost there, warrior! Just Meditate and Read left!"
- Shows actual habit names that are remaining, not just a count
- Specific and actionable -- helps ADHD users know exactly what's left

### Claude's Discretion: Nudge Banner
- Placement (top of habit list vs bottom floating bar)
- Dismiss behavior (always visible vs dismissable)

### Daily Summary Toast
- Triggers after the last habit of the day is checked (whether or not 100% completion)
- Displayed as a styled react-hot-toast showing daily %, tier, and XP earned
- Auto-dismisses after a few seconds, non-blocking

### Power Milestone Celebrations (1K, 5K, 10K, 50K)
- Full overlay animation through the animation queue (tier 1 exclusive)
- Shows the milestone number with a power-up visual
- Detection: compare powerStore's previous powerLevel with the new one in habitStore.checkHabit; if it crosses a milestone threshold, enqueue celebration animation
- Pure frontend detection -- no backend changes needed

</decisions>

<specifics>
## Specific Ideas

- Nudge banner should feel like Goku cheering you on in the final stretch
- Power milestone celebration should feel dramatic, like reaching a new power level in DBZ
- Capsule history cards should make rarity feel meaningful through color coding
- Daily summary toast provides closure signal for every session -- important for ADHD dopamine loops

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `analyticsApi.capsuleHistory()` and `analyticsApi.wishHistory()` -- API clients ready, return `CapsuleHistoryItem[]` and `WishHistoryItem[]`
- `habitsApi.contributionGraph(id, days)` -- returns `ContributionDay[]` with date + completed boolean
- `useAnalyticsData` hook -- pattern for fetching analytics data with cancellation
- `CalendarHeatmap` component -- existing grid component with color-for-tier logic, can inform contribution grid design
- `AnimationPlayer` + `useUiStore.enqueueAnimation()` -- priority-tiered animation queue for overlays
- `react-hot-toast` -- already installed and used throughout for toasts
- `usePowerStore` -- tracks `powerLevel`, `updateFromCheck()` receives new power level after each check

### Established Patterns
- Zustand stores with `useShallow` for multi-value selects
- `bg-space-800 rounded-xl p-4` card styling throughout Analytics
- Animation events dispatched from `habitStore.checkHabit()` based on response data
- Priority tiers: 1=exclusive overlays, 2=banner/combo, 3=inline
- `ky` HTTP client with retry and error handling

### Integration Points
- Analytics page (`Analytics.tsx`) -- add history list components after PowerLevelChart
- Dashboard habit cards -- add tap handler to open detail sheet with contribution graph
- `habitStore.checkHabit()` -- add nudge detection (remaining habits count) and daily summary trigger (last habit check), plus power milestone detection by comparing before/after powerLevel
- `uiStore` -- may need new animation event type for `power_milestone`
- `PRIORITY_TIERS` in uiStore -- add `power_milestone: 1` for exclusive overlay

</code_context>

<deferred>
## Deferred Ideas

None -- discussion stayed within phase scope

</deferred>

---

*Phase: 13-pure-frontend-features*
*Context gathered: 2026-03-06*
