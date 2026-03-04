# Stack Research

**Domain:** Frontend for DBZ-themed habit tracker (dopamine-heavy animations, audio, charts)
**Researched:** 2026-03-04
**Confidence:** HIGH

**Scope:** Frontend stack ONLY. Backend (Python 3.14 + FastAPI + SQLAlchemy 2.0 + SQLite) is built and validated with 222 tests. Do not re-research backend.

---

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| React | 19.2.x (19.2.4) | UI framework | Latest stable. Concurrent rendering handles animation-heavy UIs without jank. `useTransition` for non-blocking animation triggers during habit checks. |
| Vite | 7.3.x | Build tool + dev server | Rolldown-based Rust bundler = sub-second HMR. First-party Tailwind v4 plugin. **Requires Node 20.19+** (dropped Node 18). |
| TypeScript | 5.7.x | Type safety | Strict mode. Type the complex `check_habit` API response (capsule_drop, new_transformation, completion_tier, dragon_balls). Prevents runtime bugs in game logic display. |
| Zustand | 5.0.x (5.0.11) | State management | 1.1kb, zero boilerplate. `useSyncExternalStore` for React 19 compatibility. Subscriptions prevent re-renders during rapid habit checks. 4 stores map to domain objects. |
| Motion | 12.x (12.34.5) | Animations | **Renamed from framer-motion.** Install `motion`, import from `motion/react`. Screen shake, aura pulse, transformation sequences, layout animations. 18M+ monthly npm downloads. |
| Tailwind CSS | 4.2.x (4.2.0) | Styling | CSS-first config via `@theme` directive -- **no tailwind.config.js**. Use `@tailwindcss/vite` plugin. 5x faster builds, 100x faster incremental. Custom properties for dark/light theme switching at runtime. |
| React Router | 7.13.x | Routing | 3 routes (Dashboard, Analytics, Settings). v7 supports React 19 transitions. Simple client-side routing, no SSR needed. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@tanstack/react-query` | 5.90.x | Server state / API caching | Every API call. Caches habit lists, power levels, analytics. `invalidateQueries` after `check_habit` refreshes all dashboard data. Stale-while-revalidate = instant UI. Mutations with optimistic updates for snappy habit checks. |
| `use-sound` | 5.0.0 | Sound effects hook | Every interaction: scouter beep, ki charge, capsule pop, tier change, explosions. Wraps Howler.js with lazy-loading (1kb bundle + 9kb async). Simple `const [play] = useSound(url)` API. |
| `howler` | 2.2.4 | Audio engine (peer dep of use-sound) | Loaded by use-sound. Also use directly for overlapping sounds during Perfect Day explosion (multiple simultaneous streams), looping ki-charge hum with `fade()` and `stop()` control. |
| `@types/howler` | 2.2.x | Howler TypeScript types | Dev dependency. Required when accessing Howler instances via use-sound's `sound` return value. |
| `recharts` | 3.7.x (3.7.0) | Charts | Attribute progression line charts (STR/VIT/INT/KI over time), weekly XP bar charts, category breakdowns. Declarative React components, SVG-based. Best for <10k data points (our use case). |
| `canvas-confetti` | 1.9.x | Particle effects | Perfect Day explosions, transformation unlocks, Dragon Ball earned bursts. Custom energy-blast shapes via `shapeFromPath()`. Use directly -- NOT `react-canvas-confetti` (unmaintained, last update 2+ years ago). |
| `sonner` | latest | Toast notifications | Lightweight (2-3kb). XP award popups, capsule drop alerts, streak milestones, system messages. Custom styled for DBZ theme. Smaller and better styled than react-hot-toast. |
| `clsx` | 2.x | Conditional classnames | Tailwind conditional classes for dynamic styling (active habits, tier colors, transformation auras). Tiny, zero overhead. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| `@tailwindcss/vite` | Tailwind v4 Vite integration | Add to `vite.config.ts` plugins. Replaces PostCSS from v3. Auto content detection. |
| `@vitejs/plugin-react` | React Fast Refresh in Vite | Standard React plugin for Vite. |
| `eslint` 9.x | Linting | Flat config (`eslint.config.js`). React hooks + TypeScript rules. |
| `prettier` + `prettier-plugin-tailwindcss` | Formatting | Auto-sorts Tailwind classes for consistency. |
| `vitest` | Frontend unit tests | Same config as Vite. Test XP display formatting, transformation threshold logic, store behavior. |
| Vite dev proxy | API proxy to FastAPI backend | `server.proxy: { '/api': 'http://localhost:8000' }` avoids CORS during development. |

---

## Installation

```bash
# Core framework
npm install react react-dom react-router

