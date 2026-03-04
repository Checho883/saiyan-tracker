# Architecture Research

**Domain:** Frontend integration with existing FastAPI backend -- DBZ-themed habit tracker
**Researched:** 2026-03-04
**Confidence:** HIGH

## System Overview

```
+-------------------------------------------------------------+
|                     React 19 + Vite 7                       |
|                                                             |
|  Pages                                                      |
|  +------------+  +------------+  +------------+             |
|  | Dashboard  |  | Analytics  |  | Settings   |             |
|  +-----+------+  +-----+------+  +-----+------+            |
|        |               |               |                    |
|  Components                                                 |
|  +----------+ +----------+ +-----------+ +----------+       |
|  | dashboard| | analytics| | animations| | common   |       |
|  | (avatar, | | (charts, | | (perfect, | | (modals, |       |
|  |  habits, | |  heatmap)| |  shenron, | |  quotes) |       |
|  |  aura)   | |          | |  capsule) | |          |       |
|  +----+-----+ +----+-----+ +----+------+ +----+-----+      |
|       |             |            |              |           |
|  +--------------------------------------------------+      |
|  |              SoundProvider (context)              |      |
|  +--------------------------------------------------+      |
|       |             |            |              |           |
|  Zustand Stores                                             |
|  +----------+ +----------+ +-----------+ +----------+       |
|  | habitStr | | powerStr | | rewardStr | | uiStore  |       |
|  +----+-----+ +----+-----+ +----+------+ +----+-----+      |
|       |             |            |              |           |
|  +--------------------------------------------------+      |
|  |                API Client Layer (ky)              |      |
|  +--------------------------------------------------+      |
|       |                                                     |
+-------+-----------------------------------------------------+
        | HTTP (JSON)
+-------+-----------------------------------------------------+
|  FastAPI Backend (existing, unchanged)                       |
|  /api/v1/habits, /power, /attributes, /rewards, /wishes,   |
|  /quotes, /off-days, /analytics, /settings, /categories     |
+-------------------------------------------------------------+
        |
+-------+--------+
|  SQLite (local) |
+----------------+
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| API Client | HTTP communication with FastAPI backend | ky instance with base URL, JSON defaults, error interceptor |
| Zustand Stores | Client-side state + server data cache | 4 stores: habit, power, reward, ui |
| SoundProvider | Audio preloading, playback, global mute | React Context wrapping Howler.js |
| Pages | Route-level containers, data fetching on mount | React Router v7 with 3 routes |
| Animation Layer | Overlay animations (perfect day, shenron, capsule) | Motion (formerly Framer Motion) with AnimatePresence |
| Dashboard Components | Habit cards, avatar, aura bar, dragon balls | Presentation + store subscriptions |
| Analytics Components | Charts, heatmap, contribution graphs | Recharts + custom calendar grid |
| Common Components | Modals, forms, quote display | Shared across pages |

## Recommended Project Structure

```
frontend/src/
+-- main.tsx                  # React root, router setup
+-- App.tsx                   # Layout shell (header, nav, outlet)
+-- index.css                 # Tailwind v4 directives, CSS variables, theme
+-- types/
|   +-- index.ts              # All TypeScript interfaces mirroring backend schemas
+-- api/
|   +-- client.ts             # ky instance (base URL, error handling)
|   +-- habits.ts             # Habit API functions (getToday, check, CRUD)
|   +-- power.ts              # Power/attributes API
|   +-- rewards.ts            # Capsule reward CRUD
|   +-- wishes.ts             # Shenron wish CRUD + grant
|   +-- analytics.ts          # Summary, calendar, capsule/wish history
|   +-- settings.ts           # Settings get/update
|   +-- quotes.ts             # Random quote fetch
|   +-- offDays.ts            # Off day CRUD
|   +-- categories.ts         # Category CRUD
+-- stores/
|   +-- habitStore.ts         # Today's habits, check state, calendar data
|   +-- powerStore.ts         # Power level, transformation, attributes, dragon balls
|   +-- rewardStore.ts        # Capsule rewards, wishes, drop history
|   +-- uiStore.ts            # Modals, active animations, quote queue, theme
+-- audio/
|   +-- SoundProvider.tsx     # Context provider wrapping Howler
|   +-- useSound.ts           # Hook: play(soundId), preload, mute toggle
|   +-- sounds.ts             # Sound definitions (name -> file/sprite mapping)
+-- pages/
|   +-- Dashboard.tsx         # Main page, fetches today data on mount
|   +-- Analytics.tsx         # Charts/history, fetches on mount
|   +-- Settings.tsx          # Config page, fetches settings/rewards/wishes
+-- components/
|   +-- layout/
|   |   +-- Header.tsx        # App title, nav links, sound toggle
|   |   +-- PageShell.tsx     # Common page wrapper (padding, max-width)
|   +-- dashboard/
|   |   +-- SaiyanAvatar.tsx  # Character image + form-specific aura animation
|   |   +-- AttributeBars.tsx # 4 stat bars (STR/VIT/INT/KI)
|   |   +-- DailyAuraBar.tsx  # Percentage progress bar (the centerpiece)
|   |   +-- DragonBallTracker.tsx  # 7 ball slots with glow
|   |   +-- HabitCard.tsx     # Single habit row with check, attribute, streak
|   |   +-- HabitList.tsx     # Container for habit cards
|   |   +-- StreakDisplay.tsx # Current/best streak with flame
|   |   +-- TransformationTimeline.tsx  # Form progression bar
|   +-- analytics/
|   |   +-- CalendarHeatmap.tsx    # Monthly grid, color-coded days
|   |   +-- ContributionGraph.tsx  # Per-habit 90-day grid
|   |   +-- AttributeChart.tsx     # Recharts line chart for attr progression
|   |   +-- SummaryCards.tsx       # Perfect days, avg %, total XP stats
|   |   +-- CapsuleHistory.tsx     # Loot drop history list
|   |   +-- WishHistory.tsx        # Shenron wish grant history
|   +-- animations/
|   |   +-- PerfectDayExplosion.tsx   # Full-screen 100% overlay
|   |   +-- ShenronAnimation.tsx     # Full-screen wish granting
|   |   +-- TransformationReveal.tsx # New form unlock animation
|   |   +-- CapsuleDropPopup.tsx     # Capsule appear + tap-to-open + reveal
|   |   +-- XpPopup.tsx             # "+22 STR XP" float-up
|   |   +-- TierChangeBanner.tsx     # "Kaio-ken x10!" flash
|   |   +-- ScreenShake.tsx         # Wrapper that shakes children
|   +-- common/
|   |   +-- HabitFormModal.tsx   # Create/edit habit form
|   |   +-- OffDayModal.tsx      # Declare off day
|   |   +-- QuoteBar.tsx         # Character quote display (bottom bar)
|   |   +-- RewardManager.tsx    # CRUD for capsule rewards
|   |   +-- WishManager.tsx      # CRUD for Shenron wishes
|   |   +-- CategoryManager.tsx  # CRUD for visual categories
+-- assets/
|   +-- images/                # Character forms, dragon balls, capsules
|   +-- sounds/                # Audio files (.mp3/.webm)
+-- lib/
    +-- constants.ts           # Transformation thresholds, tier names, colors
    +-- formatters.ts          # XP formatting, percentage display
