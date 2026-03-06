# Phase 11: Animation Queue Refactor + Tech Debt - Context

**Gathered:** 2026-03-06
**Status:** Ready for planning

<domain>
## Phase Boundary

Priority-tiered animation system with combo batching to prevent overload when multiple events fire simultaneously, plus removing the recharts react-is override hack. No new animation types or visual features — this is infrastructure refactoring.

</domain>

<decisions>
## Implementation Decisions

### Priority Tier Assignments
- 3 tiers: Exclusive overlays (transformation, shenron) > Banners (tier_change, perfect_day, capsule_drop) > Inline (xp_popup, dragon_ball)
- FIFO ordering within the same tier — no secondary sort
- Strict priority: all Tier 1 events play before any Tier 2 events, etc.
- Inline events (xp_popup, dragon_ball) fire independently and do NOT go through the queue — they can co-exist with overlays

### Combo Summary Design
- Single combo overlay listing all batched events (not stacked cards)
- Auto-dismiss after ~3 seconds, no tap required
- Highest-priority event plays its full individual overlay first; remaining events batch into the combo summary
- DBZ-themed flair: "COMBO x3!" header with energy burst styling

### Queue Overflow Policy
- Combo batching kicks in at 3+ queued events (matching success criteria)
- No hard cap on queue size — combo batching is sufficient to prevent overload
- Late-arriving events merge into the current pending combo (not a fresh batch)
- Duplicate events of the same type are deduplicated (e.g., two xp_popups merge into one with summed XP)

### Recharts Fix
- Upgrade recharts to latest React 19-compatible version and remove the `"overrides": { "react-is": "^19.0.0" }` from package.json
- If upgrade doesn't resolve the issue, switch to an alternative chart library
- Charts must render identically to current look — no visual changes

### Claude's Discretion
- Exact combo overlay animation/transition details
- Specific auto-dismiss timing (approximately 3 seconds)
- Internal queue data structure and sorting implementation
- Which alternative chart library to use if recharts upgrade fails

</decisions>

<specifics>
## Specific Ideas

- Combo overlay should feel like a DBZ power-up moment — "COMBO x3!" with energy styling
- The top-priority event (e.g., transformation) should still get its full dramatic overlay before the combo summary plays
- Inline animations should never be blocked by the queue — XP popups should feel instant

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `AnimationPlayer` (`src/components/animations/AnimationPlayer.tsx`): Current queue consumer — needs refactoring from FIFO to priority-tiered
- `useUiStore` (`src/store/uiStore.ts`): Animation queue state with `enqueueAnimation`/`dequeueAnimation` — needs priority and batching logic
- `AnimatePresence` from `motion/react`: Already used for overlay transitions
- Existing overlay components: `PerfectDayOverlay`, `CapsuleDropOverlay`, `DragonBallTrajectory`, `TransformationOverlay`, `ShenronCeremony`

### Established Patterns
- Zustand stores for state management (`create` from `zustand`)
- `motion/react` (Framer Motion) for all animations
- `AnimatePresence mode="wait"` for sequential overlay playback
- `QUEUED_TYPES` set distinguishes overlay vs inline events — aligns with the tier split

### Integration Points
- `AppShell` mounts `AnimationPlayer` at root level
- `habitStore.ts` enqueues animation events after habit checks
- `package.json` contains the `overrides` block to remove
- `PowerLevelChart.tsx` and `AttributeChart.tsx` are the recharts consumers

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 11-animation-queue-refactor-tech-debt*
*Context gathered: 2026-03-06*