# State & data fetching
npm install zustand @tanstack/react-query

# Animation & effects
npm install motion canvas-confetti

# Audio
npm install use-sound howler

# Charts
npm install recharts

# UI utilities
npm install sonner clsx

# Styling (Tailwind v4 -- CSS-first, no config file)
npm install tailwindcss @tailwindcss/vite

# Dev dependencies
npm install -D typescript @types/react @types/react-dom @types/howler
npm install -D @vitejs/plugin-react
npm install -D eslint prettier prettier-plugin-tailwindcss
npm install -D vitest
```

---

## Critical Setup Details

### Tailwind CSS v4 (Different from v3 -- Do NOT Create tailwind.config.js)

Tailwind v4 is CSS-first. No JavaScript config file. All configuration in CSS:

```css
/* src/index.css */
@import "tailwindcss";

@theme {
  /* DBZ color palette */
  --color-space-black: #050510;
  --color-card-dark: #0D0D1A;
  --color-goku-orange: #FF6B00;
  --color-vegeta-blue: #1E90FF;
  --color-ssj-gold: #FFD700;
  --color-ssg-red: #DC143C;
  --color-ui-silver: #C0C0C0;
  --color-ue-purple: #8B00FF;
  --color-beast-orange: #FF4500;

  /* Calendar heatmap colors */
  --color-perfect-gold: #FFD700;
  --color-good-blue: #3B82F6;
  --color-mid-red: #EF4444;
  --color-miss-gray: #374151;
  --color-offday-blue: #60A5FA;
}
```

In `vite.config.ts`:
```typescript
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: { "/api": "http://localhost:8000" }
  }
});
```

### Motion (Renamed from Framer Motion)

The package was renamed. Use the new import path:

```typescript
// CORRECT (2026)
import { motion, AnimatePresence } from "motion/react";

// WRONG (legacy -- will stop receiving updates)
// import { motion } from "framer-motion";
```

Install `motion`, NOT `framer-motion`.

### Audio Architecture

**Simple interactions:** use-sound hook per component.
```typescript
const [playBeep] = useSound("/sounds/scouter-beep.mp3", { volume: 0.5 });
```

**Perfect Day explosion (overlapping audio):** Multiple simultaneous sounds.
```typescript
const [playExplosion] = useSound("/sounds/explosion.mp3");
const [playScream] = useSound("/sounds/power-up-scream.mp3");
// Fire both -- Howler handles simultaneous playback
playExplosion();
playScream();
```

**Looping ki-charge hum:** Access Howler directly for `fade()` and `stop()`.
```typescript
const [playCharge, { sound: chargeHowl }] = useSound("/sounds/ki-charge.mp3", { loop: true });
// Start charging
playCharge();
// On 100%: fade out and stop
chargeHowl?.fade(1, 0, 500);
setTimeout(() => chargeHowl?.stop(), 500);
```

**Sound files:** Keep all clips under 3 seconds. MP3 format (universal browser support). Store in `public/sounds/` for direct URL access without bundling.

### Canvas-Confetti for Energy Effects

Use `canvas-confetti` directly (not the React wrapper):

```typescript
import confetti from "canvas-confetti";

// Energy blast particles with custom SVG shape
const energyShape = confetti.shapeFromPath({
  path: "M0 0 L5 -10 L10 0 L5 -3 Z"
});

// Perfect Day explosion
confetti({
  particleCount: 150,
  spread: 360,
  origin: { y: 0.5 },
  shapes: [energyShape],
  colors: ["#FFD700", "#FF6B00", "#FF4500"],
  gravity: 0.3,
  ticks: 100,
});

// Dragon Ball earned (focused upward burst)
confetti({
  particleCount: 50,
  angle: 90,
  spread: 45,
  origin: { y: 0.8 },
  colors: ["#FFD700", "#FF8C00"],
  gravity: 0.8,
});
```

### State Architecture: TanStack Query + Zustand Split

**TanStack Query** owns ALL server state (data from API). **Zustand** owns ONLY client-side UI state. Never duplicate server state in Zustand.

```
TanStack Query (server state):
  - habits list, today's habits, calendar data
  - power level, transformation, attributes
  - rewards, wishes, capsule history
  - analytics summaries
  - quotes

Zustand uiStore (client-only state):
  - activeModal (which modal is open)
  - pendingAnimations queue (perfectDay, tierChange, transformation, capsuleDrop, shenron)
  - soundEnabled (persisted to backend but cached locally)
  - theme (dark/light)
