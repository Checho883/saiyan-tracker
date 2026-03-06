# Phase 6: Audio System - Research

**Researched:** 2026-03-05
**Domain:** Browser audio (Howler.js sprite sheets, Web Audio API synthesis)
**Confidence:** HIGH

## Summary

Phase 6 adds sound effects to every user interaction using Howler.js as the audio engine. The architecture centers on a SoundProvider React context that wraps the app, loads a single sprite sheet at mount, and exposes a `useAudio().play(soundId)` hook. Sound triggers subscribe to the existing `uiStore.animationQueue` events (tier_change, perfect_day, capsule_drop, dragon_ball, transformation, xp_popup, shenron) plus direct UI interaction sounds (habit check, tab switch, modal open/close).

Howler.js v2.2.4 is the standard library -- it wraps Web Audio API with HTML5 Audio fallback, supports sprite sheets natively, and is 7kb gzipped. The `audiosprite` npm tool generates the combined audio file + JSON sprite map from individual sound files. Sound files will be sourced from free SFX libraries (freesound.org CC0, mixkit, pixabay) or synthesized via Web Audio API for simple UI beeps.

**Primary recommendation:** Use Howler.js with a single sprite sheet, a Zustand-based sound store (not React Context) to match project patterns, and a `useSoundEffect` hook that subscribes to uiStore animation events.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Authentic DBZ feel -- sounds that evoke the anime (energy blasts, power-up whooshes, scouter beeps)
- Mix approach: synthesize simple UI sounds (beeps, clicks) via Web Audio API, use free SFX libraries (freesound.org, mixkit, pixabay) for dramatic events (explosions, power-ups, roars)
- Unified audio processing -- apply consistent reverb/compression so all sounds feel cohesive
- Single sprite sheet bundle -- one .webm/.mp3 file with all sounds at defined offsets, Howler.js sprite support
- All 8 core game events are required: habit check (scouter beep), tier change (power-up burst), capsule drop (capsule pop), capsule reveal (chime), Perfect Day (explosion/SSJ scream), Dragon Ball earned (radar ping), Shenron ceremony (thunder + roar), transformation (power-up sequence)
- Additional key UI sounds: tab switches (subtle swoosh), modal open/close
- Habit uncheck gets a distinct "undo" sound (softer, deflating reverse beep)
- Error states get a subtle error tone for accessible feedback
- playbackRate variation (0.9-1.1) on repeated interactions to prevent monotony
- Simple on/off toggle (matches existing `sound_enabled` boolean in settings types)
- Accessible from both Settings page and a persistent speaker icon in the header/nav
- Sound OFF by default -- respectful of context, user enables explicitly
- Respect device silent/vibrate mode when possible via Web Audio API
- Shared event source -- SoundProvider listens to the same AnimationEvent queue in uiStore
- Sounds can overlap when multiple events fire simultaneously
- React Context + Provider pattern wrapping the app, providing `useAudio().play(soundId)` hook
- Lazy-load audio on first user interaction to respect browser autoplay policies

