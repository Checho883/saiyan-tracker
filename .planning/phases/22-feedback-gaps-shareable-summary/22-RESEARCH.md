# Phase 22: Feedback Gaps + Shareable Summary - Research

**Researched:** 2026-03-11
**Domain:** Frontend feedback UX (animations, sounds, clipboard API) + minor backend type sync
**Confidence:** HIGH

## Summary

This phase layers feedback UX onto existing backend data and frontend infrastructure. All five requirements (FDBK-01 through FDBK-04, SHAR-01) are purely frontend work with one type-sync gap: the `StatusResponse` TypeScript type is missing the `streak_breaks` field that the backend already returns. No new backend endpoints, no new data models, no new npm dependencies.

The codebase has strong existing patterns for every feature in this phase: `XpPopup` just needs a negative variant, `AuraGauge` already has CSS transition on `strokeDashoffset`, `RoastWelcomeCard` provides the dismissible-card pattern for streak breaks, `PowerMilestoneOverlay`/`ScreenShake` are ready for escalation props, and `react-hot-toast` handles the clipboard toast. The main complexity is wiring the uncheck path in `HabitCard.handleTap` to trigger negative feedback, and expanding the milestone array + escalation tiers in the overlay.

**Primary recommendation:** Extend existing components with variants/props rather than creating new ones. The only new component is `StreakBreakCard`. Everything else is modification of `XpPopup`, `PowerMilestoneOverlay`, `HabitCard`, `habitStore`, and `HeroSection`.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Red negative XP popup mirroring the existing XpPopup -- same component with a negative variant, showing actual deducted amount (e.g., "-15 STR XP"), floating downward instead of upward
- AuraGauge smoothly animates shrink over ~500ms when completion drops (same Motion lib used for growth, just reversed)
- Keep the existing `undo` sound on uncheck (already wired in HabitCard) -- no change to audio
- Backend's `attribute_xp_awarded` on uncheck provides the actual deduction amount for the popup
- Dismissible banner card rendered above the habit list on first dashboard load when `StatusResponse.streak_breaks[]` is non-empty
- Multiple broken streaks stacked in a single card (e.g., "2 streaks broken" with a list of habit: old -> halved)
- Encouraging Saiyan tone: "A Saiyan grows stronger after every defeat." with CTA button labeled "Get Back Up"
- Plays `power_up` sound when the card appears (Zenkai recovery theme)
- Single dismiss action closes card for the session (X button or CTA both dismiss)
- Expand POWER_MILESTONES from 4 to 10: [100, 250, 500, 1000, 2500, 5000, 10000, 25000, 50000, 100000]
- Escalating celebration intensity by tier: 100-2500 standard, 5K-10K + ScreenShake, 25K-50K + ScreenShake + longer FX, 100K full gold theme + thunder_roar
- Reuses existing PowerMilestoneOverlay and ScreenShake components
- Copy-to-clipboard text summary with full stats: date, completion %, XP earned, power level + transformation name, best streak highlight, capsule drop if any, "Powered by Saiyan Tracker" footer
- Share button (clipboard icon) placed in the hero section next to power level display -- always visible
- Quick success toast on copy: "Scouter data copied!" (2s, top-center, matches existing toast style)
- Today's data only -- no yesterday fallback
- Uses navigator.clipboard.writeText API