```

**Mutation flow for habit check:**
```typescript
// In habitStore or a custom hook
const checkMutation = useMutation({
  mutationFn: (habitId: string) => api.habits.check(habitId),
  onSuccess: (response) => {
    // Invalidate all affected queries
    queryClient.invalidateQueries({ queryKey: ["habits", "today"] });
    queryClient.invalidateQueries({ queryKey: ["power"] });

    // Queue animations based on response
    if (response.capsule_drop?.dropped) {
      uiStore.queueAnimation("capsuleDrop", response.capsule_drop);
    }
    if (response.is_perfect_day) {
      uiStore.queueAnimation("perfectDay", response);
    }
    if (response.new_transformation) {
      uiStore.queueAnimation("transformation", response.new_transformation);
    }
  }
});
```

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Motion 12 | React Spring | Physics-based springs for drag/throw; Motion wins for declarative variant sequences (Perfect Day = 8-step choreography) |
| Motion 12 | GSAP | Complex timeline sequences; adds 25kb and different paradigm; Motion handles all our animation needs |
| Zustand 5 | Jotai | Atom-based state; overkill here -- 4 stores map cleanly to API domains |
| Zustand 5 | Redux Toolkit | Massive boilerplate for single-user app with 4 stores; RTK justified at team scale only |
| Recharts 3 | Nivo | Canvas rendering for 100k+ data points; Recharts simpler for our 4 chart types; Nivo has poor docs |
| Recharts 3 | Victory | React Native cross-platform; we don't need it |
| use-sound | Howler directly | Fine-grained audio everywhere; use-sound's hook API cleaner for React; access Howler when needed via `sound` return |
| canvas-confetti | tsparticles | Persistent particle systems (backgrounds); canvas-confetti better for one-shot bursts; tsparticles is 50kb+ |
| Sonner | react-hot-toast | Headless toasts; Sonner better default styling, smaller (2-3kb vs 5kb) |
| @tanstack/react-query | SWR | Simpler API; TanStack has better mutation/invalidation for check_habit flow |
| React Router 7 | TanStack Router | Type-safe routes; 3 pages don't justify learning curve |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `framer-motion` (package name) | Renamed to `motion`. Old package will stop receiving updates. | `motion` package, import from `motion/react` |
| `react-canvas-confetti` | Unmaintained (last update 2+ years ago). Wrapper adds nothing. | `canvas-confetti` directly with imperative calls |
| `tailwind.config.js` | Tailwind v4 uses CSS-first config. JS config is legacy v3 pattern. | `@theme` directive in CSS file |
| `@tsparticles/react` | Last published 2+ years ago. 50kb+ bundle. Overkill for one-shot bursts. | `canvas-confetti` for burst effects. Add tsParticles later ONLY if ambient looping particles needed |
| Redux / Redux Toolkit | Massive boilerplate for a single-user app. | Zustand 5 |
| Axios | `fetch` is built into browsers. Axios adds 13kb for no benefit here. | Native `fetch` in a thin API client + TanStack Query |
| CSS Modules / Styled Components | Tailwind v4 handles everything including dark mode via CSS custom properties. | Tailwind CSS v4 |
| `react-player` / heavy audio libs | We play short sound effects, not music or video. | `use-sound` (1kb + 9kb async Howler) |
| Chart.js / react-chartjs-2 | Canvas-based, imperative API. Recharts is more idiomatic React. | Recharts |
| Next.js | SSR adds complexity with zero benefit for single-user local app. No SEO needed. | Vite + React SPA |
| Duplicating server state in Zustand | Creates sync bugs. Two sources of truth. | TanStack Query for server state, Zustand for UI-only state |

---

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| react@19.2.x | zustand@5.0.x | Confirmed. Zustand 5 has React 19 peer dep. |
| react@19.2.x | motion@12.x | Confirmed. Motion 12 supports React 19. |
| react@19.2.x | recharts@3.7.x | Compatible. May need `react-is` override during install. Add to package.json `overrides` if peer dep warning. |
| react@19.2.x | use-sound@5.0.0 | **LOW confidence.** Last published Feb 2025. May need `--legacy-peer-deps`. See fallback plan below. |
| react@19.2.x | react-router@7.13.x | Confirmed. React Router 7 targets React 19. |
| react@19.2.x | @tanstack/react-query@5.90.x | Confirmed. Actively maintained for React 19. |
| vite@7.3.x | @tailwindcss/vite@4.2.x | Confirmed. First-party integration. |
| vite@7.3.x | @vitejs/plugin-react | Confirmed. Official plugin. |
| **Node.js** | **20.19+ required** | Vite 7 dropped Node 18. Verify before starting. |

---

## Fallback Plan: use-sound React 19 Issues

If `use-sound@5.0.0` has peer dependency conflicts with React 19 (LOW confidence risk), write a custom hook wrapping Howler directly (~15 lines):

```typescript
import { Howl } from "howler";
import { useCallback, useEffect, useRef } from "react";

