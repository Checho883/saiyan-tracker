# Pitfalls Research

**Domain:** Gamified habit tracker (DBZ-theme, ADHD-targeted, animation-heavy, audio-driven)
**Researched:** 2026-03-04
**Confidence:** MEDIUM-HIGH — web search + official docs verified; single-user scope reduces some concerns

---

## Critical Pitfalls

### Pitfall 1: Animation Avalanche — Simultaneous Framer Motion Components Causing Jank

**What goes wrong:**
Every major event in Saiyan Tracker triggers a visual animation: habit check pulses the aura bar, a PointsPopup floats up, the DragonBallTracker might glow, and the transformation meter updates — all at the same moment. When 4-6 animations fire simultaneously on a React component tree, Framer Motion's JavaScript-driven animation engine becomes the bottleneck. On mid-range hardware, this manifests as dropped frames (jank), stuttering aura fills, and audio falling out of sync with visuals.

**Why it happens:**
Framer Motion does not use the Web Animations API (WAAPI) by default — it runs its own JS-driven timing engine. Each `<motion.div>` executing simultaneous property interpolations blocks or competes on the main thread. The perfect-day explosion sequence (screen shake + full-screen overlay + XP counter animate + Dragon Ball appear + quote fade-in) is the worst-case scenario: 5+ animated components firing concurrently. Heavy nested layouts with multiple motion components reduce frame rates and animation smoothness under load.

**How to avoid:**
- Sequence the perfect-day explosion using `AnimatePresence` and staggered `delay` props rather than firing all components at once.
- Animate only `transform` and `opacity` — never `width`, `height`, `top`, `backgroundColor`, or `boxShadow` directly; these trigger layout/paint, not just composite.
- Avoid applying `willChange` broadly; use it only on the one element that will animate immediately.
- The aura bar fill animation (the most frequent event) must be a CSS transition on `scaleX` transform, not a Framer Motion value, to avoid adding to the JS animation budget on every single habit check.
- The `PerfectDayAnimation` overlay should unmount when complete — use `AnimatePresence` with `mode="wait"` so it releases GPU layers after the sequence ends.
- For layout animations, add the `layoutScroll` prop to scroll containers so Framer Motion correctly measures positions, and use `layoutRoot` for any fixed-position elements.

**Warning signs:**
- Chrome DevTools Performance tab shows long paint/composite tasks (>16ms frame budget) during habit check
- Audio plays before the visual completes (misaligned feedback)
- The aura bar "jumps" instead of smoothly growing
- `console.log` timings inside animation callbacks show delayed execution

**Phase to address:** Animation & Feedback Phase — treat `PerfectDayAnimation` and `ShenronAnimation` as performance-constrained from day one, not as "optimize later" components.

---

### Pitfall 2: Framer Motion Package Name Change — Installing the Wrong Package

**What goes wrong:**
Framer Motion has been rebranded to "Motion" and moved to a new package. Installing `framer-motion` still works but is the legacy package. The new package is `motion` with imports from `motion/react`. Tutorials and Stack Overflow answers from pre-2025 reference the old import paths. Using `framer-motion` imports in a new project means missing v11 improvements, including better React 19 concurrent rendering support and performance fixes.

**Why it happens:**
Framer Motion became independent from Framer in late 2024, rebranding as Motion with a new home at motion.dev. The old `framer-motion` package continues to exist for backward compatibility but is no longer the primary development target. Developers following older tutorials install the wrong package.

**How to avoid:**
- Install `motion` (not `framer-motion`): `npm install motion`
- Import from `motion/react` not `framer-motion`: `import { motion, AnimatePresence } from "motion/react"`
- The v11 release includes improvements for React 19 concurrent rendering — use it.
- If any tutorial or library example uses `framer-motion` imports, mentally translate to `motion/react`.

**Warning signs:**
- `package.json` shows `framer-motion` as a dependency
- Import statements use `from "framer-motion"`
- Missing features or deprecation warnings that were fixed in motion v11

**Phase to address:** Project Setup Phase — get the correct package from the start. Migrating imports later is trivial but annoying.

---

### Pitfall 3: Audio Firing on App Load — Browser Autoplay Policy Silencing Everything

**What goes wrong:**
The app starts, loads the user's daily state, and immediately plays a "welcome back" sound or queues the aura charging sound. The browser blocks it. The AudioContext is in `suspended` state until the user performs a gesture (click, tap, keypress). All audio calls before that first gesture are silently swallowed. The user never hears the scouter beep on their first habit check of the session if the AudioContext was not resumed in the same synchronous call stack as the click.

