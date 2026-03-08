# Stack Research: v1.3 Additions

**Domain:** QoL features for existing habit tracker (responsive design, sharing, analytics, animation feedback)
**Researched:** 2026-03-08
**Confidence:** HIGH

---

## Existing Stack (DO NOT change)

React 19.2 + Vite 7.3 + TypeScript 5.9 + Zustand 5 + Motion 12 + Tailwind CSS v4.2 + Recharts 3.7 + Howler.js 2.2.4 + ky + react-hot-toast + vaul 1.1 + lucide-react + react-router 7.13 + @floating-ui/react 0.27 + @dnd-kit 6.3 + Vitest 4

---

## New Libraries Required

### NONE

v1.3 requires **zero new npm dependencies**. Every feature is achievable with the existing stack plus browser-native APIs. This is the correct outcome for a polish milestone -- the stack is mature and the features are refinements, not new capability domains.

---

## Feature-by-Stack Mapping

### 1. Responsive/Mobile Design: Tailwind CSS v4 (existing)

| Property | Value |
|----------|-------|
| Package | `tailwindcss` (already installed, v4.2.1) |
| What's needed | Mobile-first responsive classes, container queries |
| Confidence | HIGH |

**Why no new library is needed:**

Tailwind CSS v4 has everything required for responsive mobile design:

- **Mobile-first breakpoints** are built-in: `sm:` (640px), `md:` (768px), `lg:` (1024px), `xl:` (1280px). Unprefixed styles apply to all screen sizes (mobile-first by default).
- **Container queries** are built-in to v4 (no plugin needed): add `@container` to a parent, use `@sm:`, `@md:` etc. on children. This is useful for the dashboard cards which live inside varying-width containers.
- **Custom breakpoints** can be added via `@theme { --breakpoint-xs: 24rem; }` in `index.css` if the defaults don't suffice.
- **Range modifiers** like `md:max-lg:hidden` enable targeting specific ranges without custom media queries.

**Current state of responsiveness:** The app has only 27 responsive class usages across 10 files. This is a desktop-first build that needs systematic mobile-first conversion. The work is pure CSS/class changes on existing components, not library additions.

**Integration approach:**
- Audit all pages (Dashboard, Analytics, Settings) at 375px, 768px, and 1024px
- Convert fixed layouts to responsive grids: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Use `@container` queries on dashboard card sections so child components respond to their container width, not viewport
- vaul drawers (already used for forms) are inherently mobile-friendly -- they slide up from bottom
- Recharts already provides `<ResponsiveContainer>` for chart resizing

**What NOT to add:**
- No CSS-in-JS libraries (styled-components, emotion) -- Tailwind v4 handles everything
- No responsive utility libraries (react-responsive, use-media-query) -- Tailwind breakpoint prefixes are declarative and simpler
- No mobile UI framework (Ionic, Framework7) -- this is a web app with responsive design, not a hybrid mobile app

### 2. Shareable Daily Summary: Clipboard API (browser-native)

| Property | Value |
|----------|-------|
| Package | None -- `navigator.clipboard.writeText()` is a browser API |
| What's needed | Copy formatted text summary to clipboard |
| Confidence | HIGH |

**Why no library is needed:**

The Clipboard API (`navigator.clipboard.writeText()`) reached Baseline Newly Available status in March 2025 and is supported in all modern browsers (Chrome, Edge, Firefox, Safari). It requires:
- Secure context (HTTPS or localhost) -- the dev server runs on localhost, production would need HTTPS
- User gesture (button click) -- the "Share" button click satisfies this
- Tab focus -- not an issue since the user is actively clicking

**Implementation approach:**
```typescript
// Build a plain-text summary string from today's data
const summary = buildDailySummary(todayHabits, dailyLog, streak);
// e.g. "SAIYAN TRACKER -- Mar 8, 2026\n4/6 habits (67%) | Kaio-ken x10\nStreak: 14 days | +70% XP bonus\n..."

await navigator.clipboard.writeText(summary);
toast.success('Summary copied to clipboard!');
```

**Why plain text, not image:**
- `navigator.clipboard.write()` with `ClipboardItem` for images has spottier browser support and requires canvas rendering
- A text summary is instantly pasteable into any chat app (WhatsApp, Discord, iMessage)
- Text is more useful for sharing than a screenshot -- the user can paste it anywhere
- If image sharing is wanted later, `html2canvas` could be added, but that is scope creep for v1.3

