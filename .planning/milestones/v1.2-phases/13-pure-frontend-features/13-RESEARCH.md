# Phase 13: Pure Frontend Features - Research

**Researched:** 2026-03-06
**Domain:** React frontend components (lists, grids, toasts, banners, animations)
**Confidence:** HIGH

## Summary

Phase 13 adds six pure frontend features using existing API data and established patterns. No backend changes are needed. The codebase already has all API clients (`analyticsApi.capsuleHistory()`, `analyticsApi.wishHistory()`, `habitsApi.contributionGraph()`), the animation queue with priority tiers (`uiStore`), `react-hot-toast` for toasts, and `motion/react` (v12) for animations. The main work is creating new UI components and wiring detection logic into `habitStore.checkHabit()`.

The six features break cleanly into three groups: (1) Analytics page additions (capsule history list, wish history list), (2) Habit detail sheet with contribution graph, and (3) Check-time feedback (nudge banner, daily summary toast, power milestone celebration). Group 3 requires modifications to `habitStore.checkHabit()` and `uiStore`.

**Primary recommendation:** Build analytics history lists and contribution graph first (no store changes), then add the three feedback features that modify `checkHabit()` in a single coordinated plan to avoid merge conflicts.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- History lists placed below existing charts on Analytics page (after PowerLevelChart), scrollable inline
- Each capsule drop: small card with rarity color-coded pill badge (common=gray, rare=blue, epic=purple), reward name, habit that triggered it, date
- Wish history: similar card style with wish title and grant date
- Rarity indicator: colored pill badge, not glow effects
- Contribution graph accessed by tapping a habit card on Dashboard -- opens detail sheet
- Detail sheet: 90-day GitHub-style contribution grid, current streak, best streak, total completions
- No attribute XP in contribution graph view
- Nudge banner: DBZ motivational tone ("Almost there, warrior! Just Meditate and Read left!")
- Shows actual habit names remaining, not just a count
- Daily summary toast: triggers after last habit of the day is checked (whether or not 100%)
- Displayed as styled react-hot-toast showing daily %, tier, and XP earned
- Auto-dismisses after a few seconds, non-blocking
- Power milestone: full overlay animation through animation queue (tier 1 exclusive)
- Shows milestone number with power-up visual
- Detection: compare powerStore's previous powerLevel with new one in habitStore.checkHabit; if crosses milestone threshold, enqueue celebration animation
- Pure frontend detection -- no backend changes needed

### Claude's Discretion
- History lists: pagination approach (show 10 + "Show more" vs scrollable container)
- Wish card exact layout
- Contribution graph: color scheme (green shades like GitHub vs attribute-themed)
- Sheet interaction pattern (bottom sheet vs modal)
- Nudge banner: placement (top of habit list vs bottom floating bar)
- Nudge banner: dismiss behavior (always visible vs dismissable)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| ANLT-01 | User can view capsule drop history in Analytics page | `analyticsApi.capsuleHistory()` returns `CapsuleHistoryItem[]` with id, reward_title, reward_rarity, habit_title, dropped_at. Render as scrollable card list after PowerLevelChart. |
| ANLT-02 | User can view wish grant history in Analytics page | `analyticsApi.wishHistory()` returns `WishHistoryItem[]` with id, wish_title, granted_at. Same card pattern as capsule history. |
| ANLT-03 | User can view per-habit contribution graph (GitHub-style 90-day grid) | `habitsApi.contributionGraph(id, 90)` returns `ContributionDay[]` with date + completed boolean. Build grid component similar to CalendarHeatmap. |
| FEED-04 | User sees "You're close!" nudge banner when 1-2 habits remain | Detect in `checkHabit()` by counting unchecked habits from `todayHabits` state. Show banner component with remaining habit names. |
| FEED-05 | User sees daily summary toast after checking last habit | Detect when all habits are completed (or this was the last check). Use `react-hot-toast` custom toast with daily_log data from CheckHabitResponse. |
| FEED-02 | User sees power level milestone celebration | Compare previous `powerStore.powerLevel` with new `result.power_level` in `checkHabit()`. Milestone thresholds: 1000, 5000, 10000, 50000. Add `power_milestone` event type to uiStore. |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19 | UI framework | Already in use |
| Zustand | Latest | State management | All stores use this pattern |
| motion/react | 12.35+ | Animations | Already used for all overlays |
| react-hot-toast | 2.6+ | Toast notifications | Already installed and used throughout |
| ky | Latest | HTTP client | Already used in api.ts |
| lucide-react | Latest | Icons | Already used throughout |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| tailwindcss | 4 | Styling | All components use Tailwind classes |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom contribution grid | react-calendar-heatmap | Extra dependency; existing CalendarHeatmap pattern sufficient |
| Bottom sheet library | Headless UI / Radix dialog | Extra dependency; simple modal/sheet with motion/react is simpler |