### Claude's Discretion
- Exact sound selection and mixing from free libraries
- Sprite sheet generation tooling/approach
- Web Audio API synthesis implementation details
- Sound duration and fade curves
- Exact playbackRate variation algorithm
- How to detect device silent mode in a PWA context
- Loading indicator while audio initializes (if any)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| AUDIO-01 | SoundProvider context wraps app with global sound toggle and playSound method | Howler.js global mute + Howl sprite API; React Context + useAudio hook pattern |
| AUDIO-02 | Habit check triggers scouter beep sound | Web Audio API oscillator for electronic chirp synthesis |
| AUDIO-03 | Tier change triggers power-up burst sound | Sprite sheet segment; free SFX library sourcing |
| AUDIO-04 | Capsule drop triggers capsule pop sound; capsule open triggers reveal chime | Two sprite segments; separate sound IDs |
| AUDIO-05 | Perfect Day (100%) triggers explosion/SSJ scream sound | Dramatic SFX from free library; loudest/most impactful |
| AUDIO-06 | Dragon Ball earned triggers radar ping sound | Synthesized ping via Web Audio or sourced |
| AUDIO-07 | Shenron ceremony triggers thunder + roar sound | Multi-part SFX: thunder crack + deep roar from free library |
| AUDIO-08 | Transformation triggers power-up sequence sound | Rising power-up SFX from free library |
| AUDIO-09 | Sound effects use playbackRate variation (0.9-1.1) to prevent monotony | Howler.js `rate()` method on Howl instances |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| howler | 2.2.4 | Audio engine with sprite sheet support | 25k+ GitHub stars, Web Audio API + HTML5 fallback, 7kb gzip, native sprite maps |
| @types/howler | latest | TypeScript definitions | Project uses TS 5.9 |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| audiosprite | latest | CLI tool to generate sprite sheet from individual files | Dev dependency, build-time only |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| howler | use-sound | React hook wrapper, but v5.0.0 React 19 compatibility unverified per STATE.md; direct Howler.js is safer |
| howler | Tone.js | Full synthesis framework, overkill for SFX playback; 500kb+ |
| audiosprite | Manual ffmpeg | More control but requires manual JSON offset mapping |

**Installation:**
```bash
npm install howler
npm install -D @types/howler audiosprite
```

## Architecture Patterns

### Recommended Project Structure
```
frontend/src/
├── audio/
│   ├── SoundProvider.tsx      # React context wrapping app
│   ├── useAudio.ts            # Hook: play(soundId), toggle mute
│   ├── soundMap.ts            # Sprite name → offset/duration map
│   └── useSoundEffect.ts     # Hook: subscribes to uiStore events → plays sounds
├── assets/
│   └── audio/
│       ├── sprite.mp3         # Combined sprite sheet
│       ├── sprite.webm        # WebM format for browsers preferring it
│       └── sprite.json        # Sprite map (offsets/durations)
```

### Pattern 1: Howler.js Sprite Sheet
**What:** Single audio file containing all sounds at defined offsets
**When to use:** Always -- reduces HTTP requests, ensures all sounds load together
**Example:**
```typescript
import { Howl } from 'howler';
import spriteMap from '../assets/audio/sprite.json';

const sound = new Howl({
  src: ['/audio/sprite.webm', '/audio/sprite.mp3'],
  sprite: {
    scouter_beep: [0, 500],      // [offset_ms, duration_ms]
    power_up: [600, 1200],
    capsule_pop: [1900, 400],
    reveal_chime: [2400, 600],
    explosion: [3100, 2000],
    radar_ping: [5200, 800],
    thunder_roar: [6100, 2500],
    transform: [8700, 3000],
    swoosh: [11800, 200],
    modal_open: [12100, 150],
    modal_close: [12350, 150],
    undo: [12600, 300],
    error_tone: [13000, 250],
  },
});

// Play a specific sprite
sound.play('scouter_beep');
```

### Pattern 2: SoundProvider Context
**What:** React Context that initializes Howl on first user interaction, provides play/mute API
**When to use:** Wrap entire app in AppShell
**Example:**
```typescript
import { createContext, useContext, useCallback, useRef, useEffect } from 'react';
import { Howl, Howler } from 'howler';

interface AudioContextValue {
  play: (soundId: string) => void;
  toggleMute: () => void;
  isMuted: boolean;
}

const AudioCtx = createContext<AudioContextValue | null>(null);

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const howlRef = useRef<Howl | null>(null);
  const [isMuted, setIsMuted] = useState(true); // OFF by default

  // Lazy-load on first user interaction
  const initAudio = useCallback(() => {
    if (howlRef.current) return;
    howlRef.current = new Howl({
      src: ['/audio/sprite.webm', '/audio/sprite.mp3'],
      sprite: SPRITE_MAP,
    });
  }, []);

  const play = useCallback((soundId: string) => {
    if (isMuted) return;
    initAudio();
    if (!howlRef.current) return;
    const id = howlRef.current.play(soundId);
    // playbackRate variation
    const rate = 0.9 + Math.random() * 0.2; // 0.9-1.1
    howlRef.current.rate(rate, id);
  }, [isMuted, initAudio]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
    Howler.mute(!isMuted);
  }, [isMuted]);

  return (
    <AudioCtx.Provider value={{ play, toggleMute, isMuted }}>
      {children}
    </AudioCtx.Provider>
  );
}

export function useAudio() {
  const ctx = useContext(AudioCtx);
  if (!ctx) throw new Error('useAudio must be used within SoundProvider');
  return ctx;
}
```

