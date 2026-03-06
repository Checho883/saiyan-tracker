# Phase 9: Cross-Phase Integration Fixes - Research

**Researched:** 2026-03-05
**Domain:** Zustand store sync, React context state, component event wiring
**Confidence:** HIGH

## Summary

Phase 9 fixes three integration bugs identified by the v1.1 milestone audit. All three are small, surgical fixes touching existing files -- no new libraries, no new components, no new architecture. The bugs are:

1. **Sound preference not persisted** (SET-01/AUDIO-01): `SoundProvider.tsx` hardcodes `isMuted = useState(true)` and never reads `rewardStore.settings.sound_enabled`. The Settings page toggle persists to the backend but SoundProvider ignores it.
2. **Stale transformation name** (DASH-04): `powerStore.updateFromCheck` sets `powerLevel` and `transformation` but not `transformationName`. Since `CheckHabitResponse` does not include `transformation_name`, we need a key-to-name lookup from the `TransformChange` data or a local constant map.
3. **Missing capsule reveal chime** (AUDIO-04): `CapsuleDropOverlay.tsx` tap handler sets `isRevealed` but never calls `play('reveal_chime')`. The sound ID exists in the sprite map but is unwired.

**Primary recommendation:** Implement all three fixes in a single plan (09-01). Each fix is 2-10 lines of code in a single file, with a supporting test update. No new dependencies required.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SET-01 | User can toggle sound effects on/off (persisted via backend) | SoundProvider must read `rewardStore.settings.sound_enabled` on mount and sync with `toggleMute`. See Bug 1 analysis. |
| AUDIO-01 | SoundProvider context wraps app with global sound toggle and playSound method | SoundProvider exists and works; fix is adding persistence sync to rewardStore settings. See Bug 1 analysis. |
| AUDIO-04 | Capsule drop triggers capsule pop sound; capsule open triggers reveal chime | `capsule_pop` fires correctly via useSoundEffect. `reveal_chime` is defined in soundMap but never called in CapsuleDropOverlay. See Bug 3 analysis. |
| DASH-04 | Aura bar shows tier label (Kaio-ken x3/x10/x20) updating at 50%/80%/100% thresholds | Tier label display works; issue is `transformationName` not updating in powerStore after check. See Bug 2 analysis. |
</phase_requirements>

## Standard Stack

### Core

No new libraries needed. All fixes use existing dependencies:

| Library | Version | Purpose | Already Installed |
|---------|---------|---------|-------------------|
| zustand | 5.x | State management (powerStore, rewardStore) | Yes |
| react | 19.x | Context (SoundProvider), hooks (useEffect) | Yes |
| howler | 2.x | Audio playback (SoundProvider) | Yes |

### Supporting

None required.

### Alternatives Considered

None -- these are targeted bug fixes, not architectural decisions.

**Installation:**
```bash
# No installs needed
```

## Architecture Patterns

### Pattern 1: Zustand Cross-Store Subscription in React Context

**What:** SoundProvider (React context) needs to read initial value from rewardStore (Zustand) on mount, and stay in sync when settings change.

**When to use:** When a React context provider needs to reflect Zustand store state.

**Current state of `SoundProvider.tsx` (line 30):**
```typescript
const [isMuted, setIsMuted] = useState(true); // Hardcoded -- BUG
```

**Fix pattern:**
```typescript
// Read initial value from rewardStore on mount
const settings = useRewardStore((s) => s.settings);
const [isMuted, setIsMuted] = useState(true); // Default until settings load

// Sync when settings load or change
useEffect(() => {
  if (settings?.sound_enabled !== undefined) {
    const shouldMute = !settings.sound_enabled;
    setIsMuted(shouldMute);
    Howler.mute(shouldMute);
  }
}, [settings?.sound_enabled]);
```

**Critical detail:** The `useInitApp` hook in `AppShell.tsx` calls `fetchSettings()` during app initialization. Settings may not be available on first render of SoundProvider. The `useEffect` handles this by syncing when `settings.sound_enabled` changes from `undefined` to a real value.

