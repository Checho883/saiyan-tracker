# Phase 21: Enhanced Analytics Views - Research

**Researched:** 2026-03-08
**Domain:** React frontend analytics components (recharts, zustand, ky)
**Confidence:** HIGH

## Summary

Phase 21 builds four new analytics view components on the existing Analytics page. Two backend endpoints already exist from Phase 19 (`/analytics/off-day-summary` and `/analytics/completion-trend`), so the off-day card (ANLYT-01) and completion trend cards (ANLYT-02) are pure frontend work consuming existing API data. The streak rankings (ANLYT-03) and best/worst days (ANLYT-04) require either new backend endpoints or frontend-side computation from already-available data.

The existing analytics page (`Analytics.tsx`) follows a clear pattern: a container page imports self-contained card components, each fetching their own data via `analyticsApi` or receiving props. The project uses recharts 3.7 for charts, zustand 5 for state, ky for HTTP, Tailwind CSS 4 for styling, and motion (framer-motion successor) for animations. All analytics components use the DBZ scouter/space theme with `bg-space-800` cards, `text-saiyan-*` accents, and `clipPath` polygon cuts.

For streak rankings: the `/habits/today/list` endpoint already returns `streak_current` per habit, so the frontend can sort habits by current streak without a new endpoint. For best/worst days: the existing `/habits/calendar/all` endpoint returns `CalendarDay[]` with `completion_tier` and `xp_earned` per day, which can be sorted to find best/worst. Both can be computed client-side from data already fetched.

**Primary recommendation:** Build four new card components plus wire up two new API client methods for off-day-summary and completion-trend endpoints. Streak rankings and best/worst days derive from existing data already available on the page or in the habit store.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| ANLYT-01 | Off-day impact analytics (total off-days, XP missed, streaks preserved, reason breakdown) | Backend `/analytics/off-day-summary` endpoint exists (Phase 19) returning `OffDaySummary` schema. Need new `analyticsApi.offDaySummary()` client method + `OffDayAnalyticsCard` component with reason breakdown chart via recharts PieChart or BarChart. |
| ANLYT-02 | Weekly/monthly completion rate cards with period-over-period comparison | Backend `/analytics/completion-trend` endpoint exists (Phase 19) returning `CompletionTrend` schema with `weekly_rate`, `weekly_delta`, `monthly_rate`, `monthly_delta`. Need `analyticsApi.completionTrend()` client method + `CompletionTrendCards` component with delta arrows. |
| ANLYT-03 | Habits ranked by current streak length (power rankings) | `/habits/today/list` already returns `streak_current` per habit. Can sort client-side from habitStore data. Need `StreakRankings` component displaying sorted list with rank numbers and streak badges. |
| ANLYT-04 | Best and worst performing days highlighted in analytics view | `/habits/calendar/all` returns `CalendarDay[]` with `completion_tier` and `xp_earned`. Can compute best/worst from existing `calendarDays` prop. Need `BestWorstDays` component showing top/bottom days by completion rate or XP. |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.2 | UI framework | Already in use |
| recharts | 3.7 | Charts (pie/bar for reason breakdown) | Already used for AttributeChart, PowerLevelChart |
| zustand | 5.0 | State management (habitStore has streak data) | Already used throughout |
| ky | 1.14 | HTTP client for new API methods | Already used in `api.ts` |
| Tailwind CSS | 4.2 | Styling | Already used throughout |
| motion | 12.35 | Entry animations | Already used in analytics components |
| lucide-react | 0.500 | Icons (arrows, trophies, etc.) | Already used throughout |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @floating-ui/react | 0.27 | Tooltips/popovers | Only if day detail popovers needed (already in CalendarHeatmap) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| recharts PieChart | Custom SVG donut | recharts is already installed, consistent with other charts |
| New backend endpoint for rankings | Client-side sort of habitStore data | Client-side is simpler, data already available, no round-trip |

**Installation:**
```bash
# No new packages needed - all libraries already installed
```