### Pattern 3: Event-Driven Sound Triggers
**What:** Subscribe to uiStore animationQueue and play corresponding sounds
**When to use:** For game events that already flow through uiStore
**Example:**
```typescript
// useSoundEffect.ts -- hook mounted in SoundProvider
import { useUiStore } from '../store/uiStore';

const EVENT_SOUND_MAP: Record<string, string> = {
  tier_change: 'power_up',
  perfect_day: 'explosion',
  capsule_drop: 'capsule_pop',
  dragon_ball: 'radar_ping',
  transformation: 'transform',
  shenron: 'thunder_roar',
};

export function useSoundEffect() {
  const { play } = useAudio();
  const queue = useUiStore(s => s.animationQueue);

  useEffect(() => {
    if (queue.length === 0) return;
    const latest = queue[queue.length - 1];
    const soundId = EVENT_SOUND_MAP[latest.type];
    if (soundId) play(soundId);
  }, [queue, play]);
}
```

### Pattern 4: PlaybackRate Variation
**What:** Randomize playback speed slightly on each play to prevent monotony
**When to use:** Every sound play call
**Example:**
```typescript
const playWithVariation = (howl: Howl, spriteId: string) => {
  const id = howl.play(spriteId);
  const rate = 0.9 + Math.random() * 0.2; // 0.9 to 1.1
  howl.rate(rate, id);
  return id;
};
```

### Anti-Patterns to Avoid
- **Multiple Howl instances:** Creating separate Howl for each sound wastes HTTP requests and memory. Use one sprite sheet.
- **Auto-playing on mount:** Browsers block autoplay. Always wait for user interaction before initializing audio.
- **Synchronous sound init in render:** Howl creation should be lazy, not in component render path.
- **Using React state for Howl instance:** Ref is correct; Howl is mutable external state, not React state.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Audio sprite generation | Manual ffmpeg + JSON mapping | `audiosprite` CLI tool | Handles format conversion, offset calculation, JSON generation |
| Cross-browser audio | Custom Web Audio + HTML5 fallback | Howler.js | Handles codec detection, context suspension/resume, mobile quirks |
| Audio format detection | Custom `canPlayType` checks | Howler.js auto-detection | Tests codec support and picks best format automatically |
| Global mute | Custom mute tracking | `Howler.mute()` global API | Handles Web Audio context suspend/resume properly |

**Key insight:** Browser audio is full of edge cases (autoplay policies, codec support, AudioContext suspension, mobile silent mode). Howler.js handles all of these; hand-rolling means rediscovering each edge case.

## Common Pitfalls

### Pitfall 1: Browser Autoplay Policy
**What goes wrong:** Audio won't play on page load -- browsers require user gesture before AudioContext starts
**Why it happens:** Chrome, Safari, Firefox all block AudioContext creation/resume without user interaction
**How to avoid:** Initialize Howl lazily on first click/tap. Use `Howler.ctx.state` to check if context is suspended, resume on interaction.
**Warning signs:** "The AudioContext was not allowed to start" console warning

