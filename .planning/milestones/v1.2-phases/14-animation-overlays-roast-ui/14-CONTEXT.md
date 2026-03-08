# Phase 14: Animation Overlays + Roast UI - Context

**Gathered:** 2026-03-06
**Status:** Ready for planning

<domain>
## Phase Boundary

Every meaningful game event discovered by backend detection (attribute level-ups, zenkai recovery, streak milestones, roast/welcome-back) gets a visible, audible celebration or notification in the UI. Also includes an achievements/badges grid for viewing earned progress. Does NOT include new backend detection logic (Phase 12) or animation queue refactoring (Phase 11).

</domain>

<decisions>
## Implementation Decisions

### Level-up overlay
- Display attribute name, new level number, AND DBZ-themed title (e.g., "STR Level 5 -- Saiyan Warrior")
- Include a character quote below the level-up info (quote data already in CheckHabitResponse)
- Wire into AnimationPlayer via new `level_up` event type in uiStore

### Level-up overlay -- Claude's Discretion
- Overlay prominence/tier (full-screen exclusive vs banner) -- Claude decides based on animation tier system
- Streak milestone overlay style (reuse level-up pattern vs distinct look) -- Claude decides

### Zenkai recovery animation
- Dramatic full-screen overlay (Tier 1 exclusive) with power-surge visual effect
- Reference the streak break: "Back after X days -- ZENKAI BOOST!" (gap data available)
- Include a Goku motivational comeback quote

### Zenkai recovery -- Claude's Discretion
- Animation queue order relative to Perfect Day overlay -- Claude decides the narrative sequence

### Roast/welcome UI
- Inline dismissible card at the top of the dashboard (not modal, not toast)
- Show character avatars (Goku + Vegeta) next to their quotes (avatar_path from backend)
- Severity-based escalating visuals: mild = subtle border/tone, medium = bolder color/shake, savage = red/intense with screen effects
- Triggered on app load when StatusResponse contains roast data

### Roast/welcome -- Claude's Discretion
- Whether Goku welcome-back and Vegeta roast appear sequentially or simultaneously -- Claude decides flow/timing

### Achievements grid
- Lives as a new section in the existing Analytics page
- Show ALL possible achievements: earned ones highlighted, unearned ones locked/grayed/silhouetted
- Grouped by category: "Streak Milestones", "Transformation Unlocks", "Attribute Level-ups"

### Achievements grid -- Claude's Discretion
- Badge card content (icon + name + date vs minimal) -- Claude designs based on available data
- Visual styling of locked vs unlocked badges

</decisions>

<specifics>
## Specific Ideas

- Zenkai should feel like the classic DBZ power-up moment -- "a Saiyan grows stronger after every defeat"
- Roast severity should be visually obvious: savage roasts should feel intense/intimidating compared to mild teasing
- Locked achievements give users goals to work toward -- classic RPG trophy case pattern

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `AnimationPlayer` (animations/AnimationPlayer.tsx): Root-level queue consumer with priority tiers, ready to accept new event types
- `uiStore` (store/uiStore.ts): AnimationEvent union type + PRIORITY_TIERS mapping -- add new types here
- `PerfectDayOverlay`, `TransformationOverlay`, `PowerMilestoneOverlay`: Existing Tier 1/2 overlays to reference for patterns
- `ScreenShake` (animations/ScreenShake.tsx): Available for savage roast visual effects
- `ParticleBurst` (animations/ParticleBurst.tsx): Available for level-up/zenkai celebrations
- `springs.ts`: Shared animation spring configs
- `useSkippable` hook: Allows users to tap-to-skip overlays

### Established Patterns
- Animation events flow: habitStore.checkHabit() -> parse response events[] -> enqueueAnimation() -> AnimationPlayer renders
- Overlay components receive `onComplete` callback, use motion/react for enter/exit
- Priority tiers: 1=exclusive (individual), 2=banner (combo-batchable), 3=inline (bypass queue)

### Integration Points
- `CheckHabitResponse.events[]` already returns `level_up`, `streak_milestone`, `transformation` event dicts -- frontend needs to map these to AnimationEvent types
- `StatusResponse` (backend/app/schemas/status.py): `welcome_back` + `roast` data for roast UI -- needs frontend fetch on app load
- Analytics page (components/analytics/): Add achievements section alongside existing StatCards, charts, history lists
- Achievement model (backend): `achievement_type`, `achievement_key`, `metadata_json` -- needs API endpoint + frontend types
- `HeroSection` or dashboard layout: Mount point for roast/welcome inline card

</code_context>

<deferred>
## Deferred Ideas

None -- discussion stayed within phase scope

</deferred>

---

*Phase: 14-animation-overlays-roast-ui*
*Context gathered: 2026-03-06*