```

### Structure Rationale

- **api/:** One file per backend router. Functions return typed data. Separates HTTP concerns from state management. Stores call these; components never call API directly.
- **stores/:** 4 stores matching the PRD specification. Each store owns its slice of server data plus client-only UI state. Actions are async (call API, update state).
- **audio/:** Isolated from component tree. Context-based so any component can trigger sounds without prop drilling. Howler handles preloading and sprite management.
- **components/animations/:** Overlay animations are separate from dashboard components because they render in a portal/overlay layer via AnimatePresence, not inline.
- **lib/:** Pure utility functions with zero React dependencies. Display-only constants (transformation names, tier display text, theme colors) -- NOT game logic constants (XP formulas, thresholds). Game logic stays on the backend.

## Architectural Patterns

### Pattern 1: Zustand Stores as Server Cache (No TanStack Query)

**What:** Each Zustand store holds server data directly and exposes async actions that call the API and update state. No separate server-state library (TanStack Query, SWR).

**When to use:** Single-user apps with simple cache needs. No concurrent users means no stale data from other sessions. No SSR means no hydration complexity.

**Trade-offs:**
- PRO: One state system instead of two. Simpler mental model. Zustand actions handle fetch + update atomically.
- PRO: Animation triggers live in the same store that receives API responses -- no synchronization gap.
- CON: Manual refetch logic (no automatic background refetch). Acceptable for single-user local app.
- CON: No built-in retry/deduplication. Acceptable given simple request patterns.

**Why not TanStack Query:** This app has a critical requirement that `check_habit()` responses drive animations (capsule drops, tier changes, transformation unlocks). The response must flow: API -> store -> animation queue -> component. TanStack Query adds a layer between API response and state that complicates this flow. Zustand actions can atomically update habit state AND queue animations in one synchronous update.

**Example:**

```typescript
// stores/habitStore.ts
import { create } from 'zustand';
import * as habitApi from '../api/habits';
import { useUiStore } from './uiStore';
import { usePowerStore } from './powerStore';

interface HabitState {
  todayHabits: HabitToday[];
  dailyProgress: DailyProgress | null;
  isLoading: boolean;

  fetchToday: (date: string) => Promise<void>;
  checkHabit: (habitId: string, date: string) => Promise<void>;
}