### Claude's Discretion
- Exact animation timing for negative XP popup float-down
- Streak-break card styling details (border color, icon choice)
- Milestone escalation thresholds for ScreenShake intensity
- Share summary text formatting details and emoji usage
- Whether to add the clipboard button to mobile MiniHero variant

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| FDBK-01 | User hears a sound and sees a negative XP popup when unchecking a habit | Extend `XpPopup` with negative variant (red, downward float). Sound already wired (`undo` plays on uncheck at HabitCard line 84). `attribute_xp_awarded` returned on uncheck provides deduction amount. |
| FDBK-02 | User sees aura gauge shrink when unchecking a habit | `AuraGauge` already has `transition: 'stroke-dashoffset 700ms ease-out'` on the progress circle. Completion recalculates via `useAuraProgress` hook when `todayHabits` updates. Shrink happens automatically -- just need to verify it works smoothly on uncheck. |
| FDBK-03 | User sees a streak-break notice on first dashboard load after a streak breaks | Backend already returns `streak_breaks[]` in `StatusResponse`. Frontend type needs sync (missing field). New `StreakBreakCard` component follows `RoastWelcomeCard` pattern. Mounts in Dashboard above HabitList. |
| FDBK-04 | User sees a celebration when passing power level milestones that currently go unnoticed | Expand `POWER_MILESTONES` array in `habitStore.ts` line 9. Add escalation props to `PowerMilestoneOverlay`. Wrap in `ScreenShake` for higher tiers. Add `thunder_roar` sound mapping for 100K. |
| SHAR-01 | User can copy a DBZ-themed daily summary to clipboard with one tap from the dashboard | New share button in `HeroSection`/`ScouterHUD`. Build summary string from `habitStore`, `powerStore`, `useAuraProgress`. Use `navigator.clipboard.writeText()` + `react-hot-toast` for feedback. |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| motion | ^12.35.0 | Animation (float-down, spring scale, shake) | Already used throughout for all animations |
| react-hot-toast | ^2.6.0 | Toast notifications ("Scouter data copied!") | Already used for all transient messages |
| zustand | ^5.0.11 | State management (habitStore, uiStore, statusStore, powerStore) | Already the state layer |
| lucide-react | ^0.500.0 | Icons (clipboard, X dismiss) | Already the icon library |
| tailwindcss | ^4.2.1 | Styling | Already the CSS framework |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| howler | ^2.2.4 | Sound sprite playback | Already wired via useAudio/useSoundEffect |

### Alternatives Considered
None -- all decisions lock onto existing stack. No new dependencies needed.

**Installation:**
No new packages required.

## Architecture Patterns

### Recommended Project Structure
```
frontend/src/
├── components/
│   ├── dashboard/
│   │   ├── XpPopup.tsx          # MODIFY: add negative variant (red, down)
│   │   ├── HabitCard.tsx        # MODIFY: trigger negative XP popup on uncheck
│   │   ├── HeroSection.tsx      # MODIFY: add share button
│   │   ├── ScouterHUD.tsx       # MODIFY: add share button placement
│   │   ├── MiniHero.tsx         # POSSIBLY MODIFY: add share button (discretion)
│   │   ├── StreakBreakCard.tsx   # NEW: dismissible streak-break banner
│   │   └── RoastWelcomeCard.tsx # REFERENCE: pattern for dismissible card
│   └── animations/
│       ├── PowerMilestoneOverlay.tsx  # MODIFY: add escalation tiers
│       └── ScreenShake.tsx            # REFERENCE: wrap milestone overlay
├── store/
│   ├── habitStore.ts            # MODIFY: expand POWER_MILESTONES, add negative XP enqueue
│   ├── uiStore.ts               # POSSIBLY MODIFY: add negative_xp animation type
│   └── statusStore.ts           # REFERENCE: streak_breaks data
├── audio/
│   ├── useSoundEffect.ts        # MODIFY: update sound map for milestone escalation
│   └── soundMap.ts              # REFERENCE: existing sound IDs
├── hooks/
│   └── useAuraProgress.ts       # REFERENCE: auto-recalculates on habit change
├── types/
│   └── index.ts                 # MODIFY: add streak_breaks to StatusResponse
├── pages/
│   └── Dashboard.tsx            # MODIFY: render StreakBreakCard
└── index.css                    # MODIFY: add xp-sink keyframe
```

### Pattern 1: Negative XP Popup (Extending XpPopup)
**What:** Add a `negative` boolean prop to XpPopup that flips color to red and animation to downward float
**When to use:** When unchecking a previously completed habit
**Example:**
```typescript
// XpPopup.tsx - add negative variant
interface XpPopupProps {
  amount: number;
  attribute: Attribute;
  negative?: boolean;  // NEW
  onDone: () => void;
}

// Render: negative uses red text, downward animation, shows "-{amount}"
<span
  className={`absolute ${negative ? '-bottom-2' : '-top-2'} right-4 text-sm font-bold pointer-events-none ${negative ? 'text-danger' : textColorMap[attribute]}`}
  style={{ animation: `${negative ? 'xp-sink' : 'xp-float'} 1s ease-out forwards` }}
>
  {negative ? '-' : '+'}{amount} {attribute.toUpperCase()} XP
</span>
```

```css
/* index.css - new keyframe for downward float */
@keyframes xp-sink {
  0% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(60px); }
}
```