**Why it happens:**
All major browsers (Chrome, Firefox, Safari) enforce an autoplay policy: `AudioContext` starts suspended, and `context.resume()` must be called from inside a user-initiated event. `use-sound` and Howler.js both rely on Web Audio API and hit this restriction identically. Safari is strictest — it will not play audio unless the resume call is in the same synchronous call stack as the user gesture. You can check the policy with `navigator.getAutoplayPolicy()` which returns "allowed", "disallowed", or "allowed-muted".

**How to avoid:**
- Implement a `SoundProvider` context that calls `audioContext.resume()` on the first user interaction anywhere in the app (a click/touch on the habit checkbox immediately satisfies this).
- Do NOT try to pre-warm or pre-play audio on `useEffect` or component mount.
- Store the `AudioContext` in a singleton (Howler.js does this automatically), not one per component — multiple contexts compound the permission problem.
- For the habit check sound specifically: the `play()` call must happen in the click handler directly, not in a `setTimeout` or `useEffect` triggered by a state change.
- Test the audio flow on first app load in a new browser tab every time a new sound event is added.

**Warning signs:**
- First habit check of the day is silent; subsequent ones have sound
- Console shows `AudioContext was not allowed to start` warning
- Sounds work in development (localhost often has fewer restrictions) but fail in production
- Transformation sounds don't play when triggered by a state change (XP threshold crossed) rather than a direct click

**Phase to address:** Audio Foundation Phase — establish the `SoundProvider` singleton and gesture-resume pattern before wiring up any individual sounds.

---

### Pitfall 4: Overlapping Audio on Rapid Habit Checks

**What goes wrong:**
Sergio checks habit 1 (scouter beep), then immediately checks habit 2 before the first sound finishes. Two scouter beeps stack. He checks 3-4 habits quickly (ADHD rapid-fire behavior) and 4 beeps are layered over each other. The capsule-drop sound overlaps the habit sound. The Kaio-ken tier-up sound fires on top of both. The dashboard sounds like audio soup.

**Why it happens:**
`use-sound` and Howler.js both allow multiple instances of the same sound to play simultaneously by default. Each `play()` call creates a new audio sprite instance. The `sound` object returned by `use-sound` is `null` for the first few moments after component mount, so early plays may silently fail while later rapid plays stack.

**How to avoid:**
- For short per-event sounds (scouter beep): use `interrupt: true` in `use-sound` so each new play stops the previous instance.
- For the aura-charging ambient hum: use a single Howler.js instance, adjust its `rate` or `volume` over time, never spawn new instances.
- For the perfect-day explosion: gate behind a flag so it cannot be triggered while already playing.
- Implement a global sound priority queue: at most 2 sounds playing simultaneously (foreground event sound + possible background ambient).
- Assign sound priority tiers: explosion/transformation (tier 1, interrupts everything), capsule/achievement (tier 2), habit-check beep (tier 3, lowest).
- When using sprites in `use-sound`, note that `playbackRate` is NOT reactive — only the initial value is used. If you need dynamic rate, use Howler directly.

**Warning signs:**
- Audio sounds muddy or distorted during rapid habit checks
- The perfect-day explosion is drowned out by leftover habit sounds
- `sound` object is null when trying to call methods on it during early component lifecycle

**Phase to address:** Audio Foundation Phase — build the priority queue and interrupt logic before any individual sounds are wired.

---

### Pitfall 5: Zustand Store Design — Fat Stores, Missing Selectors, Re-render Storms

**What goes wrong:**
All dashboard state lives in one monolithic `habitStore` that contains habits, todayHabits, calendar data, daily progress, loading flags, and error states. Every habit check updates `completion_rate`, which re-renders the SaiyanAvatar (subscribed to power level), the DragonBallTracker (subscribed to dragon balls), the AttributeBars (subscribed to attributes), and every HabitCard (subscribed to habits array). The entire dashboard tree re-renders on every single interaction.

**Why it happens:**
Zustand's simplicity makes it easy to `useHabitStore()` with no selector (equivalent to `(s) => s`), which subscribes a component to EVERY state change in the store. Developers pass objects from store selectors without shallow comparison, causing re-renders even when the specific values haven't changed. Stores grow endlessly as features are added because "it's just one more property."

