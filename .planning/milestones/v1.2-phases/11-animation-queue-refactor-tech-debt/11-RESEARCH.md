# Phase 11: Animation Queue Refactor + Tech Debt - Research

**Researched:** 2026-03-06
**Status:** Complete
**Requirements:** FEED-06, TECH-01

## Current Architecture Analysis

### Animation Queue (uiStore.ts)
- Simple FIFO array: `animationQueue: AnimationEvent[]`
- `enqueueAnimation()` appends to end
- `dequeueAnimation()` shifts from front
- No priority awareness, no batching, no deduplication
- 7 event types: `tier_change`, `perfect_day`, `capsule_drop`, `dragon_ball`, `transformation`, `xp_popup`, `shenron`

### AnimationPlayer.tsx
- Root-level consumer mounted in AppShell
- `QUEUED_TYPES` set: `perfect_day`, `capsule_drop`, `dragon_ball`, `transformation`, `shenron`
- Non-queued (inline) types: `xp_popup`, `tier_change` -- rendered elsewhere, bypass queue
- Uses `AnimatePresence mode="wait"` for sequential playback
- Dequeues after exit animation completes via `handleExitComplete`
- Bug: `dequeueAnimation()` always removes first item, but `current` finds first QUEUED_TYPES match -- mismatch if inline events precede queued events

### Event Enqueueing (habitStore.ts)
- All events enqueued synchronously after `checkHabit()` API response
- Order: transformation > capsule_drop > perfect_day > xp_popup > dragon_ball > tier_change
- A single habit check can trigger up to 6 events simultaneously
- No batching logic -- all go into queue individually

### Existing Components
- `PerfectDayOverlay` -- full-screen overlay
- `CapsuleDropOverlay` -- full-screen overlay
- `DragonBallTrajectory` -- full-screen overlay
- `TransformationOverlay` -- full-screen overlay (exclusive)
- `ShenronCeremony` -- full-screen overlay (exclusive)
- `TierChangeBanner` -- inline banner (not queued)
- XP popup -- inline (rendered in HeroSection area)

## Priority Tier Design

### Tier Assignment (from CONTEXT.md decisions)
| Tier | Priority | Events | Behavior |
|------|----------|--------|----------|
| 1 - Exclusive | Highest | `transformation`, `shenron` | Full overlay, plays individually |
| 2 - Banner | Medium | `tier_change`, `perfect_day`, `capsule_drop`, `dragon_ball` | Overlay, subject to combo batching |
| 3 - Inline | Lowest | `xp_popup` | Fire independently, bypass queue entirely |

### Queue Processing Rules
1. Sort by tier (ascending = highest priority first), FIFO within same tier
2. All Tier 1 events play their full individual overlay before any Tier 2
3. Tier 3 events fire independently (current behavior preserved)
4. Combo batching triggers at 3+ queued events (after Tier 1 plays)
5. Highest-priority event plays full overlay; remaining batch into combo summary
6. Late-arriving events merge into pending combo
7. Duplicate same-type events deduplicate (e.g., two xp_popups sum XP)

## Combo Summary Component

### Design Specs
- Single combo overlay listing all batched events
- Header: "COMBO x{N}!" with energy burst styling (DBZ theme)
- Auto-dismiss after ~3 seconds
- Lists each batched event with icon/description
- No tap required for dismissal

### Implementation Approach
- New `ComboSummaryOverlay` component
- Receives array of batched `AnimationEvent[]`
- Uses `motion/react` AnimatePresence for enter/exit
- Styled with existing Tailwind theme classes (space-*, saiyan-*, aura-*)

## Recharts Tech Debt

### Current State
- recharts v3.7.0 installed
- react-is@19.2.4 resolved (matches React 19)
- `package.json` has `"overrides": { "react-is": "^19.0.0" }`
- Override appears to be vestigial -- recharts 3.7.0 already resolves react-is@19.2.4 natively
- 2 chart consumers: `PowerLevelChart.tsx` (LineChart), `AttributeChart.tsx` (AreaChart)

### Fix Plan
1. Remove `"overrides"` block from `package.json`
2. Run `npm install` to regenerate lock file
3. Verify charts still render (existing tests in `analytics-charts.test.tsx`)
4. If removal causes peer dependency warnings, add explicit `react-is` as devDependency

## Risk Assessment

### Low Risk
- Recharts fix: Override is vestigial, removal should be clean
- Priority sorting: Simple numeric sort on tier field

### Medium Risk
- Combo batching: New component + queue logic changes
- Dequeue mismatch bug: Current `dequeueAnimation()` always pops first item regardless of type

### Mitigation
- Existing test suite (`animation-queue.test.tsx`) covers core queue behavior
- New tests needed for priority ordering and combo batching
- TierChangeBanner stays inline (unchanged)

## Implementation Strategy

### Plan 1: Priority Queue + Combo System (Wave 1)
- Refactor `uiStore.ts`: Add priority tiers, sorted insertion, deduplication
- Refactor `AnimationPlayer.tsx`: Priority-aware consumption, combo batching threshold
- New `ComboSummaryOverlay.tsx` component
- Update tests for new behavior

### Plan 2: Recharts Cleanup (Wave 1, parallel)
- Remove overrides from `package.json`
- Verify charts render correctly
- Independent of animation work -- can run in parallel

## Validation Architecture

### Dimension 1: Priority Ordering
- Enqueue transformation + perfect_day + capsule_drop simultaneously
- Verify transformation plays first (Tier 1 before Tier 2)

### Dimension 2: Combo Batching
- Enqueue 4+ Banner-tier events
- Verify first plays individually, remaining batch into combo summary
- Verify combo auto-dismisses

### Dimension 3: Inline Independence
- Enqueue xp_popup while overlay is playing
- Verify xp_popup fires immediately (not blocked by queue)

### Dimension 4: Deduplication
- Enqueue two xp_popup events
- Verify they merge into single event with summed amount

### Dimension 5: Recharts Clean
- Remove overrides, verify `npm ls react-is` shows no conflicts
- Verify chart rendering via existing test suite

---

## RESEARCH COMPLETE

*Phase: 11-animation-queue-refactor-tech-debt*
*Research completed: 2026-03-06*
