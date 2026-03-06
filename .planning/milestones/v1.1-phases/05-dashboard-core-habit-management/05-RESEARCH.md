# Phase 5: Dashboard Core & Habit Management - Research

**Researched:** 2026-03-05
**Domain:** React component architecture, mobile-first dashboard UI, optimistic state management, SVG progress visualization
**Confidence:** HIGH

## Summary

Phase 5 builds the main dashboard view -- the heart of the entire app. It replaces the placeholder `Dashboard.tsx` with a rich, game-themed habit tracking interface. The phase covers three major areas: (1) a hero section with Saiyan avatar, scouter HUD, and circular aura gauge, (2) game-state stat displays (attribute bars, Dragon Ball tracker, streaks), and (3) the habit list with optimistic check/uncheck, XP popups, character quotes, and full CRUD via bottom sheet modal.

The existing codebase is well-prepared: Zustand stores already implement optimistic habit checking with rollback, cross-store distribution (power, animations), and modal state management. The API client is fully typed for all 9 endpoints. The design token system has attribute colors, rarity colors, and glow effects predefined in Tailwind v4 `@theme`. The primary work is building React components that consume this infrastructure.

**Primary recommendation:** Build pure UI components that wire directly into the existing Zustand stores. Use Vaul for the bottom sheet modal (unstyled, Tailwind-friendly, mobile-native feel). Use raw SVG for the circular aura gauge (simple `stroke-dashoffset` technique -- no library needed). Use CSS `position: sticky` with a sentinel `IntersectionObserver` for the collapsing hero. Keep all animations minimal (CSS transitions/keyframes only) since Phase 7 handles spring physics and choreographed sequences.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Hero + scrollable list structure -- hero at top, habits scroll below
- Hero section contains: Saiyan avatar with scouter overlay, power level, transformation progress, and daily aura completion gauge
- Hero collapses on scroll to a mini version (aura bar + power level) and expands back when scrolling to top
- Secondary game stats (attribute bars, Dragon Ball tracker, streaks) live in a collapsible panel -- one tap to expand/collapse
- Collapsible panel sits between hero and habit list
- Habits grouped by category with category headers, each card has attribute color accent (left border or badge)
- Medium density cards: top line (emoji + title + checkbox indicator), bottom line (attribute badge + streak + importance indicator)
- Tap anywhere on card to check/uncheck -- biggest tap target for mobile
- Completed habits dim in place (reduced opacity + checkmark) -- no reordering, stable list position
- XP popup text floats up from the checked card
- Aura bar: Circular gauge near/around avatar, scouter readout feel, shows daily completion % with tier label (Kaio-ken x3/x10/x20) at 50%/80%/100%
- Attribute bars: 2x2 grid of quadrant cards, each showing attribute icon, level number, and XP fill toward next level
- Dragon Ball tracker: Horizontal row of 7 circles -- collected balls glow orange with star count, empty slots are dim outlines
- Avatar: Character portrait of current transformation form with scouter-style HUD overlay showing power level number, form name, and progress bar to next transformation
- Streaks: Displayed per habit (current/best) in the habit card, plus potentially a main streak display
- Create/edit form presented as bottom sheet modal sliding up from bottom (~80% screen height), scrollable, swipe down to dismiss
- Progressive disclosure: essential fields first (title, attribute, importance, category), expandable "More options" section for the rest (frequency, custom_days, description, target_time, dates)
- Same form used for edit (pre-populated) and create
- Delete via confirmation dialog or archive (set is_active=false) -- preserves streak data
- Quote appears after habit check as a styled toast notification with character avatar, quote text, and character name
- Auto-dismisses after 3-4 seconds, non-blocking

