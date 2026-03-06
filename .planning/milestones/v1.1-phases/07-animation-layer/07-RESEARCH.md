# Phase 7: Animation Layer - Research

**Researched:** 2026-03-05
**Domain:** React animation with Motion (Framer Motion) — sequential queue, spring physics, full-screen overlays
**Confidence:** HIGH

## Summary

Phase 7 adds choreographed sequential animations for major game events using Motion (formerly Framer Motion), the dominant React animation library with 30M+ monthly npm downloads. The existing `uiStore.ts` already has an animation queue skeleton (`AnimationEvent` types, `enqueueAnimation`, `dequeueAnimation`, `clearAnimations`), which needs an `AnimationPlayer` consumer component mounted at the app root using `AnimatePresence mode="wait"` for sequential playback.

The core architecture is straightforward: a root-level `AnimationPlayer` subscribes to the queue, renders the current animation overlay, and uses `AnimatePresence mode="wait"` to ensure exit completes before the next entry. Individual animations are self-contained overlay components (Perfect Day, Shenron, Capsule, Transformation, Dragon Ball trajectory) that call `onComplete` when finished. Inline animations (tier banner, XP popup) bypass the queue entirely.

**Primary recommendation:** Install `motion` (not `framer-motion`), build a single `AnimationPlayer` queue consumer at app root, implement each animation as an isolated overlay component with `onComplete` callback, and wrap accessibility with `MotionConfig reducedMotion="user"`.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Use **Framer Motion** as the animation library (install `motion`)
- Spring physics for all micro-animations (bounces, scales, enters)
- `AnimatePresence mode="wait"` for sequential queue playback at app root
- Single `AnimationPlayer` component at app root that dequeues one event at a time
- **Inline animations** for small feedback: XP popup, tier change banner — no queue delay
- **Queued animations** for full-screen sequences: Perfect Day, Shenron, transformation, capsule drop
- Dragon Ball trajectory is queued (cross-component animation)
- Perfect Day sequence ~2.5s with tap-to-skip after 1s
- Shenron ceremony ~4-5s with tap-to-skip after 1s, enforces minimum 1 active wish
- Distinct visual per transformation form (SSJ golden flash, SSJ2 lightning, SSG red, SSB blue, UI silver)
- Tier change banner is inline on AuraGauge/HeroSection, not queued
- Screen shake: CSS transform, 200-300ms, 2-4px displacement
- DOM-based particles using Framer Motion (10-20 small divs)
- Rarity glow: animated pulsing box-shadow/border with breathing effect
- Respect `prefers-reduced-motion` OS setting
- Capsule drops center-screen on overlay, tap to reveal with 3D card flip (rotateY)
- Dragon Ball emerges from checked habit card, arcs to tracker slot
- Skip behavior: first 1s uninterrupted, then tap anywhere to fast-forward

### Claude's Discretion
- Exact spring stiffness/damping values per animation
- Particle count and trajectory randomization ranges
- Transition timing between sequence steps
- Reduced-motion fallback specifics
- Whether XpPopup migrates from CSS keyframes to Framer Motion springs

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| ANIM-01 | Animation queue in uiStore enforces sequential playback | AnimatePresence mode="wait" + AnimationPlayer dequeue pattern |
| ANIM-02 | Tier change flash shows brief banner with scale-in animation | Inline motion.div with spring scale, no queue involvement |
| ANIM-03 | Perfect Day explosion plays choreographed 2-3s full-screen sequence | Queued overlay with keyframe sequence via animate() |
| ANIM-04 | Capsule drop bounces in with scale spring, pulses to invite tap | motion.div with spring type, scale from 0 to 1, pulse via repeat |
| ANIM-05 | Capsule reveal plays 3D card flip (rotateY) with rarity glow | motion.div rotateY 0->180, perspective parent, box-shadow animation |
| ANIM-06 | Dragon Ball flies into tracker slot with trajectory animation | motion.div with absolute positioning, x/y keyframes along arc path |
| ANIM-07 | Transformation unlock plays form-specific visual with avatar swap | Form-keyed overlay components with distinct color/particle configs |
| ANIM-08 | Shenron ceremony plays full-screen sequence | Multi-step queued overlay with sequential animate() calls |
| ANIM-09 | Shenron enforces minimum 1 active wish before completion | UI logic check against rewardStore wishes before allowing ceremony end |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| motion | ^12.x (latest) | React animation library | 30M+ monthly npm downloads, de facto standard for React animation, spring physics, AnimatePresence for exit animations |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| (none needed) | — | Motion is self-contained | All animation needs covered by motion alone |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| motion | react-spring | Similar spring physics but less exit animation support, smaller ecosystem |
| motion | CSS @keyframes | No spring physics, no AnimatePresence exit handling, harder sequential control |
| motion | GSAP | Heavier (44KB vs 32KB), license complexity, overkill for this use case |

