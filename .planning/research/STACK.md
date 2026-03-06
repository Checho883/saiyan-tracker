# Technology Stack: v1.2 Additions

**Project:** Saiyan Tracker v1.2 -- PRD Complete
**Researched:** 2026-03-06
**Scope:** NEW libraries/changes needed for 19 v1.2 features only. Existing stack is validated and not re-researched.

---

## Existing Stack (DO NOT change)

React 19 + Vite 7 + TypeScript + Zustand 5 + Motion 12 + Tailwind CSS v4 + Recharts 3.7 + Howler.js 2.2.4 + ky + react-hot-toast + vaul + lucide-react + react-router 7 + Vitest

---

## New Libraries Required

### 1. Drag-and-Drop: `@dnd-kit/sortable` (via `@dnd-kit/core`)

| Property | Value |
|----------|-------|
| Package | `@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/utilities` |
| Version | 6.3.x (stable) |
| Purpose | Habit card reordering on dashboard |
| Confidence | HIGH |

**Why dnd-kit over alternatives:**

- **vs `@hello-pangea/dnd`:** hello-pangea is heavier (must import entire package), was created as a stopgap fork of react-beautiful-dnd. dnd-kit is modular -- import only the sortable preset. Better performance for our use case (single vertical list, ~6-10 items).
- **vs `pragmatic-drag-and-drop`:** Atlassian's new library is headless but documentation is immature. dnd-kit has extensive docs, tutorials, and community answers. For a single sortable list, dnd-kit's `useSortable` hook is battle-tested.
- **vs `@dnd-kit/react` (0.3.x experimental):** The maintainer is working on a framework-agnostic rewrite on the `experimental` branch. Version 0.3.2 was published recently but is pre-1.0 and unstable. Use the stable 6.3.x packages.
- **vs native HTML5 drag:** No keyboard accessibility, no touch support, no animation control. dnd-kit provides all three.

**Integration points:**
- Wraps the habit list on Dashboard with `DndContext` + `SortableContext`
- Each `HabitCard` gets `useSortable` hook for drag handle, transform, and transition
- On `onDragEnd`, call `PUT /habits/reorder` with new sort_order array
- `verticalListSortingStrategy` is purpose-built for this exact use case
- Motion's `layoutId` on habit cards provides smooth reorder animation for free

**React 19 compatibility:** dnd-kit 6.3.x works with React 19. The peer dependency specifies `react >=16.8.0`. No conflicts expected.

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

### 2. Contribution Graph: Custom SVG Component (NO library)

| Property | Value |
|----------|-------|
| Package | None -- build it |
| Purpose | Per-habit GitHub-style completion grid (90 days) |
| Confidence | HIGH |

**Why build custom instead of using a library:**

- **vs `@uiw/react-heat-map`:** React 19 compatibility is unverified. Adds a dependency for a component that is ~80 lines of SVG `<rect>` elements. The library's customization API would fight our specific design needs (DBZ color scheme, custom tooltips, integration with existing Tailwind theme tokens).
- **vs `react-calendar-heatmap`:** Last meaningful update was years ago. Same dependency risk for minimal value.
- **The component is trivial:** A contribution graph is a grid of colored rectangles. The data is an array of `{ date, completed }` from `GET /habits/{id}/contribution-graph?days=90`. Map 90 days into 13 columns x 7 rows of SVG `<rect>` elements with Tailwind color classes.

**Implementation approach:**
```typescript
// ~80 lines: map dates to a 7-row x N-column grid of <rect> SVG elements
// Color: completed = green/gold, missed = gray, future = transparent
// Tooltip: date + "Completed" / "Missed" / "Off Day" on hover
// Uses existing @theme CSS custom properties for colors
```

**Integration points:**
- Lives in `components/analytics/ContributionGraph.tsx`
- Data from `GET /habits/{id}/contribution-graph?days=90` (new API endpoint)
- Rendered per-habit in the Analytics page
- Hover tooltip can use the existing `title` attribute or a simple `<div>` positioned with CSS -- no floating-ui needed here

### 3. Calendar Day Popover: `@floating-ui/react`

