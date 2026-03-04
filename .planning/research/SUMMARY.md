# Project Research Summary

**Project:** Saiyan Tracker v1.1 Frontend — The Dopamine Edition
**Domain:** DBZ-themed gamified habit tracker (animation-heavy, audio-driven, ADHD-optimized, single-user React SPA integrating with existing FastAPI backend)
**Researched:** 2026-03-04
**Confidence:** HIGH

## Executive Summary

Saiyan Tracker v1.1 is a frontend-only build that integrates with a fully built and tested FastAPI + SQLite backend (222 passing tests). The product is a dopamine-engineered habit tracker where audio and visual feedback on every interaction is non-negotiable — if the app is silent and still, it has failed. The recommended approach is a React 19 SPA using Vite 7, Tailwind CSS v4 (CSS-first config), Zustand 5 for all state management, Motion 12 for animations, Howler.js with an audio sprite sheet for sound, and Recharts for the analytics page only. The architecture is driven by a single critical data flow: the `POST /habits/{id}/check` response fans out to 3 Zustand stores and a FIFO animation queue that plays up to 5 sequential celebration animations per habit check.

The central design challenge is animation orchestration. A single habit check can trigger an XP popup, tier-change banner, capsule drop reveal, transformation unlock, Perfect Day explosion, and Shenron ceremony — all from one API response. These must play sequentially using a queue pattern in `uiStore`, not simultaneously, or the experience degrades into visual and audio chaos. The `CheckHabitResponse` was engineered by the backend to return all downstream state changes in a single payload, so the frontend never needs follow-up API calls after a check. All power level, transformation, dragon ball, and streak state comes from the check response directly — the frontend stores are mirrors of backend truth, never independent calculators.

The biggest risks are setup-phase configuration mistakes that are expensive to fix later: installing the wrong animation library package (`framer-motion` instead of `motion`), creating a `tailwind.config.js` in a Tailwind v4 project (silently ignored), using TanStack Query alongside Zustand (creates two-source-of-truth bugs that break the animation dispatch pattern), and skipping Zustand selector discipline (re-render storms across the entire dashboard on every habit check). These are all zero-cost to prevent and medium-to-high cost to recover from. The ARCHITECTURE.md provides complete working code examples for all 5 architectural patterns, so implementation is well-specified.

---

## Key Findings

### Recommended Stack

The stack is fully resolved with HIGH confidence. React 19.2 + Vite 7.3 is the foundation, requiring Node 20.19+ (Vite 7 dropped Node 18). Tailwind CSS v4.2 uses CSS-first configuration via `@theme` directives — no `tailwind.config.js` exists. Motion 12 (renamed from Framer Motion) handles all overlay animations and sequencing; install via `npm install motion` and import from `motion/react`. Zustand 5 manages all state in 4 stores with no TanStack Query — Zustand stores call API functions directly and handle animation dispatch atomically in the same synchronous call, which a separate server-state library's async scheduler would prevent. Howler.js via a SoundProvider context with a single sprite sheet handles audio. The `ky` HTTP client (3.6kb) replaces both raw fetch and Axios (13kb).

**Core technologies:**
- **React 19.2**: UI framework — concurrent rendering handles animation-heavy UIs; requires Node 20.19+
- **Vite 7.3**: Build tool — Rolldown Rust bundler, sub-second HMR, `@tailwindcss/vite` first-party plugin
- **TypeScript 5.7 (strict)**: Type safety — critical for typing `CheckHabitResponse` (the 15-field composite response that drives all state)
- **Zustand 5.0**: State management — 4 stores (habitStore, powerStore, rewardStore, uiStore); synchronous action dispatch enables atomic API-response-to-animation-queue updates; use `useShallow` for multi-value selections
- **Motion 12**: Animations — `AnimatePresence mode="wait"` for sequenced overlays, spring physics for aura bar, 3D `rotateY` card flip for capsule reveal, screen shake wrapper
- **Tailwind CSS v4.2**: Styling — CSS-first `@theme` config with 9 DBZ-specific color tokens; no `tailwind.config.js`
- **React Router 7.13**: Routing — 3 routes (Dashboard, Analytics, Settings); v7 supports React 19 transitions
- **Howler.js 2.2 via SoundProvider context**: Audio — single sprite sheet loaded once at app mount; `useAudio().play('scouter_beep')` from any component; NOT individual `use-sound` hooks (creates duplicate Howler instances per component)
- **ky 3.6kb**: HTTP client — typed API wrapper; base URL configured; components never import from `api/` directly
- **Recharts 3.7**: Charts — Analytics page only; Dashboard attribute bars use CSS progress bars (10x lighter)
- **canvas-confetti 1.9**: Particles — Perfect Day and Dragon Ball bursts; direct API, not `react-canvas-confetti` (unmaintained 2+ years)
- **sonner**: Toast notifications — 2-3kb, DBZ-themed custom styling

