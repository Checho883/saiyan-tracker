# Phase 8: Analytics & Settings - Research

**Researched:** 2026-03-05
**Domain:** React charting, calendar heatmaps, settings CRUD UI, theme switching
**Confidence:** HIGH

## Summary

Phase 8 delivers two feature-dense routes (/analytics and /settings) on top of a backend and state layer that is already 90% built. The Zustand stores (`rewardStore`, `powerStore`, `habitStore`) already expose all CRUD operations and data fetching needed — the work is purely UI component creation. The primary technical decisions are: (1) Recharts 3.7.x for area/line charts with `react-is` override for React 19, (2) custom SVG calendar heatmap (no external dependency — month-grid layout is simpler than GitHub year-grid), and (3) reusing existing bottom-sheet (vaul) and collapsible patterns for settings forms.

**Primary recommendation:** Install `recharts@^3.7.0` with `react-is` package.json override, build a custom `<CalendarHeatmap>` from SVG rects (40 lines), and compose settings sections from existing `vaul` Drawer and collapsible patterns.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Calendar heatmap cells show tooltip on tap — GitHub contribution graph style (completion %, habits done, XP earned)
- Month navigation via prev/next controls
- 4-color coding: gold (100%), blue (75-99%), red (50-74%), gray (<50%), blue outline for off-days
- Attribute progression area chart and power level line chart use glowing/neon line effects on dark background (matching DBZ energy theme)
- Charts animate on initial load (progressive draw-in) AND on period switch (smooth transitions)
- Period selector: week / month / all
- Summary stat cards styled as Scouter HUD readouts — angular frames, mono-spaced numbers, subtle scan-line effect (consistent with existing ScouterHUD component)
- Stat cards display: perfect days count, average %, total XP, longest streak
- Vertical scroll with grouped collapsible sections: Preferences, Categories, Capsule Rewards, Shenron Wishes, Off-Days
- Preferences section expanded by default; all other sections collapsed
- Sound toggle: simple on/off switch (persisted via backend)
- Theme toggle: simple dark/light switch (dark is default). No system preference detection — instant switch, no reload
- Display name: text input in Preferences section; display name appears in dashboard HeroSection as character name plate
- Add/edit forms use bottom sheet pattern (reuse HabitFormSheet pattern) — tap 'Add' button or tap an item to open sheet
- List items displayed as compact cards with swipe-left to reveal edit/delete actions
- Capsule reward rarity: segmented control (Common | Rare | Epic) with color coding matching rarity colors
- Shenron wishes: form includes active toggle and display shows times-wished count
- Category management: form includes name, color picker, emoji selector
- Delete actions require confirmation via existing DeleteConfirmDialog component
- Mark off-day trigger located in Settings page under Preferences section
- When off-day is marked: habits still visible on dashboard but grayed out / marked optional
- Off-day can be undone same-day only — once the day passes, it's locked in
- Reason selection uses icon grid: sick (thermometer), vacation (palm tree), rest (bed), injury (bandage), other (ellipsis)
- Calendar heatmap shows blue outline for off-days