**How to avoid:**
- Use 4 stores as the PRD specifies: `habitStore`, `powerStore`, `rewardStore`, `uiStore`. Do NOT merge them.
- NEVER use `useHabitStore()` without a selector. Always: `useHabitStore((s) => s.todayHabits)`.
- When selecting multiple values, use `useShallow` from `zustand/react/shallow`: `useHabitStore(useShallow((s) => ({ habits: s.todayHabits, rate: s.completionRate })))`.
- Keep server state (API responses) separate from UI state (modals, animation flags). `uiStore` handles what's visible; data stores handle what the backend returned.
- Export custom hooks that encapsulate selectors: `useTodayHabits()` instead of raw store access. This prevents selector mistakes at every call site.
- Actions (functions that modify state) should be defined inside the store with `set`, not as standalone functions that capture stale closures over store state.
- If using `persist` middleware, test hydration: the store loads default state on first render, then overwrites with persisted state — this can cause a visible flash/flicker of default values.

**Warning signs:**
- React DevTools Profiler shows 10+ components re-rendering on a single habit check
- Components re-render even when their specific data hasn't changed
- Console logging in a component shows it rendering when completely unrelated state changes
- Store has 20+ properties and growing

**Phase to address:** State Management Phase — define store boundaries and selector patterns before building any components that consume state.

---

### Pitfall 6: React 19 Breaking Changes Catching You Off Guard

**What goes wrong:**
The project targets React 19 but developers follow React 18 patterns. `defaultProps` on function components is silently ignored (removed in React 19). `PropTypes` checks are silently removed. String refs throw errors. The `ref` prop now works as a regular prop (no more `forwardRef` needed for most cases), but third-party libraries may not have updated. `act()` was moved from `react-dom/test-utils` to `react` — test imports break.

**Why it happens:**
React 19 removed several deprecated APIs that were long-warned-about but widely used. Key removals: `createFactory`, `render` from `react-dom` (use `createRoot`), string refs, `PropTypes` in React package, `defaultProps` on function components. Real-world migration reports show that the biggest surprise is third-party libraries that relied on React internals breaking silently.

**How to avoid:**
- Use ES6 default parameters instead of `defaultProps` on all function components.
- Use `ref` as a regular prop — no need for `forwardRef` wrapper components in React 19.
- Verify ALL third-party libraries support React 19 before adding them: check their `peerDependencies` in `package.json`. Libraries to verify: `motion` (supported), `zustand` (supported since v5), `recharts` (check version), `use-sound` (check — it wraps Howler, may need testing).
- For testing: import `act` from `react` not `react-dom/test-utils`.
- React 19 uses the new JSX transform — ensure TypeScript config targets it correctly. Explicit `Promise<JSX.Element>` return type annotations may cause type errors because the JSX namespace moved.
- Since this is a greenfield frontend, there's no migration — but EVERY tutorial and Stack Overflow answer predating Dec 2024 uses React 18 patterns. Be skeptical of examples.

**Warning signs:**
- TypeScript errors mentioning `JSX.Element` or namespace issues
- `defaultProps` values not appearing in components
- `forwardRef` being used unnecessarily (not wrong, just unnecessary boilerplate)
- Test utilities import errors after setup

**Phase to address:** Project Setup Phase — configure React 19 correctly from the start, set up TypeScript with the new JSX transform, and verify all library compatibility before writing any components.

---

### Pitfall 7: Tailwind CSS v4 Configuration Paradigm Shift

**What goes wrong:**
The developer creates a `tailwind.config.js` file (v3 pattern), defines custom colors (`#050510`, `#FF6B00`, `#1E90FF`), custom animations, and extends the theme. None of it works. Tailwind v4 moved from JavaScript configuration to CSS-first configuration using `@theme` directives in CSS. The `tailwind.config.js` file is ignored or only partially supported via a compatibility layer. Default behavior changes (border defaults to `currentColor` instead of `gray-200`, ring width defaults to `1px` instead of `3px`) break expected styling.

**Why it happens:**
Tailwind CSS v4 is a ground-up rewrite. The configuration paradigm changed fundamentally:
- `@tailwind base/components/utilities` directives replaced by `@import "tailwindcss"`
- Theme customization via `@theme { }` in CSS, not `tailwind.config.js`
- Legacy class names renamed: `bg-gradient-to-r` -> check for canonical v4 names
- `rotate`/`scale`/`translate` utilities now use individual CSS properties instead of composing into `transform`
- Requires Safari 16.4+, Chrome 111+, Firefox 128+

**How to avoid:**
- Do NOT create a `tailwind.config.js`. Define all custom theme values in CSS using `@theme`:
  ```css
  @import "tailwindcss";
  @theme {
    --color-bg-dark: #050510;
    --color-card-dark: #0D0D1A;
    --color-accent-orange: #FF6B00;
    --color-accent-blue: #1E90FF;
  }
  ```