## Architecture Patterns

### Recommended Project Structure
```
frontend/src/
├── components/analytics/
│   ├── OffDayAnalyticsCard.tsx    # NEW - ANLYT-01
│   ├── CompletionTrendCards.tsx   # NEW - ANLYT-02
│   ├── StreakRankings.tsx         # NEW - ANLYT-03
│   ├── BestWorstDays.tsx         # NEW - ANLYT-04
│   ├── StatCards.tsx             # existing
│   ├── CalendarHeatmap.tsx       # existing
│   └── ...                      # other existing components
├── hooks/
│   └── useAnalyticsData.ts      # MODIFY - add off-day and trend fetching
├── services/
│   └── api.ts                   # MODIFY - add analyticsApi.offDaySummary() and .completionTrend()
├── types/
│   └── index.ts                 # MODIFY - add OffDaySummary and CompletionTrend types
└── pages/
    └── Analytics.tsx             # MODIFY - import and render new components
```

### Pattern 1: Self-Contained Analytics Card
**What:** Each analytics card is a standalone component that either receives data via props or fetches its own data via hooks.
**When to use:** For all four new components.
**Example:**
```typescript
// Follows existing StatCards pattern from the codebase
interface OffDayAnalyticsCardProps {
  data: OffDaySummary | null;
}

export function OffDayAnalyticsCard({ data }: OffDayAnalyticsCardProps) {
  if (!data) return <LoadingSkeleton />;

  return (
    <div className="bg-space-800 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-text-primary mb-3">Off-Day Impact</h3>
      {/* stat grid + reason breakdown chart */}
    </div>
  );
}
```

### Pattern 2: API Method Extension
**What:** Add new methods to the existing `analyticsApi` object in `api.ts`.
**When to use:** For off-day-summary and completion-trend endpoints.
**Example:**
```typescript
// Follows existing analyticsApi pattern in api.ts
export const analyticsApi = {
  // existing methods...
  summary: (period?: 'week' | 'month' | 'all') =>
    api.get('analytics/summary', { searchParams: period ? { period } : {} }).json<AnalyticsSummary>(),
  // new methods:
  offDaySummary: (period?: 'week' | 'month' | 'all') =>
    api.get('analytics/off-day-summary', { searchParams: period ? { period } : {} }).json<OffDaySummary>(),
  completionTrend: () =>
    api.get('analytics/completion-trend').json<CompletionTrend>(),
};
```

### Pattern 3: Delta Arrow Indicator
**What:** Show trend direction with colored arrows for period-over-period comparisons.
**When to use:** CompletionTrendCards (ANLYT-02).
**Example:**
```typescript
// Using lucide-react icons (already in project)
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

function DeltaIndicator({ delta }: { delta: number }) {
  if (delta > 0) return <TrendingUp className="w-4 h-4 text-green-400" />;
  if (delta < 0) return <TrendingDown className="w-4 h-4 text-red-400" />;
  return <Minus className="w-4 h-4 text-text-muted" />;
}
```

### Pattern 4: Derived Data from Existing State
**What:** For ANLYT-03 and ANLYT-04, compute rankings and best/worst from data already available.
**When to use:** When the required data is already fetched by existing hooks/stores.
**Example:**
```typescript
// Streak rankings from habitStore (already has streak_current)
const habits = useHabitStore((s) => s.habits);
const ranked = [...habits]
  .filter((h) => h.streak_current > 0)
  .sort((a, b) => b.streak_current - a.streak_current);

// Best/worst days from calendarDays (already fetched by useAnalyticsData)
const sorted = [...calendarDays]
  .filter((d) => !d.is_off_day)
  .sort((a, b) => b.xp_earned - a.xp_earned);
const best = sorted.slice(0, 3);
const worst = sorted.slice(-3).reverse();
```