### Claude's Discretion
- Chart library choice (recharts, visx, etc.)
- Exact glow effect implementation for chart lines
- Swipe action implementation approach
- Color picker and emoji selector component choices
- Loading states and error handling patterns
- Exact spacing, typography, and responsive breakpoints

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| ANLYT-01 | Calendar heatmap with 4-color coding and off-day outline | Custom SVG heatmap using `habitsApi.calendarAll()` data; CalendarDay type already defined |
| ANLYT-02 | Month navigation with prev/next controls | Month state + prev/next buttons; `calendarAll(month)` accepts `YYYY-MM` parameter |
| ANLYT-03 | Attribute progression area chart with period selector | Recharts `<AreaChart>` with stacked areas; NOTE: backend only has current attribute XP, no historical — use DailyLog xp_earned as proxy or compute from cumulative |
| ANLYT-04 | Summary stat cards (perfect days, avg %, total XP, longest streak) | `analyticsApi.summary(period)` returns all 4 values directly; style as Scouter HUD |
| ANLYT-05 | Power level line chart showing cumulative XP progression | Recharts `<LineChart>` using DailyLog data; can derive cumulative sum from calendarAll xp_earned |
| SET-01 | Sound toggle on/off | `useRewardStore.settings.sound_enabled` + `updateSettings({ sound_enabled })` already built |
| SET-02 | Dark/light theme switch | `useRewardStore.settings.theme` + CSS class toggle on `<html>` element |
| SET-03 | CRUD capsule rewards with rarity | `useRewardStore` has full CRUD; build RewardFormSheet + RewardList UI |
| SET-04 | CRUD Shenron wishes with active toggle | `useRewardStore` has full CRUD; build WishFormSheet + WishList UI |
| SET-05 | Manage categories (name, color, emoji) | `useRewardStore` has full CRUD; build CategoryFormSheet + CategoryList UI |
| SET-06 | Mark off-day with reason selection | `offDaysApi.create/delete` ready; build OffDaySection with icon grid |
| SET-07 | Set display name | `useRewardStore.updateSettings({ display_name })` ready; text input in Preferences |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| recharts | ^3.7.0 | Area charts, line charts | Most popular React charting library; declarative components; good animation support |
| react-is | ^19.0.0 | Recharts React 19 compat | Required override — recharts internally uses react-is which must match React version |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| vaul | 1.1.2 (installed) | Bottom sheet drawers | All CRUD forms — already used for HabitFormSheet |
| lucide-react | 0.500.0 (installed) | Icons | Off-day reason icons, navigation arrows, section headers |
| motion | 12.35.0 (installed) | Animations | Chart entrance animations, stat card transitions |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| recharts | visx | More control but much more boilerplate; recharts declarative API better for this scope |
| recharts | nivo | Heavier bundle; overkill for 2 chart types |
| Custom SVG heatmap | react-calendar-heatmap | External dep for a 40-line component; our layout is month-grid not year-grid |

**Installation:**
```bash
cd frontend && npm install recharts
```

Then add `react-is` override to `package.json`:
```json
{
  "overrides": {
    "react-is": "^19.0.0"
  }
}
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── analytics/
│   │   ├── CalendarHeatmap.tsx      # SVG month-grid heatmap
│   │   ├── AttributeChart.tsx       # Recharts stacked area chart
│   │   ├── PowerLevelChart.tsx      # Recharts line chart
│   │   ├── StatCards.tsx            # Scouter HUD stat cards
│   │   └── PeriodSelector.tsx       # week/month/all toggle
│   └── settings/
│       ├── PreferencesSection.tsx   # Sound, theme, display name, off-day
│       ├── CategorySection.tsx      # Category list + form
│       ├── RewardSection.tsx        # Capsule reward list + form
│       ├── WishSection.tsx          # Shenron wish list + form
│       ├── CategoryFormSheet.tsx    # Bottom sheet for category CRUD
│       ├── RewardFormSheet.tsx      # Bottom sheet for reward CRUD
│       ├── WishFormSheet.tsx        # Bottom sheet for wish CRUD
│       ├── OffDaySelector.tsx       # Icon grid for off-day reasons
│       └── CollapsibleSection.tsx   # Shared expandable wrapper
├── pages/
│   ├── Analytics.tsx               # Analytics page (currently stub)
│   └── Settings.tsx                # Settings page (currently stub)
└── hooks/
    └── useAnalyticsData.ts         # Data fetching for analytics charts
```

### Pattern 1: Custom SVG Calendar Heatmap
**What:** Month-grid calendar rendered as SVG rects with color-coded cells
**When to use:** When the layout is a standard month grid (7 cols x 5-6 rows) not a GitHub year-grid
**Example:**
```typescript
// Custom SVG heatmap — no external dependency needed
interface CalendarHeatmapProps {
  days: CalendarDay[];
  month: string; // "YYYY-MM"
  onDayClick?: (day: CalendarDay) => void;
}

function CalendarHeatmap({ days, month, onDayClick }: CalendarHeatmapProps) {
  const daysInMonth = new Date(+month.slice(0, 4), +month.slice(5, 7), 0).getDate();
  const firstDayOfWeek = new Date(+month.slice(0, 4), +month.slice(5, 7) - 1, 1).getDay();

  const colorForTier = (day: CalendarDay | undefined) => {
    if (!day) return 'transparent';
    if (day.completion_tier === 'gold') return '#EAB308';   // gold 100%
    if (day.completion_tier === 'silver') return '#3B82F6';  // blue 75-99%
    if (day.completion_tier === 'bronze') return '#EF4444';  // red 50-74%
    return '#6B7280'; // gray <50%
  };

  return (
    <svg viewBox="0 0 280 240" className="w-full">
      {Array.from({ length: daysInMonth }, (_, i) => {
        const day = days.find(d => +d.date.slice(8, 10) === i + 1);
        const col = (firstDayOfWeek + i) % 7;
        const row = Math.floor((firstDayOfWeek + i) / 7);
        return (
          <rect
            key={i}
            x={col * 40} y={row * 40}
            width={36} height={36} rx={4}
            fill={colorForTier(day)}
            stroke={day?.is_off_day ? '#3B82F6' : 'none'}
            strokeWidth={day?.is_off_day ? 2 : 0}
            onClick={() => day && onDayClick?.(day)}
            className="cursor-pointer"
          />
        );
      })}
    </svg>
  );
}
```