**Bidirectional sync consideration:** The `toggleMute` function in SoundProvider currently only updates local state. For full persistence, `toggleMute` should also call `rewardStore.updateSettings({ sound_enabled: !isMuted })`. However, the Settings page already does this directly via `PreferencesSection`. The BottomTabBar mute button uses `toggleMute` from SoundProvider, which does NOT persist. Two options:
- Option A: Have `toggleMute` also call `updateSettings` (makes BottomTabBar persist too)
- Option B: Keep `toggleMute` local-only, rely on Settings page for persistence

**Recommendation:** Option A -- `toggleMute` should persist to backend. This makes the BottomTabBar mute button work correctly across page loads. The cost is one extra API call per toggle.

### Pattern 2: Transformation Key-to-Name Mapping

**What:** `updateFromCheck` receives `transformation` (key like "ssj") but not `transformation_name` (display name like "Super Saiyan"). The `CheckHabitResponse` schema does NOT include `transformation_name`.

**Current state of `powerStore.ts` (line 56-58):**
```typescript
updateFromCheck: (powerLevel, transformation) => {
  set({ powerLevel, transformation });
  // transformationName is NOT updated -- BUG
},
```

**Fix approach:** When `transform_change` is non-null (a transformation just occurred), the `TransformChange` object includes `name`. The habitStore already has this data at line 71-77. Two options:

- **Option A:** Expand `updateFromCheck` signature to include `transformationName` and have habitStore pass `transform_change.name` when available, or derive it from a local constant map.
- **Option B:** Create a `TRANSFORMATION_MAP` constant on the frontend (key -> name) mirroring backend `TRANSFORMATIONS` constant, and have `updateFromCheck` look up the name from the key.

**Recommendation:** Option A is simpler. The habitStore already knows if a `transform_change` happened. When it did, pass `transform_change.name`. When it didn't, the transformation key hasn't changed, so `transformationName` stays correct (it was set by `fetchPower` at init). The issue only manifests when a transformation occurs but the name isn't updated.

**Refined fix:**
```typescript
// powerStore.ts
updateFromCheck: (powerLevel, transformation, transformationName?) => {
  set({ powerLevel, transformation, ...(transformationName && { transformationName }) });
},

// habitStore.ts (line 64-66)
usePowerStore.getState().updateFromCheck(
  result.power_level,
  result.transformation,
  result.transform_change?.name,
);
```

### Pattern 3: Adding Sound to Existing Component Event Handler

**What:** CapsuleDropOverlay `handleTap` needs to call `play('reveal_chime')` when revealing.

**Current state of `CapsuleDropOverlay.tsx` (line 47-53):**
```typescript
const handleTap = () => {
  if (!isRevealed) {
    setIsRevealed(true);
    // Missing: play('reveal_chime') -- BUG
  } else if (canDismiss) {
    onComplete();
  }
};
```

**Challenge:** CapsuleDropOverlay is a pure component that doesn't currently use `useAudio`. Adding the hook requires either:
- **Option A:** Import and call `useAudio` directly in CapsuleDropOverlay
- **Option B:** Pass `play` function as a prop from AnimationPlayer

