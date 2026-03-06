# Phase 4: Project Setup & Foundation - Research

**Researched:** 2026-03-05
**Domain:** React 19 SPA scaffold with typed API client, Zustand stores, dark theme, routing
**Confidence:** HIGH

## Summary

This phase scaffolds a greenfield React 19 + Vite 7 + TypeScript SPA with Tailwind CSS v4 styling, a typed API client using ky, four Zustand stores, dark DBZ theme via CSS custom properties, and three-page routing. The frontend directory does not exist yet -- everything is built from scratch.

The stack is well-established and all libraries have stable, production-ready releases: React 19.x, Vite 7.x with the `@tailwindcss/vite` plugin (no PostCSS needed), Zustand 5.x with `useShallow` for selector discipline, ky 1.14.x as the HTTP client, and React Router 7.x for SPA routing. All backend schemas have been read and documented -- the TypeScript types can be written 1:1 from Pydantic models.

**Primary recommendation:** Use `@tailwindcss/vite` plugin (not PostCSS), define all color tokens in `@theme` CSS custom properties, create a single `ky.extend()` instance with base URL and error hooks, and enforce `useShallow` for any multi-value Zustand selector.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions
- Deep space black background (#0a0a0f range) -- high contrast, outer space feel
- Orange primary accent (Goku gi), blue secondary accent (SSGSS aura)
- Subtle glow effects on key interactive elements only (cards, buttons, progress bars) -- not every element
- CSS custom properties via Tailwind v4 `@theme` config for all color tokens
- Dark theme only for Phase 4 -- light mode deferred to Phase 8
- Build the custom property system so light theme CAN be added later without refactor
- Top-level hydration on app mount via useInitApp() hook -- single loading state, single error boundary
- Optimistic UI for habit checks: toggle immediately in store, rollback on API error, show error toast
- Animations from real API response only (not from optimistic state)
- uiStore includes animation queue skeleton (types + enqueue/dequeue) even though Phase 7 uses it -- prevents later refactor
- Bottom tab bar navigation with 3 tabs: Dashboard, Analytics, Settings
- DBZ-themed tab icons: Scouter (Dashboard), Dragon Radar (Analytics), Capsule Corp logo (Settings)
- No persistent top header -- maximize vertical content area
- Power level and transformation display live within Dashboard page content, not in a header
- Full-screen themed loading state on first mount (centered logo or energy ball spinner) while stores hydrate
- ky as HTTP client (~3kb, modern fetch wrapper with retry and hooks)
- Direct Zustand store calls for data fetching -- no TanStack Query, stores ARE the cache
- Toast notifications for API/network errors -- non-blocking, auto-dismiss after 3-5s
- Manual TypeScript types in types/index.ts matching backend Pydantic schemas
- Backend base URL configurable (localhost:8000 default)

### Claude's Discretion
- Check response flow pattern (how habitStore distributes API response to other stores)
- Exact color hex values within the deep-space-black + orange/blue palette
- Store slice boundaries and internal structure
- Animation queue skeleton shape

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| STATE-01 | App renders a React 19 SPA with Vite 7, TypeScript, and Tailwind CSS v4 | Vite 7 scaffold with `@tailwindcss/vite` plugin, React 19, TS strict mode -- see Standard Stack and Architecture Patterns |
| STATE-02 | TypeScript types match all backend API response schemas | All 11 backend schema files read and documented -- see Code Examples for complete type map from Pydantic to TS |
| STATE-03 | API client layer connects to all 9 backend endpoints with typed request/response | ky 1.14.x with `ky.extend()` instance, typed generics on `.json<T>()` -- see Architecture Patterns (API Client) |
| STATE-04 | Zustand stores (habit, power, reward, ui) hold all client state with selector discipline | Zustand 5.x with `useShallow` from `zustand/react/shallow`, store-based fetching pattern -- see Architecture Patterns (Stores) |
| STATE-05 | Dark theme applied by default with CSS custom properties for all colors | Tailwind v4 `@theme` directive for color tokens, dark-only with future light-mode extensibility -- see Architecture Patterns (Theme) |
| STATE-06 | Page routing between Dashboard, Analytics, and Settings views | React Router 7.x with unified `react-router` package, bottom tab bar layout -- see Architecture Patterns (Routing) |

</phase_requirements>

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react | 19.x | UI framework | Current stable, used by Vite template |
| react-dom | 19.x | DOM renderer | Paired with React 19 |
| vite | 7.x | Build tool + dev server | Official React recommendation post-CRA deprecation, sub-300ms HMR |
| typescript | 5.7+ | Type safety | Strict mode for catching schema mismatches |
| tailwindcss | 4.x | Utility CSS | CSS-first config via `@theme`, generates utilities from CSS custom properties |
| @tailwindcss/vite | 4.x | Vite integration | Direct Vite plugin, faster than PostCSS route, no autoprefixer needed |
| zustand | 5.0.x | State management | ~1kb, no providers, selector-based renders, `useShallow` built-in |
| ky | 1.14.x | HTTP client | ~3kb fetch wrapper, retry, hooks, typed `.json<T>()` |
| react-router | 7.13.x | SPA routing | Unified package (replaces react-router-dom), React 19 compatible |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-hot-toast | 2.x | Toast notifications | API error display, non-blocking auto-dismiss |
| lucide-react | latest | Icon library | Tab bar icons, UI icons (supplement custom DBZ SVGs) |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| ky | axios | axios is 11kb+ with node polyfills, ky is 3kb pure fetch |
| react-router | TanStack Router | TanStack Router is more complex, overkill for 3 static routes |
| react-hot-toast | sonner | sonner is newer but react-hot-toast is proven, lighter, simpler API |

**Installation:**
```bash
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install zustand ky react-router react-hot-toast lucide-react
npm install -D @tailwindcss/vite tailwindcss
```

## Architecture Patterns

### Recommended Project Structure

```
frontend/src/
├── main.tsx                # ReactDOM.createRoot, router mount
├── App.tsx                 # Router + layout (bottom tabs)
├── index.css               # @import "tailwindcss"; @theme { ... }
├── types/
│   └── index.ts            # All TS types matching backend schemas
├── services/
│   └── api.ts              # ky instance + typed endpoint functions
├── store/
│   ├── habitStore.ts       # Habits, today list, check/uncheck, calendar
│   ├── powerStore.ts       # Power level, transformation, attributes, dragon balls
│   ├── rewardStore.ts      # Capsule rewards CRUD, wishes CRUD
│   └── uiStore.ts          # Modals, toasts, animation queue skeleton
├── hooks/
│   └── useInitApp.ts       # Top-level hydration: loads habits, power, settings
├── pages/
│   ├── Dashboard.tsx        # Placeholder with layout
│   ├── Analytics.tsx        # Placeholder with layout
│   └── Settings.tsx         # Placeholder with layout
├── components/
│   ├── layout/
│   │   ├── BottomTabBar.tsx # 3-tab navigation
│   │   └── AppShell.tsx     # Outlet + tab bar + loading state
│   └── common/
│       └── LoadingScreen.tsx # Full-screen branded loading
└── assets/                  # SVG icons for tab bar (scouter, radar, capsule)
```

### Pattern 1: Tailwind v4 Dark Theme with `@theme`

**What:** Define all color tokens as CSS custom properties inside `@theme` so Tailwind generates utility classes automatically. Dark-only for now, but structured for future light mode.

**When to use:** Every color reference in the app.

**Example:**
```css
/* index.css */
@import "tailwindcss";

@theme {
  /* Background layers */
  --color-space-900: #0a0a0f;
  --color-space-800: #0d0d1a;
  --color-space-700: #141428;
  --color-space-600: #1a1a35;

  /* Accent: Orange (Goku gi) */
  --color-saiyan-500: #ff6b00;
  --color-saiyan-400: #ff8533;
  --color-saiyan-600: #cc5500;

  /* Accent: Blue (SSGSS aura) */
  --color-aura-500: #1e90ff;
  --color-aura-400: #4da6ff;
  --color-aura-600: #0070dd;

  /* Text */
  --color-text-primary: #e8e8f0;
  --color-text-secondary: #9898b0;
  --color-text-muted: #5a5a78;

  /* Semantic */
  --color-success: #22c55e;
  --color-danger: #ef4444;
  --color-warning: #f59e0b;

  /* Glow effects */
  --color-glow-orange: oklch(0.7 0.2 50 / 0.3);
  --color-glow-blue: oklch(0.6 0.2 250 / 0.3);
}
```

This generates utilities like `bg-space-900`, `text-saiyan-500`, `border-aura-500` etc. To add light mode later, wrap an alternative set in `@media (prefers-color-scheme: light)` or use `@custom-variant`.

### Pattern 2: ky API Client Instance

**What:** Single ky instance with base URL, error hooks, and typed endpoint functions.

**When to use:** All backend communication.

**Example:**
```typescript
// services/api.ts
import ky from 'ky';
import type {
  HabitResponse, HabitTodayResponse, HabitCreate, HabitUpdate,
  CheckHabitRequest, CheckHabitResponse,
  PowerResponse, AttributeDetail,
  CategoryResponse, CategoryCreate, CategoryUpdate,
  RewardResponse, RewardCreate, RewardUpdate,
  WishResponse, WishCreate, WishUpdate, WishGrantRequest, WishGrantResponse,
  OffDayResponse, OffDayCreate, OffDayMarkResponse,
  QuoteResponse,
  SettingsResponse, SettingsUpdate,
  AnalyticsSummary, CapsuleHistoryItem, WishHistoryItem,
  CalendarDay, ContributionDay,
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8000/api/v1';

export const api = ky.extend({
  prefixUrl: API_BASE,
  retry: { limit: 2, methods: ['get'] },
  hooks: {
    afterResponse: [
      async (_request, _options, response) => {
        if (!response.ok) {
          // Will be caught by store error handlers
          const body = await response.json().catch(() => ({}));
          throw new Error((body as any).detail ?? `HTTP ${response.status}`);
        }
      },
    ],
  },
});

// Habits
export const habitsApi = {
  list: () => api.get('habits/').json<HabitResponse[]>(),
  create: (data: HabitCreate) => api.post('habits/', { json: data }).json<HabitResponse>(),
  get: (id: string) => api.get(`habits/${id}`).json<HabitResponse>(),
  update: (id: string, data: HabitUpdate) => api.put(`habits/${id}`, { json: data }).json<HabitResponse>(),
  delete: (id: string) => api.delete(`habits/${id}`),
  todayList: (date: string) => api.get('habits/today/list', { searchParams: { local_date: date } }).json<HabitTodayResponse[]>(),
  check: (id: string, data: CheckHabitRequest) => api.post(`habits/${id}/check`, { json: data }).json<CheckHabitResponse>(),
  calendarAll: (month: string) => api.get('habits/calendar/all', { searchParams: { month } }).json<CalendarDay[]>(),
  contributionGraph: (id: string, days?: number) =>
    api.get(`habits/${id}/contribution-graph`, { searchParams: days ? { days } : {} }).json<ContributionDay[]>(),
};

// Power
export const powerApi = {
  current: () => api.get('power/current').json<PowerResponse>(),
  attributes: () => api.get('attributes/').json<AttributeDetail[]>(),
};

// Categories
export const categoriesApi = {
  list: () => api.get('categories/').json<CategoryResponse[]>(),
  create: (data: CategoryCreate) => api.post('categories/', { json: data }).json<CategoryResponse>(),
  update: (id: string, data: CategoryUpdate) => api.put(`categories/${id}`, { json: data }).json<CategoryResponse>(),
  delete: (id: string) => api.delete(`categories/${id}`),
};

// Rewards
export const rewardsApi = {
  list: () => api.get('rewards/').json<RewardResponse[]>(),
  create: (data: RewardCreate) => api.post('rewards/', { json: data }).json<RewardResponse>(),
  update: (id: string, data: RewardUpdate) => api.put(`rewards/${id}`, { json: data }).json<RewardResponse>(),
  delete: (id: string) => api.delete(`rewards/${id}`),
};

// Wishes
export const wishesApi = {
  list: () => api.get('wishes/').json<WishResponse[]>(),
  create: (data: WishCreate) => api.post('wishes/', { json: data }).json<WishResponse>(),
  update: (id: string, data: WishUpdate) => api.put(`wishes/${id}`, { json: data }).json<WishResponse>(),
  delete: (id: string) => api.delete(`wishes/${id}`),
  grant: (data: WishGrantRequest) => api.post('wishes/grant', { json: data }).json<WishGrantResponse>(),
};

// Off Days
export const offDaysApi = {
  list: (month?: string) => api.get('off-days/', { searchParams: month ? { month } : {} }).json<OffDayResponse[]>(),
  create: (data: OffDayCreate) => api.post('off-days/', { json: data }).json<OffDayMarkResponse>(),
  delete: (date: string) => api.delete(`off-days/${date}`),
};

// Quotes
export const quotesApi = {
  random: (triggerEvent?: string) =>
    api.get('quotes/random', { searchParams: triggerEvent ? { trigger_event: triggerEvent } : {} }).json<QuoteResponse>(),
};

// Analytics
export const analyticsApi = {
  summary: (period?: 'week' | 'month' | 'all') =>
    api.get('analytics/summary', { searchParams: period ? { period } : {} }).json<AnalyticsSummary>(),
  capsuleHistory: () => api.get('analytics/capsule-history').json<CapsuleHistoryItem[]>(),
  wishHistory: () => api.get('analytics/wish-history').json<WishHistoryItem[]>(),
};

// Settings
export const settingsApi = {
  get: () => api.get('settings/').json<SettingsResponse>(),
  update: (data: SettingsUpdate) => api.put('settings/', { json: data }).json<SettingsResponse>(),
};
```

### Pattern 3: Zustand Store with useShallow Discipline

**What:** Store holds state + async actions. Components use `useShallow` for any multi-value selection. No bare `useStore()` calls.

**When to use:** Every store consumer component.

**Example:**
```typescript
// store/habitStore.ts
import { create } from 'zustand';
import type { HabitTodayResponse, CheckHabitResponse } from '../types';
import { habitsApi } from '../services/api';

interface HabitState {
  todayHabits: HabitTodayResponse[];
  isLoading: boolean;
  error: string | null;

  fetchToday: (date: string) => Promise<void>;
  checkHabit: (habitId: string, date: string) => Promise<CheckHabitResponse>;
}

export const useHabitStore = create<HabitState>((set, get) => ({
  todayHabits: [],
  isLoading: false,
  error: null,

  fetchToday: async (date) => {
    set({ isLoading: true, error: null });
    try {
      const habits = await habitsApi.todayList(date);
      set({ todayHabits: habits, isLoading: false });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  checkHabit: async (habitId, date) => {
    // Optimistic toggle
    const prev = get().todayHabits;
    set({
      todayHabits: prev.map((h) =>
        h.id === habitId ? { ...h, completed: !h.completed } : h
      ),
    });

    try {
      const result = await habitsApi.check(habitId, { local_date: date });
      // Update local state from server response
      set({
        todayHabits: get().todayHabits.map((h) =>
          h.id === habitId ? { ...h, completed: result.is_checking } : h
        ),
      });
      return result;
    } catch (err) {
      // Rollback
      set({ todayHabits: prev, error: (err as Error).message });
      throw err;
    }
  },
}));

// Component usage — ALWAYS use useShallow for multi-value:
// import { useShallow } from 'zustand/react/shallow';
// const { todayHabits, isLoading } = useHabitStore(
//   useShallow((s) => ({ todayHabits: s.todayHabits, isLoading: s.isLoading }))
// );
//
// Single value — selector is fine without useShallow:
// const isLoading = useHabitStore((s) => s.isLoading);
```

### Pattern 4: useInitApp Hydration Hook

**What:** Single hook called in App.tsx that hydrates all stores on mount, providing unified loading/error state.

**When to use:** App root, once.

**Example:**
```typescript
// hooks/useInitApp.ts
import { useEffect, useState } from 'react';
import { useHabitStore } from '../store/habitStore';
import { usePowerStore } from '../store/powerStore';
import { useRewardStore } from '../store/rewardStore';

export function useInitApp() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];

    Promise.all([
      useHabitStore.getState().fetchToday(today),
      usePowerStore.getState().fetchPower(),
      useRewardStore.getState().fetchRewards(),
    ])
      .then(() => setIsReady(true))
      .catch((err) => setError((err as Error).message));
  }, []);

  return { isReady, error };
}
```

### Pattern 5: React Router 7 SPA Layout with Bottom Tabs

**What:** BrowserRouter with layout route wrapping three pages + bottom tab bar.

**When to use:** App entry point.

**Example:**
```typescript
// App.tsx
import { BrowserRouter, Routes, Route } from 'react-router';
import { AppShell } from './components/layout/AppShell';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Dashboard />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

### Pattern 6: Animation Queue Skeleton in uiStore

**What:** Types + enqueue/dequeue for animation events, placed now to prevent refactor in Phase 7.

**When to use:** uiStore structure.

**Example:**
```typescript
// store/uiStore.ts
import { create } from 'zustand';

type AnimationEvent =
  | { type: 'tier_change'; tier: string }
  | { type: 'perfect_day' }
  | { type: 'capsule_drop'; rewardTitle: string; rarity: string }
  | { type: 'dragon_ball'; count: number }
  | { type: 'transformation'; form: string; name: string }
  | { type: 'xp_popup'; amount: number; attribute: string }
  | { type: 'shenron' };

interface UiState {
  // Animation queue (skeleton for Phase 7)
  animationQueue: AnimationEvent[];
  enqueueAnimation: (event: AnimationEvent) => void;
  dequeueAnimation: () => AnimationEvent | undefined;
  clearAnimations: () => void;

  // Modal state
  activeModal: string | null;
  openModal: (id: string) => void;
  closeModal: () => void;
}

export const useUiStore = create<UiState>((set, get) => ({
  animationQueue: [],
  enqueueAnimation: (event) =>
    set((s) => ({ animationQueue: [...s.animationQueue, event] })),
  dequeueAnimation: () => {
    const [first, ...rest] = get().animationQueue;
    set({ animationQueue: rest });
    return first;
  },
  clearAnimations: () => set({ animationQueue: [] }),

  activeModal: null,
  openModal: (id) => set({ activeModal: id }),
  closeModal: () => set({ activeModal: null }),
}));
```

### Anti-Patterns to Avoid

- **Bare `useStore()` without selector:** Causes re-render on ANY state change. Always use a selector function.
- **`useShallow` on single primitives:** Unnecessary overhead. `useShallow` is only needed when returning objects/arrays.
- **Tailwind `@config` with JS file:** v4 CSS-first approach via `@theme` is the standard. Do not create a `tailwind.config.js`.
- **`react-router-dom` import:** v7 consolidates to `react-router` package. `react-router-dom` still exists as re-export but is deprecated.
- **PostCSS for Tailwind in Vite:** Use `@tailwindcss/vite` plugin instead -- faster, fewer dependencies.
- **Fetching in components:** All data fetching lives in store actions, not in `useEffect` inside components.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| HTTP client with retry/hooks | Custom fetch wrapper | ky with `ky.extend()` | Edge cases: retry backoff, content-type detection, timeout, streaming |
| Toast notifications | Custom toast system | react-hot-toast | Positioning, animation, auto-dismiss, stacking -- deceptively complex |
| Shallow equality comparison | Manual `Object.keys` comparison | `useShallow` from zustand | Handles arrays, nested references, edge cases |
| CSS vendor prefixing | Autoprefixer setup | `@tailwindcss/vite` | Vite plugin handles it automatically |

**Key insight:** The API client and toast system look simple but have 20+ edge cases each. Using ky and react-hot-toast saves days of debugging.

## Common Pitfalls

### Pitfall 1: Tailwind v4 Config Confusion
**What goes wrong:** Developer creates `tailwind.config.js` (v3 pattern) instead of using `@theme` in CSS.
**Why it happens:** Muscle memory from Tailwind v3 tutorials which dominate search results.
**How to avoid:** No `tailwind.config.js` file. All tokens go in `index.css` inside `@theme { }` block. Import via `@import "tailwindcss"`.
**Warning signs:** File `tailwind.config.js` or `postcss.config.js` exists in the project.

### Pitfall 2: useShallow Import Path
**What goes wrong:** Importing `shallow` from the wrong path or using the deprecated `zustand/shallow` instead of `zustand/react/shallow`.
**Why it happens:** Zustand v4 docs show `import { shallow } from 'zustand/shallow'` which changed in v5.
**How to avoid:** Always import `import { useShallow } from 'zustand/react/shallow'`.
**Warning signs:** TypeScript error on import, or runtime warning about deprecated API.

### Pitfall 3: ky prefixUrl Trailing Slash
**What goes wrong:** Double slashes or missing segments in URLs when `prefixUrl` and endpoint paths don't align.
**Why it happens:** ky's `prefixUrl` requires input to NOT start with `/`. If prefixUrl ends with `/api/v1` and you call `api.get('/habits/')`, the leading slash breaks resolution.
**How to avoid:** Set `prefixUrl` to `http://localhost:8000/api/v1` (no trailing slash) and use paths like `'habits/'` (no leading slash) in all API calls.
**Warning signs:** 404 errors with doubled path segments in network tab.

### Pitfall 4: React Router v7 Import Changes
**What goes wrong:** Importing from `react-router-dom` instead of `react-router`.
**Why it happens:** Every React Router tutorial before v7 uses `react-router-dom`.
**How to avoid:** Install `react-router` (not `react-router-dom`). Import `{ BrowserRouter, Routes, Route, NavLink, Outlet }` from `'react-router'`.
**Warning signs:** Package `react-router-dom` in `package.json`.

### Pitfall 5: Store Hydration Race Condition
**What goes wrong:** Components render before stores are hydrated, showing empty state or errors.
**Why it happens:** `useEffect` fetches are async but React renders synchronously.
**How to avoid:** `useInitApp()` returns `isReady` boolean. `AppShell` shows `LoadingScreen` until all stores report ready.
**Warning signs:** Flash of empty content on app load, or components mounting with undefined data.

### Pitfall 6: Vite Env Variable Naming
**What goes wrong:** Environment variables not available at runtime.
**Why it happens:** Vite requires `VITE_` prefix for client-exposed env vars. Using `REACT_APP_` (CRA pattern) silently fails.
**How to avoid:** Use `VITE_API_BASE` for the backend URL. Access via `import.meta.env.VITE_API_BASE`.
**Warning signs:** `undefined` when reading `import.meta.env.REACT_APP_*`.

## Code Examples

### Complete TypeScript Types (from Backend Pydantic Schemas)

```typescript
// types/index.ts — Matches backend/app/schemas/*.py exactly

// ── Enums / Literals ──
export type Attribute = 'str' | 'vit' | 'int' | 'ki';
export type Importance = 'normal' | 'important' | 'critical';
export type Frequency = 'daily' | 'weekdays' | 'custom';
export type Rarity = 'common' | 'rare' | 'epic';
export type OffDayReason = 'sick' | 'vacation' | 'rest' | 'injury' | 'other';
export type Theme = 'dark' | 'light';
export type AnalyticsPeriod = 'week' | 'month' | 'all';

// ── Habits ──
export interface HabitCreate {
  title: string;
  attribute: Attribute;
  importance?: Importance;
  frequency?: Frequency;
  custom_days?: number[] | null;
  description?: string | null;
  icon_emoji?: string;
  category_id?: string | null;
  target_time?: string | null;
  is_temporary?: boolean;
  start_date: string; // YYYY-MM-DD
  end_date?: string | null;
  sort_order?: number;
}

export interface HabitUpdate {
  title?: string;
  attribute?: Attribute;
  importance?: Importance;
  frequency?: Frequency;
  custom_days?: number[] | null;
  description?: string | null;
  icon_emoji?: string;
  category_id?: string | null;
  target_time?: string | null;
  is_temporary?: boolean;
  start_date?: string;
  end_date?: string | null;
  sort_order?: number;
  is_active?: boolean;
}

export interface HabitResponse {
  id: string;
  title: string;
  description: string | null;
  icon_emoji: string;
  importance: Importance;
  attribute: Attribute;
  frequency: Frequency;
  custom_days: number[] | null;
  target_time: string | null;
  is_temporary: boolean;
  start_date: string;
  end_date: string | null;
  sort_order: number;
  is_active: boolean;
  category_id: string | null;
  created_at: string; // ISO datetime
}

export interface HabitTodayResponse extends HabitResponse {
  completed: boolean;
  streak_current: number;
  streak_best: number;
}

// ── Check Habit ──
export interface CheckHabitRequest {
  local_date: string; // YYYY-MM-DD
}

export interface DailyLogSummary {
  habits_due: number;
  habits_completed: number;
  completion_rate: number;
  completion_tier: string;
  xp_earned: number;
  streak_multiplier: number;
  zenkai_bonus_applied: boolean;
  dragon_ball_earned: boolean;
}

export interface StreakInfo {
  current_streak: number;
  best_streak: number;
}

export interface TransformChange {
  key: string;
  name: string;
  threshold: number;
}

export interface DragonBallInfo {
  dragon_balls_collected: number;
  wish_available: boolean;
}

export interface CapsuleDropDetail {
  id: string;
  reward_id: string;
  reward_title: string;
  reward_rarity: Rarity;
}

export interface QuoteDetail {
  character: string;
  quote_text: string;
  source_saga: string;
  avatar_path: string;
}

export interface CheckHabitResponse {
  is_checking: boolean;
  habit_id: string;
  log_date: string;
  attribute_xp_awarded: number;
  is_perfect_day: boolean;
  zenkai_activated: boolean;
  daily_log: DailyLogSummary;
  streak: StreakInfo;
  habit_streak: StreakInfo;
  power_level: number;
  transformation: string;
  transform_change: TransformChange | null;
  dragon_ball: DragonBallInfo | null;
  capsule: CapsuleDropDetail | null;
  quote: QuoteDetail | null;
}

// ── Power ──
export interface AttributeDetail {
  attribute: Attribute;
  raw_xp: number;
  level: number;
  title: string | null;
  xp_for_current_level: number;
  xp_for_next_level: number;
  progress_percent: number;
}

export interface PowerResponse {
  power_level: number;
  transformation: string;
  transformation_name: string;
  next_transformation: string | null;
  next_threshold: number | null;
  dragon_balls_collected: number;
  wishes_granted: number;
  attributes: AttributeDetail[];
}

// ── Categories ──
export interface CategoryCreate {
  name: string;
  color_code: string;
  icon: string;
  sort_order?: number;
}

export interface CategoryUpdate {
  name?: string;
  color_code?: string;
  icon?: string;
  sort_order?: number;
}

export interface CategoryResponse {
  id: string;
  name: string;
  color_code: string;
  icon: string;
  sort_order: number;
  created_at: string;
}

// ── Rewards ──
export interface RewardCreate {
  title: string;
  rarity?: Rarity;
}

export interface RewardUpdate {
  title?: string;
  rarity?: Rarity;
  is_active?: boolean;
}

export interface RewardResponse {
  id: string;
  title: string;
  rarity: Rarity;
  is_active: boolean;
  created_at: string;
}

// ── Wishes ──
export interface WishCreate {
  title: string;
}

export interface WishUpdate {
  title?: string;
  is_active?: boolean;
}

export interface WishResponse {
  id: string;
  title: string;
  is_active: boolean;
  times_wished: number;
  created_at: string;
}

export interface WishGrantRequest {
  wish_id: string;
}

export interface WishGrantResponse {
  wish_title: string;
  times_wished: number;
  wishes_granted: number;
}

// ── Off Days ──
export interface OffDayCreate {
  local_date: string; // YYYY-MM-DD
  reason?: OffDayReason;
  notes?: string | null;
}

export interface OffDayResponse {
  id: string;
  off_date: string;
  reason: OffDayReason;
  notes: string | null;
  created_at: string;
}

export interface OffDayMarkResponse {
  off_date: string;
  habits_reversed: number;
  xp_clawed_back: number;
}

// ── Quotes ──
export interface QuoteResponse {
  character: string;
  quote_text: string;
  source_saga: string;
  avatar_path: string;
}

// ── Settings ──
export interface SettingsResponse {
  display_name: string;
  sound_enabled: boolean;
  theme: Theme;
}

export interface SettingsUpdate {
  display_name?: string;
  sound_enabled?: boolean;
  theme?: Theme;
}

// ── Analytics ──
export interface AnalyticsSummary {
  perfect_days: number;
  avg_completion: number;
  total_xp: number;
  days_tracked: number;
  longest_streak: number;
}

export interface CapsuleHistoryItem {
  id: string;
  reward_title: string;
  reward_rarity: Rarity;
  habit_title: string;
  dropped_at: string;
}

export interface WishHistoryItem {
  id: string;
  wish_title: string;
  granted_at: string;
}

export interface CalendarDay {
  date: string;
  is_perfect_day: boolean;
  completion_tier: string;
  xp_earned: number;
  is_off_day: boolean;
}

export interface ContributionDay {
  date: string;
  completed: boolean;
}
```

### Vite Config with Tailwind Plugin

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
});
```

### Check Response Distribution Pattern (Claude's Discretion)

When `checkHabit` returns `CheckHabitResponse`, habitStore should distribute data to other stores:

```typescript
// Inside habitStore.checkHabit after successful API call:
const result = await habitsApi.check(habitId, { local_date: date });