### Claude's Discretion
- Exact collapse/expand transition for hero section
- Collapsible panel animation and toggle design
- Spacing, typography, and card shadow/border details
- Loading skeleton design for initial data fetch
- Error state handling for failed API calls
- Empty state when no habits exist (suggest creating first habit)
- Sort order within category groups

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DASH-01 | User can see all active habits grouped by category with completion status | Category grouping pattern using `Array.reduce` + `CategoryResponse` from rewardStore; habit data from `habitStore.todayHabits` |
| DASH-02 | User can check/uncheck a habit and see optimistic UI toggle with rollback on error | Already implemented in `habitStore.checkHabit` -- UI just needs to call it and reflect state |
| DASH-03 | Daily aura progress bar animates from 0% to current completion with spring physics | SVG circular gauge with `stroke-dashoffset`; CSS `transition` for basic animation in Phase 5, spring physics deferred to Phase 7 |
| DASH-04 | Aura bar shows tier label (Kaio-ken x3/x10/x20) updating at 50%/80%/100% thresholds | Computed from `daily_log.completion_tier` in CheckHabitResponse; derive from habits completed/due ratio |
| DASH-05 | Four RPG attribute bars (STR/VIT/INT/KI) display current level and XP fill toward next level | `powerStore.attributes` provides `AttributeDetail[]` with `level`, `progress_percent`, `xp_for_current_level`, `xp_for_next_level`; attr colors in Tailwind tokens |
| DASH-06 | Dragon Ball tracker shows 7 slots with glowing filled balls and dim empty slots | `powerStore.dragonBallsCollected` (0-7); SVG circles with conditional glow styling |
| DASH-07 | Saiyan avatar displays current transformation form with form-appropriate aura effect | `powerStore.transformation` key maps to image asset; STATE.md notes 10 form art assets must be sourced |
| DASH-08 | Avatar shows power level in scouter-style display and progress bar to next form | `powerStore.powerLevel`, `nextTransformation`, `nextThreshold`; progress = powerLevel / nextThreshold |
| DASH-09 | Streak display shows current and best streak with visual scaling | Per-habit streaks in `HabitTodayResponse.streak_current/streak_best`; main streak derivable from daily_log |
| DASH-10 | Character quote appears after habit check with character avatar, text, and attribution | `CheckHabitResponse.quote` provides `QuoteDetail` with character, quote_text, source_saga, avatar_path; display as custom toast |
| DASH-11 | User can create a new habit via modal (title, description, importance, attribute, frequency, category) | Vaul bottom sheet + form; call `habitsApi.create()` then refresh `habitStore.fetchToday()` |
| DASH-12 | User can edit and delete existing habits | Pre-populate same form with habit data; `habitsApi.update()` / `habitsApi.delete()` or set `is_active=false` |
| DASH-13 | XP popup floats up from habit card showing "+N [ATTR] XP" in attribute color | CSS `@keyframes` animation with `position: absolute`, `translateY`, and `opacity` fade; triggered from animation queue or inline |
</phase_requirements>

## Standard Stack

### Core (already installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.2.0 | UI framework | Already installed |
| Zustand | 5.0.11 | State management | Already installed, stores built |
| react-hot-toast | 2.6.0 | Toast notifications | Already installed, used for errors |
| lucide-react | 0.500.0 | Icons | Already installed |
| Tailwind CSS | 4.2.1 | Styling | Already installed with DBZ theme tokens |
| ky | 1.14.3 | HTTP client | Already installed, API layer built |

### New Dependencies
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|-------------|
| vaul | ^1.1.2 | Bottom sheet drawer | Unstyled (Tailwind-friendly), mobile-native swipe-to-dismiss, snap points, built on Radix Dialog for accessibility, MIT license, 7.4k GitHub stars, used by Vercel |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Vaul | react-modal-sheet | react-modal-sheet depends on Motion (framer-motion successor, heavier); Vaul is lighter with Radix Dialog dependency only |
| Vaul | Hand-rolled bottom sheet | Swipe gesture physics, scroll locking, keyboard avoidance, backdrop dismiss -- too many edge cases to hand-roll |
| SVG circular gauge | react-circular-progressbar | Library adds unnecessary abstraction; raw SVG `stroke-dashoffset` is ~20 lines of code |