| Property | Value |
|----------|-------|
| Package | `@floating-ui/react` |
| Version | 0.27.x |
| Purpose | Calendar day click popover with per-habit breakdown |
| Confidence | HIGH |

**Why @floating-ui/react:**

- **vs `@radix-ui/react-popover`:** Radix Popover is 91.3kb unpacked and brings in multiple Radix sub-packages. Floating UI is lighter and more composable. We need exactly ONE popover in the entire app (calendar day detail). Radix is justified when you adopt 5+ primitives; for one component it is overkill.
- **vs `vaul` (already installed):** vaul is a drawer component, not a popover. Different UI pattern. The calendar needs a positioned popover anchored to the clicked day cell, not a bottom drawer.
- **vs building with CSS only:** Positioning a popover correctly (viewport collision, scroll handling, arrow placement) is surprisingly hard. Floating UI handles this with `useFloating` + `flip` + `shift` middleware. Worth the ~8kb for correctness.
- **vs no popover (navigate to detail page):** The PRD specifies "Click any day -> popover with per-habit breakdown." A popover keeps context without navigation.

**Integration points:**
- Enhances existing `CalendarHeatmap.tsx` (which already has a `selectedDay` state)
- `useFloating` + `useClick` + `useDismiss` + `useRole` for accessible popover
- Content: list of habits for that day with check/miss status, XP earned, tier
- Data from `GET /habits/calendar/all?month=YYYY-MM` (already exists, add habit breakdown to response)

```bash
npm install @floating-ui/react
```

### 4. Day Picker for Custom Frequency: NO new library

| Property | Value |
|----------|-------|
| Package | None -- build it |
| Purpose | Tappable day-of-week selector (Mon-Sun) for custom habit frequency |
| Confidence | HIGH |

**Why no library:**

This is 7 toggle buttons labeled "M T W T F S S." It is not a date picker or calendar widget. It maps to the existing `custom_days` JSON field (`["mon","wed","fri"]`). Adding a date picker library (react-day-picker, react-datepicker) would be absurd overkill.

**Implementation:** 7 `<button>` elements in a flex row. Each toggles its day in/out of a `Set<string>`. Styled with Tailwind (active = orange fill, inactive = gray outline). ~30 lines.

### 5. Temporary Habit Date Picker: Native `<input type="date">`

| Property | Value |
|----------|-------|
| Package | None |
| Purpose | Start/end date selection for temporary habits |
| Confidence | HIGH |

**Why native inputs:**

- The habit form needs two date fields: start_date and end_date (only shown when `is_temporary` is toggled on)
- Native `<input type="date">` renders a calendar picker on all modern browsers
- The app is single-user (Sergio), not a design-system product. Native inputs are functional and consistent.
- Adding `react-datepicker` (200kb) or `react-day-picker` (30kb) for two date inputs in one form is unjustified.
- If native styling clashes with the dark theme, style with Tailwind's `[&::-webkit-calendar-picker-indicator]` pseudo-element selector and `color-scheme: dark`.

### 6. react-is Peer Dependency: Install explicitly

| Property | Value |
|----------|-------|
| Package | `react-is` |
| Version | ^19.0.0 |
| Purpose | Satisfy recharts 3.7.x peer dependency |
| Confidence | HIGH |

**Current situation:** The project already has an `overrides` entry for `react-is` in package.json. Recharts 3.7.x moved `react-is` from `dependencies` to `peerDependencies`, meaning it must be explicitly installed by the consuming project.

**Resolution:**
```bash
npm install react-is@^19.0.0
```

Then remove the `overrides` block from package.json. With react-is properly installed as a direct dependency matching React 19, the override hack becomes unnecessary. This is the clean fix the recharts maintainers intended.

---

## Audio Strategy: Real Sound Files

| Property | Value |
|----------|-------|
| Package | None (file sourcing, not code) |
| Purpose | Replace placeholder audio sprite with real DBZ-style sounds |
| Confidence | MEDIUM |

**Current state:** The app uses a Howler.js sprite sheet with 13 named sound effects, but the actual audio files are placeholders.