**Critical version notes:**
- `use-sound@5.0.0` has LOW confidence React 19 compatibility — if peer dep conflicts, use the custom 15-line Howler wrapper provided in STACK.md
- `recharts@3.7.x` may need `react-is` in `package.json` overrides during install
- **Node 20.19+ required** — Vite 7 dropped Node 18; verify before starting

### Expected Features

**Must have — Core daily loop (v1.1 Core):**
- Habit list with check/uncheck and optimistic UI — the primary interaction; every other feature flows from here
- Daily aura progress bar with tier labels (Kaio-ken x3/x10/x20) — the visual centerpiece; uses CSS `scaleX` not Motion
- RPG attribute bars STR/VIT/INT/KI with XP fill and level numbers
- Dragon Ball tracker (7 slots; filled balls glow with `box-shadow: 0 0 20px #FF6B00`)
- Saiyan avatar with form-appropriate aura (10 transformation forms, color per form)
- Streak display (current + best, per-habit on habit cards)
- Character quote display — embedded in check response; no extra API call needed
- Habit CRUD modal (title, importance, attribute, frequency, category)
- XP popup animation floating up from checked habit card (`"+22 STR XP"`)
- SoundProvider with sound effects on every interaction — PRD core value; not optional
- Dark theme with DBZ CSS custom properties

**Must have — Dopamine layer (v1.1 Dopamine):**
- Tier change flash banner at 50%/80% thresholds (Kaio-ken x3/x10!)
- Perfect Day explosion — full-screen 8-step choreographed sequence; THE climax moment; screen shake + particles + XP reveal
- Capsule drop reveal — 3D card flip, rarity glow, user-defined real-life rewards; notification badge pattern (not blocking popup)
- Transformation animation — milestone event (~10 times ever); form-specific aura colors
- Shenron ceremony — 7 Dragon Balls collected, user selects a wish; requires at least 1 active wish in DB

**Should have — Complete the feature set (v1.1 Complete):**
- Calendar heatmap (gold/blue/red/gray 4-tier coloring via `@uiw/react-heat-map`)
- Attribute progression charts (Recharts `AreaChart` on Analytics page)
- Analytics summary stat cards (perfect days, avg %, total XP, longest streak)
- Settings page (sound/theme toggle, Reward CRUD, Wish CRUD, Category CRUD)
- Off-day management modal

**Defer to v1.x (post-validation):**
- Per-habit 90-day contribution graph
- Vegeta escalating roast system (mild/medium/savage, triggers at session start after missed day — never mid-session)
- Streak milestone badges (Piccolo at 21 days, Whis at 60+)
- Calendar day drill-down popover with per-habit breakdown

**Defer to v2+:**
- PWA with offline support, VPS + PostgreSQL, Training Arc challenges, Tournament mode vs past self

**Anti-features — explicitly excluded:**
- Task/to-do list — dilutes clean 100% model; enables ADHD hyperfocus exploit
- HP loss / punishment — ADHD abandonment trigger; Zenkai halving covers this
- Leaderboards or social features — triggers shame in neurodivergent users
- Multi-user auth or cloud sync — single-tenant SQLite design; zero value for solo app
- Notification/reminder system — notification fatigue; the dopamine loop IS the reminder