**Installation:**
```bash
npm install motion
```

**Note:** Install `motion`, NOT `framer-motion`. The `motion` package is the modern successor. `framer-motion` still publishes but redirects to `motion` internally. React 19 is compatible (requires React 18.2+).

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── animations/           # All animation overlay components
│   │   ├── AnimationPlayer.tsx      # Root queue consumer
│   │   ├── PerfectDayOverlay.tsx    # ANIM-03
│   │   ├── CapsuleDropOverlay.tsx   # ANIM-04, ANIM-05
│   │   ├── DragonBallTrajectory.tsx # ANIM-06
│   │   ├── TransformationOverlay.tsx # ANIM-07
│   │   ├── ShenronCeremony.tsx      # ANIM-08, ANIM-09
│   │   ├── TierChangeBanner.tsx     # ANIM-02 (inline, not queued)
│   │   ├── ScreenShake.tsx          # Shared utility
│   │   └── ParticleBurst.tsx        # Shared particle system
│   ├── dashboard/
│   │   ├── XpPopup.tsx              # Existing — inline animation
│   │   └── ...
```

### Pattern 1: Animation Queue Consumer (AnimationPlayer)
**What:** A root-level component that subscribes to uiStore's animation queue and renders overlays one at a time using AnimatePresence mode="wait"
**When to use:** Always — this is the core sequential playback mechanism

```typescript
import { AnimatePresence } from 'motion/react';
import { useUiStore } from '@/store/uiStore';

export function AnimationPlayer() {
  const queue = useUiStore(s => s.animationQueue);
  const dequeue = useUiStore(s => s.dequeueAnimation);
  const current = queue[0] ?? null;

  return (
    <AnimatePresence mode="wait" onExitComplete={() => dequeue()}>
      {current && (
        <AnimationOverlay key={`${current.type}-${Date.now()}`} event={current} />
      )}
    </AnimatePresence>
  );
}
```

### Pattern 2: Self-Contained Overlay Component
**What:** Each animation overlay manages its own choreography and calls onComplete when done
**When to use:** For every queued animation (Perfect Day, Shenron, Capsule, etc.)

```typescript
import { motion } from 'motion/react';

interface Props {
  onComplete: () => void;
}

export function PerfectDayOverlay({ onComplete }: Props) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onAnimationComplete={onComplete}
    >
      {/* Choreographed content */}
    </motion.div>
  );
}
```

### Pattern 3: Spring Configuration Constants
**What:** Centralized spring presets for consistent feel across animations
**When to use:** All spring-based animations should reference shared presets

```typescript
export const SPRINGS = {
  bouncy: { type: 'spring' as const, stiffness: 400, damping: 15 },
  gentle: { type: 'spring' as const, stiffness: 200, damping: 20 },
  snappy: { type: 'spring' as const, stiffness: 500, damping: 25 },
  wobbly: { type: 'spring' as const, stiffness: 300, damping: 10 },
} as const;
```

### Pattern 4: Tap-to-Skip with Minimum Duration
**What:** Allow skip after initial impact plays (1s), prevent accidental skip before
**When to use:** All full-screen sequences

```typescript
function useSkippable(minDurationMs: number, onSkip: () => void) {
  const [canSkip, setCanSkip] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setCanSkip(true), minDurationMs);
    return () => clearTimeout(timer);
  }, [minDurationMs]);
  return { canSkip, skip: canSkip ? onSkip : undefined };
}
```

### Pattern 5: 3D Card Flip (Capsule Reveal)
**What:** rotateY flip with perspective parent and backface-visibility
**When to use:** Capsule reveal animation (ANIM-05)

```typescript
<div style={{ perspective: 800 }}>
  <motion.div
    animate={{ rotateY: isFlipped ? 180 : 0 }}
    transition={SPRINGS.snappy}
    style={{ transformStyle: 'preserve-3d' }}
  >
    <div style={{ backfaceVisibility: 'hidden' }}>Front</div>
    <div style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', position: 'absolute', inset: 0 }}>Back</div>
  </motion.div>