### Pitfall 2: Mobile Audio Silent Mode
**What goes wrong:** Sounds play even when phone is on silent/vibrate
**Why it happens:** Web Audio API ignores hardware silent switch on iOS
**How to avoid:** Cannot reliably detect silent mode in web apps. Document this limitation. The mute toggle is the user's control.
**Warning signs:** User complaints about sounds in meetings

### Pitfall 3: Memory Leaks from Howl Instances
**What goes wrong:** Creating Howl instances without cleanup causes memory leaks
**Why it happens:** Each Howl creates Web Audio nodes that aren't garbage collected
**How to avoid:** Use a single Howl instance via ref. Clean up with `howl.unload()` in useEffect cleanup.
**Warning signs:** Increasing memory usage over time in DevTools

### Pitfall 4: Sprite Offset Drift
**What goes wrong:** Sound plays wrong segment or clips into next sound
**Why it happens:** Manual sprite offset calculation is error-prone, especially after re-encoding
**How to avoid:** Use `audiosprite` tool to generate offsets. Add 100ms silence gap between sprites.
**Warning signs:** Sounds cut off early or have wrong beginning

### Pitfall 5: Race Condition on Rapid Interactions
**What goes wrong:** Multiple rapid habit checks cause audio glitches
**Why it happens:** Overlapping sound plays without rate limiting
**How to avoid:** Howler.js handles overlapping plays natively (each play() returns unique ID). The playbackRate variation actually helps here -- slightly different speeds make overlaps sound intentional.
**Warning signs:** Audio crackling or distortion on rapid interactions

## Code Examples

### Howler.js Sprite Sheet Initialization
```typescript
// Source: https://github.com/goldfire/howler.js
import { Howl, Howler } from 'howler';

// Single sprite sheet for all app sounds
const gameSound = new Howl({
  src: ['/audio/sprite.webm', '/audio/sprite.mp3'],
  sprite: {
    scouter_beep: [0, 500],
    power_up: [600, 1200],
    capsule_pop: [1900, 400],
    reveal_chime: [2400, 600],
    explosion: [3100, 2000],
    radar_ping: [5200, 800],
    thunder_roar: [6100, 2500],
    transform: [8700, 3000],
    swoosh: [11800, 200],
    modal_open: [12100, 150],
    modal_close: [12350, 150],
    undo: [12600, 300],
    error_tone: [13000, 250],
  },
  preload: false, // Lazy load
  html5: false,   // Use Web Audio API for sprite support
});
```

### Global Mute Control
```typescript
// Source: https://howlerjs.com/
// Mute all audio globally
Howler.mute(true);

// Unmute
Howler.mute(false);

// Check mute state -- track in React state, Howler doesn't expose getter
```