### Architecture Approach

The architecture is a React SPA with clean layer separation: ky API client → 4 Zustand stores → Motion animation layer → React components. The key architectural decision is **Zustand-only state management with no TanStack Query**: stores call API functions directly so that the `checkHabit` action can atomically update 3 stores AND populate the animation queue in one synchronous block. An `AnimationLayer` component in `App.tsx` renders above all content via `position: fixed; z-index: 50`, watches `uiStore.currentAnimation` using `AnimatePresence mode="wait"`, and calls `dequeueAnimation()` on each animation's exit. The SoundProvider wraps the entire app with a single Howler sprite sheet. The backend requires one addition before the frontend can communicate: CORSMiddleware in `main.py` restricted to `localhost:5173`.

**Major components:**
1. **API client layer** (`api/client.ts` + per-resource modules) — ky instance with typed wrappers; 1 file per backend router; stores call these, components never import from `api/` directly
2. **Zustand stores** (4 stores: habitStore, powerStore, rewardStore, uiStore) — `habitStore.checkHabit()` is the hub: optimistic toggle → POST → update 3 stores → populate animation queue
3. **SoundProvider context** — singleton Howler instance with sprite sheet (`~500KB-1MB`); `useAudio().play('scouter_beep')` from any component; preloads all sounds at mount
4. **AnimationLayer** in `App.tsx` — `AnimatePresence mode="wait"` rendering overlay animations sequentially from FIFO queue in uiStore; each calls `dequeueAnimation()` on completion
5. **Dashboard page** — HabitList, DailyAuraBar (CSS), SaiyanAvatar, AttributeBars (CSS), DragonBallTracker, StreakDisplay; all read-only displays driven by store subscriptions with fine-grained selectors
6. **Analytics page** — CalendarHeatmap, AttributeChart (Recharts), SummaryCards; parallel API fetches on mount; independent of animation system
7. **Settings page** — RewardManager, WishManager, CategoryManager, sound/theme toggles; parallel API fetches on mount

**Recommended build order (dependency-driven):**
Types → API client → 4 Zustand stores → App shell + CORS + Vite proxy → Dashboard core (habit check e2e verified) → Dashboard context components → Audio system (parallel) → Animation layer → Modals → Settings → Analytics

### Critical Pitfalls

1. **Wrong Motion package** — Install `motion` (not `framer-motion`); import from `motion/react`. `framer-motion` is the legacy package, no longer the primary dev target. Zero-cost to prevent at setup; 30-minute fix if caught early.

2. **Tailwind v4 config paradigm shift** — Do NOT create `tailwind.config.js`. All custom colors go in `@theme {}` in `index.css`. Border defaults changed to `currentColor` (was `gray-200`); ring defaults to 1px (was 3px blue). Always specify explicit color and width on borders and rings. Medium recovery cost via `npx @tailwindcss/upgrade`.

3. **Audio autoplay policy** — Browser `AudioContext` starts suspended until a user gesture. The SoundProvider must call `audioContext.resume()` on first interaction. Do NOT call `play()` in `useEffect` or on mount. The first habit check naturally satisfies the gesture requirement — wire sound calls inside click handlers only. Test on cold browser tab after every new sound event.

4. **Animation avalanche / jank** — Multiple animations firing simultaneously produces dropped frames and audio/visual desync. Use the `uiStore` FIFO queue for strict sequential playback with `AnimatePresence mode="wait"`. Animate only `transform` and `opacity` — never `width`, `height`, `backgroundColor`, or `boxShadow` (these trigger layout/paint). The aura bar fill must use CSS `scaleX` transition, not a Motion value, to keep the JS animation budget free for celebrations.

5. **Zustand re-render storms** — Never call `useStore()` without a selector. Always: `useHabitStore((s) => s.todayHabits)`. Use `useShallow` for multi-value selections. 6 habit cards + avatar + attribute bars + aura bar + dragon balls all re-rendering on every single habit check is catastrophic for performance. Define all 4 store boundaries and document the selector pattern before building any components.