export const useHabitStore = create<HabitState>((set, get) => ({
  todayHabits: [],
  dailyProgress: null,
  isLoading: false,

  fetchToday: async (date) => {
    set({ isLoading: true });
    const habits = await habitApi.getTodayHabits(date);
    set({ todayHabits: habits, isLoading: false });
  },

  checkHabit: async (habitId, date) => {
    // Optimistic: toggle the habit immediately
    set((state) => ({
      todayHabits: state.todayHabits.map((h) =>
        h.id === habitId ? { ...h, completed: !h.completed } : h
      ),
    }));

    try {
      const result = await habitApi.checkHabit(habitId, date);

      // Update habit store with server truth
      set((state) => ({
        todayHabits: state.todayHabits.map((h) =>
          h.id === habitId
            ? {
                ...h,
                completed: result.is_checking,
                streak_current: result.habit_streak.current_streak,
              }
            : h
        ),
        dailyProgress: {
          habitsDue: result.daily_log.habits_due,
          habitsCompleted: result.daily_log.habits_completed,
          completionRate: result.daily_log.completion_rate,
          completionTier: result.daily_log.completion_tier,
          xpEarned: result.daily_log.xp_earned,
        },
      }));

      // Update power store (cross-store)
      usePowerStore.getState().applyCheckResult(result);

      // Queue animations in UI store (cross-store)
      useUiStore.getState().processCheckResult(result);
    } catch (error) {
      // Revert optimistic update
      set((state) => ({
        todayHabits: state.todayHabits.map((h) =>
          h.id === habitId ? { ...h, completed: !h.completed } : h
        ),
      }));
    }
  },
}));
```

### Pattern 2: Animation Queue in UI Store

**What:** The `uiStore` maintains a FIFO queue of animation events. Components subscribe to the queue and consume events one at a time. Each animation calls `dequeue()` on its exit, triggering the next.

**When to use:** When multiple animations can trigger from a single action (XP popup -> tier change banner -> capsule drop -> perfect day explosion). They must play sequentially, not simultaneously.

**Trade-offs:**
- PRO: Deterministic animation ordering. No race conditions.
- PRO: Components are simple -- they just watch for their event type and animate when it appears.
- CON: Slightly more complex store logic. Worth it for the animation-heavy nature of this app.

**Example:**

```typescript
// stores/uiStore.ts
type AnimationEvent =
  | { type: 'xp_popup'; attribute: string; xp: number }
  | { type: 'tier_change'; tier: string }
  | { type: 'capsule_drop'; reward: CapsuleReward }
  | { type: 'perfect_day' }
  | { type: 'dragon_ball'; count: number }
  | { type: 'transformation'; form: string; name: string }
  | { type: 'shenron' };

interface UiState {
  animationQueue: AnimationEvent[];
  currentAnimation: AnimationEvent | null;
  quote: QuoteDetail | null;
  activeModal: string | null;

  processCheckResult: (result: CheckHabitResponse) => void;
  dequeueAnimation: () => void;
}

export const useUiStore = create<UiState>((set, get) => ({
  animationQueue: [],
  currentAnimation: null,
  quote: null,
  activeModal: null,

  processCheckResult: (result) => {
    const events: AnimationEvent[] = [];

    // Always show XP popup when checking (not unchecking)
    if (result.is_checking && result.attribute_xp_awarded > 0) {
      events.push({
        type: 'xp_popup',
        attribute: result.daily_log.completion_tier,
        xp: result.attribute_xp_awarded,
      });
    }

    // Tier change (compare previous tier vs new -- tracked in habitStore)
    // Only queue if tier actually changed from previous state

    // Capsule drop
    if (result.capsule) {
      events.push({
        type: 'capsule_drop',
        reward: {
          id: result.capsule.id,
          title: result.capsule.reward_title,
          rarity: result.capsule.reward_rarity,
        },
      });
    }

    // Transformation unlock (highest priority visual)
    if (result.transform_change) {
      events.push({
        type: 'transformation',
        form: result.transform_change.key,
        name: result.transform_change.name,
      });
    }

    // Perfect day explosion (after other animations)
    if (result.is_perfect_day && result.is_checking) {
      events.push({ type: 'perfect_day' });
    }

    // Dragon ball / Shenron
    if (result.dragon_ball?.dragon_balls_collected === 7) {
      events.push({ type: 'shenron' });
    } else if (result.daily_log.dragon_ball_earned && result.is_checking) {
      events.push({
        type: 'dragon_ball',
        count: result.dragon_ball?.dragon_balls_collected ?? 0,
      });
    }

    // Set quote (displays independently in QuoteBar, not queued)
    if (result.quote) {
      set({ quote: result.quote });
    }

    // Start the queue
    if (events.length > 0) {
      set({
        animationQueue: events.slice(1),
        currentAnimation: events[0],
      });
    }
  },

  dequeueAnimation: () => {
    const { animationQueue } = get();
    if (animationQueue.length > 0) {
      set({
        currentAnimation: animationQueue[0],
        animationQueue: animationQueue.slice(1),
      });
    } else {
      set({ currentAnimation: null });
    }
  },
}));
```

### Pattern 3: API Client with Typed Wrappers

**What:** A single `ky` instance configured with base URL and error handling. Per-resource files export typed async functions. Stores call these functions -- components never import from `api/` directly.

**When to use:** Always. This is the boundary between frontend and backend.

**Trade-offs:**
- PRO: Type safety at the API boundary. Backend schema changes caught at compile time.
- PRO: Easy to mock in tests (mock the api module, not HTTP).
- PRO: ky is 3.6KB gzipped vs axios at 13.5KB. Built on fetch. Better TypeScript support.

**Why ky over axios or raw fetch:** Axios is bloated for what this app needs (no upload progress, no XSRF tokens, no Node.js support needed). Raw fetch lacks automatic JSON parsing, error throwing on 4xx/5xx, and timeout support. ky is the right middle ground -- thin fetch wrapper with exactly the features needed.

**Example:**

```typescript
// api/client.ts
import ky from 'ky';

