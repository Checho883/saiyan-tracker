# Phase 20: Habit Detail View - Research

**Researched:** 2026-03-08
**Domain:** React frontend — bottom sheet enhancement, SVG progress rings, calendar view
**Confidence:** HIGH

## Summary

Phase 20 enhances the existing `HabitDetailSheet` bottom sheet component with completion rate progress rings, attribute XP display, habit metadata grid, and a tabbed history section (contribution grid + calendar view). All backend endpoints already exist from Phase 19: `GET /habits/{id}/stats` returns completion rates, streaks, and attribute XP; `GET /habits/{id}/calendar` returns per-day completion data. The frontend needs new API methods, TypeScript types, and UI components.

The work is primarily frontend — no backend changes needed. The existing sheet structure (Framer Motion spring animation, backdrop overlay, 85vh max height) stays intact. New sections slot in between the existing stats row and contribution grid. The calendar view uses a simple month grid with attribute-colored dots.

**Primary recommendation:** Enhance HabitDetailSheet in-place by adding new sections (progress rings, metadata, tabbed history) and passing the full habit object instead of individual props. Create a reusable SVG ProgressRing component and a simple CalendarGrid component.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Completion rates displayed as circular progress rings with percentage in center — two rings side by side for 7-day and 30-day rates
- Trend indicators (up/down arrows) next to each percentage comparing current period vs previous period
- Attribute XP shown as a single prominent stat with attribute color and icon — each habit maps to one attribute
- Existing stats row (current streak, best streak, total completions) stays as-is — progress rings are a NEW section below it
- 2-column info grid for metadata: target time, category badge, importance level, creation date, attribute
- Importance shown as colored dot + text label (reuses existing importance dot colors)
- Creation date shows both absolute date AND relative time
- Metadata grid placed below stats, above history section
- Section order: Header -> Stats row -> Progress rings + XP -> Metadata grid -> Tabbed history -> Legend
- History section uses toggle tabs: "Grid" (90-day contribution heatmap) and "Calendar" (monthly calendar view)
- Sheet max height stays at 85vh with overflow-y-auto scroll
- Both contribution grid and calendar view available via tab toggle (not stacked)
- Calendar: completed days with filled dot in attribute color, missed days as empty/gray
- Progress rings use the habit's attribute color for fill
- Subtle aura glow/gradient at top of sheet in the attribute color
- Keep current spring slide-up animation (stiffness 300, damping 30)
- Calendar dots use attribute color, consistent with contribution grid

### Claude's Discretion
- Exact progress ring SVG implementation and sizing
- Tab component styling for grid/calendar toggle
- Spacing and typography within metadata grid
- Loading states for stats and calendar data
- Error handling for failed API calls

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DTAIL-01 | User can tap a habit to see weekly and monthly completion rates | Backend `GET /habits/{id}/stats` returns `completion_rate_7d` and `completion_rate_30d`; SVG progress ring component renders these as circular gauges |
| DTAIL-02 | User can see total attribute XP earned for a specific habit | Backend stats endpoint returns `total_xp_earned` and `attribute_xp` map; display as prominent stat with attribute color |
| DTAIL-03 | User can see target time, creation date, category badge, importance/attribute tags | HabitResponse already has all fields (`target_time`, `created_at`, `category_id`, `importance`, `attribute`); need to pass full habit object to sheet |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.x | UI framework | Already in project |
| motion/react | latest | Spring animations for sheet | Already used for sheet slide-up |
| lucide-react | latest | Icons (X, ChevronLeft, ChevronRight, etc.) | Already in project |
| ky | latest | HTTP client | Already used in api.ts |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| SVG (native) | N/A | Progress ring circles | No library needed — simple SVG circle with stroke-dasharray |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| SVG circles | react-circular-progressbar | Extra dependency for trivial SVG — not worth it |
| Custom tabs | @radix-ui/react-tabs | Overkill for 2-tab toggle — simple button group suffices |
| date-fns | Native Date | Only need basic month/day math — no library needed |