**Installation:**
```bash
cd frontend && npm install vaul
```

## Architecture Patterns

### Recommended Component Structure
```
src/
├── components/
│   ├── dashboard/
│   │   ├── HeroSection.tsx          # Avatar + scouter HUD + aura gauge (full)
│   │   ├── MiniHero.tsx             # Collapsed hero (aura bar + power level)
│   │   ├── AuraGauge.tsx            # SVG circular progress ring
│   │   ├── SaiyanAvatar.tsx         # Character portrait + aura effect
│   │   ├── ScouterHUD.tsx           # Power level + form name + next form progress
│   │   ├── StatsPanel.tsx           # Collapsible panel wrapper
│   │   ├── AttributeGrid.tsx        # 2x2 grid of attribute cards
│   │   ├── AttributeBar.tsx         # Single attribute: icon + level + XP fill
│   │   ├── DragonBallTracker.tsx    # 7 ball slots
│   │   ├── StreakDisplay.tsx         # Current/best streak
│   │   ├── HabitList.tsx            # Category-grouped habit cards
│   │   ├── CategoryGroup.tsx        # Category header + habit cards
│   │   ├── HabitCard.tsx            # Single habit card with tap-to-check
│   │   ├── XpPopup.tsx              # Floating "+N XP" text
│   │   └── CharacterQuote.tsx       # Quote toast notification
│   ├── habit/
│   │   ├── HabitFormSheet.tsx        # Vaul bottom sheet wrapper
│   │   ├── HabitForm.tsx            # Form fields (create/edit)
│   │   └── DeleteConfirmDialog.tsx  # Delete confirmation
│   └── common/
│       ├── LoadingScreen.tsx        # (existing)
│       ├── LoadingSkeleton.tsx      # Skeleton placeholder
│       └── EmptyState.tsx           # No habits prompt
├── pages/
│   └── Dashboard.tsx                # Orchestrates all dashboard components
```

### Pattern 1: Collapsing Hero with Sticky Mini-Header
**What:** Full hero visible at top; when user scrolls past it, a slim sticky bar replaces it with key info (aura bar + power level).
**When to use:** Mobile-first layouts where screen real estate matters but context needs to persist.
**Implementation:**
```typescript
// Use IntersectionObserver with a sentinel element
function Dashboard() {
  const [heroVisible, setHeroVisible] = useState(true);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => setHeroVisible(entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <div>
      {/* Sticky mini hero -- only shows when full hero scrolls out */}
      {!heroVisible && (
        <div className="fixed top-0 left-0 right-0 z-30 bg-space-800 border-b border-space-700 px-4 py-2">
          <MiniHero />
        </div>
      )}
      {/* Sentinel: 1px element at top of hero */}
      <div ref={sentinelRef} className="h-px" />
      <HeroSection />
      <StatsPanel />
      <HabitList />
    </div>
  );
}
```
**Why not CSS-only `position: sticky`:** The hero needs to *transform* into a different component (mini version), not just stick. IntersectionObserver gives us a boolean to conditionally render the mini hero.

### Pattern 2: SVG Circular Aura Gauge
**What:** SVG circle with `stroke-dasharray` and `stroke-dashoffset` for progress.
**When to use:** Circular progress indicators where you need full visual control.
**Implementation:**
```typescript
interface AuraGaugeProps {
  percent: number; // 0-100
  tier: string;    // 'base' | 'kaioken_x3' | 'kaioken_x10' | 'kaioken_x20'
  size?: number;
}

function AuraGauge({ percent, tier, size = 120 }: AuraGaugeProps) {
  const radius = (size - 8) / 2; // 8 = strokeWidth * 2
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  const tierLabel = {
    base: '',
    kaioken_x3: 'Kaio-ken x3',
    kaioken_x10: 'Kaio-ken x10',
    kaioken_x20: 'Kaio-ken x20',
  }[tier] ?? '';

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      {/* Track */}
      <circle cx={size/2} cy={size/2} r={radius}
        fill="none" stroke="var(--color-space-700)" strokeWidth={4} />
      {/* Progress */}
      <circle cx={size/2} cy={size/2} r={radius}
        fill="none" stroke="var(--color-saiyan-500)" strokeWidth={4}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="transition-[stroke-dashoffset] duration-700 ease-out" />
    </svg>
  );
}
```