export function useSound(src: string, options?: { volume?: number; loop?: boolean }) {
  const soundRef = useRef<Howl | null>(null);

  useEffect(() => {
    soundRef.current = new Howl({
      src: [src],
      volume: options?.volume ?? 1,
      loop: options?.loop ?? false,
    });
    return () => { soundRef.current?.unload(); };
  }, [src, options?.volume, options?.loop]);

  const play = useCallback(() => soundRef.current?.play(), []);
  const stop = useCallback(() => soundRef.current?.stop(), []);

  return [play, { sound: soundRef.current, stop }] as const;
}
```

This replaces the dependency entirely. Consider this if `npm install use-sound` fails or produces React version warnings.

---

## Animation Choreography Pattern

The Perfect Day explosion is an 8-step sequence. Use Motion's `AnimatePresence` + `variants` + `onAnimationComplete` to chain steps. **Do NOT use setTimeout chains** -- they drift and cannot be interrupted.

```typescript
// Step sequence managed by state machine, not timeouts
const PERFECT_DAY_STEPS = [
  "blackout",           // 100ms dark overlay
  "aura_explosion",     // screen shake + aura burst
  "audio_scream",       // power-up audio trigger
  "banner",             // "100% COMPLETE" title card
  "xp_counter",         // animated XP multiplier reveal
  "dragon_ball",        // Dragon Ball earned animation
  "quote",              // Goku celebration quote
  "wind_down"           // 2-3s fade back to dashboard
] as const;
```

Each step triggers the next via `onAnimationComplete`. Motion handles spring timing naturally.

---

## API Client Pattern

Use native `fetch` in a thin typed wrapper. TanStack Query handles caching, retries, background refetching:

```typescript
// services/api.ts
const BASE = "/api/v1";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const api = {
  habits: {
    today: () => request<TodayHabitsResponse>("/habits/today/list"),
    check: (id: string) => request<CheckHabitResponse>(`/habits/${id}/check`, { method: "POST" }),
    calendar: (id: string, month?: string) => request<CalendarResponse>(`/habits/${id}/calendar`),
  },
  power: {
    current: () => request<PowerResponse>("/power/current"),
  },
  analytics: {
    summary: (period: string) => request<AnalyticsResponse>(`/analytics/summary?period=${period}`),
  },
  settings: {
    get: () => request<SettingsResponse>("/settings/"),
    update: (data: SettingsUpdate) => request<SettingsResponse>("/settings/", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  },
};
```

---

## Sources

- [React 19.2 blog](https://react.dev/blog/2025/10/01/react-19-2) -- v19.2.4 stable confirmed -- HIGH
- [Vite 7.0 announcement](https://vite.dev/blog/announcing-vite7) -- Rolldown, Node 20.19+ -- HIGH
- [Vite 7 releases](https://github.com/vitejs/vite/releases) -- v7.3.1 current -- HIGH
- [Motion docs](https://motion.dev/docs/react) -- renamed from framer-motion, import path -- HIGH
- [Motion npm](https://www.npmjs.com/package/framer-motion) -- v12.34.5 -- HIGH
- [Tailwind CSS v4 docs](https://tailwindcss.com/docs) -- @tailwindcss/vite, @theme directive, v4.2.0 -- HIGH
- [Zustand GitHub](https://github.com/pmndrs/zustand) -- v5.0.11, React 19 compatible -- HIGH
- [Recharts npm](https://www.npmjs.com/package/recharts) -- v3.7.0, react-is override note -- MEDIUM
- [Recharts React 19 issue](https://github.com/recharts/recharts/issues/4558) -- peer dep workaround -- MEDIUM
- [use-sound GitHub](https://github.com/joshwcomeau/use-sound) -- v5.0.0, last update Feb 2025 -- LOW (maintenance risk)
- [Howler.js npm](https://www.npmjs.com/package/howler) -- v2.2.4 stable -- HIGH
- [TanStack Query docs](https://tanstack.com/query/latest) -- v5.90.x, React 19 -- HIGH
- [React Router npm](https://www.npmjs.com/package/react-router) -- v7.13.1 -- HIGH
- [canvas-confetti GitHub](https://github.com/catdad/canvas-confetti) -- custom shapes via shapeFromPath, v1.9.4 -- HIGH
- [Sonner comparison](https://www.oreateai.com/blog/sonner-vs-toast-a-deep-dive-into-react-notification-libraries/) -- 2-3kb, better than react-hot-toast -- MEDIUM

---

*Stack research for: Saiyan Tracker v3 frontend -- The Dopamine Layer*
*Researched: 2026-03-04*
