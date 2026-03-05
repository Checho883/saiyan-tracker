# Phase 6: Audio System - Context

**Gathered:** 2026-03-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Every user interaction produces a sound effect — the app is never silent when something happens. SoundProvider with Howler.js sprite sheet, sound effects on all game events and key UI interactions, global mute toggle. Animations are Phase 7 — this phase handles audio only.

</domain>

<decisions>
## Implementation Decisions

### Sound sourcing & style
- Authentic DBZ feel — sounds that evoke the anime (energy blasts, power-up whooshes, scouter beeps)
- Mix approach: synthesize simple UI sounds (beeps, clicks) via Web Audio API, use free SFX libraries (freesound.org, mixkit, pixabay) for dramatic events (explosions, power-ups, roars)
- Unified audio processing — apply consistent reverb/compression so all sounds feel cohesive
- Single sprite sheet bundle — one .webm/.mp3 file with all sounds at defined offsets, Howler.js sprite support

### Sound trigger scope
- All 8 core game events are required: habit check (scouter beep), tier change (power-up burst), capsule drop (capsule pop), capsule reveal (chime), Perfect Day (explosion/SSJ scream), Dragon Ball earned (radar ping), Shenron ceremony (thunder + roar), transformation (power-up sequence)
- Additional key UI sounds: tab switches (subtle swoosh), modal open/close
- Habit uncheck gets a distinct "undo" sound (softer, deflating reverse beep)
- Error states get a subtle error tone for accessible feedback
- playbackRate variation (0.9-1.1) on repeated interactions to prevent monotony

### Mute/volume UX
- Simple on/off toggle (matches existing `sound_enabled` boolean in settings types)
- Accessible from both Settings page and a persistent speaker icon in the header/nav
- Sound OFF by default — respectful of context, user enables explicitly
- Respect device silent/vibrate mode when possible via Web Audio API

### Sound-animation coupling
- Shared event source — SoundProvider listens to the same AnimationEvent queue in uiStore
- Sounds can overlap when multiple events fire simultaneously (each event gets instant feedback)
- React Context + Provider pattern wrapping the app, providing `useAudio().play(soundId)` hook (matches roadmap spec)
- Lazy-load audio on first user interaction to respect browser autoplay policies

### Claude's Discretion
- Exact sound selection and mixing from free libraries
- Sprite sheet generation tooling/approach
- Web Audio API synthesis implementation details
- Sound duration and fade curves
- Exact playbackRate variation algorithm
- How to detect device silent mode in a PWA context
- Loading indicator while audio initializes (if any)

</decisions>

<specifics>
## Specific Ideas

- Scouter beep on habit check should feel like the DBZ scouter scanning — a quick electronic chirp
- Power-up burst on tier change should escalate with tier (Kaio-ken sounds different from SSJ)
- Perfect Day explosion should be the most impactful sound in the app — a moment of celebration
- Shenron ceremony should feel dramatic: thunder crack → deep roar
- The whole audio system should make the app feel like a Dragon Ball Z game, not a generic productivity app

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `uiStore` (frontend/src/store/uiStore.ts): AnimationEvent queue with typed events (tier_change, perfect_day, capsule_drop, dragon_ball, transformation, xp_popup, shenron) — SoundProvider can subscribe to this
- `SettingsResponse.sound_enabled` / `SettingsUpdate.sound_enabled` (frontend/src/types/index.ts): Boolean already typed for settings API

### Established Patterns
- Zustand stores with `useShallow` selector discipline — SoundProvider should follow same pattern
- Store cross-communication via `getState()` (habitStore calls uiStore.enqueueAnimation)
- React Context exists as a pattern (though currently stores are Zustand-based)

### Integration Points
- `habitStore.toggleCheck()` already distributes events to uiStore animation queue — sound triggers hook in here
- App shell (layout components) — where SoundProvider context wrapper goes
- Settings page — where full mute toggle control lives
- Header/BottomTabBar — where persistent quick-mute icon goes

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 06-audio-system*
*Context gathered: 2026-03-05*