### Pattern 3: Category Grouping from Flat Habit List
**What:** Group `todayHabits` by `category_id`, using categories from `rewardStore`.
**Implementation:**
```typescript
function groupByCategory(
  habits: HabitTodayResponse[],
  categories: CategoryResponse[]
): { category: CategoryResponse | null; habits: HabitTodayResponse[] }[] {
  const catMap = new Map(categories.map(c => [c.id, c]));
  const groups = new Map<string | null, HabitTodayResponse[]>();

  for (const habit of habits) {
    const key = habit.category_id;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(habit);
  }

  // Sort: categorized groups by category sort_order, uncategorized last
  return Array.from(groups.entries())
    .sort(([a], [b]) => {
      if (a === null) return 1;
      if (b === null) return -1;
      return (catMap.get(a)?.sort_order ?? 0) - (catMap.get(b)?.sort_order ?? 0);
    })
    .map(([catId, habits]) => ({
      category: catId ? catMap.get(catId) ?? null : null,
      habits,
    }));
}
```

### Pattern 4: XP Popup with CSS Keyframe Animation
**What:** Floating text that appears at habit card position and animates upward while fading.
**Implementation:**
```typescript
// CSS keyframes in index.css or component
// @keyframes xp-float {
//   0% { opacity: 1; transform: translateY(0); }
//   100% { opacity: 0; transform: translateY(-60px); }
// }

function XpPopup({ amount, attribute, onDone }: {
  amount: number;
  attribute: Attribute;
  onDone: () => void;
}) {
  const colorMap: Record<Attribute, string> = {
    str: 'text-attr-str',
    vit: 'text-attr-vit',
    int: 'text-attr-int',
    ki: 'text-attr-ki',
  };

  useEffect(() => {
    const timer = setTimeout(onDone, 1000);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <span
      className={`absolute -top-2 right-4 text-sm font-bold ${colorMap[attribute]} pointer-events-none`}
      style={{ animation: 'xp-float 1s ease-out forwards' }}
    >
      +{amount} {attribute.toUpperCase()} XP
    </span>
  );
}
```

### Pattern 5: Vaul Bottom Sheet for Habit CRUD
**What:** Unstyled drawer that slides up from bottom, dismissible by swipe or backdrop tap.
**Implementation:**
```typescript
import { Drawer } from 'vaul';

function HabitFormSheet({ open, onClose, habit }: {
  open: boolean;
  onClose: () => void;
  habit?: HabitTodayResponse; // undefined = create mode
}) {
  return (
    <Drawer.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 bg-space-800 rounded-t-2xl max-h-[85vh] overflow-y-auto">
          <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-space-600" />
          <Drawer.Title className="px-4 pt-4 text-lg font-bold text-text-primary">
            {habit ? 'Edit Habit' : 'New Habit'}
          </Drawer.Title>
          <HabitForm habit={habit} onSuccess={onClose} />
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
```

### Pattern 6: Character Quote Toast
**What:** Custom toast with avatar, quote text, and character name -- appears after habit check.
**Implementation:**
```typescript
import toast from 'react-hot-toast';

function showCharacterQuote(quote: QuoteDetail) {
  toast.custom(
    (t) => (
      <div className={`flex items-start gap-3 bg-space-700 border border-space-600 rounded-lg px-4 py-3 shadow-lg max-w-sm ${t.visible ? 'animate-enter' : 'animate-leave'}`}>
        <img src={quote.avatar_path} alt={quote.character} className="w-10 h-10 rounded-full" />
        <div>
          <p className="text-text-primary text-sm italic">"{quote.quote_text}"</p>
          <p className="text-text-muted text-xs mt-1">— {quote.character}</p>
        </div>
      </div>
    ),
    { duration: 3500, position: 'top-center' }
  );
}
```