**What NOT to add:**
- No `clipboard-copy` or `copy-to-clipboard` npm packages -- they are thin wrappers around the same browser API, adding dependencies for 3 lines of code
- No `html2canvas` or `dom-to-image` for screenshot sharing -- text clipboard is the v1.3 scope
- No Web Share API (`navigator.share()`) -- it launches the OS share sheet which is mobile-only and overkill for "copy to clipboard"

### 3. Enhanced Analytics Views: Recharts 3.7 + Custom Components (existing)

| Property | Value |
|----------|-------|
| Package | `recharts` (already installed, v3.7.0) |
| What's needed | Weekly/monthly completion rate charts, streak leaderboard, best/worst day patterns |
| Confidence | HIGH |

**Why no new charting library:**

Recharts 3.7 already handles all the new chart types needed:

- **Weekly/monthly completion rates:** `<BarChart>` or `<AreaChart>` with `<ResponsiveContainer>`. Data from the existing `/analytics/summary?period=week|month` endpoint (may need enhancement to return per-day breakdown).
- **Best/worst day patterns:** `<BarChart>` grouped by day-of-week (Mon-Sun). Aggregate completion rates by weekday from daily_logs table.
- **Streak leaderboard:** This is a sorted list, not a chart. A simple table/list component with per-habit streak data, sorted by `current_streak` descending. No charting library needed.

**Backend additions needed (not stack, but flagged):**
- New endpoint or enhanced `/analytics/summary` to return daily breakdown by weekday
- New endpoint for per-habit streak ranking (or compute from existing `/habits/today/list` data which includes streaks)
- Enhanced off-day analytics: count off-days by reason, impact on streaks/XP

**Integration approach:**
- New chart components in `components/analytics/` using existing Recharts imports
- All charts wrapped in `<ResponsiveContainer width="100%" height={300}>` for mobile responsiveness
- Use existing Tailwind theme tokens for chart colors (attribute colors are already defined)
- Streak leaderboard is a styled list component, not a chart

**What NOT to add:**
- No `victory` or `nivo` or `chart.js` -- Recharts is already integrated and sufficient
- No `d3` directly -- Recharts abstracts d3 internals; adding raw d3 would create two charting paradigms

### 4. Habit Detail View: Existing Components + React Router (existing)

| Property | Value |
|----------|-------|
| Package | `react-router` (already installed, v7.13.1) |
| What's needed | New route `/habits/:id` with full history, streaks, contribution graph |
| Confidence | HIGH |

**Implementation approach:**
- Add route `/habits/:id` in App.tsx router config
- Compose from existing components: `ContributionGraph` (built in v1.2), streak display, calendar
- New: full completion history list (paginated or virtualized if >100 entries)
- Data from existing endpoints: `GET /habits/{id}/contribution-graph`, `GET /habits/{id}/stats`, `GET /habits/{id}/calendar`

**Virtualization consideration:** If habit history grows long (365+ entries), a virtualized list improves performance. However, adding `@tanstack/react-virtual` or `react-window` is premature -- the app is single-user with at most a year of data (~365 rows per habit). A simple paginated list with "Load more" is sufficient. Flag for v2 if performance becomes an issue.

**What NOT to add:**
- No `@tanstack/react-virtual` or `react-window` -- premature for single-user data volumes
- No separate detail page framework -- React Router dynamic segments handle this cleanly

### 5. Additional Animation/Feedback Events: Motion 12 + uiStore (existing)

| Property | Value |
|----------|-------|
| Package | `motion` (already installed, v12.35.0) |
| What's needed | Uncheck feedback, streak-break acknowledgment, milestone celebrations |
| Confidence | HIGH |

**New animation events to add to `AnimationEvent` union type in `uiStore.ts`:**

| Event | Type | Tier | Description |
|-------|------|------|-------------|
| Habit uncheck | `uncheck` | 3 (Inline) | Brief "undo" visual feedback when unchecking a habit |
| Streak break | `streak_break` | 2 (Banner) | Acknowledgment overlay with Vegeta quote when streak breaks |

**Why these fit the existing architecture:**

The priority-tiered animation queue in `uiStore.ts` already handles 11 event types across 3 tiers. Adding 2 more event types is a pattern extension, not an architecture change:
- Add new types to the `AnimationEvent` union
- Add tier mappings to `PRIORITY_TIERS`
- Add new overlay/inline components in `components/animations/`
- Wire sound IDs in `EVENT_SOUND_MAP`

