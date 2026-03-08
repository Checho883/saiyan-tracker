# Phase 18: Dashboard Polish + Responsive Design - Context

**Gathered:** 2026-03-08
**Status:** Ready for planning

<domain>
## Phase Boundary

User can use the full app comfortably on a mobile phone (375px) with consistent layout on all screen sizes up to 1440px desktop. Fix desktop spacing, add mobile breakpoints, audit overlays for mobile safety. No new features — purely layout and interaction polish.

</domain>

<decisions>
## Implementation Decisions

### Mobile Hero Collapse
- Compact single-row layout on mobile: avatar + gauge shrink to ~48px, power level and transformation name sit beside it horizontally, aura progress bar inline
- Breakpoint: `md:` (768px) — below gets compact hero, above keeps full vertical stack
- MiniHero sticky bar stays as-is on all screen sizes (already compact at h-12)
- Keep all dopamine feedback elements visible in compact form (no hiding)

### Navigation & Touch Targets
- BottomTabBar stays as bottom bar on all screen sizes (3 tabs + sound toggle)
- Touch targets: bump icons from 20px to 24px, increase padding to py-3 px-4 (~48px touch area)
- FAB (+ button) stays at bottom-20 right-4, just verify clearance from tab bar on small screens
- Dashboard content area: max-width ~768px, centered on large screens

### Charts & Analytics on Mobile
- Tap to show tooltip (replace hover-based Recharts tooltips on touch)
- Keep stacked vertical layout for all 7 analytics sections — no tabs or reorganization
- All charts and heatmap resize to fit container width — no horizontal scrolling
- Chart legends move below chart on mobile, stay inline/side on desktop

### Settings & Forms on Mobile
- Vaul drawers stay as drawers, allow snap to ~90vh on mobile for more room
- Settings collapsible sections: all collapsed by default on mobile
- Confirm dialogs: Claude's discretion on mobile adaptation

### Claude's Discretion
- Tier change banner adaptation on mobile compact hero
- Form input spacing adjustments for thumb-friendliness
- DeleteConfirmDialog mobile treatment (centered dialog vs bottom sheet)
- Exact spacing and typography scaling at breakpoints

</decisions>

<specifics>
## Specific Ideas

- Compact hero should feel like a status bar — avatar + key info at a glance, not a miniature version of the full hero
- Max-width 768px centered pattern for content prevents absurd stretching on ultrawide monitors
- Charts should never require horizontal scrolling — always fit the viewport

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `MiniHero` (components/dashboard/MiniHero.tsx): Already a compact bar with progress + power level — pattern reference for compact hero
- `BottomTabBar` (components/layout/BottomTabBar.tsx): Fixed bottom nav, needs touch target sizing update
- `AppShell` (components/layout/AppShell.tsx): Root layout with pb-16 for bottom bar clearance
- `HabitFormSheet` + all form sheets: Already use Vaul Drawer — just need snap point adjustment
- `CollapsibleSection` (components/settings/CollapsibleSection.tsx): Already supports collapse — needs default-collapsed prop for mobile

### Established Patterns
- Tailwind CSS v4 with @tailwindcss/vite — no config file, CSS-based configuration, default breakpoints (sm/md/lg/xl)
- Vaul for bottom sheet drawers (already imported and used across all form sheets)
- IntersectionObserver for hero collapse detection (Dashboard.tsx)
- Recharts for all chart components (AttributeChart, PowerLevelChart, CalendarHeatmap)

### Integration Points
- Dashboard.tsx: Add responsive classes to content wrapper, hero section conditional rendering
- AppShell.tsx: May need max-width container wrapper
- Analytics.tsx: Add responsive chart container sizing
- Settings.tsx: Configure CollapsibleSection default state by breakpoint
- All form sheet components: Vaul snap point configuration

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 18-dashboard-polish-responsive-design*
*Context gathered: 2026-03-08*