### Anti-Patterns to Avoid
- **Prop-drilling store values through many layers:** Use `useHabitStore(s => s.todayHabits)` directly in the component that needs it, not passing through Dashboard -> HabitList -> HabitCard.
- **Re-rendering entire list on single habit check:** Use `useShallow` when selecting multiple store values; individual `HabitCard` should select only its own habit data via selector or receive data via props from a memoized list.
- **Scroll event listeners for hero collapse:** Use `IntersectionObserver` -- it's async and offloaded to browser rendering engine, far more efficient than `scroll` event throttling.
- **Building spring physics now:** Phase 5 uses CSS `transition` only. Phase 7 adds spring physics. Don't import framer-motion or motion in this phase.
- **Blocking UI on API calls for habit check:** The optimistic pattern is already in `habitStore.checkHabit`. Never `await` the check before updating the UI.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Bottom sheet modal | Custom drag handler + touch events + scroll lock + backdrop dismiss | Vaul | Swipe physics, scroll locking inside drawer content, keyboard avoidance, focus trapping, accessibility (ARIA) -- dozens of edge cases |
| Toast notifications | Custom notification system | react-hot-toast (already installed) | Stacking, auto-dismiss timing, enter/exit animations, positioning |
| HTTP error handling | Custom fetch wrapper | ky (already installed) | Retry logic, response parsing, error extraction already configured |
| Form validation | Custom validation logic | HTML5 `required` + `pattern` + `type` attributes | For a single-user app, native browser validation is sufficient; no need for Zod/Yup/react-hook-form overhead |

**Key insight:** This phase has a large surface area (13 requirements) but most of the hard infrastructure (stores, API client, types, design tokens) is already built. The work is primarily UI composition -- assembling components that consume existing state. Don't add complexity where simple solutions work.

## Common Pitfalls

### Pitfall 1: Stale Closure in Optimistic Check Handler
**What goes wrong:** HabitCard captures `todayHabits` in a closure, checks a habit, but the closure has stale data if another check was in-flight.
**Why it happens:** Zustand's `get()` inside `checkHabit` already handles this correctly by reading current state at rollback time. But UI components might capture stale values via `useState`.
**How to avoid:** Always read from store via selectors, never cache habit data in local component state. The store is the single source of truth.
**Warning signs:** Checking two habits quickly causes one to visually revert.

### Pitfall 2: XP Popup Positioning Drift
**What goes wrong:** XP popup appears at wrong position because `position: absolute` is relative to nearest positioned ancestor, which may not be the card.
**Why it happens:** Missing `position: relative` on the HabitCard container.
**How to avoid:** Always add `relative` to the HabitCard wrapper div so absolute children position correctly.
**Warning signs:** Popup appears at page top or overlaps other cards.

### Pitfall 3: Overloading the Animation Queue
**What goes wrong:** Multiple animation events (xp_popup, tier_change, dragon_ball) fire simultaneously on a single habit check, creating visual chaos.
**Why it happens:** `habitStore.checkHabit` enqueues all events from the API response.
**How to avoid:** In Phase 5, only consume `xp_popup` events immediately (inline with habit card). Other animation types (tier_change, perfect_day, capsule_drop, dragon_ball, transformation) remain in the queue for Phase 7 to choreograph. Don't try to display them all in Phase 5.
**Warning signs:** Multiple overlapping popups/toasts appearing simultaneously.

### Pitfall 4: Category Fetch Race Condition
**What goes wrong:** Dashboard renders before categories are loaded, so habit grouping fails.
**Why it happens:** `useInitApp` calls `fetchCategories()` but doesn't guarantee it completes before habits.
**How to avoid:** `useInitApp` already uses `Promise.all` -- all data loads before `isReady` becomes true. Trust the loading guard in AppShell.
**Warning signs:** Habits appear ungrouped briefly, then snap into groups.