**Uncheck feedback specifics:**
- Tier 3 (inline) so it fires immediately without queuing
- Brief visual: red flash on the habit card, XP floats down (reverse of check)
- Sound: a short "power down" effect (reverse of scouter beep) -- reuse existing `power_down` SoundId or add a reversed audio sample
- Motion: `animate={{ scale: [1, 0.95, 1] }}` with red border flash

**Streak break acknowledgment:**
- Tier 2 (banner) so it shows as an overlay
- Triggers when the backend returns a streak break event (new field in check response or detected on daily load)
- Shows Vegeta roast quote with streak halving info: "Streak: 14 -> 7 (Zenkai halved)"
- Motion: dramatic entrance with red/purple color scheme

**What NOT to add:**
- No `react-confetti` or `canvas-confetti` -- Motion handles all particle/celebration effects
- No `lottie-react` or `@lottiefiles/react` -- Lottie animations are overkill; Motion keyframes + CSS gradients create the DBZ aesthetic
- No `react-spring` -- Motion is already the animation library; mixing two animation libraries creates confusion

### 6. Off-Day Analytics: Backend Enhancement + Existing Frontend (no new deps)

| Property | Value |
|----------|-------|
| Package | None |
| What's needed | Impact analysis of off-days on streaks, XP, power level |
| Confidence | HIGH |

**Backend work needed:**
- New endpoint `GET /analytics/off-days` or enhanced existing `/off-days/` endpoint
- Return: total off-days by reason, off-day frequency by month, impact metrics (XP lost to off-days, streak pauses)
- Query the existing `off_days` table joined with `daily_logs` and `streaks`

**Frontend:** New section in Analytics page using existing Recharts components for visualization.

### 7. Dashboard Decluttering: Tailwind + Motion (existing)

| Property | Value |
|----------|-------|
| Package | None |
| What's needed | Spacing/alignment polish, collapsible sections, mobile layout |
| Confidence | HIGH |

**Approach:**
- Use Tailwind responsive classes to stack sections vertically on mobile, grid on desktop
- Collapsible sections with Motion `animate={{ height: "auto" }}` for Saiyan Stats, Transformations
- vaul drawer (already used) for habit detail sheets on mobile tap

---

## Libraries Explicitly NOT Needed for v1.3

| Feature | Library Considered | Why Rejected | What to Use Instead |
|---------|-------------------|-------------|---------------------|
| Responsive design | `react-responsive` | Tailwind breakpoint prefixes are declarative and simpler | Tailwind `sm:` `md:` `lg:` prefixes |
| Responsive design | CSS-in-JS (emotion, styled-components) | Already using Tailwind v4; mixing paradigms adds complexity | Tailwind v4 utility classes |
| Container queries | `@container-queries` plugin | Built into Tailwind CSS v4 natively, no plugin needed | Tailwind `@container` + `@sm:` `@md:` |
| Clipboard copy | `clipboard-copy` / `copy-to-clipboard` | 3 lines of browser API code; npm package adds dependency for nothing | `navigator.clipboard.writeText()` |
| Image sharing | `html2canvas` / `dom-to-image` | Text clipboard is the v1.3 scope; image is a different feature | Plain text summary |
| Share sheet | Web Share API wrapper libs | Mobile-only, overkill for "copy to clipboard" | Direct clipboard API |
| Charting | `nivo` / `victory` / `chart.js` | Recharts already integrated; switching adds migration work | Recharts 3.7 (existing) |
| Animation | `react-confetti` / `lottie-react` | Motion 12 handles all effects; mixing animation libs is bad DX | Motion 12 (existing) |
| Virtualized list | `@tanstack/react-virtual` / `react-window` | Premature; max ~365 rows per habit for single user | Simple pagination / "Load more" |
| Mobile UI kit | Ionic / Framework7 / Capacitor | This is responsive web, not a hybrid mobile app | Tailwind responsive + vaul drawers |
| Date/time display | `date-fns` / `dayjs` / `luxon` | The app already uses native `Date` and `Intl.DateTimeFormat` | Continue with native APIs |
| Toast library swap | `sonner` | react-hot-toast is already installed and themed | react-hot-toast (existing) |

---