**Installation:** No new packages needed. All dependencies already installed.

## Architecture Patterns

### Recommended Project Structure
```
frontend/src/
├── components/analytics/     # CapsuleHistoryList, WishHistoryList (new)
├── components/dashboard/     # HabitDetailSheet (new), NudgeBanner (new)
├── components/animations/    # PowerMilestoneOverlay (new)
├── store/                    # uiStore (modify), habitStore (modify)
├── hooks/                    # useAnalyticsData (modify or extend)
└── types/                    # No changes needed -- types exist
```

### Pattern 1: Analytics List Components
**What:** Scrollable card list with "Show more" pagination
**When to use:** For capsule and wish history lists
**Example:**
```typescript
// Pattern from existing StatCards / CalendarHeatmap
function CapsuleHistoryList() {
  const [items, setItems] = useState<CapsuleHistoryItem[]>([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    analyticsApi.capsuleHistory().then(setItems).catch(() => {});
    return () => { /* cleanup */ };
  }, []);

  const visible = showAll ? items : items.slice(0, 10);

  return (
    <div className="bg-space-800 rounded-xl p-4">
      {visible.map(item => <CapsuleCard key={item.id} item={item} />)}
      {!showAll && items.length > 10 && (
        <button onClick={() => setShowAll(true)}>Show more</button>
      )}
    </div>
  );
}
```

### Pattern 2: Contribution Grid (GitHub-style)
**What:** 90-day grid using cells colored by completion status
**When to use:** Per-habit detail sheet
**Example:**
```typescript
// Similar to CalendarHeatmap but simpler -- just completed/not-completed cells
// 90 days = ~13 weeks of 7-day columns
// Grid: 7 rows (days of week) x ~13 columns (weeks)
function ContributionGrid({ days }: { days: ContributionDay[] }) {
  // Organize into weeks (columns), days of week (rows)
  // Color: completed = green shade, not = space-700
}
```

### Pattern 3: Animation Event Extension
**What:** Adding new event type to existing animation queue
**When to use:** Power milestone celebration
**Example:**
```typescript
// In uiStore.ts -- extend AnimationEvent union:
| { type: 'power_milestone'; milestone: number }

// In PRIORITY_TIERS:
power_milestone: 1,  // Exclusive -- full overlay

// In AnimationPlayer.tsx -- add case:
case 'power_milestone':
  return <PowerMilestoneOverlay milestone={event.milestone} onComplete={onComplete} />;
```

### Pattern 4: Detection in checkHabit()
**What:** Post-check detection for nudge, summary, and milestone
**When to use:** After successful check response, before return
**Example:**
```typescript
// In habitStore.checkHabit(), after updating state and enqueuing existing animations:

// 1. Power milestone detection
const prevPower = usePowerStore.getState().powerLevel; // BEFORE updateFromCheck
// ... do updateFromCheck ...
const newPower = result.power_level;
const MILESTONES = [1000, 5000, 10000, 50000];
const crossed = MILESTONES.find(m => prevPower < m && newPower >= m);
if (crossed) {
  ui.enqueueAnimation({ type: 'power_milestone', milestone: crossed });
}

// 2. Nudge detection -- count remaining unchecked
const remaining = get().todayHabits.filter(h => !h.completed);
if (remaining.length >= 1 && remaining.length <= 2 && result.is_checking) {
  // Show nudge (via uiStore or direct state)
}

// 3. Daily summary -- all done?
const allDone = get().todayHabits.every(h => h.completed);
if (allDone && result.is_checking) {
  // Show summary toast with daily_log data
}
```