### Pitfall 5: Bottom Sheet Scroll vs Page Scroll Conflict
**What goes wrong:** Scrolling within the bottom sheet form also scrolls the page behind it.
**Why it happens:** Touch events propagate to the page body.
**How to avoid:** Vaul handles this internally with scroll locking. Don't add custom `overflow: hidden` to body -- let Vaul manage it.
**Warning signs:** Background scrolls while drawer is open.

### Pitfall 6: Avatar Images Not Found
**What goes wrong:** `SaiyanAvatar` shows broken image because transformation form art assets don't exist yet.
**Why it happens:** STATE.md notes "10 transformation form art assets must be sourced before Phase 5 avatar component."
**How to avoid:** Use a placeholder/fallback image strategy. Map transformation keys to asset paths with a fallback: `const src = AVATAR_MAP[transformation] ?? '/assets/avatar/base.webp'`. Create a `/public/assets/avatar/` directory with at least a base placeholder.
**Warning signs:** Broken image icon on dashboard.

## Code Examples

### Connecting HabitCard to Store
```typescript
import { useHabitStore } from '../../store/habitStore';
import type { HabitTodayResponse, Attribute } from '../../types';

const ATTR_COLORS: Record<Attribute, string> = {
  str: 'border-attr-str',
  vit: 'border-attr-vit',
  int: 'border-attr-int',
  ki: 'border-attr-ki',
};

function HabitCard({ habit }: { habit: HabitTodayResponse }) {
  const checkHabit = useHabitStore(s => s.checkHabit);
  const [showXp, setShowXp] = useState(false);
  const [xpAmount, setXpAmount] = useState(0);

  const handleTap = async () => {
    try {
      const result = await checkHabit(habit.id, new Date().toISOString().split('T')[0]);
      if (result.is_checking && result.attribute_xp_awarded > 0) {
        setXpAmount(result.attribute_xp_awarded);
        setShowXp(true);
      }
      if (result.quote) {
        showCharacterQuote(result.quote);
      }
    } catch {
      // Rollback handled by store, error toast shown by store
    }
  };

  return (
    <div
      className={`relative border-l-4 ${ATTR_COLORS[habit.attribute]} bg-space-800 rounded-lg p-3 cursor-pointer transition-opacity ${habit.completed ? 'opacity-50' : ''}`}
      onClick={handleTap}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleTap()}
    >
      {/* Card content */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span>{habit.icon_emoji}</span>
          <span className="text-text-primary font-medium">{habit.title}</span>
        </div>
        {habit.completed && <CheckIcon className="w-5 h-5 text-success" />}
      </div>
      <div className="flex items-center gap-3 mt-1 text-xs text-text-secondary">
        <span className="uppercase">{habit.attribute}</span>
        {habit.streak_current > 0 && <span>🔥 {habit.streak_current}</span>}
        <span className="capitalize">{habit.importance}</span>
      </div>
      {/* XP Popup */}
      {showXp && (
        <XpPopup amount={xpAmount} attribute={habit.attribute} onDone={() => setShowXp(false)} />
      )}
    </div>
  );
}
```

### Computing Aura Percentage from Habits
```typescript
function useAuraProgress() {
  const todayHabits = useHabitStore(s => s.todayHabits);
  const due = todayHabits.length;
  const completed = todayHabits.filter(h => h.completed).length;
  const percent = due > 0 ? Math.round((completed / due) * 100) : 0;

  let tier = 'base';
  if (percent >= 100) tier = 'kaioken_x20';
  else if (percent >= 80) tier = 'kaioken_x10';
  else if (percent >= 50) tier = 'kaioken_x3';

  return { percent, tier, completed, due };
}
```