**Sourcing strategy -- two tiers:**

**Tier 1: Royalty-free sound-alikes (RECOMMENDED)**
- Use [Pixabay Sound Effects](https://pixabay.com/sound-effects/) -- royalty-free, no attribution required, free for commercial use
- Search terms: "power up," "energy charge," "explosion," "beep scanner," "achievement fanfare," "thunder," "magic chime," "whoosh"
- These are generic sci-fi/anime-style effects that evoke DBZ without being copyrighted DBZ audio
- Download as MP3, trim to <3 seconds with Audacity or ffmpeg

**Tier 2: Game rips (PERSONAL USE ONLY)**
- Sources like [The Sounds Resource](https://sounds.spriters-resource.com/) have Dragon Ball FighterZ rips
- [SoundBible](https://soundbible.com/tags-dragon-ball-z.html) has some DBZ effects
- These are copyrighted. Acceptable for a personal single-user app that will never be distributed, but cannot be open-sourced or deployed publicly.

**Recommended approach:** Use Tier 1 (royalty-free sound-alikes) for all 13 effects. They will be close enough to DBZ sounds without legal risk. The app is personal-use, but clean licensing avoids issues if the repo is ever shared.

**Audio sprite rebuild:**
- Keep the existing Howler.js sprite sheet architecture
- Use [audiosprite](https://www.npmjs.com/package/audiosprite) CLI to combine individual MP3s into a single sprite file with timing definitions
- Or: just load individual short MP3s from `public/sounds/` -- with 13 files under 3 seconds each, total payload is ~200-400kb. No need for sprite sheet complexity.

**Individual files vs sprite sheet:** Given that the app already uses individual `useSound` calls per component (not a single sprite), switch to individual MP3 files in `public/sounds/`. This simplifies the architecture -- each sound is independently loadable, cacheable, and replaceable.

---

## Libraries NOT Needed (Explicitly Rejected)

| Feature | Library Considered | Why Rejected | What to Use |
|---------|-------------------|-------------|-------------|
| Contribution graph | `@uiw/react-heat-map` | React 19 unverified, trivial to build custom | Custom SVG component (~80 LOC) |
| Contribution graph | `react-calendar-heatmap` | Unmaintained, adds dep for simple grid | Custom SVG component |
| Day-of-week picker | `react-day-picker` | Wrong tool -- we need 7 toggle buttons, not a calendar | 7 Tailwind-styled `<button>` elements |
| Date picker | `react-datepicker` | 200kb for 2 date inputs | Native `<input type="date">` |
| Badge/achievement icons | Icon library | Already have lucide-react + emoji support | Lucide icons + inline SVG for badge shapes |
| Toast notifications | New library | Already have react-hot-toast installed | Existing react-hot-toast (streak milestones, daily summary, nudge banner) |
| Popover (contrib graph tooltip) | `@floating-ui/react` | Simple hover tooltip, not positioned popover | Native `title` attr or CSS-positioned `<div>` |
| State management for achievements | New store | Fits in existing Zustand stores | Add to powerStore (badges/achievements are progression data) |
| Animation for celebrations | New library | Motion 12 handles everything | `AnimatePresence` + `motion.div` variants |

---

## Installation Summary

```bash
# New production dependencies
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities @floating-ui/react react-is@^19.0.0

# Then clean up package.json:
# Remove the "overrides": { "react-is": "^19.0.0" } block
# (react-is is now a direct dependency, override no longer needed)

# No new dev dependencies required
```

**Total new dependencies: 5 packages** (3 dnd-kit + floating-ui + react-is)
**Total new bundle size impact:** ~25-30kb gzipped (dnd-kit ~15kb, floating-ui ~8kb, react-is ~2kb)

---

## Version Compatibility Matrix (New Additions)

| Package | Version | React 19 | Notes |
|---------|---------|----------|-------|
| `@dnd-kit/core` | 6.3.x | Yes | Peer dep: `react >=16.8.0` |
| `@dnd-kit/sortable` | 9.0.x | Yes | Follows core compatibility |
| `@dnd-kit/utilities` | 3.2.x | Yes | Utility functions, no React peer dep issues |
| `@floating-ui/react` | 0.27.x | Yes | Uses `useSyncExternalStore`, React 18+ |
| `react-is` | 19.0.0 | Yes | Must match React major version |
| `recharts` | 3.7.x (existing) | Yes | With react-is@19 installed, no overrides needed |

---

## Integration Architecture

### How new libraries connect to existing stack

```
Dashboard Page
  |
  +-- DndContext + SortableContext (NEW: @dnd-kit)
  |     |
  |     +-- HabitCard (EXISTING) + useSortable hook
  |           |
  |           +-- onDragEnd -> PUT /habits/reorder -> invalidateQueries
  |
  +-- Motion AnimatePresence (EXISTING)
        |
        +-- Streak milestone notification (NEW: uses existing animation queue)
        +-- Power level celebration (NEW: uses existing animation queue)
        +-- Zenkai recovery animation (NEW: uses existing animation queue)
        +-- Attribute level-up animation (NEW: uses existing animation queue)

Analytics Page
  |
  +-- CalendarHeatmap (EXISTING)
  |     |
  |     +-- useFloating popover (NEW: @floating-ui/react)
  |           |
  |           +-- DayDetailPopover content (per-habit breakdown)
  |
  +-- ContributionGraph (NEW: custom SVG, no library)
  |
  +-- CapsuleHistory (NEW: component, existing recharts)
  +-- WishHistory (NEW: component, existing recharts)

Settings Page
  |
  +-- HabitFormModal (EXISTING, enhanced)
        |
        +-- DayPicker (NEW: 7 toggle buttons, no library)
        +-- DateInputs (NEW: native <input type="date">)
        +-- ArchivedHabitsView (NEW: component, no new deps)
```

### Animation queue additions (no new libraries)

All new animations (streak milestone, power level celebration, Zenkai recovery, attribute level-up, nudge banner) use the existing Motion `AnimatePresence` queue system. The `uiStore.queueAnimation()` pattern from v1.1 handles sequencing. No new animation libraries needed.

### Toast additions (no new libraries)

Daily summary toast, nudge banner, and streak milestone notifications use the existing `react-hot-toast`. The project already has it installed and themed. No switch to sonner needed for v1.2 -- that is a potential v1.3 improvement.

---

## Sources

- [dnd-kit official docs](https://docs.dndkit.com/) -- sortable preset, useSortable hook -- HIGH
- [dnd-kit maintenance status (GitHub #1194)](https://github.com/clauderic/dnd-kit/issues/1194) -- active development, framework-agnostic rewrite in progress -- HIGH
- [DnD library comparison (Puck 2026)](https://puckeditor.com/blog/top-5-drag-and-drop-libraries-for-react) -- dnd-kit vs hello-pangea vs pragmatic -- MEDIUM
- [Floating UI popover docs](https://floating-ui.com/docs/popover) -- useFloating + useClick pattern -- HIGH
- [Floating UI React docs](https://floating-ui.com/docs/react) -- React-specific hooks -- HIGH
- [@radix-ui/react-popover npm](https://www.npmjs.com/package/@radix-ui/react-popover) -- 91.3kb package size -- MEDIUM
- [recharts dependency discussion (#5701)](https://github.com/recharts/recharts/discussions/5701) -- react-is moved to peerDependencies in 3.x -- HIGH
- [recharts npm](https://www.npmjs.com/package/recharts) -- v3.7.0, peerDeps: react + react-dom + react-is ^16-19 -- HIGH
- [@uiw/react-heat-map GitHub](https://github.com/uiwjs/react-heat-map) -- React 19 compat unverified -- LOW
- [Pixabay Sound Effects](https://pixabay.com/sound-effects/) -- royalty-free, no attribution -- MEDIUM
- [The Sounds Resource](https://sounds.spriters-resource.com/pc_computer/dragonballfighterz/) -- game rips, copyrighted -- LOW

---

*Stack additions research for: Saiyan Tracker v1.2 -- PRD Complete*
*Researched: 2026-03-06*