### Anti-Patterns to Avoid
- **Creating new backend endpoints for data already available client-side:** The habit store already has streak data per habit, and calendarDays already has per-day completion data. Don't add backend endpoints for streak rankings or best/worst days.
- **Fetching data in each card independently when a shared hook already exists:** Extend `useAnalyticsData` hook rather than creating separate fetches in each card.
- **Using raw numbers without formatting:** Always format rates as percentages, XP with `.toLocaleString()`, and deltas with sign prefix.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Pie/donut chart for reason breakdown | Custom SVG | recharts `PieChart` + `Cell` | Already installed, handles labels, tooltips, responsive |
| Trend arrows | Custom arrow SVGs | lucide-react `TrendingUp/Down/Minus` | Already installed, consistent icon set |
| Loading skeletons | Custom shimmer divs | Follow existing `LoadingSkeleton` pattern from StatCards.tsx | Consistent UX, already proven |
| Period filtering | New filter UI | Reuse existing `PeriodSelector` component | Already handles week/month/all |

**Key insight:** This phase is pure UI composition from existing data and UI patterns. Every building block (charts, icons, API client, theming) is already in the project.

## Common Pitfalls

### Pitfall 1: Race Conditions in Multi-Fetch Hook
**What goes wrong:** `useAnalyticsData` hook needs to fetch off-day and trend data alongside existing summary data. If the component unmounts mid-fetch, state updates on unmounted components cause warnings.
**Why it happens:** Multiple concurrent API calls without proper cleanup.
**How to avoid:** Use the existing `cancelled` flag pattern already in `useAnalyticsData.ts` (lines 17-29). Apply the same pattern for new fetches.
**Warning signs:** Console warnings about state updates on unmounted components.