### Dragon Ball Tracker
```typescript
function DragonBallTracker({ collected }: { collected: number }) {
  return (
    <div className="flex items-center gap-2 justify-center">
      {Array.from({ length: 7 }, (_, i) => (
        <div
          key={i}
          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${
            i < collected
              ? 'bg-warning border-warning text-space-900 shadow-[0_0_8px_var(--color-warning)]'
              : 'border-space-600 text-space-600'
          }`}
        >
          {i + 1}★
        </div>
      ))}
    </div>
  );
}
```

### Lucide Icons for Attributes
```typescript
import { Swords, Heart, Brain, Flame } from 'lucide-react';

const ATTR_ICONS: Record<Attribute, React.FC<{ className?: string }>> = {
  str: Swords,   // Strength - combat
  vit: Heart,    // Vitality - life/health
  int: Brain,    // Intelligence - mind
  ki: Flame,     // Ki Control - energy/fire
};
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Framer Motion | Motion (renamed) | 2024 | Motion is the successor to framer-motion; BUT Phase 5 uses CSS transitions only -- no motion library needed |
| react-spring-bottom-sheet | Vaul | 2023 | react-spring-bottom-sheet is unmaintained; Vaul is the current standard for web bottom sheets |
| useEffect scroll listener | IntersectionObserver | Stable since 2019 | More performant, no throttle/debounce needed, browser-native |
| Context for modals | Zustand modal state | Project convention | `uiStore.openModal/closeModal` already established |

**Deprecated/outdated:**
- `react-spring-bottom-sheet`: No longer maintained, last published 2022
- `framer-motion` package name: Renamed to `motion` but project doesn't need either for Phase 5

## Open Questions

1. **Avatar art assets**
   - What we know: 10 transformation forms need images (base, ssj, ssj2, ssj3, ssg, ssb, ui_sign, mui, ue, beast). STATE.md flags this as a blocker.
   - What's unclear: Whether assets have been sourced yet, what format/dimensions they should be.
   - Recommendation: Use a single placeholder image for all forms. Map transformation keys to paths: `/assets/avatars/{form_key}.webp`. Create the mapping code regardless -- assets can be dropped in later without code changes.

2. **Quote avatar images**
   - What we know: `QuoteDetail.avatar_path` references character avatar images for quote toasts.
   - What's unclear: Whether these images exist in the backend or need to be bundled.
   - Recommendation: Use a fallback icon (lucide `User` icon) when avatar_path fails to load.

3. **Habit CRUD store actions**
   - What we know: `habitsApi.create/update/delete` exist in the API client. `rewardStore` has CRUD patterns for rewards/wishes/categories.
   - What's unclear: Whether to add habit CRUD actions to `habitStore` or call the API directly from the form component.
   - Recommendation: Add `createHabit`, `updateHabit`, `deleteHabit` actions to `habitStore` following the same pattern as `rewardStore` CRUD. This keeps the store as the single mutation layer and ensures `todayHabits` refreshes after mutations.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.0.18 + @testing-library/react 16.3.2 |