### Pattern 2: Dismissible Session Card (Following RoastWelcomeCard)
**What:** A card that renders based on store data, dismisses for the session via local `useState(false)`
**When to use:** StreakBreakCard renders when `StatusResponse.streak_breaks.length > 0`
**Key pattern from RoastWelcomeCard:**
```typescript
const [dismissed, setDismissed] = useState(false);
if (!isLoaded || !status || status.streak_breaks.length === 0) return null;
if (dismissed) return null;
// AnimatePresence wrapping for exit animation
```

### Pattern 3: Milestone Escalation via Props
**What:** Pass `milestone` value to `PowerMilestoneOverlay`, derive escalation tier from threshold ranges
**When to use:** When `power_milestone` animation event fires
**Example:**
```typescript
function getEscalationTier(milestone: number): 'standard' | 'shake' | 'epic' | 'legendary' {
  if (milestone >= 100000) return 'legendary';
  if (milestone >= 25000) return 'epic';
  if (milestone >= 5000) return 'shake';
  return 'standard';
}
```

### Pattern 4: Clipboard Share
**What:** Build text summary from store data, copy via navigator.clipboard.writeText, toast on result
**When to use:** Share button tap in hero section
**Example:**
```typescript
async function handleShare() {
  const summary = buildDailySummary(); // pulls from stores
  try {
    await navigator.clipboard.writeText(summary);
    toast.success('Scouter data copied!', { duration: 2000, position: 'top-center' });
  } catch {
    toast.error('Copy failed — try again', { duration: 2000, position: 'top-center' });
  }
}
```

### Anti-Patterns to Avoid
- **Creating new animation event types for negative XP when inline state suffices:** The uncheck path already has the data in HabitCard's local state. Don't route through uiStore animation queue -- just show the popup locally like positive XP already does.
- **Persisting streak-break dismissal to localStorage:** Decision says "session only" -- use `useState(false)`, not persistent storage.
- **Adding new sound files for milestone escalation:** Reuse existing sounds (`explosion`, `thunder_roar`). The escalation is visual (ScreenShake, gold theme), not audio-only.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Clipboard access | Custom clipboard polyfill | `navigator.clipboard.writeText` | Supported in all modern browsers; fallback unnecessary for this app's target |
| Dismissible card animations | Manual CSS transition management | `AnimatePresence` + `motion.div` from motion/react | Already the pattern in RoastWelcomeCard |
| Sound-on-mount for streak card | Manual Howler call | `useAudio().play('power_up')` in a `useEffect` | Consistent with existing audio pattern |
| Toast notifications | Custom toast component | `react-hot-toast` `toast.success()` / `toast.error()` | Already the toast system |
| Screen shake | CSS keyframe shake | `ScreenShake` component wrapping motion | Already built with configurable trigger |

**Key insight:** Every building block for this phase already exists in the codebase. The work is wiring, extending, and composing -- not creating from scratch.

## Common Pitfalls

### Pitfall 1: StatusResponse Type Mismatch
**What goes wrong:** Backend returns `streak_breaks[]` but frontend TypeScript type doesn't include it, causing runtime property access on `undefined`
**Why it happens:** The `StatusResponse` type in `frontend/src/types/index.ts` was defined before streak-break detection was added to the backend (Phase 19)
**How to avoid:** Add `streak_breaks: StreakBreak[]` to the frontend `StatusResponse` type AND add the `StreakBreak` interface
**Warning signs:** TypeScript errors on `status.streak_breaks`, or silent `undefined` if using optional chaining

### Pitfall 2: AuraGauge Shrink Already Works (Don't Over-Engineer)
**What goes wrong:** Building custom shrink animation when the existing CSS transition already handles it
**Why it happens:** The `AuraGauge` component has `transition: 'stroke-dashoffset 700ms ease-out'` and `useAuraProgress` recalculates `percent` from `todayHabits` state. When a habit is unchecked, the store updates `todayHabits`, `percent` drops, and the gauge transitions smoothly.
**How to avoid:** Verify the existing transition works on uncheck. Only intervene if the 700ms timing needs adjustment to match the ~500ms decision.
**Warning signs:** None expected -- the mechanism is already in place. May want to adjust from 700ms to 500ms per user decision.

### Pitfall 3: Double Sound on Uncheck
**What goes wrong:** Playing both `undo` sound AND a negative-XP sound, creating audio clash
**Why it happens:** `HabitCard.handleTap` already plays `undo` on uncheck (line 84). If negative XP also triggers a sound via the animation queue, two sounds overlap.
**How to avoid:** Decision says "Keep the existing `undo` sound on uncheck -- no change to audio." The negative XP popup should NOT trigger additional sound. Do NOT route it through `uiStore.enqueueAnimation` (which triggers `useSoundEffect`).
**Warning signs:** Two sounds playing simultaneously on uncheck