</div>
```

### Anti-Patterns to Avoid
- **Simultaneous overlays:** Never render multiple queued animations at once — AnimatePresence mode="wait" prevents this
- **Inline animations in queue:** XP popup and tier banner should NOT go through the queue — they animate in-place on their component
- **Canvas for particles:** DOM-based particles with 10-20 divs are sufficient and simpler — no canvas layer needed
- **Blocking main thread:** Use `will-change: transform` on animated elements and avoid animating layout-triggering properties (width, height, top, left)
- **Missing exit animations:** Every overlay MUST have an `exit` prop — without it, AnimatePresence cannot orchestrate sequential playback

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Spring physics | Custom spring math | `motion` transition type: "spring" | Spring math involves differential equations; motion handles stiffness/damping/mass correctly |
| Exit animations | Manual unmount delays | `AnimatePresence` + `exit` prop | React unmounts immediately; AnimatePresence delays unmount until exit animation completes |
| Sequential playback | Custom setTimeout chains | `AnimatePresence mode="wait"` | Handles edge cases (rapid queue, interruption, race conditions) |
| Reduced motion | Manual matchMedia listener | `useReducedMotion()` hook from motion | Handles SSR, listener cleanup, re-renders on preference change |
| 3D transforms | Manual CSS transform strings | motion.div `rotateY` prop | Independent transform axis control, spring interpolation on transforms |

**Key insight:** Motion handles the hard parts (spring differential equations, unmount timing, accessibility detection, transform decomposition). Hand-rolling any of these leads to subtle bugs.

## Common Pitfalls

### Pitfall 1: AnimatePresence Key Stability
**What goes wrong:** Animations replay unexpectedly or skip when keys change
**Why it happens:** AnimatePresence uses `key` to track elements. Unstable keys (e.g., `Date.now()`) cause constant remounts
**How to avoid:** Use a stable key derived from the animation event (e.g., `${event.type}-${event.id}` where id is a queue-assigned counter)
**Warning signs:** Animations replaying on unrelated state changes

### Pitfall 2: Queue Race Condition on Dequeue
**What goes wrong:** Dequeuing during exit animation causes the next animation to mount before exit completes
**Why it happens:** Calling `dequeueAnimation()` in the component's effect instead of in `onExitComplete`
**How to avoid:** Only call `dequeueAnimation()` in AnimatePresence's `onExitComplete` callback, not in the overlay component
**Warning signs:** Two overlays briefly visible simultaneously

### Pitfall 3: 3D Flip Without Perspective
**What goes wrong:** rotateY animation looks flat (2D squish instead of 3D flip)
**Why it happens:** Missing `perspective` on parent container
**How to avoid:** Always wrap 3D transforms in a container with `style={{ perspective: 800 }}`
**Warning signs:** Card appears to shrink horizontally instead of rotating in 3D space

### Pitfall 4: Particles Not Cleaning Up
**What goes wrong:** DOM accumulates particle divs, performance degrades over time
**Why it happens:** Particle elements not removed after animation completes
**How to avoid:** Use AnimatePresence for particles OR remove particle container when parent overlay exits. Each particle should have `onAnimationComplete` to trigger removal
**Warning signs:** Increasing DOM node count in DevTools after repeated animations

### Pitfall 5: Screen Shake on Body vs Container
**What goes wrong:** Shake animation causes scrollbar jitter or layout shift
**Why it happens:** Applying transform to `document.body` or elements with overflow
**How to avoid:** Apply shake to a wrapper div inside the viewport that doesn't affect scroll position. Use `transform: translate3d(Xpx, Ypx, 0)` for GPU acceleration
**Warning signs:** Horizontal scrollbar flashing during shake

### Pitfall 6: Testing Motion Components
**What goes wrong:** Tests fail or hang because animations never complete in JSDOM
**Why it happens:** JSDOM doesn't run CSS animations or requestAnimationFrame properly
**How to avoid:** Mock `motion` components in tests. Create a `__mocks__/motion/react.ts` that replaces `motion.div` with regular `div` and `AnimatePresence` with a passthrough
**Warning signs:** Tests timing out, `waitFor` never resolving

## Code Examples

### Screen Shake (CSS Transform)
```typescript
import { motion, useAnimation } from 'motion/react';