- Run the official v4 upgrade tool (`npx @tailwindcss/upgrade`) on any existing code — it handles 90% of class renames automatically.
- Be aware that custom component classes (via `@apply` in complex scenarios) are second-class citizens in v4 compared to utility classes. Keep custom CSS minimal.
- Test border and ring styling early — the default color/width changes will make borders invisible or wrong without explicit values.
- For dark mode, the `class` strategy still works but configuration is different: `@variant dark (&:where(.dark, .dark *))` in CSS.

**Warning signs:**
- Custom colors not appearing despite being defined in config
- Borders appearing as `currentColor` (usually black) instead of expected gray
- Ring utilities looking different than expected
- Build errors mentioning `@tailwind` directives

**Phase to address:** Project Setup Phase — configure Tailwind v4 CSS-first theme with all custom colors and design tokens before building any components. This is foundational.

---

### Pitfall 8: XP Calculation Drift Between Frontend and Backend

**What goes wrong:**
The frontend Zustand store calculates and displays XP optimistically (before the API responds). The backend calculates XP authoritatively. They use slightly different rounding, slightly different streak multiplier values, or slightly different tier boundaries. After 30 days, the displayed power level is 47 XP higher than the database value. The user sees a transformation milestone fire in the UI at 1,000 XP, but the backend hasn't crossed 1,000 yet. A page refresh "uncrosses" the transformation.

**Why it happens:**
The XP formula has multiple multiplication steps with `floor()` calls: `floor(base_daily_xp * completion_rate * tier_multiplier * (1 + streak_bonus))`. Floating-point arithmetic in Python and JavaScript can produce different results at the sub-integer boundary. If the frontend recalculates on state change and the backend recalculates on receipt, one rounding call difference compounds over hundreds of days.

**How to avoid:**
- The backend is the single source of truth for all XP values. The frontend NEVER independently calculates XP — it only displays what the backend returns.
- The `POST /habits/{id}/check` response already returns `daily_xp_so_far`, `attribute_xp_awarded`, `completion_tier` — use these directly, do not recalculate them in the store.
- The `powerStore` sets values from API responses, never derives them locally. `power_level = response.power_level`, not `power_level += calculated_xp`.
- For optimistic UI: show a loading/pending state on the XP counter during the API call rather than optimistically incrementing by a client-calculated amount.

**Warning signs:**
- Displayed power level after refresh differs from displayed power level before refresh
- Transformation animation fires on frontend but backend still shows previous form
- Streak bonus percentages displayed in UI don't match analytics summary stats

**Phase to address:** State Management Phase — establish the calculation-authority contract before any UI is built. The `powerStore` must only be a mirror of backend state.

---

### Pitfall 9: CORS and Vite Proxy Misconfiguration with FastAPI

**What goes wrong:**
The React frontend on `localhost:5173` makes API calls to FastAPI on `localhost:8000`. Without configuration, every request fails with CORS errors. The developer adds FastAPI's `CORSMiddleware` — it works. They also add a Vite proxy — now requests go through two CORS handling paths, and preflight responses conflict. Or worse: the Vite proxy rewrites paths incorrectly, stripping the `/api/v1` prefix when it shouldn't, or preserving it when it should be stripped. In production, the proxy doesn't exist, and the app breaks because it was built to rely on dev-server path rewriting.

**Why it happens:**
Two independent CORS solutions exist and developers use both without understanding their interaction:
1. **FastAPI CORSMiddleware** — backend handles CORS headers directly
2. **Vite dev server proxy** — proxy bypasses CORS entirely by same-originating the request

Using both creates confusion. The Vite proxy's `rewrite` function can silently mangle paths. The `changeOrigin` flag adjusts the `Host` header but not the `Origin` header, leading to subtle issues.