**Recommendation:** Option A -- direct `useAudio` hook usage. The component already lives inside the SoundProvider tree (it's rendered by AnimationPlayer which is inside AppShell). This is the simplest approach and matches how other sound-producing components would work.

**Fix:**
```typescript
import { useAudio } from '../../audio/useAudio';

export function CapsuleDropOverlay({ ... }) {
  const { play } = useAudio();
  // ...
  const handleTap = () => {
    if (!isRevealed) {
      setIsRevealed(true);
      play('reveal_chime');
    } else if (canDismiss) {
      onComplete();
    }
  };
  // ...
}
```

### Anti-Patterns to Avoid

- **Polling for settings:** Do not add a setInterval to re-read settings. Use React's `useEffect` dependency array to react to store changes.
- **Duplicating transformation data:** Do not create a frontend `TRANSFORMATIONS` constant that mirrors the backend. The backend already sends `transformation_name` via `fetchPower` and `transform_change.name` via check. Use existing data flow.
- **Adding sound via useSoundEffect map:** Do not add `reveal_chime` to the `EVENT_SOUND_MAP` in `useSoundEffect.ts`. The reveal chime is NOT triggered by a new animation event -- it's triggered by user tap within an existing `capsule_drop` animation. It must be called directly in the tap handler.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Settings sync | Custom pub/sub between context and store | Zustand selector + useEffect | Zustand selectors trigger re-renders automatically |
| Sound persistence | localStorage cache of mute state | Backend settings API (already wired) | Single source of truth, already persisted by Settings page |

**Key insight:** All three fixes connect existing, working pieces. No new infrastructure needed.

## Common Pitfalls

### Pitfall 1: Infinite Re-render Loop in SoundProvider

**What goes wrong:** If `toggleMute` calls `updateSettings` which updates `settings.sound_enabled`, which triggers the `useEffect` to call `setIsMuted`, which could trigger re-render loops.
**Why it happens:** Bidirectional sync between React state and Zustand store without proper guards.
**How to avoid:** In the `useEffect`, only call `setIsMuted` if the value actually differs from current state. Compare before setting. Use `settings?.sound_enabled` as the sole dependency, not the full `settings` object.
**Warning signs:** Console shows rapid re-renders, browser becomes sluggish.

### Pitfall 2: Sound Plays Before Settings Load

**What goes wrong:** SoundProvider defaults to `isMuted = true`, but if a user had sound enabled, there's a brief period where sounds are muted until `fetchSettings` resolves.
**Why it happens:** `useInitApp` fires all fetches in parallel. Settings may resolve after the first habit check.
**How to avoid:** This is acceptable behavior -- sound starts muted until settings load, then syncs. The alternative (starting unmuted) is worse because unwanted sound is more jarring than a brief delay. Keep `useState(true)` as default.

### Pitfall 3: CapsuleDropOverlay Test Breaks with useAudio

**What goes wrong:** Existing tests for CapsuleDropOverlay don't provide a SoundProvider wrapper, so adding `useAudio` will throw "useAudio must be used within a SoundProvider".
**Why it happens:** Test renders the component in isolation without context providers.
**How to avoid:** Either wrap test renders in `<SoundProvider>` (requires mocking howler) or mock `useAudio` directly with `vi.mock('../../audio/useAudio')`. Mocking the hook is simpler since howler is already mocked in the sound-provider test file.

### Pitfall 4: updateFromCheck Signature Change Breaks Existing Call

**What goes wrong:** If the third parameter is required, the existing call in habitStore will fail TypeScript compilation until updated.
**Why it happens:** Forgetting to make the new parameter optional.
**How to avoid:** Make `transformationName` optional in the signature: `updateFromCheck(powerLevel: number, transformation: string, transformationName?: string)`.

## Code Examples

### Bug 1 Fix: SoundProvider Reads Settings (SET-01/AUDIO-01)

```typescript
// SoundProvider.tsx - Add import
import { useRewardStore } from '../store/rewardStore';

// Inside SoundProvider function, after useState:
const soundEnabled = useRewardStore((s) => s.settings?.sound_enabled);

// Add sync effect (after existing useEffect):
useEffect(() => {
  if (soundEnabled !== undefined) {
    const shouldMute = !soundEnabled;
    setIsMuted(shouldMute);
    Howler.mute(shouldMute);
  }
}, [soundEnabled]);

// Update toggleMute to persist:
const toggleMute = useCallback(() => {
  setIsMuted((prev) => {
    const newMuted = !prev;
    Howler.mute(newMuted);
    // Persist to backend
    useRewardStore.getState().updateSettings({ sound_enabled: !newMuted });
    return newMuted;
  });
}, []);
```

### Bug 2 Fix: updateFromCheck Includes transformationName (DASH-04)

```typescript
// powerStore.ts
updateFromCheck: (powerLevel, transformation, transformationName?) => {
  set({
    powerLevel,
    transformation,
    ...(transformationName && { transformationName }),
  });
},

// habitStore.ts (line 64-66)
usePowerStore.getState().updateFromCheck(
  result.power_level,
  result.transformation,
  result.transform_change?.name,
);
```

### Bug 3 Fix: CapsuleDropOverlay Plays reveal_chime (AUDIO-04)

```typescript
// CapsuleDropOverlay.tsx - Add import
import { useAudio } from '../../audio/useAudio';

// Inside component, add hook:
const { play } = useAudio();

// Update handleTap:
const handleTap = () => {
  if (!isRevealed) {
    setIsRevealed(true);
    play('reveal_chime');
  } else if (canDismiss) {
    onComplete();
  }
};
```

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest (via vitest.config.ts) |
| Config file | `frontend/vitest.config.ts` |
| Quick run command | `cd frontend && npx vitest run --reporter=verbose` |
| Full suite command | `cd frontend && npx vitest run` |

### Phase Requirements -> Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SET-01 / AUDIO-01 | SoundProvider reads sound_enabled from rewardStore on mount | unit | `cd frontend && npx vitest run src/__tests__/sound-provider.test.tsx -x` | Exists -- needs new test case |
| DASH-04 | updateFromCheck updates transformationName | unit | `cd frontend && npx vitest run src/__tests__/stores.test.ts -x` | Exists -- needs updated test case |
| AUDIO-04 | CapsuleDropOverlay tap calls play('reveal_chime') | unit | `cd frontend && npx vitest run src/__tests__/capsule-drop.test.tsx -x` | Exists -- needs new test case |

### Sampling Rate

- **Per task commit:** `cd frontend && npx vitest run --reporter=verbose`
- **Per wave merge:** `cd frontend && npx vitest run`
- **Phase gate:** Full suite green before verify

### Wave 0 Gaps

None -- existing test infrastructure covers all phase requirements. Three test files need new/updated test cases but the files and framework already exist.

## Files to Modify

| File | Change | Bug |
|------|--------|-----|
| `frontend/src/audio/SoundProvider.tsx` | Add rewardStore subscription, sync mute from settings, persist toggleMute | Bug 1 |
| `frontend/src/store/powerStore.ts` | Add optional `transformationName` param to `updateFromCheck` | Bug 2 |
| `frontend/src/store/habitStore.ts` | Pass `transform_change?.name` to `updateFromCheck` | Bug 2 |
| `frontend/src/components/animations/CapsuleDropOverlay.tsx` | Add `useAudio` hook, call `play('reveal_chime')` on reveal tap | Bug 3 |
| `frontend/src/__tests__/sound-provider.test.tsx` | Add test: SoundProvider syncs isMuted from rewardStore settings | Bug 1 |
| `frontend/src/__tests__/stores.test.ts` | Update test: updateFromCheck also sets transformationName | Bug 2 |
| `frontend/src/__tests__/capsule-drop.test.tsx` | Add test: tap calls play('reveal_chime') | Bug 3 |

## Open Questions

None. All three bugs have clear root causes, clear fixes, and clear test strategies. No external research or decisions needed.

## Sources

### Primary (HIGH confidence)

- Direct source code inspection of all affected files (SoundProvider.tsx, powerStore.ts, habitStore.ts, CapsuleDropOverlay.tsx, rewardStore.ts, useInitApp.ts, soundMap.ts, types/index.ts)
- Backend schema inspection (check_habit.py, power.py, constants.py) confirming CheckHabitResponse does not include `transformation_name`
- v1.1 Milestone Audit report (`.planning/v1.1-MILESTONE-AUDIT.md`) documenting all three bugs with precise line numbers
- Existing test files (sound-provider.test.tsx, stores.test.ts, capsule-drop.test.tsx) confirming test infrastructure

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - no new libraries, all fixes in existing code
- Architecture: HIGH - patterns are straightforward React/Zustand integration
- Pitfalls: HIGH - identified from direct code inspection, well-understood React patterns

**Research date:** 2026-03-05
**Valid until:** 2026-04-05 (stable -- no external dependencies to change)