export function ScreenShake({ children, trigger }: { children: React.ReactNode; trigger: boolean }) {
  const controls = useAnimation();

  useEffect(() => {
    if (trigger) {
      controls.start({
        x: [-3, 3, -3, 3, -2, 2, 0],
        y: [-2, 2, -1, 1, 0],
        transition: { duration: 0.3 },
      });
    }
  }, [trigger, controls]);

  return <motion.div animate={controls}>{children}</motion.div>;
}
```

### DOM Particle Burst
```typescript
import { motion, AnimatePresence } from 'motion/react';

function ParticleBurst({ count = 15, origin }: { count?: number; origin: { x: number; y: number } }) {
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    angle: (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5,
    distance: 60 + Math.random() * 80,
    size: 4 + Math.random() * 6,
  }));

  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-yellow-400"
          style={{ width: p.size, height: p.size, left: origin.x, top: origin.y }}
          initial={{ scale: 1, opacity: 1 }}
          animate={{
            x: Math.cos(p.angle) * p.distance,
            y: Math.sin(p.angle) * p.distance,
            scale: 0,
            opacity: 0,
          }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}
```

### Rarity Glow (Pulsing Box Shadow)
```typescript
<motion.div
  animate={{
    boxShadow: [
      '0 0 8px 2px rgba(168, 85, 247, 0.4)',   // purple dim
      '0 0 20px 8px rgba(168, 85, 247, 0.8)',  // purple bright
      '0 0 8px 2px rgba(168, 85, 247, 0.4)',   // purple dim
    ],
  }}
  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
/>
```

### Reduced Motion Configuration
```typescript
import { MotionConfig } from 'motion/react';

function App() {
  return (
    <MotionConfig reducedMotion="user">
      {/* All motion components inside will respect OS preference */}
      <AppShell />
    </MotionConfig>
  );
}
```

### Test Mock for Motion
```typescript
// frontend/src/__mocks__/motion/react.ts
import React from 'react';

const motion = new Proxy({} as Record<string, React.FC<any>>, {
  get: (_target, prop: string) =>
    React.forwardRef(({ children, ...props }: any, ref: any) =>
      React.createElement(prop, { ...props, ref }, children),
    ),
});

const AnimatePresence = ({ children }: { children: React.ReactNode }) => children;

export { motion, AnimatePresence };
export const useAnimation = () => ({ start: vi.fn(), stop: vi.fn() });
export const useReducedMotion = () => false;
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `framer-motion` package | `motion` package | 2024 (v11.11+) | Same API, new package name. Install `motion` not `framer-motion` |
| `motion.div` from `framer-motion` | `motion.div` from `motion/react` | 2024 | Import path changed: `import { motion } from 'motion/react'` |
| Manual requestAnimationFrame | Motion's hybrid engine | 2024+ | GPU-accelerated 120fps animations via native browser APIs |
| Custom reduced-motion listener | `MotionConfig reducedMotion="user"` | v10+ | Automatic OS preference respect, disables transform/layout animations |