### Pattern 2: Recharts Neon Glow Effect
**What:** CSS filter-based glow on chart lines for DBZ energy aesthetic
**When to use:** Area and line charts on dark backgrounds
**Example:**
```typescript
// Neon glow via SVG filter + recharts customization
<defs>
  <filter id="glow">
    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
    <feMerge>
      <feMergeNode in="coloredBlur" />
      <feMergeNode in="SourceGraphic" />
    </feMerge>
  </filter>
</defs>

<Area
  type="monotone"
  dataKey="str"
  stroke="#EF4444"
  fill="url(#strGradient)"
  strokeWidth={2}
  filter="url(#glow)"
  animationDuration={1500}
  animationEasing="ease-out"
/>
```

### Pattern 3: Collapsible Section with Shared State
**What:** Reusable accordion-style sections for settings
**When to use:** Settings page with multiple grouped sections
**Example:**
```typescript
function CollapsibleSection({
  title, icon, defaultOpen = false, children
}: {
  title: string; icon: LucideIcon; defaultOpen?: boolean; children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border border-space-600 rounded-lg overflow-hidden">
      <button
        className="w-full flex items-center justify-between p-4 bg-space-700"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-saiyan-500" />
          <span className="font-semibold">{title}</span>
        </span>
        <ChevronDown className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

### Pattern 4: Swipe-to-Reveal Actions
**What:** Touch-friendly swipe gesture to expose edit/delete buttons
**When to use:** List items in CRUD management sections
**Example:**
```typescript
// Using motion's drag gesture
function SwipeableCard({ children, onEdit, onDelete }) {
  const x = useMotionValue(0);

  return (
    <div className="relative overflow-hidden">
      {/* Action buttons behind */}
      <div className="absolute right-0 inset-y-0 flex items-center gap-1 pr-2">
        <button onClick={onEdit} className="p-2 bg-blue-600 rounded">
          <Pencil className="w-4 h-4" />
        </button>
        <button onClick={onDelete} className="p-2 bg-red-600 rounded">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      {/* Draggable content */}
      <motion.div
        drag="x" dragConstraints={{ left: -100, right: 0 }}
        style={{ x }}
        className="relative z-10 bg-space-700"
      >
        {children}
      </motion.div>
    </div>
  );
}
```

### Anti-Patterns to Avoid
- **Fetching analytics on every render:** Use `useEffect` with dependency on `period` and `month`, not on every render cycle
- **Storing derived chart data in Zustand:** Keep chart transformations in component/hook level — store holds raw API responses only
- **Inline SVG glow filters per chart:** Define `<defs>` once in a shared SVG context, reference by ID
- **Theme toggle with full page reload:** Use CSS class toggle on `<html>` element with Tailwind dark: prefix or CSS custom properties

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Area/line charts | Custom SVG path math | Recharts `<AreaChart>` / `<LineChart>` | Axes, tooltips, responsiveness, animation — all handled |
| Bottom sheets | Custom modal + drag | vaul `<Drawer>` (already installed) | Touch physics, scroll lock, a11y all handled |
| Color picker | Custom palette grid | Simple predefined color swatches (8-12 options) | Tiny scope — full color picker is overkill for category colors |
| Emoji selector | Full emoji keyboard | Curated grid of ~20-30 relevant emojis | Category emojis are decorative; a massive picker adds bundle + complexity |
| Responsive charts | Manual resize handlers | Recharts `<ResponsiveContainer>` | Handles resize observer, debounce, parent sizing |

**Key insight:** The stores and API layer are already complete. Every minute spent on data plumbing is wasted — focus 100% on visual components.

## Common Pitfalls

### Pitfall 1: Recharts + React 19 `react-is` Error
**What goes wrong:** Recharts 3.7.x internally depends on `react-is` which ships an older version incompatible with React 19; renders fail silently or crash
**Why it happens:** Recharts bundles `react-is@18.x` but React 19 needs matching version
**How to avoid:** Add `"overrides": { "react-is": "^19.0.0" }` to package.json BEFORE first install
**Warning signs:** Charts render blank, console error about `react-is` version mismatch

### Pitfall 2: Calendar Heatmap Date Math Off-by-One
**What goes wrong:** Days appear in wrong grid positions or month has wrong number of days
**Why it happens:** JavaScript Date month is 0-indexed; day-of-week calculations can shift with timezone
**How to avoid:** Use UTC dates consistently; test with months that start on Sunday and Saturday
**Warning signs:** February grid showing 30 days, days shifted by one column

### Pitfall 3: Theme Toggle Flicker
**What goes wrong:** Brief flash of wrong theme on page load or toggle
**Why it happens:** CSS class applied after React hydration, not in initial HTML
**How to avoid:** Apply theme class to `<html>` element via script in `index.html` head (before React loads), AND via React state
**Warning signs:** White flash on dark theme load, brief wrong-theme render

### Pitfall 4: Attribute Progression Data Gap
**What goes wrong:** Area chart has no data to show because backend stores cumulative XP on User, not per-day attribute breakdown
**Why it happens:** DailyLog stores total `xp_earned` per day but not per-attribute XP breakdown
**How to avoid:** Use total XP from calendarAll as single line OR derive approximate attribute progression from the power/current endpoint's attribute raw_xp values as "current state" display (not time-series)
**Warning signs:** Empty chart, missing data points

### Pitfall 5: Swipe Gesture Conflicts with Scroll
**What goes wrong:** Horizontal swipe-to-reveal intercepts vertical scroll events
**Why it happens:** Touch events don't distinguish intent until moved past threshold
**How to avoid:** Use `dragDirectionLock` with motion's drag prop; set a minimum horizontal delta before activating swipe
**Warning signs:** Scroll feels "sticky" or jerky on settings lists

## Code Examples

### Recharts Area Chart with Glow
```typescript
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