export const api = ky.create({
  prefixUrl: 'http://localhost:8000/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
  hooks: {
    beforeError: [
      (error) => {
        console.error(`API Error: ${error.response?.status} ${error.request?.url}`);
        return error;
      },
    ],
  },
});

// api/habits.ts
import { api } from './client';
import type { HabitToday, CheckHabitResponse } from '../types';

export async function getTodayHabits(date: string): Promise<HabitToday[]> {
  return api.get('habits/today/list', { searchParams: { local_date: date } }).json();
}

export async function checkHabit(
  habitId: string,
  date: string
): Promise<CheckHabitResponse> {
  return api
    .post(`habits/${habitId}/check`, { json: { local_date: date } })
    .json();
}

export async function getCalendar(
  year: number,
  month: number
): Promise<CalendarDay[]> {
  return api
    .get('habits/calendar/all', { searchParams: { year, month } })
    .json();
}
```

### Pattern 4: Audio System via Context + Howler Sprites

**What:** A single Howler sprite sheet loaded on app init. A React context provides a `play(soundId)` function. Components call `play('scouter_beep')` without knowing about audio internals. Global mute is controlled via settings store.

**When to use:** When every interaction needs audio feedback (this app's core requirement).

**Trade-offs:**
- PRO: Single HTTP request for all sounds. No loading delays on individual interactions.
- PRO: Howler handles Web Audio API fallback, mobile autoplay restrictions, format detection.
- PRO: Context avoids prop drilling; any component can trigger audio.
- CON: Initial load is larger (one sprite file ~500KB-1MB). Acceptable for a single-user local app.

**Why Howler directly over use-sound:** use-sound is a React hook wrapper around Howler. It creates one Howl instance per hook call. With 10+ sounds across many components, this means duplicate instances and no shared sprite support. Using Howler directly with a context gives full control over instance lifecycle and sprite configuration.

**Example:**

```typescript
// audio/sounds.ts
export const SOUND_SPRITE = {
  src: ['/sounds/sprite.webm', '/sounds/sprite.mp3'],
  sprite: {
    scouter_beep:    [0, 800],
    ki_charge:       [1000, 1500],
    power_up_burst:  [3000, 2000],
    capsule_pop:     [5500, 1000],
    item_reveal:     [7000, 1200],
    explosion:       [9000, 3000],
    dragon_radar:    [12500, 1500],
    shenron_roar:    [14500, 3000],
    transform_power: [18000, 4000],
    achievement:     [22500, 2000],
  },
} as const;

export type SoundId = keyof typeof SOUND_SPRITE.sprite;

// audio/SoundProvider.tsx
import { createContext, useContext, useRef, useEffect, useCallback } from 'react';
import { Howl } from 'howler';
import { SOUND_SPRITE, type SoundId } from './sounds';

interface SoundContextValue {
  play: (id: SoundId) => void;
}

const SoundCtx = createContext<SoundContextValue>({ play: () => {} });

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const howlRef = useRef<Howl | null>(null);
  // Read sound_enabled from settings -- fetched on app mount
  const soundEnabled = usePowerStore((s) => s.soundEnabled);

  useEffect(() => {
    howlRef.current = new Howl({
      src: SOUND_SPRITE.src,
      sprite: SOUND_SPRITE.sprite as Record<string, [number, number]>,
      preload: true,
    });
    return () => {
      howlRef.current?.unload();
    };
  }, []);

  const play = useCallback(
    (id: SoundId) => {
      if (soundEnabled && howlRef.current) {
        howlRef.current.play(id);
      }
    },
    [soundEnabled]
  );

  return <SoundCtx.Provider value={{ play }}>{children}</SoundCtx.Provider>;
}