6. **XP calculation authority** — The backend is the only source of truth for XP, power level, and transformation state. `powerStore` sets values from API responses only: `power_level = response.power_level`, never `power_level += calculated_xp`. Optimistic UI for habit completion uses a toggle (checked/unchecked state), not an XP increment.

7. **CORS + Vite proxy** — Configure the Vite proxy in `vite.config.ts` as the primary CORS solution. All API calls use relative URLs (`/api/v1/habits`), never absolute. Add restricted CORSMiddleware to FastAPI backend as a fallback for Swagger UI access only. Do not use both simultaneously with wildcard origins.

---

## Implications for Roadmap

Based on the combined research — dependency graph from ARCHITECTURE.md, pitfall-to-phase mapping from PITFALLS.md, and feature priority tiers from FEATURES.md — the following 5-phase structure is recommended:

### Phase 1: Project Setup and Foundation
**Rationale:** Seven pitfalls require prevention at setup time. Wrong packages, wrong config paradigms, CORS misconfiguration, and React 19 library incompatibilities are all zero-cost to prevent and medium-to-high cost to fix after components are built. This phase must complete before any component work begins.
**Delivers:** Working project scaffold with Vite 7 + React 19 + TypeScript 5.7 strict; Tailwind v4 configured with all 9 DBZ color tokens in `@theme`; `motion` (not `framer-motion`) installed and import path verified; ky API client with typed wrappers; TypeScript types in `types/index.ts` mirroring all backend schemas; Vite proxy confirmed working (first `GET /api/v1/habits/today/list` succeeds); CORSMiddleware added to FastAPI backend; all library peer dependencies verified for React 19
**Addresses:** TypeScript types for `CheckHabitResponse` (foundational for type safety across all subsequent work)
**Avoids:**
- Pitfall 2: `motion` not `framer-motion`; `motion/react` import path
- Pitfall 7: Tailwind v4 CSS-first `@theme`; no `tailwind.config.js`; explicit border and ring classes
- Pitfall 6 (React 19): All libraries verified; new JSX transform configured; no `defaultProps` on function components
- Pitfall 9: Vite proxy configured; relative API URLs throughout; CORSMiddleware added with restricted origin
**Research flag:** Standard patterns — official docs are authoritative. Verify `use-sound@5.0.0` React 19 peer dep at install time; fall back to custom Howler hook if warnings appear.

### Phase 2: State Management and Core Data Flow
**Rationale:** Zustand stores are the spine of the app. Components are useless without data. The animation queue in `uiStore` must exist before the animation layer can be built. All 4 stores must be defined with proper selectors and documented patterns before any component consumes state, or re-render bugs are baked in from the start.
**Delivers:** 4 Zustand stores with typed state shapes, API-calling actions, cross-store communication pattern (`usePowerStore.getState()` inside `habitStore.checkHabit()`), `processCheckResult()` function that builds the animation queue from a check response, `dequeueAnimation()` action; custom hooks encapsulating selectors (`useTodayHabits()` etc.); `useShallow` documented and enforced; `local_date` sent in every check request
**Addresses:** Habit check data flow (the most critical flow), optimistic UI toggle with rollback on error
**Avoids:**
- Pitfall 5: 4 stores, selector discipline documented, `useShallow` for multi-value selections
- Pitfall 8 (XP authority): `powerStore` sets values from check response only; no local XP math
- Pitfall 12 (timezone): `local_date: "YYYY-MM-DD"` in every check request body
- Anti-pattern: No TanStack Query; Zustand owns server state for atomic animation dispatch
**Research flag:** Standard patterns — Zustand 5 architecture is well-documented; ARCHITECTURE.md has complete working code for all store shapes and the `processCheckResult` function.