### Pitfall 4: Milestone Detection Regression When Expanding Array
**What goes wrong:** Changing `POWER_MILESTONES` from `[1000, 5000, 10000, 50000]` to the new 10-element array causes users who already passed 100/250/500 to get retroactive celebrations
**Why it happens:** Milestone detection uses `prevPower < m && newPower >= m` which only fires on crossing. As long as `prevPower` is captured correctly before the check, this is safe. But on first load after update, if a recalculation triggers, it could false-fire.
**How to avoid:** Milestone detection only runs in the `checkHabit` flow (not on page load). Verify no other code path triggers it.
**Warning signs:** Celebration overlays appearing on page load without any check action

### Pitfall 5: Clipboard Failure on HTTP (non-HTTPS)
**What goes wrong:** `navigator.clipboard.writeText` fails silently or throws in non-secure contexts
**Why it happens:** Clipboard API requires HTTPS in production, but works on `localhost` during dev
**How to avoid:** Wrap in try/catch with error toast fallback. The decision already specifies "success/failure toast confirmation."
**Warning signs:** No toast appearing at all (uncaught promise rejection)

## Code Examples

### Negative XP Popup Trigger in HabitCard
```typescript
// HabitCard.tsx handleTap - add negative popup on uncheck
// AFTER: const result = await checkHabit(habit.id, today);
if (!result.is_checking && result.attribute_xp_awarded > 0) {
  // Show negative XP popup (deduction amount)
  setXpAmount(result.attribute_xp_awarded);
  setShowXp(true);
  setXpNegative(true);  // new state
}
// Existing positive path remains as-is
if (result.is_checking && result.attribute_xp_awarded > 0) {
  setXpAmount(result.attribute_xp_awarded);
  setShowXp(true);
  setXpNegative(false);
}
```

### StreakBreakCard Component Structure
```typescript
// StreakBreakCard.tsx
export function StreakBreakCard() {
  const status = useStatusStore((s) => s.status);
  const isLoaded = useStatusStore((s) => s.isLoaded);
  const [dismissed, setDismissed] = useState(false);
  const { play } = useAudio();

  useEffect(() => {
    if (isLoaded && status?.streak_breaks?.length) {
      play('power_up');
    }
  }, [isLoaded, status?.streak_breaks?.length, play]);

  if (!isLoaded || !status?.streak_breaks?.length || dismissed) return null;

  const breaks = status.streak_breaks;
  return (
    <AnimatePresence>
      <motion.div /* same pattern as RoastWelcomeCard */>
        <p>"A Saiyan grows stronger after every defeat."</p>
        {breaks.map(b => (
          <div key={b.habit_id}>
            {b.habit_title}: {b.old_streak} -> {b.halved_value}
          </div>
        ))}
        <button onClick={() => setDismissed(true)}>Get Back Up</button>
      </motion.div>
    </AnimatePresence>
  );
}
```

### Milestone Escalation in PowerMilestoneOverlay
```typescript
// PowerMilestoneOverlay.tsx - add escalation prop
interface PowerMilestoneOverlayProps {
  milestone: number;
  onComplete: () => void;
}

function getEscalationTier(milestone: number) {
  if (milestone >= 100000) return 'legendary';
  if (milestone >= 25000) return 'epic';
  if (milestone >= 5000) return 'shake';
  return 'standard';
}

// In render: conditionally apply gold theme for legendary,
// wrap in ScreenShake for shake/epic/legendary tiers
```