**How to avoid:**
- Pick ONE approach and stick with it. For this project, use the **Vite proxy** because:
  - It eliminates CORS entirely in development (requests go from browser -> Vite -> FastAPI, all same-origin from the browser's perspective)
  - It mirrors the production setup where a reverse proxy (nginx) serves both frontend and API
  - It avoids exposing `*` CORS headers in development that hide production CORS problems
- Vite proxy config in `vite.config.ts`:
  ```typescript
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        // Do NOT rewrite — FastAPI routes already include /api/v1
      }
    }
  }
  ```
- In the API service layer, use relative URLs (`/api/v1/habits`) not absolute (`http://localhost:8000/api/v1/habits`). This way the same code works through the proxy in dev and through the reverse proxy in production.
- Still add `CORSMiddleware` to FastAPI as a fallback for Swagger UI access and any direct API testing, but restrict origins to `localhost:5173`, not `*`.

**Warning signs:**
- API calls fail with CORS errors in the browser console
- API calls work in Postman but fail in the browser
- Different behavior between `fetch('/api/v1/habits')` and `fetch('http://localhost:8000/api/v1/habits')`
- API calls work in dev but fail when deployed

**Phase to address:** Project Setup Phase — configure the Vite proxy and API service base URL before making the first API call.

---

### Pitfall 10: Recharts Re-render Performance on Dashboard Updates

**What goes wrong:**
The Analytics page renders attribute progression charts, calendar heatmaps, and capsule history using Recharts. Every time the user navigates to Analytics, all charts re-render from scratch. If the dashboard uses Recharts for the attribute bars or any real-time display, every habit check causes the entire chart to re-render because the parent component's state changed, even if the chart data didn't.

**Why it happens:**
Recharts components re-render when ANY parent prop changes, including object references that are recreated on each render cycle. Passing `data={[...transformedData]}` creates a new array reference every render. Passing inline `tickFormatter={(value) => ...}` creates a new function reference every render. Recharts doesn't deep-compare its props.

**How to avoid:**
- Wrap chart data with `useMemo`: `const chartData = useMemo(() => transformData(rawData), [rawData])`.
- Wrap formatter functions with `useCallback` or define them outside the component.
- Isolate charts into their own components and wrap with `React.memo` — if the chart's specific data slice hasn't changed, it won't re-render.
- For the attribute bars on the dashboard, do NOT use Recharts. Simple CSS progress bars with CSS transitions are 10x lighter and more performant for 4 horizontal bars.
- Reserve Recharts for the Analytics page where it renders once and stays static until data changes.
- For large datasets (90-day contribution graph), aggregate/sample data to reduce rendering points.

**Warning signs:**
- Navigating to Analytics page takes >500ms to render
- Charts visibly flicker or redraw when unrelated state changes
- Performance profiler shows Recharts components in the "slow renders" list
- Main thread blocking during chart rendering

**Phase to address:** Analytics Phase — set up chart components with proper memoization from the start. Use CSS for simple bars on the dashboard.

---

### Pitfall 11: Reward System Saturation — 25% Capsule Rate Feels Spammy by Week 3

**What goes wrong:**
The 25% capsule drop rate feels exciting on day 1. By week 3, Sergio has accumulated 15 unclaimed capsules in history. The popup interrupts habit checking every third check. The slot-machine thrill habituates. Research shows 40% of users exit gamified apps due to visual noise, and 35% abandon apps due to perceived clutter or irrelevance. Opening capsules becomes a chore rather than a delight.

**Why it happens:**
25% per habit check on 6 habits = statistically ~1.5 capsules per day. In a week, that's 10+ common rewards. Variable reward schedules require that the reward feels genuinely surprising, which habituates fast at consistent 25%. If gamification mechanics are too repetitive or predictable, users grow bored or fatigued. Studies show limiting gamified features to ~20% of the interface is optimal.

**How to avoid:**
- The 25% rate is correct for the PRD. Do NOT inflate it during testing.
- Implement a "pending capsule" notification badge rather than an immediate popup interrupt. The user opens capsules when they want to, not mid-habit-check flow.
- The capsule opening animation must be short (<2 seconds) and skippable.
- Reserve screen shake exclusively for 100% perfect day and transformation unlocks — never for individual habit checks.
- Vegeta roast triggers only at session start (opening the app after a missed day), never during an active habit-check session.
- The dashboard hierarchy must be clear: completion % is huge and primary; everything else is secondary, smaller, less prominent. ADHD cognitive overload from too many visible numbers (Power Level + 4 attributes + streak + completion % + XP earned) must be avoided.

**Warning signs:**
- Capsule history shows large unclaimed backlog
- The habit-check flow feels interrupted and annoying rather than exciting
- User wants to disable animations/popups

**Phase to address:** Reward System & Animation Phase — establish the UX pattern of "notification badge, open when ready" from the start.

---

### Pitfall 12: Streak Breaking at Midnight / Timezone Boundary

**What goes wrong:**
Sergio completes all habits at 11:58 PM. The backend records the completion with the server's local date. He opens the app at 12:02 AM — the frontend sends today's date (now the next calendar day). If the server is in UTC and the user is UTC-6, "today" on the server became the next day 6 hours ago. The streak incorrectly breaks.

**Why it happens:**
Streak logic using `date.today()` on the server computes the date in the server's timezone, not the user's. SQLite's `DATE` type stores dates as `YYYY-MM-DD` strings, which are timezone-naive. DST transitions creating 23-hour or 25-hour days further complicate naive date arithmetic.

**How to avoid:**
- All `log_date` values must be stored using the client's local date in `YYYY-MM-DD` format, sent explicitly in the API request body.
- The `POST /habits/{id}/check` request should include `local_date: "2026-03-04"`.
- Streak evaluation compares `last_active_date` to the client-provided `local_date`, never to `datetime.now()`.
- All date arithmetic uses Python's `datetime.date` subtraction (pure date objects, no time component).

**Warning signs:**
- Streaks break "when I'm sure I completed all my habits yesterday"
- Streak resets consistently happen around midnight or on DST transition dates
- `last_active_date` in the database shows UTC date, not local date

**Phase to address:** Already handled by v1.0 backend — verify the frontend sends `local_date` correctly when calling habit check endpoints.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Calculate XP in frontend Zustand store | Instant UI without waiting for API | XP drift, inconsistent transformation triggers, rollback complexity | Never — the backend must own all XP math |
| Use `(s) => s` Zustand selector (no selector) | Quick prototyping | Every state change re-renders that component and all children | Never in production components |
| Use `framer-motion` package instead of `motion` | Familiar import paths | Missing v11 React 19 improvements, eventual deprecation | Never for a new project |
| Create `tailwind.config.js` instead of CSS `@theme` | Familiar v3 patterns | Config partially ignored, dark mode and theme values don't work correctly | Never in v4 — use CSS-first config |
| Animate `backgroundColor` and `boxShadow` directly | Simpler code, fewer transform workarounds | Browser paint on every frame, jank on mid-range hardware | Never for high-frequency animations (aura bar) |
| One `AudioContext` per component | Simpler sound wiring | Exceeds browser limits (6 concurrent contexts), permission issues | Never |
| Skip `interrupt: true` on short sounds | Simpler sound setup | Audio soup during rapid habit checks | Never |
| Pre-populate all 10 transformation animations on load | No lazy-load delay during transformation unlock | Bundle size balloons; animations 8-10 never seen by week-1 users | Only if transformation unlock latency is perceptible |
| Use absolute URLs in API service (`http://localhost:8000/...`) | Works immediately | Breaks with Vite proxy, breaks in production, hardcodes dev URL | Never — always use relative `/api/v1/...` |
| Use `defaultProps` on function components | Familiar React 18 pattern | Silently ignored in React 19 | Never — use ES6 default parameters |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Motion (Framer Motion) + React 19 | Installing `framer-motion` package; using old import paths | Install `motion`; import from `motion/react` |
| use-sound + AudioContext | Calling `play()` before user gesture (app load, useEffect) | Call `play()` only inside click/tap handlers; implement `SoundProvider` that resume()s context on first interaction |
| use-sound + sprite playbackRate | Expecting `playbackRate` to be reactive when using sprites | `playbackRate` is NOT reactive with sprites — only initial value is used; use Howler directly for dynamic rate |
| use-sound + early access | Accessing `sound` object immediately after mount | `sound` is null for first few moments after mount — guard with null check before calling methods |
| Zustand + persist middleware | Assuming hydrated state is available on first render | Store loads defaults first, then overwrites with persisted state — causes UI flash; use `onRehydrateStorage` callback |
| Tailwind v4 + `@tailwind` directives | Using `@tailwind base; @tailwind components; @tailwind utilities;` | Use `@import "tailwindcss";` — single import replaces all three directives |
| Tailwind v4 + border utility | Expecting `border` to produce `gray-200` border | v4 defaults border color to `currentColor` — always specify: `border border-gray-200` |
| Tailwind v4 + ring utility | Expecting `ring` to produce 3px blue ring | v4 defaults ring to 1px `currentColor` — explicitly set `ring-2 ring-blue-500` |
| Vite proxy + FastAPI | Using both Vite proxy AND FastAPI CORSMiddleware with conflicting CORS headers | Pick one; prefer Vite proxy for dev, add restricted CORSMiddleware for Swagger |
| Recharts + parent re-renders | Passing inline functions and new array references as props | Memoize data with `useMemo`, functions with `useCallback`, wrap chart in `React.memo` |
| React 19 + `forwardRef` | Wrapping components in `forwardRef` unnecessarily | In React 19, `ref` is a regular prop — `forwardRef` wrapper is no longer needed |
| React 19 + test utils | Importing `act` from `react-dom/test-utils` | In React 19, import `act` from `react` directly |
| AnimatePresence + missing keys | Not setting unique `key` on animated overlays — exit animation doesn't fire | Every overlay (`PerfectDayAnimation`, `ShenronAnimation`) needs a unique key that changes when re-triggered |
| react-canvas-confetti + particle count | Using high particle counts for energy blast effects | Keep under 100 particles for 60fps; use `useWorker` option for off-main-thread rendering |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Animating all 6 habit cards simultaneously on load | Dashboard load causes visible card stagger lag | Stagger with `delay: index * 0.05` for sequential card entry | Immediately visible with 6+ habits |
| `motion.div` on every habit card list item | React DevTools shows 6x motion wrappers re-rendering on any state change | Only animate the specific property that changes (checkbox state); use CSS for static card layout | Noticeable on slower hardware |
| Howler.js loading all audio files at startup | First paint delayed 1-2 seconds while audio buffers load | Lazy-load audio files; only preload the most frequent sound (habit-check beep) | At page load, especially on slower connections |
| Recharts rendering all charts on Analytics page at once | Analytics page takes 500ms+ to render; visible layout shift | Lazy-load charts below the fold; use `React.memo` on each chart component | With 4+ charts on one page |
| Zustand store re-rendering entire dashboard | Every habit check causes all dashboard components to re-render | Use fine-grained selectors and `useShallow` for multi-value selections | Immediately, as component tree grows |
| Confetti/particle effects on every habit check | Frame drops, battery drain on longer sessions | Reserve particles for 100% and transformations only; cap at 80 particles | On mobile and mid-range devices |
| Large sound files in assets | Bundle size grows; initial load slowed | Compress to OGG/MP3 at 64-96kbps; sounds are <3 seconds, don't need high bitrate | At build time if assets exceed 2MB total |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Animation plays then locks UI during it | ADHD users cannot check the next habit until previous animation finishes; frustration | Animations must be non-blocking; the aura fill plays while the next habit is already checkable |
| Screen shake on every habit check (not just 100%) | Overstimulation by habit 3; screen shake becomes noise, not reward | Reserve screen shake exclusively for 100% perfect day and transformation unlocks |
| Vegeta roast appears mid-session | User is actively trying to complete habits; a roast interrupts flow and feels punishing | Vegeta roast triggers only at session start when previous day was missed, never during an active session |
| No visual distinction between "completed this session" and "completed earlier today" | User cannot tell if an undo/recheck is happening | Completed habits show time on hover; recently completed habits have a brief highlight that fades |
| Sound volume not calibrated across events | Habit beep is quiet; explosion is deafening | All sounds normalized to same peak volume; drama comes from animation, not decibels |
| Too many visible numbers simultaneously | ADHD cognitive overload; decision paralysis | Completion % is huge and primary; everything else is secondary, smaller, less prominent |
| Capsule popup interrupts habit check flow | User is in "check habits" mode; popup demanding interaction breaks flow | Queue capsule notification, show badge; user opens capsule drawer intentionally |
| Rewards are too predictable after 2 weeks | Variable reward circuit fails when user can predict outcomes | Vary capsule opening animations slightly each time; occasional "double drop" surprise |

---

## "Looks Done But Isn't" Checklist

- [ ] **Tailwind v4 theme:** Custom colors (`#050510`, `#FF6B00`, `#1E90FF`) are defined via `@theme` in CSS, not `tailwind.config.js` — verify colors render correctly in both dark and light mode
- [ ] **React 19 compatibility:** All third-party libraries (`motion`, `zustand`, `recharts`, `use-sound`) verified to support React 19 peerDependencies — check npm for each
- [ ] **Motion package:** `package.json` shows `motion` (not `framer-motion`) as dependency; imports use `motion/react`
- [ ] **Zustand selectors:** No component uses `useStore()` without a selector — search codebase for bare store hook calls
- [ ] **Audio on cold load:** Open a new browser tab, do NOT click anything before checking a habit — verify the sound plays (SoundProvider resume pattern works)
- [ ] **Rapid habit checks:** Check all 6 habits within 5 seconds — verify no audio stacking/soup, no jank in aura bar fill
- [ ] **Perfect day sequence:** Trigger 100% completion — verify the full sequence (darken -> explosion -> XP counter -> Dragon Ball -> quote) plays in order without overlap
- [ ] **XP display consistency:** Displayed power level after page refresh matches displayed power level before refresh (no drift)
- [ ] **Vite proxy:** API calls use relative URLs (`/api/v1/habits`), not absolute URLs — verify calls work through proxy
- [ ] **Transformation unlock:** Cross an XP threshold — verify transformation animation fires exactly once even if the user rapidly checks habits at the boundary
- [ ] **Dragon Ball 7th collection:** Collect 7th Dragon Ball — verify Shenron animation fires and `dragon_balls_collected` resets to 0 in the database (not just UI)
- [ ] **Capsule at 0 rewards:** Open the app with capsule reward list empty — verify habit check doesn't crash when capsule drop triggers but no rewards exist
- [ ] **Border/ring defaults:** All borders and rings have explicit color/width classes — no reliance on v3 defaults

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| XP drift discovered after weeks of use | HIGH | Audit `daily_logs.xp_earned` vs expected formula output per day; recalculate; UPDATE database; clear Zustand persistence |
| Wrong Tailwind config paradigm (JS instead of CSS) | MEDIUM | Run `npx @tailwindcss/upgrade`; migrate all custom values to `@theme`; takes 2-4 hours for full project |
| Wrong Motion package installed | LOW | `npm uninstall framer-motion && npm install motion`; find/replace imports from `framer-motion` to `motion/react`; 30 minutes |
| Audio architecture missing interrupt/priority | MEDIUM | Add `SoundManager` singleton with queue; replace all direct `play()` calls; 1-2 days |
| Animation jank discovered in production | MEDIUM | Profile with DevTools; convert worst offenders from `motion.div` to CSS transitions; 1-2 days per component |
| Zustand re-render storm | MEDIUM | Add selectors to all store consumers; wrap multi-value selections in `useShallow`; 1 day for full codebase |
| Capsule popup UX is too intrusive | LOW | Change popup to badge notification; UI-only, no backend work |
| React 19 library incompatibility discovered | MEDIUM-HIGH | Depends on the library; may need alternative, may need to pin older React version; varies |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Wrong Motion package | Project Setup | `package.json` shows `motion`, imports use `motion/react` |
| Tailwind v4 config paradigm | Project Setup | No `tailwind.config.js` exists; custom colors defined in CSS `@theme` |
| React 19 incompatibilities | Project Setup | All libraries installed; `npm ls` shows no peer dependency warnings |
| CORS / Vite proxy | Project Setup | First API call succeeds through proxy; no CORS errors in console |
| Zustand store structure | State Management | 4 stores defined; no component uses bare `useStore()` without selector |
| XP calculation authority | State Management | `powerStore` sets values from API only; no local XP math in frontend |
| Audio autoplay restriction | Audio Foundation | First-load test in new tab; first habit check plays audio |
| Overlapping sounds | Audio Foundation | Rapid-check test: 6 habits in 5 seconds; audio is clean |
| Animation avalanche (jank) | Animation & Feedback | Chrome DevTools frame budget during perfect-day sequence; all frames <16ms |
| Reward saturation UX | Reward & Gamification | Capsule drop shows badge, not blocking popup; skippable open animation |
| Recharts performance | Analytics | Charts wrapped in `React.memo`; memoized data/functions; dashboard uses CSS bars not Recharts |
| Transformation fires twice | Animation & Feedback | Rapid habit check at XP boundary; animation fires exactly once |
| UI blocks during animation | Animation & Feedback | Habit checkbox is interactive during all animations including perfect-day |
| Streak timezone | State Management | Frontend sends `local_date` in habit check requests |

---

## Sources

- [Motion.dev Upgrade Guide (Framer Motion -> Motion)](https://motion.dev/docs/react-upgrade-guide) — HIGH confidence
- [Motion.dev Layout Animations](https://motion.dev/docs/react-layout-animations) — HIGH confidence
- [MDN Autoplay Guide](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay) — HIGH confidence
- [MDN getAutoplayPolicy()](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/getAutoplayPolicy) — HIGH confidence
- [Chrome Autoplay Policy for Web Audio](https://developer.chrome.com/blog/web-audio-autoplay) — HIGH confidence
- [use-sound GitHub](https://github.com/joshwcomeau/use-sound) — HIGH confidence (interrupt option, sprite limitations, null sound documented)
- [Zustand GitHub Discussions: Selectors v5](https://github.com/pmndrs/zustand/discussions/2867) — MEDIUM confidence
- [React 19 Upgrade Guide (official)](https://react.dev/blog/2024/04/25/react-19-upgrade-guide) — HIGH confidence
- [React 19 Release Notes](https://react.dev/blog/2024/12/05/react-19) — HIGH confidence
- [Tailwind CSS v4 Upgrade Guide (official)](https://tailwindcss.com/docs/upgrade-guide) — HIGH confidence
- [Recharts Performance Guide (official)](https://recharts.github.io/en-US/guide/performance/) — HIGH confidence
- [Vite Server Proxy Options (official)](https://vite.dev/config/server-options) — HIGH confidence
- [Gamification UX Anti-Patterns — ALMAX Agency](https://almaxagency.com/gamification-in-ux-ui/gamification-in-ui-ux-a-comprehensive-guide-to-when-it-works-when-to-avoid-it-and-alternative-engagement-strategies/) — MEDIUM confidence

---
*Pitfalls research for: Gamified habit tracker (Saiyan Tracker v3 — The Dopamine Edition)*
*Researched: 2026-03-04*