### Phase 3: Dashboard Core and Audio Foundation
**Rationale:** The habit-check loop must work end-to-end before animation or analytics work begins. Audio is foundational infrastructure — nearly every feature needs sound, and the SoundProvider autoplay pattern must be established before individual sounds are wired. These two tracks can be built in parallel (audio has no dependency on UI components).
**Delivers:** Working daily habit-check loop with optimistic UI; DailyAuraBar with CSS `scaleX` transition and spring physics; HabitList + HabitCard components; SaiyanAvatar (transformation-aware, 10 form images); AttributeBars (CSS, not Recharts); DragonBallTracker (7 slots, glow CSS); StreakDisplay; XP popup float animation; SoundProvider with Howler sprite sheet; `useAudio()` hook; all ~10 sound clips sourced and sprite sheet compiled; global mute toggle respected
**Addresses:** Habit list + check/uncheck (table stakes), daily aura progress bar (visual centerpiece), streak display, character quote display, XP popup, sound on every interaction (PRD core value)
**Avoids:**
- Pitfall 3: SoundProvider `audioContext.resume()` on first user gesture; `play()` only inside click handlers; tested on cold browser tab
- Pitfall 4: Audio priority queue; `interrupt: true` for short repeated sounds; single Howler context, not one per component
- Pitfall 1: Aura bar uses CSS `scaleX`, not Motion — keeps JS animation budget free for celebrations
- Pitfall 10: Dashboard uses CSS progress bars for attributes, not Recharts
**Research flag:** Sound asset sourcing requires attention — source ~10 clips from Freesound.org (CC0) and compile sprite sheet with `audiosprite` or ffmpeg before this phase starts. This is a prerequisite, not a Phase 3 task.

### Phase 4: Animation Layer and Dopamine Mechanics
**Rationale:** The animation layer requires a working dashboard to overlay on top of and a working audio system to trigger sounds. Building animations first without real data makes integration testing impossible. This phase delivers the features that differentiate the app from every competitor — the celebrations that make it feel like a game.
**Delivers:** `AnimationLayer` in `App.tsx` with `AnimatePresence mode="wait"`; `PerfectDayExplosion` (8-step choreographed sequence: blackout → screen shake → canvas-confetti particles → "100% COMPLETE" title → XP counter → Dragon Ball earned → Goku quote → wind-down); `CapsuleDropPopup` (notification badge → 3D card flip reveal); `TransformationReveal` (form-specific aura color, avatar swap); `ShenronAnimation` (sky darkens, Shenron scales up, wish selection, Dragon Balls scatter); `TierChangeBanner` (Kaio-ken x3/x10!); `XpPopup`; `ScreenShake` wrapper; all animations call `dequeueAnimation()` on exit; UI is non-blocking during animations (habit checkbox remains interactive)
**Addresses:** All P1 dopamine differentiators: Perfect Day explosion, capsule loot reveal, transformation milestone, Shenron ceremony, tier-change flash, Dragon Ball trajectory animation
**Avoids:**
- Pitfall 1: `AnimatePresence mode="wait"` enforces sequential playback; animate only `transform`/`opacity`; `PerfectDayExplosion` unmounts on completion to release GPU layers
- Pitfall 11 (reward saturation): Capsule shows notification badge, not blocking popup mid-habit-check flow; skippable open animation under 2 seconds
- Anti-pattern 3: Animations play sequentially via queue, never simultaneously
- UX pitfall: Screen shake reserved for 100% and transformation only; Vegeta roast triggers at session start only, never mid-session
**Research flag:** The Perfect Day 8-step choreography and Shenron ceremony flow need explicit step-by-step planning before implementation. The multi-step timing using `onAnimationComplete` chaining (not `setTimeout`) is the most complex UI sequence in the project. Plan the state machine explicitly before coding.