### Share Summary Builder
```typescript
function buildDailySummary(): string {
  const habits = useHabitStore.getState().todayHabits;
  const { powerLevel, transformationName } = usePowerStore.getState();
  const completed = habits.filter(h => h.completed).length;
  const total = habits.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const bestStreak = Math.max(...habits.map(h => h.streak_current), 0);
  const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return [
    `${today} - Saiyan Training Report`,
    `Completion: ${completed}/${total} (${pct}%)`,
    `Power Level: ${powerLevel.toLocaleString()} - ${transformationName}`,
    bestStreak > 0 ? `Best Streak: ${bestStreak} days` : null,
    ``,
    `Powered by Saiyan Tracker`,
  ].filter(Boolean).join('\n');
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `document.execCommand('copy')` | `navigator.clipboard.writeText()` | 2020+ | Async, Promise-based, simpler API. execCommand is deprecated. |
| `POWER_MILESTONES = [1000, 5000, 10000, 50000]` | Expanded to 10 milestones with escalation tiers | This phase | More frequent dopamine hits, especially at lower power levels |

**Deprecated/outdated:**
- `document.execCommand('copy')`: Deprecated. Use `navigator.clipboard.writeText()` instead.

## Open Questions

1. **AuraGauge transition timing: 700ms vs 500ms**
   - What we know: Current CSS transition is 700ms. User decision says ~500ms for shrink.
   - What's unclear: Whether to change the existing 700ms (affects growth too) or add a conditional timing
   - Recommendation: Change to 500ms for both growth and shrink -- the difference is negligible and avoids conditional logic

2. **Negative XP amount on uncheck: Is it always `attribute_xp_awarded`?**
   - What we know: `CheckHabitResponse.attribute_xp_awarded` is present on uncheck responses. CONTEXT.md says "Backend's attribute_xp_awarded on uncheck provides the actual deduction amount."
   - What's unclear: Whether the backend returns the absolute deduction value or 0 on uncheck
   - Recommendation: Verify backend behavior in integration. If `attribute_xp_awarded` is 0 on uncheck, may need to calculate from habit's expected XP.

3. **MiniHero share button**
   - What we know: MiniHero is the sticky compact hero when scrolled. CONTEXT.md lists this as Claude's discretion.
   - Recommendation: Add the share button to MiniHero as well -- it's the visible header when scrolled, so omitting it would make the feature unreachable during normal use.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.x + @testing-library/react 16.x |
| Config file | `frontend/vitest.config.ts` |
| Quick run command | `cd frontend && npx vitest run --reporter=verbose` |
| Full suite command | `cd frontend && npx vitest run` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FDBK-01 | Negative XP popup appears on uncheck with red text and deduction amount | unit | `cd frontend && npx vitest run src/__tests__/negative-xp-popup.test.tsx -x` | No - Wave 0 |
| FDBK-02 | AuraGauge percent decreases when habit unchecked | unit | `cd frontend && npx vitest run src/__tests__/aura-gauge.test.tsx -x` | Yes (extend) |
| FDBK-03 | StreakBreakCard renders when streak_breaks non-empty, dismisses on CTA | unit | `cd frontend && npx vitest run src/__tests__/streak-break-card.test.tsx -x` | No - Wave 0 |
| FDBK-04 | Expanded milestones detected and escalation tier applied | unit | `cd frontend && npx vitest run src/__tests__/power-milestone.test.ts -x` | Yes (extend) |
| SHAR-01 | Share button copies summary to clipboard, shows success toast | unit | `cd frontend && npx vitest run src/__tests__/share-summary.test.tsx -x` | No - Wave 0 |

### Sampling Rate
- **Per task commit:** `cd frontend && npx vitest run --reporter=verbose`
- **Per wave merge:** `cd frontend && npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `frontend/src/__tests__/negative-xp-popup.test.tsx` -- covers FDBK-01 (negative variant rendering, downward animation class)
- [ ] `frontend/src/__tests__/streak-break-card.test.tsx` -- covers FDBK-03 (renders with streak breaks, dismisses, plays sound)
- [ ] `frontend/src/__tests__/share-summary.test.tsx` -- covers SHAR-01 (clipboard write, toast feedback, summary content)
- [ ] Extend `frontend/src/__tests__/aura-gauge.test.tsx` -- covers FDBK-02 (transition on percent decrease)
- [ ] Extend `frontend/src/__tests__/power-milestone.test.ts` -- covers FDBK-04 (expanded milestones array, escalation tier detection)

## Sources

### Primary (HIGH confidence)
- Direct codebase analysis of all referenced components, stores, and types
- Backend schema `backend/app/schemas/status.py` confirms `streak_breaks: list[StreakBreak]` field
- Backend endpoint `backend/app/api/v1/status.py` confirms streak-break detection logic

### Secondary (MEDIUM confidence)
- `navigator.clipboard.writeText()` API -- well-established, supported in all modern browsers (Chrome 66+, Firefox 63+, Safari 13.1+)
- motion/react animation patterns verified from existing codebase usage

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all libraries already in project, no new dependencies
- Architecture: HIGH - every pattern has a working reference in the codebase
- Pitfalls: HIGH - identified from direct code reading (type mismatch, double sound, transition timing)

**Research date:** 2026-03-11
**Valid until:** 2026-04-10 (stable -- no external dependencies changing)