**Installation:**
No new packages needed. All dependencies already in project.

## Architecture Patterns

### Recommended Project Structure
```
frontend/src/
├── components/dashboard/
│   ├── HabitDetailSheet.tsx  # Enhanced (existing file)
│   ├── ProgressRing.tsx      # New — reusable SVG circle
│   ├── CalendarGrid.tsx      # New — monthly calendar with dots
│   ├── ContributionGrid.tsx  # Existing — no changes
│   └── HabitCard.tsx         # Modified — pass full habit object
├── services/
│   └── api.ts                # Add stats() and calendar() methods
└── types/
    └── index.ts              # Add HabitStatsResponse and HabitCalendarDay types
```

### Pattern 1: SVG Progress Ring
**What:** Circular progress indicator using SVG circle + stroke-dasharray
**When to use:** Showing completion rates as visual gauges
**Example:**
```typescript
// SVG circle progress ring pattern
const circumference = 2 * Math.PI * radius;
const offset = circumference - (percentage * circumference);
// <circle r={radius} strokeDasharray={circumference} strokeDashoffset={offset} />
```

### Pattern 2: Pass Full Habit Object to Sheet
**What:** Instead of individual props (habitId, habitTitle, etc.), pass the full `HabitTodayResponse` object
**When to use:** When sheet needs access to metadata fields (attribute, importance, category_id, target_time, created_at)
**Why:** Avoids prop explosion — sheet already needs 10+ fields. Single `habit` prop is cleaner.

### Pattern 3: Tab State with useState
**What:** Simple `useState<'grid' | 'calendar'>('grid')` for tab toggle
**When to use:** Two-tab toggle where both components exist in same parent
**Why:** No router or context needed — local component state suffices

### Anti-Patterns to Avoid
- **Over-engineering tabs:** Don't use a tab library or router for a 2-option toggle
- **Fetching all data upfront:** Fetch stats on mount, but lazy-fetch calendar only when user switches to calendar tab
- **Hardcoding colors:** Use the existing attribute color CSS variables (`--color-attr-str`, etc.) not hex values

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Circular progress | Canvas-based gauge | SVG circle + stroke-dasharray | SVG is simpler, accessible, CSS-animatable |
| Relative time | Custom "X days ago" logic | Simple helper function | Only need months/days precision, not a library |
| Month calendar grid | Full calendar component | Simple 7xN grid of divs | Just dots, no events/selection/navigation complexity |

## Common Pitfalls

