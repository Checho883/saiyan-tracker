# Phase 5: Dashboard Core & Habit Management - Context

**Gathered:** 2026-03-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the main dashboard view where users can view all habits, check them off with optimistic UI, and see every game-state display (aura %, attributes, Dragon Balls, avatar, streaks, quotes, XP popup) update from real backend data. Also includes habit create, edit, and delete flows. Animations are Phase 7 — this phase builds the static/functional UI with basic transitions only.

</domain>

<decisions>
## Implementation Decisions

### Dashboard Layout
- Hero + scrollable list structure — hero at top, habits scroll below
- Hero section contains: Saiyan avatar with scouter overlay, power level, transformation progress, and daily aura completion gauge
- Hero collapses on scroll to a mini version (aura bar + power level) and expands back when scrolling to top
- Secondary game stats (attribute bars, Dragon Ball tracker, streaks) live in a collapsible panel — one tap to expand/collapse
- Collapsible panel sits between hero and habit list

### Habit Card Design
- Habits grouped by category with category headers, each card has attribute color accent (left border or badge)
- Medium density cards: top line (emoji + title + checkbox indicator), bottom line (attribute badge + streak + importance indicator)
- Tap anywhere on card to check/uncheck — biggest tap target for mobile
- Completed habits dim in place (reduced opacity + checkmark) — no reordering, stable list position
- XP popup text floats up from the checked card

### Game-State Displays
- **Aura bar:** Circular gauge near/around avatar, scouter readout feel, shows daily completion % with tier label (Kaio-ken x3/x10/x20) at 50%/80%/100%
- **Attribute bars:** 2x2 grid of quadrant cards, each showing attribute icon, level number, and XP fill toward next level
- **Dragon Ball tracker:** Horizontal row of 7 circles — collected balls glow orange with star count, empty slots are dim outlines
- **Avatar:** Character portrait of current transformation form with scouter-style HUD overlay showing power level number, form name, and progress bar to next transformation
- **Streaks:** Displayed per habit (current/best) in the habit card, plus potentially a main streak display

### Habit CRUD
- Create/edit form presented as bottom sheet modal sliding up from bottom (~80% screen height), scrollable, swipe down to dismiss
- Progressive disclosure: essential fields first (title, attribute, importance, category), expandable "More options" section for the rest (frequency, custom_days, description, target_time, dates)
- Same form used for edit (pre-populated) and create
- Delete via confirmation dialog or archive (set is_active=false) — preserves streak data

### Character Quotes
- Quote appears after habit check as a styled toast notification with character avatar, quote text, and character name
- Auto-dismisses after 3-4 seconds, non-blocking

### Claude's Discretion
- Exact collapse/expand transition for hero section
- Collapsible panel animation and toggle design
- Spacing, typography, and card shadow/border details
- Loading skeleton design for initial data fetch
- Error state handling for failed API calls
- Empty state when no habits exist (suggest creating first habit)
- Sort order within category groups

</decisions>

<specifics>
## Specific Ideas

- Scouter readout feel for the aura gauge — like the show's power level scanner
- Cards should feel responsive and satisfying on tap, even without Phase 7 animations
- Dragon Ball tracker should be immediately recognizable to DBZ fans (orange glowing balls with stars)
- The collapsing hero is a "best of both worlds" approach — full immersion at top, maximum habit space when scrolling

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `habitStore.ts`: Full optimistic check/uncheck with rollback, auto-enqueues animation events (xp_popup, tier_change, capsule_drop, dragon_ball, transformation, perfect_day)
- `powerStore.ts`: Holds powerLevel, transformation, transformationName, nextTransformation, nextThreshold, dragonBallsCollected, attributes (level + XP detail)
- `uiStore.ts`: Animation queue (skeleton for Phase 7) + modal state (activeModal, openModal, closeModal)
- `rewardStore.ts`: Available for capsule/reward data
- `useInitApp.ts`: Hydrates all stores on mount
- `LoadingScreen.tsx`: Loading state component
- `AppShell.tsx`: Layout wrapper with Outlet + BottomTabBar
- `BottomTabBar.tsx`: Navigation between Dashboard/Analytics/Settings

### Established Patterns
- Zustand stores with `useShallow` for multi-value selections
- `react-hot-toast` for error notifications
- Tailwind v4 with DBZ tokens: `space-900` (background), `saiyan-500`/`saiyan-600` (orange accents), `text-secondary`, `danger`
- API client using `ky` with typed request/response
- Optimistic UI pattern established in habitStore.checkHabit

### Integration Points
- Dashboard.tsx is a placeholder — new components render here via the AppShell Outlet
- habitStore.fetchToday(date) provides today's habits
- powerStore.fetchPower() provides all game-state data
- uiStore.openModal/closeModal for CRUD modals
- uiStore.enqueueAnimation for XP popups and events (Phase 7 will consume queue, Phase 5 can show basic XP text)
- Types fully defined: HabitCreate, HabitUpdate, HabitTodayResponse, CheckHabitResponse, AttributeDetail, QuoteDetail

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 05-dashboard-core-habit-management*
*Context gathered: 2026-03-05*