export const useAudio = () => useContext(SoundCtx);
```

### Pattern 5: Animation Overlays with Motion AnimatePresence

**What:** Full-screen animation overlays (perfect day, shenron, transformation) render in a fixed-position layer above all content. Motion's `AnimatePresence` handles mount/unmount animations. Each overlay watches `uiStore.currentAnimation` and renders when its type matches.

**When to use:** For the "climax" animations that take over the screen.

**Trade-offs:**
- PRO: Overlays don't disrupt page layout. They render on top via `position: fixed`.
- PRO: `AnimatePresence` handles exit animations cleanly -- the component stays mounted until the exit animation completes.
- PRO: GPU-accelerated transforms (scale, opacity, x/y) for smooth 60fps.
- CON: Must manage z-index carefully. Use a dedicated layer above everything.

**Note on package name:** The library formerly known as Framer Motion is now called Motion. Install via `npm install motion`. Import from `motion/react`.

**Example:**

```typescript
// App.tsx -- animation layer rendered above page content
import { AnimatePresence } from 'motion/react';
import { useUiStore } from './stores/uiStore';

function AnimationLayer() {
  const current = useUiStore((s) => s.currentAnimation);
  const dequeue = useUiStore((s) => s.dequeueAnimation);

  return (
    <AnimatePresence mode="wait">
      {current?.type === 'xp_popup' && (
        <XpPopup
          key="xp"
          attribute={current.attribute}
          xp={current.xp}
          onComplete={dequeue}
        />
      )}
      {current?.type === 'capsule_drop' && (
        <CapsuleDropPopup
          key="capsule"
          reward={current.reward}
          onComplete={dequeue}
        />
      )}
      {current?.type === 'perfect_day' && (
        <PerfectDayExplosion key="perfect" onComplete={dequeue} />
      )}
      {current?.type === 'transformation' && (
        <TransformationReveal
          key="transform"
          form={current.form}
          name={current.name}
          onComplete={dequeue}
        />
      )}
      {current?.type === 'shenron' && (
        <ShenronAnimation key="shenron" onComplete={dequeue} />
      )}
    </AnimatePresence>
  );
}

// components/animations/PerfectDayExplosion.tsx
import { motion } from 'motion/react';
import { useAudio } from '../../audio/SoundProvider';
import { useEffect } from 'react';

interface Props {
  onComplete: () => void;
}