### Pitfall 1: SVG Circle Rotation
**What goes wrong:** Progress ring starts at 3 o'clock (SVG default) instead of 12 o'clock
**Why it happens:** SVG circles start drawing from the right (0 degrees = 3 o'clock position)
**How to avoid:** Apply `transform="rotate(-90)"` to the circle or use `transform: rotate(-90deg)` CSS on the SVG
**Warning signs:** Progress fill starts from the side

### Pitfall 2: Sheet Prop Explosion
**What goes wrong:** Adding 10+ individual props to HabitDetailSheet for all metadata fields
**Why it happens:** Incrementally adding props without refactoring the interface
**How to avoid:** Refactor to pass the full `HabitTodayResponse` object as a single `habit` prop
**Warning signs:** Props list grows beyond 5-6 items

### Pitfall 3: Calendar Month Boundary
**What goes wrong:** Calendar grid doesn't pad first/last week correctly
**Why it happens:** Month may start on Wednesday — need empty cells for Sun-Tue
**How to avoid:** Calculate `firstDayOfWeek = new Date(year, month, 1).getDay()` and pad with empty cells
**Warning signs:** Calendar grid is misaligned

### Pitfall 4: Attribute Color Mapping in SVG
**What goes wrong:** Tailwind classes like `text-attr-str` don't work as SVG `stroke` values
**Why it happens:** SVG stroke needs actual color values, not Tailwind utility classes
**How to avoid:** Create a mapping from attribute to CSS variable: `stroke="var(--color-attr-str)"` or use a JS color map
**Warning signs:** SVG circles render with no color

## Code Examples

### SVG Progress Ring Component
```typescript
interface ProgressRingProps {
  percentage: number;  // 0-1
  size?: number;       // px, default 64
  strokeWidth?: number;
  color: string;       // CSS color value or variable
  label: string;       // "7d" or "30d"
}

function ProgressRing({ percentage, size = 64, strokeWidth = 4, color, label }: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - percentage * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle cx={size/2} cy={size/2} r={radius}
          fill="none" stroke="var(--color-space-700)" strokeWidth={strokeWidth} />
        {/* Progress circle */}
        <circle cx={size/2} cy={size/2} r={radius}
          fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" className="transition-all duration-500" />
      </svg>
      {/* Percentage text overlaid */}
      <span className="text-text-primary text-sm font-bold">
        {Math.round(percentage * 100)}%
      </span>
      <span className="text-text-muted text-xs">{label}</span>
    </div>
  );
}
```

### Attribute Color Map for SVG
```typescript
const attrColorVar: Record<Attribute, string> = {
  str: 'var(--color-attr-str)',
  vit: 'var(--color-attr-vit)',
  int: 'var(--color-attr-int)',
  ki: 'var(--color-attr-ki)',
};
```

### Relative Time Helper
```typescript
function relativeTime(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return 'today';
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(months / 12);
  return `${years}y ago`;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Individual string props for sheet | Pass full habit object | This phase | Cleaner API, less prop drilling |
| Only contribution grid in history | Tabbed grid + calendar | This phase | More history visualization options |

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | vitest + @testing-library/react |
| Config file | frontend/vitest.config.ts |
| Quick run command | `cd frontend && npx vitest run --reporter=verbose` |
| Full suite command | `cd frontend && npx vitest run --reporter=verbose` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DTAIL-01 | Progress rings show 7d and 30d completion rates | unit | `cd frontend && npx vitest run src/__tests__/habit-detail-sheet.test.tsx -t "completion rates"` | ❌ Wave 0 |
| DTAIL-02 | Attribute XP display with correct color | unit | `cd frontend && npx vitest run src/__tests__/habit-detail-sheet.test.tsx -t "attribute XP"` | ❌ Wave 0 |
| DTAIL-03 | Metadata grid shows target time, creation date, category, importance, attribute | unit | `cd frontend && npx vitest run src/__tests__/habit-detail-sheet.test.tsx -t "metadata"` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `cd frontend && npx vitest run --reporter=verbose`
- **Per wave merge:** `cd frontend && npx vitest run --reporter=verbose`
- **Phase gate:** Full suite green before verify

### Wave 0 Gaps
- [ ] `frontend/src/__tests__/habit-detail-sheet.test.tsx` — covers DTAIL-01, DTAIL-02, DTAIL-03
- [ ] Test fixtures for mock habit stats and calendar API responses

## Sources

### Primary (HIGH confidence)
- Codebase analysis: `HabitDetailSheet.tsx`, `HabitCard.tsx`, `api.ts`, `types/index.ts`
- Backend schemas: `backend/app/schemas/habit.py` — HabitStatsResponse, HabitCalendarDay
- Backend endpoints: `backend/app/api/v1/habits.py` — stats and calendar routes confirmed

### Secondary (MEDIUM confidence)
- SVG circle progress ring pattern — well-established CSS/SVG technique

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all libraries already in project, no new dependencies
- Architecture: HIGH - enhancing existing component with clear section order from CONTEXT.md
- Pitfalls: HIGH - based on direct codebase analysis and SVG fundamentals

**Research date:** 2026-03-08
**Valid until:** 2026-04-07
