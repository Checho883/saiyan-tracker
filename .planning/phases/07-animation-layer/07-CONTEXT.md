# Phase 7: Animation Layer - Context

**Gathered:** 2026-03-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Choreographed sequential animations for major game events: tier change flash, Perfect Day explosion, capsule drop/reveal, Dragon Ball trajectory, transformation unlock, and Shenron ceremony. The animation queue enforces sequential playback so overlapping events play one after another. Small feedback animations (XP popup, tier banner) play inline on their components without queuing.

</domain>

<decisions>
## Implementation Decisions

### Animation Technology
- Use **Framer Motion** as the animation library (install `motion`)
- Spring physics for all micro-animations (bounces, scales, enters) — the app should feel alive and game-like
- `AnimatePresence mode="wait"` for sequential queue playback at app root
- Single `AnimationPlayer` component at app root that dequeues one event at a time, renders the matching overlay, waits for exit animation, then dequeues next

### Queue Architecture
- **Inline animations** for small feedback: XP popup, tier change banner — these animate directly on their component, no queue delay
- **Queued animations** for full-screen sequences: Perfect Day, Shenron ceremony, transformation, capsule drop — these go through the uiStore animation queue
- Dragon Ball trajectory is queued (it's a cross-component animation from habit card to tracker)

### Perfect Day Sequence (~2.5s)
- Full theatrical: dark overlay -> screen shake -> particle burst -> "100% COMPLETE" scales in -> XP counter ticks up -> character quote fades in -> everything fades out
- Tap-to-skip available after first 1s (the impactful opening plays uninterrupted)
- Auto-completes at end of sequence

### Shenron Ceremony (~4-5s, epic)
- Sky darkens -> lightning flashes -> Shenron scales up from bottom -> wish prompt appears -> user selects wish -> balls scatter with trajectory -> reset
- Tap-to-skip available after first 1s
- Enforces minimum 1 active wish before allowing completion (ANIM-09)

### Transformation Unlock
- **Distinct visual per form** — each transformation is a unique achievement:
  - SSJ: golden flash
  - SSJ2: lightning
  - SSG: red aura
  - SSB: blue aura
  - UI: silver flash
- Each includes avatar swap to new form
- Tap-to-skip after 1s

### Tier Change Banner
- Brief inline banner ("Kaio-ken x3!") with scale-in spring animation at 50%/80% thresholds
- Plays directly on the AuraGauge/HeroSection, not through queue
- Quick dismiss (~1.5s auto)

### Screen Shake
- CSS transform shake: quick translateX/Y jitter on app container
- 200-300ms duration, subtle (2-4px displacement)
- Used in Perfect Day and power-up moments

### Particles
- DOM-based particles using Framer Motion (10-20 small divs with randomized trajectories)
- No canvas layer needed — adequate for short burst effects
- Garbage-collected after animation completes

### Rarity Glow (Capsule Rewards)
- Animated pulsing box-shadow/border glow that breathes
- Higher rarity = more intense pulse rate
- Epic rarity gets subtle sparkle particles in addition to glow
- Colors: white (common), blue (rare), purple (epic)

### Accessibility
- Respect `prefers-reduced-motion` OS setting
- When enabled: skip particles/shake/flash, show static banners instead
- Full-screen sequences show simplified versions (text + color, no choreography)

### Claude's Discretion
- Exact spring stiffness/damping values per animation
- Particle count and trajectory randomization ranges
- Transition timing between sequence steps
- Reduced-motion fallback specifics
- Whether XpPopup migrates from CSS keyframes to Framer Motion springs (recommended for consistency)

</decisions>

<specifics>
## Specific Ideas

### Capsule Interaction
- Capsule drops into **center of screen** on semi-transparent overlay
- **Tap to reveal**: capsule bounces in with scale spring, pulses invitingly, user taps to trigger 3D card flip (rotateY)
- Reward displays with rarity-appropriate animated glow
- **Dismiss**: tap anywhere after minimum 1.5s display, or auto-dismiss after 4s

### Dragon Ball Trajectory
- Ball emerges from the **checked habit card** and arcs up to the Dragon Ball tracker slot in the hero section
- Clear cause-and-effect connection between the action and the reward

### Skip Behavior (all full-screen sequences)
- First 1s plays uninterrupted (the impactful opening)
- After 1s, tap anywhere to fast-forward to end/dismiss
- Prevents accidental skips while respecting user's time

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `uiStore.ts`: Animation queue skeleton already exists with `AnimationEvent` types, `enqueueAnimation`, `dequeueAnimation`, `clearAnimations` — ready to use
- `useSoundEffect.ts`: Maps animation events to sounds — already wired, sounds play when events are enqueued
- `XpPopup.tsx`: Current CSS keyframe animation (`xp-float`) — candidate for Framer Motion migration
- `AuraGauge.tsx`: CSS transition on progress circle — tier label area is where inline tier banner would appear
- `EmptyState.tsx`, `LoadingScreen.tsx`: Existing common components pattern

### Established Patterns
- Zustand with `useShallow` for multi-value selections — animation state follows this pattern
- CSS custom properties for theming (`--color-saiyan-500`, `--color-aura-500`, etc.) — animation colors should use these tokens
- Component-per-feature in `components/dashboard/` — each animation overlay should follow this structure

### Integration Points
- `AppShell.tsx`: Root layout — AnimationPlayer component mounts here as sibling to page content
- `HabitCard.tsx`: Habit check triggers `enqueueAnimation` — already wired in habitStore
- `HeroSection.tsx` / `SaiyanAvatar.tsx`: Transformation animation targets these components
- `DragonBallTracker.tsx`: Dragon Ball trajectory animation target
- `SoundProvider.tsx`: Audio already fires on animation events — visual animations layer on top

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 07-animation-layer*
*Context gathered: 2026-03-05*
