# Phase 8: Analytics & Settings - Context

**Gathered:** 2026-03-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can review their habit history through visual analytics (calendar heatmap, attribute progression charts, power level charts, summary stat cards) and manage all app configuration (capsule rewards, Shenron wishes, categories, preferences, off-days). This phase delivers the /analytics and /settings routes end-to-end.

</domain>

<decisions>
## Implementation Decisions

### Chart Visuals & Interaction
- Calendar heatmap cells show tooltip on tap — GitHub contribution graph style (completion %, habits done, XP earned)
- Month navigation via prev/next controls
- 4-color coding: gold (100%), blue (75-99%), red (50-74%), gray (<50%), blue outline for off-days
- Attribute progression area chart and power level line chart use glowing/neon line effects on dark background (matching DBZ energy theme)
- Charts animate on initial load (progressive draw-in) AND on period switch (smooth transitions)
- Period selector: week / month / all
- Summary stat cards styled as Scouter HUD readouts — angular frames, mono-spaced numbers, subtle scan-line effect (consistent with existing ScouterHUD component)
- Stat cards display: perfect days count, average %, total XP, longest streak

### Settings Page Layout
- Vertical scroll with grouped collapsible sections: Preferences, Categories, Capsule Rewards, Shenron Wishes, Off-Days
- Preferences section expanded by default; all other sections collapsed
- Sound toggle: simple on/off switch (persisted via backend)
- Theme toggle: simple dark/light switch (dark is default). No system preference detection — instant switch, no reload
- Display name: text input in Preferences section; display name appears in dashboard HeroSection as character name plate

### CRUD Management UX
- Add/edit forms use bottom sheet pattern (reuse HabitFormSheet pattern) — tap 'Add' button or tap an item to open sheet
- List items displayed as compact cards with swipe-left to reveal edit/delete actions
- Capsule reward rarity: segmented control (Common | Rare | Epic) with color coding matching rarity colors
- Shenron wishes: form includes active toggle and display shows times-wished count
- Category management: form includes name, color picker, emoji selector
- Delete actions require confirmation via existing DeleteConfirmDialog component

### Off-Day Experience
- Mark off-day trigger located in Settings page under Preferences section
- When off-day is marked: habits still visible on dashboard but grayed out / marked optional — user can still check them for bonus XP if they want. Streak preserved either way
- Off-day can be undone same-day only — once the day passes, it's locked in
- Reason selection uses icon grid: sick (thermometer), vacation (palm tree), rest (bed), injury (bandage), other (ellipsis) — tap to select, then confirm
- Calendar heatmap shows blue outline for off-days

### Claude's Discretion
- Chart library choice (recharts, visx, etc.)
- Exact glow effect implementation for chart lines
- Swipe action implementation approach
- Color picker and emoji selector component choices
- Loading states and error handling patterns
- Exact spacing, typography, and responsive breakpoints

</decisions>

<specifics>
## Specific Ideas

- Scouter-style stat cards should match the existing ScouterHUD component's visual language (angular, mono-spaced, scan-line)
- Chart glow effects should feel like DBZ energy auras — neon blue/gold on the space-800 dark background
- Off-day habits shown as "optional" rather than hidden — preserves the feeling of choice rather than restriction (aligns with "no punishment" philosophy)
- Bottom sheet forms maintain consistency with habit creation flow

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `HabitFormSheet` (frontend/src/components/habit/HabitFormSheet.tsx): Bottom sheet pattern for forms — reuse for reward/wish/category forms
- `DeleteConfirmDialog` (frontend/src/components/habit/DeleteConfirmDialog.tsx): Confirmation dialog — reuse for all CRUD deletes
- `ScouterHUD` (frontend/src/components/dashboard/ScouterHUD.tsx): Scouter visual style — reference for stat card design
- `AttributeGrid` (frontend/src/components/dashboard/AttributeGrid.tsx): Shows STR/VIT/INT/KI bars — reference for attribute chart styling
- `StatsPanel` (frontend/src/components/dashboard/StatsPanel.tsx): Collapsible panel pattern — reference for settings sections

### Established Patterns
- Zustand stores with async CRUD + toast error handling (`rewardStore.ts` has full rewards/wishes/categories/settings CRUD ready)
- API service layer (`rewardsApi`, `wishesApi`, `categoriesApi`, `settingsApi`) already defined
- Tailwind CSS with `space-800` dark theme, `saiyan-500` accent
- `useShallow` from zustand for multi-value selects

### Integration Points
- `BottomTabBar` already has /analytics and /settings routes defined
- `useRewardStore` has all CRUD operations + `fetchSettings` / `updateSettings` ready
- `usePowerStore` provides powerLevel, transformation, attributes, dragonBalls data for charts
- `useHabitStore` provides todayHabits with streak data
- `HeroSection` component is where display name will be added

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 08-analytics-settings*
*Context gathered: 2026-03-05*