## Installation Summary

```bash
# No new dependencies needed for v1.3
# The existing stack handles everything
```

**Total new dependencies: 0 packages**
**Total new bundle size impact: 0kb**

---

## Version Compatibility Notes

All existing packages are at current versions as of March 2026. No upgrades needed for v1.3 features.

| Package | Current Version | Status |
|---------|----------------|--------|
| `tailwindcss` | 4.2.1 | Container queries built-in, responsive breakpoints ready |
| `motion` | 12.35.0 | All animation patterns needed are supported |
| `recharts` | 3.7.0 | `ResponsiveContainer` works (minor console warning in v3, non-blocking) |
| `vaul` | 1.1.2 | Drawer component already mobile-friendly |
| `react-router` | 7.13.1 | Dynamic routes for habit detail view |
| `@floating-ui/react` | 0.27.19 | Available for any new popover needs |
| `react-hot-toast` | 2.6.0 | Handles clipboard success/error feedback |

---

## Integration Architecture for v1.3

### How features map to existing stack

```
RESPONSIVE DESIGN (Tailwind v4)
  |
  +-- Dashboard: grid-cols-1 -> md:grid-cols-2 -> lg:grid-cols-3
  +-- Analytics: stacked charts on mobile, side-by-side on desktop
  +-- Settings: single-column forms on mobile (vaul drawers already work)
  +-- @container queries on card sections for component-level responsiveness

SHAREABLE SUMMARY (Browser Clipboard API)
  |
  +-- New "Share" button on Dashboard (lucide-react Share2 icon)
  +-- buildDailySummary() utility function
  +-- navigator.clipboard.writeText() on click
  +-- react-hot-toast for success/error feedback

HABIT DETAIL VIEW (React Router + existing components)
  |
  +-- New route: /habits/:id
  +-- Reuses: ContributionGraph, streak display, calendar components
  +-- New: completion history list, target time display
  +-- Data: existing GET /habits/{id}/stats + /contribution-graph endpoints

ENHANCED ANALYTICS (Recharts + custom components)
  |
  +-- Weekly/monthly rates: BarChart or AreaChart in ResponsiveContainer
  +-- Best/worst days: BarChart grouped by weekday
  +-- Streak leaderboard: styled list (not a chart)
  +-- Off-day analytics: PieChart by reason + impact metrics

NEW ANIMATION EVENTS (Motion + uiStore)
  |
  +-- Add 'uncheck' (Tier 3) and 'streak_break' (Tier 2) to AnimationEvent
  +-- New overlay components in components/animations/
  +-- Wire to existing EVENT_SOUND_MAP
  +-- Extend existing priority queue -- no architecture changes
```

### Backend additions needed (flagged, not stack changes)

| Endpoint | Purpose | Complexity |
|----------|---------|------------|
| `GET /analytics/off-days` | Off-day impact analysis | Low -- query existing tables |
| `GET /analytics/daily-breakdown` | Per-weekday completion rates | Low -- aggregate daily_logs |
| `GET /habits/streak-ranking` | Sorted streak leaderboard | Low -- query habit_streaks |
| Enhanced `/habits/{id}/check` response | Include streak_break event data | Low -- add field to existing response |

---

## Sources

- [Tailwind CSS v4 responsive design docs](https://tailwindcss.com/docs/responsive-design) -- built-in breakpoints, mobile-first -- HIGH
- [Tailwind CSS v4 container queries](https://www.sitepoint.com/tailwind-css-v4-container-queries-modern-layouts/) -- native support, no plugin -- MEDIUM
- [Clipboard API: writeText (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText) -- browser support, secure context requirement -- HIGH
- [Clipboard API: writeText (Can I Use)](https://caniuse.com/mdn-api_clipboard_writetext) -- Baseline Newly Available March 2025 -- HIGH
- [Recharts ResponsiveContainer docs](https://recharts.github.io/en-US/api/ResponsiveContainer/) -- width/height percentage support -- HIGH
- [Recharts 3 ResponsiveContainer issue #6716](https://github.com/recharts/recharts/issues/6716) -- console warning, non-blocking -- MEDIUM
- [Motion for React docs](https://motion.dev/docs/react) -- animation capabilities, spring/keyframe support -- HIGH

---

*Stack additions research for: Saiyan Tracker v1.3 -- The Polish Pass*
*Researched: 2026-03-08*