// Distribute to powerStore
usePowerStore.getState().updateFromCheck(result.power_level, result.transformation);

// Distribute to uiStore animation queue
if (result.transform_change) {
  useUiStore.getState().enqueueAnimation({
    type: 'transformation',
    form: result.transform_change.key,
    name: result.transform_change.name,
  });
}
if (result.capsule) {
  useUiStore.getState().enqueueAnimation({
    type: 'capsule_drop',
    rewardTitle: result.capsule.reward_title,
    rarity: result.capsule.reward_rarity,
  });
}
if (result.is_perfect_day) {
  useUiStore.getState().enqueueAnimation({ type: 'perfect_day' });
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `tailwind.config.js` (JS) | `@theme` in CSS | Tailwind v4.0 (Jan 2025) | No JS config file needed, CSS-first |
| `react-router-dom` package | `react-router` unified package | React Router v7 (late 2024) | Single import source |
| `zustand/shallow` | `zustand/react/shallow` (useShallow) | Zustand v5 (mid 2024) | Hook-based shallow comparison |
| PostCSS + autoprefixer | `@tailwindcss/vite` plugin | Tailwind v4.0 (Jan 2025) | Faster builds, fewer deps |
| `create-react-app` | `npm create vite@latest` | CRA deprecated (Feb 2025) | Official React recommendation |

**Deprecated/outdated:**
- `tailwind.config.js`: Still works via `@config` directive but discouraged for new projects
- `react-router-dom`: Re-exported from `react-router` for migration, will eventually be removed
- `shallow` from `zustand/shallow`: Replaced by `useShallow` from `zustand/react/shallow` in v5
- `postcss.config.js` for Tailwind: Replaced by `@tailwindcss/vite` plugin for Vite projects

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.x + @testing-library/react |
| Config file | None -- Wave 0 creates `vitest.config.ts` |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run` |

### Phase Requirements -> Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| STATE-01 | React 19 SPA renders with Vite 7, TS, Tailwind v4 | smoke | `npx vitest run src/__tests__/app-renders.test.tsx -t "renders"` | Wave 0 |
| STATE-02 | TS types match backend schemas (compile check) | unit | `npx tsc --noEmit` | Wave 0 (tsconfig) |
| STATE-03 | API client calls all 9 endpoints with typed responses | unit | `npx vitest run src/__tests__/api-client.test.ts` | Wave 0 |
| STATE-04 | Zustand stores hold state, useShallow used for multi-value | unit | `npx vitest run src/__tests__/stores.test.ts` | Wave 0 |
| STATE-05 | Dark theme CSS custom properties applied | smoke | `npx vitest run src/__tests__/theme.test.tsx` | Wave 0 |
| STATE-06 | Page routing between 3 views | integration | `npx vitest run src/__tests__/routing.test.tsx` | Wave 0 |

### Sampling Rate

- **Per task commit:** `npx vitest run --reporter=verbose`
- **Per wave merge:** `npx vitest run && npx tsc --noEmit`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `vitest.config.ts` -- Vitest config with jsdom environment, React plugin
- [ ] `src/test-setup.ts` -- @testing-library/jest-dom setup
- [ ] `package.json` test script -- `"test": "vitest run"`
- [ ] Dev dependencies: `vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom`
- [ ] `src/__tests__/app-renders.test.tsx` -- covers STATE-01
- [ ] `src/__tests__/api-client.test.ts` -- covers STATE-03 (mock ky)
- [ ] `src/__tests__/stores.test.ts` -- covers STATE-04
- [ ] `src/__tests__/theme.test.tsx` -- covers STATE-05
- [ ] `src/__tests__/routing.test.tsx` -- covers STATE-06

## Open Questions

1. **Today's habits endpoint query param name**
   - What we know: Backend uses `local_date` query param for `GET /habits/today/list`
   - What's unclear: The PRD says the endpoint has no query params, but the actual backend code requires `local_date`
   - Recommendation: Use the actual backend implementation (`local_date` query param), not the PRD spec

2. **Vite proxy vs direct CORS**
   - What we know: Backend has CORS configured. Vite can proxy `/api` to localhost:8000.
   - What's unclear: Whether to use Vite proxy (cleaner URLs) or direct CORS (simpler config)
   - Recommendation: Use Vite proxy for dev (avoids CORS issues), keep `VITE_API_BASE` env var for production flexibility

## Sources

### Primary (HIGH confidence)
- [Tailwind CSS v4 Theme Variables](https://tailwindcss.com/docs/theme) -- @theme directive syntax and behavior
- [Tailwind CSS v4 Release Blog](https://tailwindcss.com/blog/tailwindcss-v4) -- Migration and new features
- [Zustand useShallow Reference](https://zustand.docs.pmnd.rs/reference/hooks/use-shallow) -- Import path and usage
- [ky GitHub](https://github.com/sindresorhus/ky) -- API, ky.extend(), typed responses
- [React Router v7 Docs](https://reactrouter.com/) -- Unified package, v6->v7 migration
- [Vite Getting Started](https://vite.dev/guide/) -- Scaffold command, Node.js requirements

### Secondary (MEDIUM confidence)
- [Zustand v5 Releases](https://github.com/pmndrs/zustand/releases) -- v5.0.11 confirmed
- [ky npm](https://www.npmjs.com/package/ky) -- v1.14.3 confirmed
- [react-router-dom npm](https://www.npmjs.com/package/react-router-dom) -- v7.13.1 confirmed
- [Vitest npm](https://www.npmjs.com/package/vitest) -- v4.0.18 confirmed
- Backend schema files read directly from codebase -- all types verified against source

### Tertiary (LOW confidence)
- None -- all claims verified against official sources or direct codebase inspection

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all library versions verified via npm/official docs
- Architecture: HIGH -- patterns from official documentation + backend schemas read directly
- Pitfalls: HIGH -- based on documented breaking changes in v4/v5/v7 migrations

**Research date:** 2026-03-05
**Valid until:** 2026-04-05 (stable stack, 30-day validity)