### Phase 5: Analytics and Settings
**Rationale:** Analytics and Settings have no dependencies on the animation system. Settings is needed to manage the rewards and wishes required for the Shenron/capsule system to be fully tested end-to-end — making it a prerequisite for validating Phase 4 completeness. Analytics is lowest dependency and appropriate for the final phase.
**Delivers:** CalendarHeatmap (`@uiw/react-heat-map`, 4-tier gold/blue/red/gray coloring, click-to-detail); Recharts `AreaChart` for attribute progression with `useMemo`-wrapped data and `React.memo`-wrapped components; Analytics summary stat cards; Settings page with sound/theme toggles, Reward CRUD, Wish CRUD, Category CRUD; Off-day modal; UI guard enforcing minimum 1 active wish before Shenron ceremony can complete; guard against empty rewards list when capsule drop triggers
**Addresses:** All P2 features: analytics visualization, user configuration, Shenron wish management, capsule reward customization
**Avoids:**
- Pitfall 10: All Recharts components wrapped in `React.memo`; chart data memoized with `useMemo`; formatter functions with `useCallback`; no Recharts on Dashboard
- Shenron crash: UI enforces minimum 1 active wish guard
- Capsule crash: Guard against empty rewards list when capsule drop triggers backend response
**Research flag:** Standard patterns — `@uiw/react-heat-map` and Recharts APIs are straightforward with the memoization discipline established here.

### Phase Ordering Rationale

- **Setup before everything**: 7 of 12 pitfalls must be prevented at setup time. Wrong packages and config paradigms compound into every subsequent phase and grow more expensive to fix as the codebase grows.
- **State before components**: Zustand store boundaries and selector discipline must be established before any component consumes state. Retrofitting selectors and `useShallow` across a completed component tree is a full-day task and requires touching every consumer.
- **Dashboard core before animations**: A working `checkHabit()` flow with real API data is required to test the animation queue. Animations built against mock data frequently break during integration because the response shape is richer than mocks capture.
- **Audio parallel with dashboard**: The SoundProvider context has no component dependencies — it can be built during Phase 3 alongside dashboard components and wired in at the end of the phase.
- **Analytics last**: Recharts and heatmap components are read-only with no Zustand write dependencies. They are completely independent and appropriate for the final phase, where they benefit from real accumulated data for meaningful testing.

### Research Flags

Phases needing implementation attention during planning:

- **Phase 1**: Verify `use-sound@5.0.0` React 19 compatibility before committing to it; have the custom 15-line Howler hook fallback from STACK.md ready to drop in
- **Phase 3 prerequisite**: Sound asset sourcing must happen before Phase 3 begins — source ~10 clips from Freesound.org and compile sprite sheet. Plan this as pre-Phase 3 work.
- **Phase 3 prerequisite**: Character image assets (10 transformation forms, 7 Dragon Ball images, Shenron image) must be sourced or commissioned before Phase 4 can build the components that use them
- **Phase 4**: Perfect Day 8-step choreography is the most complex UI sequence in the project; plan the step machine (state-driven, not setTimeout-based) before implementation

Phases with standard patterns (can skip `/gsd:research-phase`):

- **Phase 2**: Zustand 5 store patterns are well-documented; ARCHITECTURE.md has complete working code for all store shapes, `processCheckResult`, and cross-store communication
- **Phase 5**: Recharts `ResponsiveContainer` + `React.memo` pattern is established; `@uiw/react-heat-map` has adequate documentation

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All core libraries verified against official docs and npm. One LOW-confidence item: `use-sound@5.0.0` React 19 peer dep — documented fallback (custom Howler hook) exists |
| Features | HIGH | Backend API contracts are fixed (222 passing tests). Feature set derived from API response shapes and PRD. CheckHabitResponse schema is the authoritative feature spec. |
| Architecture | HIGH | Complete working TypeScript code examples for all 5 architectural patterns in ARCHITECTURE.md. Build order is dependency-graph-derived with explicit rationale. |
| Pitfalls | MEDIUM-HIGH | 10 of 12 pitfalls backed by official sources (MDN, React blog, Tailwind docs, Motion docs, Chrome for Developers). 2 are behavioral/UX based on ADHD gamification research (MEDIUM confidence). |

**Overall confidence:** HIGH

### Gaps to Address