### Pitfall 2: Empty State Handling
**What goes wrong:** New users with no data see broken charts or NaN values.
**Why it happens:** Division by zero in percentage calculations, empty arrays passed to recharts.
**How to avoid:** Every card must check for null/empty data and render a meaningful empty state (follow `AttributeChart`'s "No data for this period" pattern).
**Warning signs:** NaN displayed in UI, blank cards with no explanation.

### Pitfall 3: Inconsistent Period Filtering
**What goes wrong:** Off-day summary respects period filter but completion trend does not (trend endpoint has no period param).
**Why it happens:** The backend `/analytics/completion-trend` endpoint always returns last 7/30 days regardless of the period selector.
**How to avoid:** Document that completion trend cards are always "current" and don't change with the period selector. Alternatively, don't gate them behind the period selector.
**Warning signs:** Users confused that changing period doesn't affect trend cards.

### Pitfall 4: CalendarDay Data Not Available for Best/Worst
**What goes wrong:** `calendarDays` only contains data for the currently selected month, not all-time.
**Why it happens:** The calendar API is month-scoped (`/habits/calendar/all?month=YYYY-MM`).
**How to avoid:** For ANLYT-04, show best/worst days within the currently viewed month (matching the calendar scope), or fetch additional data for broader time ranges. The simplest approach is month-scoped best/worst that updates as the user navigates the calendar.
**Warning signs:** "Best day ever" only showing data from current month without indicating the scope.

### Pitfall 5: Streak Rankings Showing Inactive Habits
**What goes wrong:** Rankings include habits the user has paused or archived.
**Why it happens:** Habit store may contain inactive habits.
**How to avoid:** Filter to `is_active === true` before ranking. Also filter out habits with `streak_current === 0`.
**Warning signs:** Rankings showing habits the user no longer tracks.

## Code Examples

### Off-Day Summary API + Types
```typescript
// types/index.ts - add these types (match backend schemas)
export interface OffDaySummary {
  total_off_days: number;
  xp_impact_estimate: number;
  streaks_preserved: number;
  reason_breakdown: Record<string, number>; // {"rest": 2, "sick": 1}
}

export interface CompletionTrend {
  weekly_rate: number;
  weekly_delta: number;
  weekly_habits_due: number;
  weekly_habits_completed: number;
  monthly_rate: number;
  monthly_delta: number;
  monthly_habits_due: number;
  monthly_habits_completed: number;
}
```

### Reason Breakdown Pie Chart
```typescript
// Using recharts PieChart (already installed)
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const REASON_COLORS: Record<string, string> = {
  rest: '#3B82F6',    // blue
  sick: '#EF4444',    // red
  vacation: '#22C55E', // green
  injury: '#F59E0B',  // amber
  other: '#6B7280',   // gray
};

const chartData = Object.entries(data.reason_breakdown).map(([reason, count]) => ({
  name: reason,
  value: count,
}));

<ResponsiveContainer width="100%" height={160}>
  <PieChart>
    <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={60}>
      {chartData.map((entry) => (
        <Cell key={entry.name} fill={REASON_COLORS[entry.name] ?? '#6B7280'} />
      ))}
    </Pie>
    <Tooltip />
  </PieChart>
</ResponsiveContainer>
```

### Completion Trend Card with Delta Arrow
```typescript
// CompletionTrendCards component pattern
function TrendCard({ label, rate, delta, due, completed }: TrendCardProps) {
  const pct = Math.round(rate * 100);
  const deltaPct = Math.round(delta * 100);

  return (
    <div className="bg-space-800 border border-saiyan-500/30 p-3" style={{ clipPath }}>
      <p className="text-xs text-text-muted uppercase tracking-wider">{label}</p>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-2xl font-mono font-bold text-saiyan-400 tabular-nums">{pct}%</span>
        <span className={`text-sm font-mono ${delta >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {delta >= 0 ? '+' : ''}{deltaPct}pp
        </span>
        {delta > 0 ? <TrendingUp className="w-4 h-4 text-green-400" /> :
         delta < 0 ? <TrendingDown className="w-4 h-4 text-red-400" /> :
         <Minus className="w-4 h-4 text-text-muted" />}
      </div>
      <p className="text-xs text-text-muted mt-1">{completed}/{due} habits</p>
    </div>
  );
}
```

### Streak Rankings List
```typescript
// Power Rankings leaderboard style
function StreakRankings({ habits }: { habits: HabitTodayResponse[] }) {
  const ranked = [...habits]
    .filter((h) => h.is_active && h.streak_current > 0)
    .sort((a, b) => b.streak_current - a.streak_current);

  if (ranked.length === 0) {
    return (
      <div className="bg-space-800 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-text-primary mb-3">Power Rankings</h3>
        <p className="text-sm text-text-muted">No active streaks yet</p>
      </div>
    );
  }

  return (
    <div className="bg-space-800 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-text-primary mb-3">Power Rankings</h3>
      <div className="space-y-2">
        {ranked.map((habit, i) => (
          <div key={habit.id} className="flex items-center gap-3">
            <span className={`text-lg font-bold font-mono w-6 text-center ${
              i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-amber-600' : 'text-text-muted'
            }`}>
              {i + 1}
            </span>
            <span className="text-base">{habit.icon_emoji}</span>
            <span className="text-sm text-text-primary flex-1 truncate">{habit.title}</span>
            <span className="text-sm font-mono text-saiyan-400">{habit.streak_current}d</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| recharts 2.x | recharts 3.7 | 2025 | API is the same, just performance improvements |
| framer-motion | motion (package rename) | 2024 | Import from `motion/react` not `framer-motion` |
| React 18 | React 19.2 | 2025 | No analytics-specific changes |

**Deprecated/outdated:**
- `framer-motion` package name: use `motion` import instead (already done in this project)

## Open Questions

1. **Best/Worst Days Scope**
   - What we know: `calendarDays` is month-scoped. The calendar only shows one month at a time.
   - What's unclear: Should best/worst days be scoped to the current calendar month, or should we fetch broader data?
   - Recommendation: Scope to current calendar month for simplicity. This keeps it in sync with the calendar heatmap the user is viewing. Label clearly as "This Month's Best/Worst."

2. **Streak Rankings Data Source**
   - What we know: `habitStore` has `habits` with `streak_current` from `/habits/today/list`. The analytics page currently doesn't use the habit store.
   - What's unclear: Whether `useAnalyticsData` should also fetch habits, or the component should use the habit store directly.
   - Recommendation: Use `useHabitStore` directly in the `StreakRankings` component. The habit store is already populated on app init. This avoids coupling analytics data fetching with habit data.

3. **CalendarDay Missing completion_rate Field**
   - What we know: `CalendarDay` has `completion_tier` and `xp_earned` but no numeric `completion_rate`. Best/worst day needs a numeric value to rank.
   - What's unclear: Whether to rank by `xp_earned` or derive rate from tier.
   - Recommendation: Rank by `xp_earned` (available directly). XP is a more meaningful metric than tier (which is categorical). Display tier badge alongside for context.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | vitest 4.0.18 + @testing-library/react 16.3 |
| Config file | `frontend/vitest.config.ts` |
| Quick run command | `cd frontend && npx vitest run --reporter=verbose` |
| Full suite command | `cd frontend && npx vitest run` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ANLYT-01 | Off-day analytics card renders stats and reason chart | unit | `cd frontend && npx vitest run src/__tests__/off-day-analytics.test.tsx` | No - Wave 0 |
| ANLYT-02 | Completion trend cards show rates and delta arrows | unit | `cd frontend && npx vitest run src/__tests__/completion-trend.test.tsx` | No - Wave 0 |
| ANLYT-03 | Streak rankings list sorted by streak length | unit | `cd frontend && npx vitest run src/__tests__/streak-rankings.test.tsx` | No - Wave 0 |
| ANLYT-04 | Best/worst days highlighted with XP values | unit | `cd frontend && npx vitest run src/__tests__/best-worst-days.test.tsx` | No - Wave 0 |

### Sampling Rate
- **Per task commit:** `cd frontend && npx vitest run --reporter=verbose`
- **Per wave merge:** `cd frontend && npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `frontend/src/__tests__/off-day-analytics.test.tsx` -- covers ANLYT-01
- [ ] `frontend/src/__tests__/completion-trend.test.tsx` -- covers ANLYT-02
- [ ] `frontend/src/__tests__/streak-rankings.test.tsx` -- covers ANLYT-03
- [ ] `frontend/src/__tests__/best-worst-days.test.tsx` -- covers ANLYT-04

Note: recharts must be mocked in tests (see existing pattern in `analytics-charts.test.tsx` lines 6-15). Motion animations should also be mocked.

## Sources

### Primary (HIGH confidence)
- Project codebase: `backend/app/api/v1/analytics.py` -- confirmed off-day-summary and completion-trend endpoints exist with exact response schemas
- Project codebase: `backend/app/schemas/analytics.py` -- confirmed `OffDaySummary` and `CompletionTrend` Pydantic schemas
- Project codebase: `frontend/src/services/api.ts` -- confirmed `analyticsApi` object pattern, currently missing offDaySummary and completionTrend methods
- Project codebase: `frontend/src/types/index.ts` -- confirmed types match backend schemas; `OffDaySummary` and `CompletionTrend` types NOT yet defined
- Project codebase: `frontend/src/components/analytics/StatCards.tsx` -- confirmed card component pattern with clipPath, skeleton loading, space-800 theme
- Project codebase: `frontend/src/components/analytics/AttributeChart.tsx` -- confirmed recharts usage pattern with ResponsiveContainer, theme colors
- Project codebase: `frontend/src/__tests__/analytics-charts.test.tsx` -- confirmed test pattern with recharts mocking

### Secondary (MEDIUM confidence)
- Phase 19 research (`.planning/phases/19-backend-analytics-endpoints/19-RESEARCH.md`) -- confirmed endpoint design decisions

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all libraries already installed and in active use in the project
- Architecture: HIGH - patterns directly observed in existing analytics components
- Pitfalls: HIGH - derived from actual codebase analysis (data scoping, empty states, filter behavior)

**Research date:** 2026-03-08
**Valid until:** 2026-04-07 (stable -- no library changes expected)