### Anti-Patterns to Avoid
- **Modifying backend:** Phase 13 is pure frontend. All APIs already exist.
- **Creating new Zustand stores:** Use existing stores (uiStore, habitStore, powerStore).
- **Blocking toasts:** Daily summary must use auto-dismiss toast, not a modal.
- **Milestone detection on app load:** Only detect during `checkHabit()`, never on power fetch.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Toast system | Custom toast manager | `react-hot-toast` | Already integrated, handles positioning and auto-dismiss |
| Animation queue | New queue system | `uiStore.enqueueAnimation()` | Priority tiers already handle ordering |
| HTTP requests | fetch/axios | `ky` via existing api.ts clients | Retry, error handling already configured |
| Date formatting | Manual string manipulation | `toLocaleDateString()` | Browser-native, handles locale |

## Common Pitfalls

### Pitfall 1: Power Level Race Condition
**What goes wrong:** Reading `powerStore.powerLevel` AFTER `updateFromCheck()` means you compare new vs new.
**Why it happens:** `updateFromCheck` is synchronous -- it immediately sets the new value.
**How to avoid:** Capture `prevPower` BEFORE calling `updateFromCheck()`.
**Warning signs:** Milestone never fires despite crossing threshold.

### Pitfall 2: Nudge Banner Showing on Uncheck
**What goes wrong:** Banner appears when user unchecks a habit (going from 0 remaining to 1-2).
**Why it happens:** Detection doesn't check `result.is_checking`.
**How to avoid:** Only show nudge when `result.is_checking === true`.
**Warning signs:** Banner appears when user taps to uncheck.

### Pitfall 3: Daily Summary Firing on Every Check
**What goes wrong:** Summary toast shows after every habit check, not just the last one.
**Why it happens:** Checking "all completed" without considering this is the LAST check.
**How to avoid:** Check `result.is_checking === true` AND all habits now completed after state update.
**Warning signs:** Multiple summary toasts in a session.

### Pitfall 4: Contribution Grid Off-by-One
**What goes wrong:** Grid shows 89 or 91 days, or days are misaligned to weekdays.
**Why it happens:** Date math errors with timezones.
**How to avoid:** Work with date strings (YYYY-MM-DD), not Date objects. API returns string dates.
**Warning signs:** Grid has empty rows or wrong day-of-week alignment.

### Pitfall 5: Stale State in checkHabit Detection
**What goes wrong:** `get().todayHabits` returns state BEFORE the optimistic update settles.
**Why it happens:** The `set()` call with updated state hasn't been read back yet.
**How to avoid:** Compute remaining habits from the updated array you just set, or use the result data directly.
**Warning signs:** Nudge/summary triggers one check too early or too late.

## Code Examples

### Rarity Color Map (for Capsule History)
```typescript
const rarityColorMap: Record<Rarity, string> = {
  common: 'bg-gray-500 text-gray-100',
  rare: 'bg-blue-500 text-blue-100',
  epic: 'bg-purple-500 text-purple-100',
};
```

### Custom Toast for Daily Summary
```typescript
import toast from 'react-hot-toast';

function showDailySummary(dailyLog: DailyLogSummary) {
  toast.custom((t) => (
    <div className={`bg-space-800 border border-saiyan-500 rounded-xl p-4 shadow-xl
      ${t.visible ? 'animate-enter' : 'animate-leave'}`}>
      <p className="text-saiyan-500 font-bold">Day Complete!</p>
      <p className="text-text-primary text-sm">
        {Math.round(dailyLog.completion_rate * 100)}% | {dailyLog.completion_tier} | +{dailyLog.xp_earned} XP
      </p>
    </div>
  ), { duration: 4000 });
}
```