function AttributeChart({ data, period }: { data: DayData[]; period: string }) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <AreaChart data={data}>
        <defs>
          <filter id="neonGlow">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="strFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="date" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
        <YAxis tick={{ fill: '#9CA3AF', fontSize: 12 }} />
        <Tooltip
          contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
          labelStyle={{ color: '#F9FAFB' }}
        />
        <Area
          type="monotone" dataKey="str" stroke="#EF4444"
          fill="url(#strFill)" strokeWidth={2} filter="url(#neonGlow)"
          animationDuration={1500} animationEasing="ease-out"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
```

### Theme Toggle with Instant Switch
```typescript
function useTheme() {
  const settings = useRewardStore(s => s.settings);
  const updateSettings = useRewardStore(s => s.updateSettings);

  const toggleTheme = () => {
    const newTheme = settings?.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    document.documentElement.classList.toggle('light', newTheme === 'light');
    updateSettings({ theme: newTheme });
  };

  // Apply on mount / settings change
  useEffect(() => {
    if (settings?.theme) {
      document.documentElement.classList.toggle('dark', settings.theme === 'dark');
      document.documentElement.classList.toggle('light', settings.theme === 'light');
    }
  }, [settings?.theme]);

  return { theme: settings?.theme ?? 'dark', toggleTheme };
}
```

### Scouter HUD Stat Card
```typescript
function StatCard({ label, value, unit }: { label: string; value: number; unit?: string }) {
  return (
    <div className="relative bg-space-800 border border-saiyan-500/30 p-3 clip-scouter">
      {/* Scan line effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-saiyan-500/5 to-transparent
                      animate-scan pointer-events-none" />
      <p className="text-xs text-gray-400 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-mono text-saiyan-400 tabular-nums">
        {value.toLocaleString()}{unit && <span className="text-sm ml-1">{unit}</span>}
      </p>
    </div>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| recharts 2.x | recharts 3.7.x | 2025 | New state management, removed react-smooth dep, better perf |
| react-calendar-heatmap (year grid) | Custom SVG (month grid) | N/A | Our UX calls for month navigation, not year overview |
| Context API for theme | Zustand store + CSS class | N/A | Already using Zustand; theme is just another setting |
| Full color picker library | Predefined swatch grid | N/A | Scope-appropriate for category colors |

**Deprecated/outdated:**
- recharts 2.x: Still works but 3.x has better performance and removed dependencies
- react-calendar-heatmap: Designed for year-view (like GitHub); our month-grid is simpler

## Open Questions

1. **Attribute progression historical data**
   - What we know: Backend DailyLog stores total xp_earned per day, not per-attribute breakdown. User model stores cumulative attribute XP.
   - What's unclear: Whether we can meaningfully show attribute-level time series
   - Recommendation: Show total XP line chart (from DailyLog xp_earned cumulative sum) for ANLYT-05. For ANLYT-03 attribute chart, display current attribute levels as a static comparison view (bar chart or radial) rather than time series, OR derive approximate attribute splits from habit completions per day if HabitLog data includes attribute info. Check HabitLog model during planning.

2. **Off-day undo mechanics**
   - What we know: offDaysApi.delete(date) exists for undoing off-days
   - What's unclear: How to enforce "same-day only" undo on the frontend
   - Recommendation: Compare off-day date to today's date; disable undo button if date !== today

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.0.18 + @testing-library/react 16.3.2 |
| Config file | frontend/vitest.config.ts |
| Quick run command | `cd frontend && npx vitest run --reporter=verbose` |
| Full suite command | `cd frontend && npx vitest run` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ANLYT-01 | Calendar heatmap renders with color coding | unit | `npx vitest run src/__tests__/calendar-heatmap.test.tsx` | ❌ Wave 0 |
| ANLYT-02 | Month nav changes displayed month | unit | `npx vitest run src/__tests__/calendar-heatmap.test.tsx` | ❌ Wave 0 |
| ANLYT-03 | Attribute chart renders with data | unit | `npx vitest run src/__tests__/analytics-charts.test.tsx` | ❌ Wave 0 |
| ANLYT-04 | Stat cards display correct values | unit | `npx vitest run src/__tests__/stat-cards.test.tsx` | ❌ Wave 0 |
| ANLYT-05 | Power level chart renders | unit | `npx vitest run src/__tests__/analytics-charts.test.tsx` | ❌ Wave 0 |
| SET-01 | Sound toggle persists | unit | `npx vitest run src/__tests__/settings.test.tsx` | ❌ Wave 0 |
| SET-02 | Theme toggle switches class | unit | `npx vitest run src/__tests__/settings.test.tsx` | ❌ Wave 0 |
| SET-03 | Reward CRUD renders list + form | unit | `npx vitest run src/__tests__/settings-crud.test.tsx` | ❌ Wave 0 |
| SET-04 | Wish CRUD renders list + form | unit | `npx vitest run src/__tests__/settings-crud.test.tsx` | ❌ Wave 0 |
| SET-05 | Category CRUD renders list + form | unit | `npx vitest run src/__tests__/settings-crud.test.tsx` | ❌ Wave 0 |
| SET-06 | Off-day selector shows reasons | unit | `npx vitest run src/__tests__/settings.test.tsx` | ❌ Wave 0 |
| SET-07 | Display name input updates | unit | `npx vitest run src/__tests__/settings.test.tsx` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `cd frontend && npx vitest run --reporter=verbose`
- **Per wave merge:** `cd frontend && npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/__tests__/calendar-heatmap.test.tsx` — covers ANLYT-01, ANLYT-02
- [ ] `src/__tests__/analytics-charts.test.tsx` — covers ANLYT-03, ANLYT-05
- [ ] `src/__tests__/stat-cards.test.tsx` — covers ANLYT-04
- [ ] `src/__tests__/settings.test.tsx` — covers SET-01, SET-02, SET-06, SET-07
- [ ] `src/__tests__/settings-crud.test.tsx` — covers SET-03, SET-04, SET-05
- [ ] recharts install: `cd frontend && npm install recharts` + react-is override

## Sources

### Primary (HIGH confidence)
- Project codebase analysis — rewardStore.ts, api.ts, types/index.ts, analytics.py, power.py
- Existing patterns — HabitFormSheet (vaul), DeleteConfirmDialog, ScouterHUD, StatsPanel

### Secondary (MEDIUM confidence)
- [recharts npm](https://www.npmjs.com/package/recharts) — v3.7.0 latest, React 19 needs react-is override
- [recharts 3.0 migration guide](https://github.com/recharts/recharts/wiki/3.0-migration-guide) — removed react-smooth, new state management
- [React 19 recharts issue #4558](https://github.com/recharts/recharts/issues/4558) — react-is override solution

### Tertiary (LOW confidence)
- Calendar heatmap libraries surveyed but custom SVG recommended for month-grid layout

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - recharts is well-established, react-is override documented
- Architecture: HIGH - stores and API layer already built, patterns from existing components
- Pitfalls: HIGH - known issues documented in STATE.md blockers, verified through codebase analysis

**Research date:** 2026-03-05
**Valid until:** 2026-04-05 (stable domain, 30 days)