export function PerfectDayExplosion({ onComplete }: Props) {
  const { play } = useAudio();

  useEffect(() => {
    play('explosion');
    // Auto-dismiss after 3 seconds
    const timer = setTimeout(onComplete, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: [0, 1.5, 1], rotate: 0 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
      >
        <h1 className="text-6xl font-bold text-yellow-400 text-center drop-shadow-[0_0_30px_rgba(255,200,0,0.8)]">
          100% COMPLETE
        </h1>
        <p className="text-2xl text-orange-300 text-center mt-4">
          KAIO-KEN x20!
        </p>
      </motion.div>
    </motion.div>
  );
}
```

### Pattern 6: Screen Shake Wrapper Component

**What:** A reusable component that wraps children and applies a shake animation on trigger. Used for the dashboard container when habits are checked and for the 100% explosion.

**Example:**

```typescript
// components/animations/ScreenShake.tsx
import { motion, useAnimation } from 'motion/react';
import { useImperativeHandle, forwardRef } from 'react';

export interface ScreenShakeRef {
  shake: () => void;
}

export const ScreenShake = forwardRef<ScreenShakeRef, { children: React.ReactNode }>(
  ({ children }, ref) => {
    const controls = useAnimation();

    useImperativeHandle(ref, () => ({
      shake: () => {
        controls.start({
          x: [0, -8, 8, -6, 6, -3, 3, 0],
          transition: { duration: 0.5 },
        });
      },
    }));

    return <motion.div animate={controls}>{children}</motion.div>;
  }
);
```

## Data Flow

### The Critical Flow: Habit Check

This is the most important data flow in the entire app. A single habit check triggers state updates across 3 stores and potentially 5+ sequential animations.

```
[User taps habit checkbox]
    |
    v
[HabitCard] --> habitStore.checkHabit(id, date)
    |
    v
[habitStore] -- 1. Optimistic toggle (instant UI feedback)
    |          -- 2. POST /habits/{id}/check
    |          -- 3. Update habits + dailyProgress from response
    |          -- 4. Cross-store: powerStore.applyCheckResult(response)
    |          -- 5. Cross-store: uiStore.processCheckResult(response)
    |
    v
[powerStore] -- Updates power_level, transformation, attributes, dragon_balls
    |
    v
[uiStore] -- Builds animation queue from response fields:
    |        -- capsule? -> queue capsule_drop
    |        -- transform_change? -> queue transformation
    |        -- is_perfect_day? -> queue perfect_day + dragon_ball
    |        -- Sets currentAnimation = queue[0]
    |
    v
[AnimationLayer] -- AnimatePresence renders currentAnimation
    |              -- Each animation calls play(soundId) via useAudio
    |              -- On complete: uiStore.dequeueAnimation()
    |              -- Next animation renders (or queue empties)
    |
    v
[QuoteBar] -- Displays result.quote independently (not queued)
    |
    v
[Dashboard components] -- Re-render from store subscriptions:
    -- DailyAuraBar reads habitStore.dailyProgress.completionRate
    -- AttributeBars reads powerStore.attributes
    -- DragonBallTracker reads powerStore.dragonBalls
    -- SaiyanAvatar reads powerStore.transformation
    -- StreakDisplay reads habitStore/powerStore streak
```

### Page Load Flow

```
[Dashboard mounts]
    |
    +-> habitStore.fetchToday(todayDate)     -- GET /habits/today/list
    +-> powerStore.fetchPower()              -- GET /power/current
    |   (parallel requests)
    v
[Components render from store state]

[Analytics mounts]
    |
    +-> GET /analytics/summary?period=month
    +-> GET /habits/calendar/all?year=2026&month=3
    |   (parallel requests)
    v
[Charts render]

[Settings mounts]
    |
    +-> GET /settings/
    +-> GET /rewards/
    +-> GET /wishes/
    +-> GET /categories/
    |   (parallel requests)
    v
[Forms render with current values]
```

### State Synchronization Strategy

| Trigger | Action | Why |
|---------|--------|-----|
| Page mount | Fetch from API | Fresh data on navigation |
| After habit check | Use response directly | CheckHabitResponse contains ALL updated state |
| After CRUD (reward, wish, category) | Refetch list | Simple, correct, low-frequency operations |
| Tab refocus (visibilitychange) | Refetch today's habits + power | Catch midnight rollover |
| No polling or WebSocket | N/A | Single-user local app, no concurrent writers |

**Key insight:** The `CheckHabitResponse` is designed to return ALL downstream state changes (daily log, streak, power level, transformation, dragon balls, capsule, quote). The frontend never needs follow-up requests after checking a habit. The single POST response drives all UI updates.

### Zustand Store Shapes

**habitStore:**
```typescript
{
  todayHabits: HabitToday[],       // from GET /habits/today/list
  dailyProgress: {                  // derived from check response
    habitsDue: number,
    habitsCompleted: number,
    completionRate: number,         // 0.0 - 1.0
    completionTier: string,         // 'base' | 'kaio_x3' | 'kaio_x10' | 'kaio_x20'
    xpEarned: number,
  } | null,
  allHabits: HabitResponse[],      // from GET /habits/ (for settings page)
  isLoading: boolean,
}
```

**powerStore:**
```typescript
{
  powerLevel: number,
  transformation: string,          // 'base' | 'ssj' | ... | 'beast'
  transformationName: string,      // 'Super Saiyan 2'
  nextTransformation: string | null,
  nextThreshold: number | null,
  dragonBallsCollected: number,    // 0-7
  wishesGranted: number,
  attributes: AttributeDetail[],   // 4 items: str, vit, int, ki with levels
  soundEnabled: boolean,           // from settings, drives SoundProvider
  theme: 'dark' | 'light',
  isLoading: boolean,
}
```

**rewardStore:**
```typescript
{
  rewards: RewardResponse[],       // capsule loot pool
  wishes: WishResponse[],          // Shenron wish pool
  capsuleHistory: CapsuleHistoryItem[],
  wishHistory: WishHistoryItem[],
  isLoading: boolean,
}
```

**uiStore:**
```typescript
{
  animationQueue: AnimationEvent[],
  currentAnimation: AnimationEvent | null,
  quote: QuoteDetail | null,
  activeModal: 'habitForm' | 'offDay' | 'shenronWish' | null,
  editingHabitId: string | null,   // for edit mode in HabitFormModal
}
```

## Anti-Patterns

### Anti-Pattern 1: Fetching Power Level After Habit Check

**What people do:** Call `checkHabit()`, then call `fetchPower()` to get updated power level.
**Why it's wrong:** `CheckHabitResponse` already contains `power_level`, `transformation`, `transform_change`, `dragon_ball`, `streak`. A second request is wasted and creates a timing gap where the UI shows stale data.
**Do this instead:** Extract all state updates from the single check response. The backend was designed for this exact pattern.

### Anti-Pattern 2: Putting Server State in TanStack Query AND Zustand

**What people do:** Use TanStack Query for fetching, then copy data into Zustand stores.
**Why it's wrong:** Two sources of truth. Cache invalidation becomes a nightmare. Animation triggers need synchronous access to the latest state, but TanStack Query updates asynchronously via its own scheduler.
**Do this instead:** Use Zustand as the single source of truth. Store actions call API functions directly and update state in the same synchronous call.

### Anti-Pattern 3: Playing Animations Simultaneously

**What people do:** When a perfect day triggers (XP popup + capsule + tier change + dragon ball + explosion), render all animation components at once.
**Why it's wrong:** Visual chaos. Sounds overlap. User can't process what happened. The dopamine hit gets diluted instead of compounding.
**Do this instead:** Use the animation queue. Each event plays one at a time. Each calls `dequeue()` on completion. The sequence IS the experience.

### Anti-Pattern 4: Individual Sound File Imports with use-sound

**What people do:** Call `useSound('/assets/sounds/scouter-beep.mp3')` inside HabitCard. With 6 habit cards rendered, 6 Howler instances are created for the same sound.
**Why it's wrong:** Memory waste, audio glitches in React 19 StrictMode (double-mount creates duplicate instances), and sounds play at inconsistent offsets if two habits are checked quickly.
**Do this instead:** SoundProvider creates one Howl instance with audio sprites at app mount. Components call `useAudio().play('scouter_beep')`. One instance, one network request, consistent playback.

### Anti-Pattern 5: Computing Game Logic on the Frontend

**What people do:** Frontend calculates whether a transformation was unlocked, computes XP with the Kaio-ken formula, or decides capsule drop rarity weights.
**Why it's wrong:** Game constants drift between Python and TypeScript. Backend is the authoritative source for stored state. Frontend duplicating logic means bugs where the UI shows "SSJ" but the DB says "base."
**Do this instead:** Backend computes everything. Frontend only renders what it receives. The `lib/constants.ts` file contains display-only data (transformation names for labels, colors for themes) -- never XP formulas or threshold values used for logic.

### Anti-Pattern 6: CSS Animations for Sequenced Overlays

**What people do:** Use CSS `@keyframes` for full-screen animations to avoid library overhead.
**Why it's wrong:** CSS animations cannot coordinate with React component lifecycle. Exit animations require `AnimatePresence` -- CSS has no concept of "animate while unmounting." Sequencing CSS animations requires manual timers that drift across browsers.
**Do this instead:** Use Motion for all overlay/sequenced animations. Use CSS/Tailwind for simple hover/focus/transition states only.

## Integration Points

### Backend API (Existing -- Unchanged)

| Endpoint | Frontend Consumer | Integration Notes |
|----------|-------------------|-------------------|
| `POST /habits/{id}/check` | habitStore.checkHabit() | THE critical endpoint. Response drives 3 stores + animation queue. Requires `{ local_date: "YYYY-MM-DD" }` body. |
| `GET /habits/today/list` | habitStore.fetchToday() | Requires `local_date` query param. Returns habits with completion + streak. |
| `GET /habits/` | habitStore.fetchAll() | Settings page habit management. |
| `POST /habits/` | habitStore.createHabit() | HabitFormModal. Requires attribute + importance. |
| `PUT /habits/{id}` | habitStore.updateHabit() | HabitFormModal edit mode. |
| `DELETE /habits/{id}` | habitStore.archiveHabit() | Soft-delete (is_active=false). |
| `PUT /habits/reorder` | habitStore.reorderHabits() | Batch sort_order update. |
| `GET /habits/{id}/calendar` | CalendarHeatmap | Per-habit monthly calendar. |
| `GET /habits/calendar/all` | CalendarHeatmap | Monthly heatmap with tier colors. Returns CalendarDay[]. |
| `GET /habits/{id}/contribution-graph` | ContributionGraph | 90-day grid. Returns ContributionDay[]. |
| `GET /power/current` | powerStore.fetchPower() | Dashboard load. Returns power, transformation, attributes, dragon balls. |
| `GET /attributes/` | (redundant) | Subset of /power/current -- use /power/current instead. |
| `GET /rewards/` | rewardStore.fetchRewards() | Settings page. |
| `POST/PUT/DELETE /rewards/` | RewardManager | CRUD for capsule loot pool. |
| `GET /wishes/` | rewardStore.fetchWishes() | Settings page. |
| `POST/PUT/DELETE /wishes/` | WishManager | CRUD for Shenron wishes. |
| `POST /wishes/grant` | ShenronAnimation flow | Called when user picks a wish after 7 dragon balls. |
| `GET /quotes/random` | Dashboard welcome | Optional -- check response already includes a quote. |
| `GET/POST/DELETE /off-days/` | OffDayModal | Creates off day, then refetch today's habits. |
| `GET /analytics/summary` | SummaryCards | Accepts `period=week\|month\|all`. |
| `GET /analytics/capsule-history` | CapsuleHistory | Loot drop history list. |
| `GET /analytics/wish-history` | WishHistory | Wish grant log. |
| `GET/PUT /settings/` | Settings page + powerStore | sound_enabled drives global mute. theme drives CSS class. |
| `GET/POST/PUT/DELETE /categories/` | CategoryManager + HabitFormModal | Visual grouping only. |

### CORS Requirement (Backend Modification Needed)

The backend `main.py` does NOT currently include CORS middleware. This MUST be added before the frontend can communicate:

```python
# backend/app/main.py -- add before route registration
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Internal Boundaries (Frontend)

| Boundary | Communication | Notes |
|----------|---------------|-------|
| habitStore <-> powerStore | `usePowerStore.getState()` | Cross-store update after habit check. Zustand allows direct store access outside React. |
| habitStore <-> uiStore | `useUiStore.getState()` | Animation queue population after check response. |
| Components <-> Stores | Zustand selectors | `useHabitStore((s) => s.todayHabits)`. Selectors prevent unnecessary re-renders. |
| Components <-> Audio | React Context | `useAudio().play('scouter_beep')`. No store involvement needed. |
| Animation components <-> uiStore | Subscribe + callback | Watch `currentAnimation`, call `dequeueAnimation()` on exit. |
| Settings <-> Theme | CSS class on `<html>` | `document.documentElement.classList.toggle('dark')`. Tailwind v4 dark mode strategy. |

## Build Order (Dependency-Driven)

Components have hard dependencies. This is the recommended build order:

| Order | What to Build | Depends On | Why This Order |
|-------|---------------|------------|----------------|
| 1 | Types (`types/index.ts`) + API client (`api/client.ts`) + all API modules | Backend running | Foundation. Every store and component imports from these. |
| 2 | Zustand stores (habitStore, powerStore, rewardStore, uiStore) | Types, API modules | Stores are the spine. Components are useless without data. |
| 3 | App shell (Router, Header, PageShell, theme CSS) | Stores (for nav state) | Navigation structure before page content. CORS must be added to backend here. |
| 4 | Dashboard core: HabitList + HabitCard + DailyAuraBar | habitStore | Core interaction loop. Must work before anything else. Verify check flow end-to-end. |
| 5 | Dashboard context: SaiyanAvatar + AttributeBars + DragonBallTracker + StreakDisplay + TransformationTimeline | powerStore | Visual context around the habit list. These are read-only displays. |
| 6 | Audio system (SoundProvider, sprite sheet, useAudio hook) | Independent | Can build in parallel with steps 4-5. Wire to HabitCard after. |
| 7 | Animation layer (AnimationLayer + all overlay components) | uiStore, Motion, Audio | The dopamine layer. Needs stores + audio to be meaningful. |
| 8 | Modals (HabitFormModal, OffDayModal) | habitStore, uiStore | CRUD flows needed for Settings and Dashboard "add habit." |
| 9 | Settings page (RewardManager, WishManager, CategoryManager, settings form) | rewardStore, API | Configuration screens. Lower priority than daily use flow. |
| 10 | Analytics page (CalendarHeatmap, ContributionGraph, AttributeChart, SummaryCards, CapsuleHistory, WishHistory) | analyticsApi, Recharts | Historical views. No dependency on animation system. Can build last. |

**Why this order matters:**
- Steps 1-4 give a working habit check flow with optimistic updates. This is testable end-to-end before any animation work begins.
- Step 6 (audio) is independent and can be developed in parallel with dashboard components.
- Step 7 (animations) is the "dopamine layer" -- it requires a working dashboard underneath to overlay on top of. Building animations first without real data makes integration testing impossible.
- Steps 9-10 are lowest dependency and can be built in parallel by different phases.

## Sources

- [Zustand GitHub - pmndrs/zustand](https://github.com/pmndrs/zustand) - Official repo, multi-store philosophy, selector patterns
- [TkDodo - Working with Zustand](https://tkdodo.eu/blog/working-with-zustand) - Custom hooks, selector best practices
- [Zustand Architecture Patterns at Scale](https://brainhub.eu/library/zustand-architecture-patterns-at-scale) - Store organization, cross-store communication
- [Zustand + React Query discussion](https://medium.com/@freeyeon96/zustand-react-query-new-state-management-7aad6090af56) - When to combine vs choose one
- [Motion (formerly Framer Motion)](https://motion.dev/docs/react) - AnimatePresence, layout animations, React 19 support
- [Motion npm package](https://www.npmjs.com/package/motion) - v12.x, `motion/react` import path, 30M+ monthly downloads
- [Motion performance best practices](https://tillitsdone.com/blogs/framer-motion-performance-tips/) - GPU acceleration, transform properties
- [Howler.js](https://howlerjs.com/) - Audio sprites, preloading, Web Audio API fallback
- [Howler.js audio sprites guide](https://medium.com/game-development-stuff/how-to-create-audiosprites-to-use-with-howler-js-beed5d006ac1) - Sprite sheet creation
- [use-sound npm](https://www.npmjs.com/package/use-sound) - React hook wrapper (evaluated, decided against for this project)
- [ky GitHub](https://github.com/sindresorhus/ky) - 3.6KB fetch wrapper, TypeScript-first
- [Axios vs Fetch vs Ky 2025](https://dev.to/suhaotian/axios-vs-fetch-which-fetch-wrapper-should-i-choose-in-2025-57f2) - Size and feature comparison
- [Building Type-Safe API Client in TypeScript](https://dev.to/limacodes/building-a-type-safe-api-client-in-typescript-beyond-axios-vs-fetch-4a3i) - Typed wrapper patterns

---
*Architecture research for: Saiyan Tracker v1.1 frontend integration*
*Researched: 2026-03-04*