### GitHub-Style Grid Layout
```typescript
// 90 days arranged as 7 rows x ~13 columns
// Each column = 1 week, rows = Mon-Sun
// Most recent week on the right
function buildGrid(days: ContributionDay[]): (ContributionDay | null)[][] {
  const grid: (ContributionDay | null)[][] = Array.from({ length: 7 }, () => []);
  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));

  // Pad to start on correct weekday
  const firstDay = new Date(sorted[0]?.date);
  const startDow = firstDay.getDay(); // 0=Sun
  for (let i = 0; i < startDow; i++) grid[i].push(null);

  for (const day of sorted) {
    const dow = new Date(day.date).getDay();
    grid[dow].push(day);
  }

  return grid;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| framer-motion | motion/react v12 | 2025 | Import from 'motion/react' not 'framer-motion' |
| Custom animation queue | Priority-tiered queue in uiStore | Phase 11 | Use existing enqueueAnimation with tier system |

## Open Questions

1. **Nudge banner placement**
   - What we know: CONTEXT.md says "Claude's Discretion" for placement
   - Recommendation: Bottom floating bar (more visible, doesn't push content). Render in Dashboard above BottomTabBar.

2. **Contribution graph color scheme**
   - What we know: CONTEXT.md says "Claude's Discretion"
   - Recommendation: Green shades like GitHub (universally recognized pattern). 4 levels: empty, light, medium, dark green.

3. **Detail sheet interaction**
   - What we know: CONTEXT.md says "Claude's Discretion"
   - Recommendation: Bottom sheet (natural for mobile-first). Slide up with motion/react. Tap outside or swipe down to close.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.0 + @testing-library/react |
| Config file | `frontend/vitest.config.ts` |
| Quick run command | `cd frontend && npx vitest run --reporter=verbose` |
| Full suite command | `cd frontend && npx vitest run --reporter=verbose` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ANLT-01 | Capsule history list renders items with rarity badges | unit | `cd frontend && npx vitest run src/__tests__/capsule-history.test.tsx -x` | Wave 0 |
| ANLT-02 | Wish history list renders items with dates | unit | `cd frontend && npx vitest run src/__tests__/wish-history.test.tsx -x` | Wave 0 |
| ANLT-03 | Contribution grid renders 90-day grid from API data | unit | `cd frontend && npx vitest run src/__tests__/contribution-graph.test.tsx -x` | Wave 0 |
| FEED-04 | Nudge banner shows when 1-2 habits remain | unit | `cd frontend && npx vitest run src/__tests__/nudge-banner.test.tsx -x` | Wave 0 |
| FEED-05 | Daily summary toast shows after last habit check | unit | `cd frontend && npx vitest run src/__tests__/daily-summary.test.ts -x` | Wave 0 |
| FEED-02 | Power milestone animation enqueues on threshold crossing | unit | `cd frontend && npx vitest run src/__tests__/power-milestone.test.ts -x` | Wave 0 |

### Sampling Rate
- **Per task commit:** `cd frontend && npx vitest run --reporter=verbose`
- **Per wave merge:** `cd frontend && npx vitest run --reporter=verbose`
- **Phase gate:** Full suite green before verify-work

### Wave 0 Gaps
- [ ] `frontend/src/__tests__/capsule-history.test.tsx` -- covers ANLT-01
- [ ] `frontend/src/__tests__/wish-history.test.tsx` -- covers ANLT-02
- [ ] `frontend/src/__tests__/contribution-graph.test.tsx` -- covers ANLT-03
- [ ] `frontend/src/__tests__/nudge-banner.test.tsx` -- covers FEED-04
- [ ] `frontend/src/__tests__/daily-summary.test.ts` -- covers FEED-05
- [ ] `frontend/src/__tests__/power-milestone.test.ts` -- covers FEED-02

## Sources

### Primary (HIGH confidence)
- Codebase analysis: `frontend/src/store/uiStore.ts` -- animation queue with priority tiers
- Codebase analysis: `frontend/src/store/habitStore.ts` -- checkHabit flow and event dispatch
- Codebase analysis: `frontend/src/store/powerStore.ts` -- power level tracking
- Codebase analysis: `frontend/src/services/api.ts` -- all API clients ready
- Codebase analysis: `frontend/src/types/index.ts` -- CapsuleHistoryItem, WishHistoryItem, ContributionDay types
- Codebase analysis: `frontend/src/components/analytics/CalendarHeatmap.tsx` -- grid pattern reference
- Codebase analysis: `frontend/src/components/animations/AnimationPlayer.tsx` -- overlay dispatch pattern

### Secondary (MEDIUM confidence)
- GitHub contribution graph layout (well-known pattern, 7 rows x N weeks)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all libraries already in use, no new deps
- Architecture: HIGH - established patterns in codebase, clear integration points
- Pitfalls: HIGH - identified from actual code analysis of checkHabit flow

**Research date:** 2026-03-06
**Valid until:** 2026-04-06 (stable -- pure frontend, no external API changes)