**Deprecated/outdated:**
- `framer-motion` package name: Still works but `motion` is the canonical package
- `import { motion } from 'framer-motion'`: Use `import { motion } from 'motion/react'` instead

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.x + React Testing Library 16.x |
| Config file | frontend/vitest.config.ts |
| Quick run command | `cd frontend && npx vitest run --reporter=verbose` |
| Full suite command | `cd frontend && npx vitest run` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ANIM-01 | Animation queue enforces sequential playback | unit | `cd frontend && npx vitest run src/__tests__/animation-queue.test.tsx -x` | No — Wave 0 |
| ANIM-02 | Tier change banner shows at 50%/80% thresholds | unit | `cd frontend && npx vitest run src/__tests__/tier-change-banner.test.tsx -x` | No — Wave 0 |
| ANIM-03 | Perfect Day plays choreographed sequence | unit | `cd frontend && npx vitest run src/__tests__/perfect-day.test.tsx -x` | No — Wave 0 |
| ANIM-04 | Capsule drop bounces in with scale spring | unit | `cd frontend && npx vitest run src/__tests__/capsule-drop.test.tsx -x` | No — Wave 0 |
| ANIM-05 | Capsule reveal plays 3D card flip | unit | `cd frontend && npx vitest run src/__tests__/capsule-drop.test.tsx -x` | No — Wave 0 |
| ANIM-06 | Dragon Ball flies into tracker slot | unit | `cd frontend && npx vitest run src/__tests__/dragon-ball-trajectory.test.tsx -x` | No — Wave 0 |
| ANIM-07 | Transformation plays form-specific visual | unit | `cd frontend && npx vitest run src/__tests__/transformation.test.tsx -x` | No — Wave 0 |
| ANIM-08 | Shenron ceremony plays full-screen sequence | unit | `cd frontend && npx vitest run src/__tests__/shenron-ceremony.test.tsx -x` | No — Wave 0 |
| ANIM-09 | Shenron enforces minimum 1 active wish | unit | `cd frontend && npx vitest run src/__tests__/shenron-ceremony.test.tsx -x` | No — Wave 0 |

### Sampling Rate
- **Per task commit:** `cd frontend && npx vitest run --reporter=verbose`
- **Per wave merge:** `cd frontend && npx vitest run`
- **Phase gate:** Full suite green before verification

### Wave 0 Gaps
- [ ] `frontend/src/__mocks__/motion/react.ts` — Motion component mocks for JSDOM (AnimatePresence, motion.div, useAnimation, useReducedMotion)
- [ ] `frontend/src/__tests__/animation-queue.test.tsx` — covers ANIM-01 (queue sequential playback)
- [ ] Test files for ANIM-02 through ANIM-09 created during their respective plan waves

## Open Questions

1. **XpPopup migration to Framer Motion**
   - What we know: Currently uses CSS `@keyframes xp-float`. Could migrate to motion springs for consistency
   - What's unclear: Whether the visual difference justifies the change
   - Recommendation: Migrate during this phase — consistency outweighs minor effort, and spring physics feel better than linear keyframes

2. **Dragon Ball trajectory coordinate calculation**
   - What we know: Ball needs to arc from habit card position to tracker slot position
   - What's unclear: How to get bounding rects across component boundaries
   - Recommendation: Use `getBoundingClientRect()` on source (habit card) and target (tracker slot) elements via refs, calculate bezier control point for arc

## Sources

### Primary (HIGH confidence)
- [Motion official docs — React Animation](https://motion.dev/docs/react-animation)
- [Motion official docs — AnimatePresence](https://motion.dev/docs/react-animate-presence)
- [Motion official docs — React Accessibility](https://motion.dev/docs/react-accessibility)
- [Motion official docs — React Installation](https://motion.dev/docs/react-installation)
- [Motion official docs — Upgrade Guide](https://motion.dev/docs/react-upgrade-guide)
- [Motion npm package](https://www.npmjs.com/package/motion) — latest v12.35.0

### Secondary (MEDIUM confidence)
- [AnimatePresence modes tutorial](https://motion.dev/tutorials/react-animate-presence-modes)
- [3D Card Flip with Framer Motion](https://dev.to/graciesharma/how-to-create-a-flipping-card-animation-using-framer-motion-5djh)
- [Mocking framer-motion for testing](https://dev.to/tmikeschu/mocking-framer-motion-v4-19go)

### Tertiary (LOW confidence)
- [Vitest + Framer Motion mock patterns](https://github.com/framer/motion/issues/1690) — community patterns, may need adaptation for motion v12

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — Motion is the undisputed leader for React animation with 30M+ monthly downloads
- Architecture: HIGH — AnimatePresence mode="wait" is the documented pattern for sequential animations
- Pitfalls: HIGH — Well-documented testing challenges and 3D transform gotchas from community experience
- Validation: MEDIUM — Test mocking patterns may need adaptation for motion v12 import paths

**Research date:** 2026-03-05
**Valid until:** 2026-04-05 (30 days — Motion is stable, API unlikely to change)