### PlaybackRate Variation
```typescript
// Source: https://howlerjs.com/ (rate method docs)
const id = gameSound.play('scouter_beep');
gameSound.rate(0.95, id); // Slightly slower
// Range: 0.9-1.1 for subtle variation
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| HTML5 `<audio>` elements | Web Audio API via Howler.js | 2018+ | Low latency, sprite support, effects processing |
| Multiple audio files | Single sprite sheet | Standard practice | Fewer HTTP requests, guaranteed simultaneous loading |
| use-sound React hook | Direct Howler.js | Ongoing | use-sound wraps Howler but adds React 19 compatibility risk |

**Deprecated/outdated:**
- `use-sound` v5.0.0: React 19 compatibility unverified (noted in STATE.md). Direct Howler.js is safer.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.0.18 + jsdom |
| Config file | `frontend/vitest.config.ts` |
| Quick run command | `cd frontend && npx vitest run --reporter=verbose` |
| Full suite command | `cd frontend && npx vitest run --reporter=verbose` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AUDIO-01 | SoundProvider wraps app, useAudio hook provides play/toggle | unit | `cd frontend && npx vitest run src/__tests__/sound-provider.test.tsx -x` | ❌ Wave 0 |
| AUDIO-02 | Habit check triggers scouter beep | unit | `cd frontend && npx vitest run src/__tests__/sound-triggers.test.ts -x` | ❌ Wave 0 |
| AUDIO-03 | Tier change triggers power-up burst | unit | `cd frontend && npx vitest run src/__tests__/sound-triggers.test.ts -x` | ❌ Wave 0 |
| AUDIO-04 | Capsule drop/reveal triggers pop/chime | unit | `cd frontend && npx vitest run src/__tests__/sound-triggers.test.ts -x` | ❌ Wave 0 |
| AUDIO-05 | Perfect Day triggers explosion/SSJ scream | unit | `cd frontend && npx vitest run src/__tests__/sound-triggers.test.ts -x` | ❌ Wave 0 |
| AUDIO-06 | Dragon Ball earned triggers radar ping | unit | `cd frontend && npx vitest run src/__tests__/sound-triggers.test.ts -x` | ❌ Wave 0 |
| AUDIO-07 | Shenron ceremony triggers thunder + roar | unit | `cd frontend && npx vitest run src/__tests__/sound-triggers.test.ts -x` | ❌ Wave 0 |
| AUDIO-08 | Transformation triggers power-up sequence | unit | `cd frontend && npx vitest run src/__tests__/sound-triggers.test.ts -x` | ❌ Wave 0 |
| AUDIO-09 | playbackRate variation 0.9-1.1 | unit | `cd frontend && npx vitest run src/__tests__/sound-provider.test.tsx -x` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `cd frontend && npx vitest run --reporter=verbose`
- **Per wave merge:** `cd frontend && npx vitest run --reporter=verbose`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `frontend/src/__tests__/sound-provider.test.tsx` -- covers AUDIO-01, AUDIO-09
- [ ] `frontend/src/__tests__/sound-triggers.test.ts` -- covers AUDIO-02 through AUDIO-08
- [ ] Howler.js mock setup in test-setup.ts or inline -- jsdom has no Web Audio API

## Open Questions

1. **Sound asset sourcing**
   - What we know: Free SFX libraries (freesound.org CC0, mixkit, pixabay) have suitable sounds
   - What's unclear: Exact files to use for each sound effect
   - Recommendation: Source placeholder/final sounds during implementation. Use simple synthesized beeps for development, replace with sourced SFX later. The sprite sheet architecture allows easy replacement.

2. **iOS Silent Mode Detection**
   - What we know: Web Audio API cannot detect iOS hardware silent switch
   - What's unclear: Whether any workaround exists in 2026
   - Recommendation: Accept limitation. Document it. The default-off + mute toggle gives users control.

3. **Sprite sheet build pipeline**
   - What we know: `audiosprite` CLI generates Howler-compatible sprite maps
   - What's unclear: Whether to integrate into Vite build or keep as manual dev step
   - Recommendation: Manual dev step with generated files committed to repo. Audio changes are rare -- no need for build pipeline complexity.

## Sources

### Primary (HIGH confidence)
- [Howler.js GitHub](https://github.com/goldfire/howler.js) - API reference, sprite support, global controls
- [Howler.js official site](https://howlerjs.com/) - Documentation, examples
- [MDN Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) - Browser audio fundamentals

### Secondary (MEDIUM confidence)
- [audiosprite GitHub](https://github.com/tonistiigi/audiosprite) - Sprite generation tool
- [Howler.js npm](https://www.npmjs.com/package/howler) - Version 2.2.4, latest

### Tertiary (LOW confidence)
- Web Audio API synthesis patterns from various blog posts -- specific synthesis code needs testing

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Howler.js is the established standard, well-documented
- Architecture: HIGH - Provider + hook pattern is established React pattern, matches project conventions
- Pitfalls: HIGH - Browser autoplay, mobile silent mode are well-documented issues
- Sound sourcing: MEDIUM - Free library availability confirmed but exact files need selection

**Research date:** 2026-03-05
**Valid until:** 2026-04-05 (30 days -- stable domain)