- **`use-sound` React 19 compatibility**: LOW confidence. Attempt install first; if peer dep warnings appear, use the custom Howler hook (15 lines in STACK.md). Resolve in Phase 1 before any audio work begins.
- **Sound asset sourcing**: The ~10 audio clips (scouter beep, ki charge, explosion, capsule pop, item reveal, dragon radar ping, shenron roar, transform power-up, achievement fanfare) must be sourced or created before Phase 3. Freesound.org has CC0 options. Sprite sheet creation requires `audiosprite` npm package or manual ffmpeg. This is pre-Phase 3 work.
- **Character image assets**: 10 transformation form images (Base through Beast/UI) and 7 Dragon Ball images (1-star through 7-star) must exist before Phase 4 components can be built. Shenron image also required. Source or commission before Phase 4 starts.
- **`recharts@3.7.x` peer dep**: May require adding `react-is` to `package.json` overrides. Minor — resolve at install time in Phase 5.
- **Capsule crash guard**: When capsule drop triggers but rewards table is empty, the frontend must gracefully handle a null/empty capsule response. Backend behavior under this condition should be verified before Phase 4 capsule animation is wired.

---

## Sources

### Primary (HIGH confidence)
- [React 19.2 blog](https://react.dev/blog/2025/10/01/react-19-2) — v19.2.4 stable, concurrent rendering, ref as regular prop
- [React 19 Upgrade Guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide) — removed APIs, new JSX transform, `act` import path
- [Vite 7.0 announcement](https://vite.dev/blog/announcing-vite7) — Rolldown, Node 20.19+ requirement
- [Motion docs](https://motion.dev/docs/react) — renamed from framer-motion, `motion/react` import path, AnimatePresence, v12 React 19 support
- [Tailwind CSS v4 docs + upgrade guide](https://tailwindcss.com/docs/upgrade-guide) — `@theme` directive, CSS-first config, border/ring default changes
- [Zustand GitHub v5.0.11](https://github.com/pmndrs/zustand) — React 19 peerDep, `useShallow`, selector patterns, cross-store `getState()`
- [Howler.js](https://howlerjs.com/) — audio sprites, singleton `AudioContext`, Web Audio API fallback, `play(spriteId)`
- [canvas-confetti GitHub](https://github.com/catdad/canvas-confetti) — `shapeFromPath`, particle count limits for 60fps
- [MDN Autoplay Guide](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay) — `AudioContext` suspension policy, cross-browser gesture requirement
- [Chrome Web Audio Autoplay Policy](https://developer.chrome.com/blog/web-audio-autoplay) — `context.resume()` in event handler
- [Vite Server Proxy docs](https://vite.dev/config/server-options) — proxy configuration, `changeOrigin`, path rewriting
- [ky GitHub](https://github.com/sindresorhus/ky) — 3.6kb fetch wrapper, TypeScript-first, error throwing on 4xx/5xx

### Secondary (MEDIUM confidence)
- [Recharts npm + React 19 issue #4558](https://github.com/recharts/recharts/issues/4558) — `react-is` override workaround
- [use-sound GitHub](https://github.com/joshwcomeau/use-sound) — v5.0.0, last update Feb 2025, `interrupt` option, sprite `playbackRate` limitation, null guard on `sound` object
- [Recharts Performance Guide](https://recharts.github.io/en-US/guide/performance/) — `React.memo`, `useMemo` for chart data
- [Gamification UX research — ALMAX Agency](https://almaxagency.com/gamification-in-ux-ui/) — 40% exit rate from visual noise, 20% interface saturation threshold
- [Variable reward psychology — Nir Eyal](https://www.nirandfar.com/want-to-hook-your-users-drive-them-crazy/) — capsule drop rate justification and habituation risk
- [Gamification in habit tracking — Cohorty](https://blog.cohorty.app/gamification-in-habit-tracking-does-it-work-research-real-user-data) — real-user dropout data

### Tertiary (LOW confidence)
- `use-sound@5.0.0` React 19 peer dep compatibility — needs empirical verification at install time in Phase 1; fallback documented

---
*Research completed: 2026-03-04*
*Ready for roadmap: yes*