| Config file | `frontend/vitest.config.ts` |
| Quick run command | `cd frontend && npx vitest run --reporter=verbose` |
| Full suite command | `cd frontend && npx vitest run` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DASH-01 | Habits render grouped by category | unit | `cd frontend && npx vitest run src/__tests__/dashboard-habits.test.tsx -t "groups habits by category"` | No - Wave 0 |
| DASH-02 | Check/uncheck toggles completed state optimistically | unit | `cd frontend && npx vitest run src/__tests__/dashboard-habits.test.tsx -t "optimistic toggle"` | No - Wave 0 |
| DASH-03 | Aura gauge renders correct percentage | unit | `cd frontend && npx vitest run src/__tests__/aura-gauge.test.tsx` | No - Wave 0 |
| DASH-04 | Tier label updates at thresholds | unit | `cd frontend && npx vitest run src/__tests__/aura-gauge.test.tsx -t "tier label"` | No - Wave 0 |
| DASH-05 | Attribute bars display level and progress | unit | `cd frontend && npx vitest run src/__tests__/game-stats.test.tsx -t "attribute bars"` | No - Wave 0 |
| DASH-06 | Dragon Ball tracker shows correct filled/empty slots | unit | `cd frontend && npx vitest run src/__tests__/game-stats.test.tsx -t "dragon ball tracker"` | No - Wave 0 |
| DASH-07 | Avatar renders transformation image | unit | `cd frontend && npx vitest run src/__tests__/hero-section.test.tsx -t "avatar"` | No - Wave 0 |
| DASH-08 | Scouter HUD shows power level and next form progress | unit | `cd frontend && npx vitest run src/__tests__/hero-section.test.tsx -t "scouter"` | No - Wave 0 |
| DASH-09 | Streak display shows current and best | unit | `cd frontend && npx vitest run src/__tests__/dashboard-habits.test.tsx -t "streak"` | No - Wave 0 |
| DASH-10 | Character quote toast renders after check | unit | `cd frontend && npx vitest run src/__tests__/dashboard-habits.test.tsx -t "character quote"` | No - Wave 0 |
| DASH-11 | Habit form creates new habit | unit | `cd frontend && npx vitest run src/__tests__/habit-form.test.tsx -t "create"` | No - Wave 0 |
| DASH-12 | Habit form edits and deletes habit | unit | `cd frontend && npx vitest run src/__tests__/habit-form.test.tsx -t "edit"` | No - Wave 0 |
| DASH-13 | XP popup renders with correct amount and color | unit | `cd frontend && npx vitest run src/__tests__/dashboard-habits.test.tsx -t "xp popup"` | No - Wave 0 |

### Sampling Rate
- **Per task commit:** `cd frontend && npx vitest run --reporter=verbose`
- **Per wave merge:** `cd frontend && npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `frontend/src/__tests__/dashboard-habits.test.tsx` -- covers DASH-01, DASH-02, DASH-09, DASH-10, DASH-13
- [ ] `frontend/src/__tests__/aura-gauge.test.tsx` -- covers DASH-03, DASH-04
- [ ] `frontend/src/__tests__/game-stats.test.tsx` -- covers DASH-05, DASH-06
- [ ] `frontend/src/__tests__/hero-section.test.tsx` -- covers DASH-07, DASH-08
- [ ] `frontend/src/__tests__/habit-form.test.tsx` -- covers DASH-11, DASH-12
- [ ] Mock fixtures for `HabitTodayResponse[]`, `PowerResponse`, `CategoryResponse[]`, `CheckHabitResponse` shared across test files

## Sources

### Primary (HIGH confidence)
- Existing codebase analysis: `habitStore.ts`, `powerStore.ts`, `uiStore.ts`, `rewardStore.ts`, `api.ts`, `types/index.ts`, `index.css`, `AppShell.tsx`, `useInitApp.ts`
- Vaul GitHub: https://github.com/emilkowalski/vaul -- API, snap points, unstyled approach
- Lucide React icons: https://lucide.dev/icons/ -- Swords, Heart, Brain, Flame icons confirmed

### Secondary (MEDIUM confidence)
- SVG circular progress technique: https://blog.logrocket.com/build-svg-circular-progress-component-react-hooks/ -- stroke-dasharray/dashoffset pattern
- IntersectionObserver sticky header: https://ygongdev.github.io/blog/categories/web-development/how-to-build-a-collapsible-sticky-header-with-intersection-observer/ -- sentinel pattern
- react-hot-toast custom toasts: https://react-hot-toast.com/docs/toast -- `toast.custom()` API for character quotes

### Tertiary (LOW confidence)
- None -- all findings verified against official sources or codebase

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Only one new dependency (Vaul); everything else already installed and verified working
- Architecture: HIGH - Patterns derived from existing codebase conventions (Zustand selectors, Tailwind tokens, ky API client) and well-documented web standards (IntersectionObserver, SVG)
- Pitfalls: HIGH - Pitfalls identified from actual codebase patterns (optimistic check flow, store architecture, asset dependencies)

**Research date:** 2026-03-05
**Valid until:** 2026-04-05 (30 days -- stable domain, no fast-moving dependencies)
