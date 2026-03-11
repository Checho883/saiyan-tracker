# Phase 18: Dashboard Polish + Responsive Design - Research

**Researched:** 2026-03-08
**Domain:** Responsive CSS / Mobile-first layout with Tailwind CSS v4
**Confidence:** HIGH

## Summary

Phase 18 transforms the Saiyan Tracker from a desktop-only layout to a mobile-friendly app using Tailwind CSS v4 responsive utilities. The codebase is built with Tailwind v4 (@tailwindcss/vite), React 19, Recharts, Vaul drawers, and Framer Motion (motion/react). All layout is currently desktop-first with no responsive breakpoints applied.

The work divides into four domains: (1) global layout container and desktop spacing polish, (2) hero section mobile collapse, (3) chart/analytics touch adaptation, and (4) form/settings mobile optimization. No new libraries are needed - Tailwind's `sm:`, `md:`, `lg:` utilities plus a few Vaul snap point configs handle everything.

**Primary recommendation:** Use mobile-first responsive classes (base = mobile, `md:` = tablet/desktop), add a max-width container for content centering, and make the hero section swap between compact (mobile) and full (desktop) layouts at the `md:` breakpoint (768px).

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Compact single-row layout on mobile: avatar + gauge shrink to ~48px, power level and transformation name sit beside it horizontally, aura progress bar inline
- Breakpoint: `md:` (768px) — below gets compact hero, above keeps full vertical stack
- MiniHero sticky bar stays as-is on all screen sizes (already compact at h-12)
- Keep all dopamine feedback elements visible in compact form (no hiding)
- BottomTabBar stays as bottom bar on all screen sizes (3 tabs + sound toggle)
- Touch targets: bump icons from 20px to 24px, increase padding to py-3 px-4 (~48px touch area)
- FAB (+ button) stays at bottom-20 right-4, just verify clearance from tab bar on small screens
- Dashboard content area: max-width ~768px, centered on large screens
- Tap to show tooltip (replace hover-based Recharts tooltips on touch)
- Keep stacked vertical layout for all 7 analytics sections — no tabs or reorganization
- All charts and heatmap resize to fit container width — no horizontal scrolling
- Chart legends move below chart on mobile, stay inline/side on desktop
- Vaul drawers stay as drawers, allow snap to ~90vh on mobile for more room
- Settings collapsible sections: all collapsed by default on mobile
- Confirm dialogs: Claude's discretion on mobile adaptation

### Claude's Discretion
- Tier change banner adaptation on mobile compact hero
- Form input spacing adjustments for thumb-friendliness
- DeleteConfirmDialog mobile treatment (centered dialog vs bottom sheet)
- Exact spacing and typography scaling at breakpoints

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| RESP-01 | User can use the full app on a mobile phone with proper touch targets (44px minimum) and readable layouts | BottomTabBar touch target increase + global container + responsive typography |
| RESP-02 | User sees a bottom tab bar for navigation on mobile viewports (< 768px) | BottomTabBar already exists and is fixed-bottom — just needs touch target sizing |
| RESP-03 | User sees consistent spacing and alignment across all dashboard sections on desktop | Max-width container + uniform px-4 spacing + gap normalization |
| RESP-04 | User sees the hero section collapse to a compact form on mobile viewports | New CompactHero component or conditional render in HeroSection at md: breakpoint |
| RESP-05 | User can interact with all charts and analytics on mobile with touch-friendly tooltips | Recharts Tooltip `trigger="click"` + responsive chart heights + legend repositioning |
| RESP-06 | User can complete all settings forms on mobile with thumb-friendly input spacing | Vaul snap points + CollapsibleSection default-collapsed on mobile + form spacing |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Tailwind CSS | v4 (via @tailwindcss/vite) | Responsive utility classes | Already in project, CSS-based config, default breakpoints |
| Recharts | 2.x | Chart rendering with responsive containers | Already in project, ResponsiveContainer already used |
| Vaul | latest | Bottom sheet drawers | Already in project, all form sheets use it |
| motion/react | latest | Animations / AnimatePresence | Already in project for overlays and transitions |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @floating-ui/react | latest | Popover positioning | Already used in CalendarHeatmap for day detail |
| lucide-react | latest | Icons | Already used throughout, icon sizes need responsive updates |

### Alternatives Considered
None needed - all required libraries are already in the project.

**Installation:**
No new packages required.

## Architecture Patterns

### Pattern 1: Mobile-First Responsive with Tailwind v4
**What:** Write base styles for mobile (375px), then add `md:` overrides for tablet/desktop (768px+)
**When to use:** Every component that needs responsive behavior
**Example:**
```tsx
// Mobile-first: base is mobile, md: is desktop
<div className="flex flex-row gap-2 md:flex-col md:gap-4">
  {/* row on mobile, column on desktop */}
</div>
```

### Pattern 2: Responsive Visibility Toggle
**What:** Show/hide different component variants at breakpoints using `hidden`/`md:block`
**When to use:** Hero section (compact on mobile, full on desktop)
**Example:**
```tsx
{/* Full hero - hidden on mobile, shown on md+ */}
<div className="hidden md:block">
  <HeroSection />
</div>

{/* Compact hero - shown on mobile, hidden on md+ */}
<div className="md:hidden">
  <CompactHero />
</div>
```

### Pattern 3: Content Container with Max-Width
**What:** Wrap main content in a centered max-width container
**When to use:** AppShell or page-level wrappers
**Example:**
```tsx
<div className="mx-auto max-w-3xl"> {/* 768px */}
  <Outlet />
</div>
```

### Pattern 4: Vaul Snap Points for Mobile
**What:** Configure Vaul drawer snap points to allow near-fullscreen on mobile
**When to use:** All form sheets (HabitFormSheet, CategoryFormSheet, RewardFormSheet, WishFormSheet)
**Example:**
```tsx
<Drawer.Root
  open={open}
  onOpenChange={(o) => !o && onClose()}
  snapPoints={[0.9]}
>
```

### Pattern 5: Touch-Friendly Recharts Tooltips
**What:** Use click/tap trigger for tooltips on touch devices instead of hover
**When to use:** All Recharts charts (AttributeChart, PowerLevelChart)
**Example:**
```tsx
<Tooltip
  trigger="click"
  contentStyle={{
    backgroundColor: '#1F2937',
    border: '1px solid #374151',
    borderRadius: '8px',
  }}
/>
```

### Anti-Patterns to Avoid
- **Fixed pixel widths on charts:** Never set width in px — always use ResponsiveContainer width="100%"
- **Hiding dopamine elements on mobile:** User decision says keep ALL feedback visible
- **Using `@media` queries in CSS:** Use Tailwind responsive prefixes instead
- **Horizontal scroll containers for charts:** Charts must fit viewport width

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Responsive breakpoint detection | Custom window resize listener + state | Tailwind `md:` / `lg:` classes | CSS-only, no JS overhead, no hydration mismatch |
| Mobile menu / navigation | Custom hamburger + slide panel | Keep existing BottomTabBar (already mobile-native) | Already built correctly |
| Touch tooltip detection | Custom isTouchDevice check | Recharts `trigger="click"` prop | Built into library, handles edge cases |
| Bottom sheet drawers | Custom drag-to-dismiss sheet | Vaul (already used) | Snap points, gesture handling, accessibility built-in |

**Key insight:** This phase requires zero new libraries. Everything needed is already installed. The work is purely adding responsive Tailwind classes and adjusting existing component props.

## Common Pitfalls

### Pitfall 1: Calendar Heatmap Overflow on Narrow Screens
**What goes wrong:** The 7x13 grid of 36px cells (w-9 = 36px) plus gaps requires ~300px. On 375px viewport with px-4 padding (32px), that leaves 343px — tight but possible. However, the legend row at the bottom with 5 items can overflow.
**Why it happens:** Fixed cell sizes don't scale below certain widths.
**How to avoid:** Reduce cell size on mobile (w-7 h-7 = 28px base, w-9 h-9 on md:), wrap legend items.
**Warning signs:** Horizontal scroll appears on 375px test.

### Pitfall 2: Vaul Drawer Content Cut Off Behind Keyboard
**What goes wrong:** On mobile, virtual keyboard pushes content up but drawer height doesn't adjust.
**Why it happens:** `max-h-[85vh]` on drawer content doesn't account for keyboard.
**How to avoid:** Use `snapPoints={[0.9]}` which Vaul handles dynamically. Also ensure form inputs are not at the very bottom of the drawer.
**Warning signs:** Users can't see submit button when typing.

### Pitfall 3: Animation Overlays Not Centered on Mobile
**What goes wrong:** Full-screen overlays (TransformationOverlay, ShenronCeremony, etc.) use fixed positioning with potential desktop-specific sizing.
**Why it happens:** Overlay components may have hardcoded sizes or positions.
**How to avoid:** Audit all 11 overlay components in animations/ for responsive sizing (use % or viewport units, not fixed px).
**Warning signs:** Overlay content extends beyond mobile viewport or appears off-center.

### Pitfall 4: SVG AuraGauge Doesn't Scale
**What goes wrong:** AuraGauge has `size={160}` passed from HeroSection. SVG has `width={size} height={size}` as fixed attributes.
**Why it happens:** SVG dimensions are absolute, not responsive.
**How to avoid:** Pass smaller size for compact hero (48px per user decision), or use viewBox with responsive CSS sizing.
**Warning signs:** Aura gauge overflows compact hero row.

### Pitfall 5: Recharts Tooltip Doesn't Dismiss on Tap-Away
**What goes wrong:** With `trigger="click"`, tapping a data point shows tooltip, but tapping elsewhere may not dismiss it.
**Why it happens:** Recharts click tooltip behavior needs explicit handling on some versions.
**How to avoid:** Test touch dismiss behavior. If needed, add an onClick handler on the chart container to reset active tooltip state.
**Warning signs:** Tooltip stays visible after user navigates away from the data point.

## Code Examples

### Compact Hero Layout (Mobile)
```tsx
// Compact single-row hero for mobile (< 768px)
function CompactHero() {
  const { powerLevel, transformationName } = usePowerStore(useShallow(s => ({
    powerLevel: s.powerLevel,
    transformationName: s.transformationName,
  })));
  const { percent, tier } = useAuraProgress();

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-b from-space-800 to-transparent">
      {/* Small avatar + gauge */}
      <div className="relative flex-shrink-0">
        <AuraGauge percent={percent} tier={tier} size={48} />
        <div className="absolute inset-0 flex items-center justify-center">
          <SaiyanAvatar transformation={transformation} className="w-6 h-6" />
        </div>
      </div>

      {/* Power info inline */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-mono font-bold text-saiyan-500">
            {powerLevel.toLocaleString()}
          </span>
          <span className="text-xs text-text-secondary truncate">
            {transformationName}
          </span>
        </div>
        {/* Inline progress bar */}
        <div className="h-1.5 bg-space-700 rounded-full mt-1 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColorMap[tier]}`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
```

### Responsive Chart Container
```tsx
// Chart with mobile-optimized height and touch tooltip
<ResponsiveContainer width="100%" height={isMobile ? 160 : 200}>
  <AreaChart data={chartData}>
    <Tooltip trigger="click" />
    {/* ... */}
  </AreaChart>
</ResponsiveContainer>
```

### Max-Width Container in AppShell
```tsx
<div className="min-h-screen bg-space-900 pb-16">
  <div className="mx-auto max-w-3xl">
    <Outlet />
  </div>
  <AnimationPlayer />
  <BottomTabBar />
</div>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Tailwind config.js | Tailwind CSS v4 (@theme in CSS) | 2024-2025 | Breakpoints are built-in defaults (sm:640, md:768, lg:1024, xl:1280) |
| media query-based responsive | Utility-first responsive prefixes | Ongoing | No separate CSS files needed |
| Custom bottom sheets | Vaul library with snap points | 2024 | Gesture-native, accessible, snap point API |

## Open Questions

1. **Recharts `trigger="click"` availability**
   - What we know: Recharts Tooltip has a `trigger` prop that accepts "hover" or "click"
   - What's unclear: Exact behavior on touch devices in current Recharts version
   - Recommendation: Test during implementation; if unreliable, wrap chart in a click handler that manages active index state

2. **Animation overlay responsive audit scope**
   - What we know: 11 animation overlay components exist, all use fixed positioning
   - What's unclear: Which ones have hardcoded desktop-specific pixel dimensions
   - Recommendation: Quick audit of each during implementation; most use `fixed inset-0` which is inherently responsive

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest + jsdom + @testing-library/react |
| Config file | `frontend/vitest.config.ts` |
| Quick run command | `cd frontend && npx vitest run --reporter=verbose` |
| Full suite command | `cd frontend && npx vitest run --reporter=verbose` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| RESP-01 | Touch targets >= 44px on all interactive elements | manual-only | Visual inspection at 375px viewport | N/A |
| RESP-02 | Bottom tab bar visible on mobile | unit | `cd frontend && npx vitest run src/__tests__/routing.test.tsx -x` | Exists (routing.test.tsx) - needs responsive assertion |
| RESP-03 | Consistent desktop spacing (no overlap, uniform gaps) | manual-only | Visual inspection at 1440px viewport | N/A |
| RESP-04 | Hero collapses to compact form on mobile | unit | `cd frontend && npx vitest run src/__tests__/hero-section.test.tsx -x` | Exists - needs compact hero test |
| RESP-05 | Charts touch-interactive, no horizontal scroll | manual-only | Visual + touch inspection at 375px | N/A |
| RESP-06 | Settings forms thumb-friendly on mobile | manual-only | Visual inspection at 375px | N/A |

### Sampling Rate
- **Per task commit:** `cd frontend && npx vitest run --reporter=verbose`
- **Per wave merge:** `cd frontend && npx vitest run --reporter=verbose`
- **Phase gate:** Full suite green before verification

### Wave 0 Gaps
- [ ] `frontend/src/__tests__/responsive-hero.test.tsx` — covers RESP-04 (compact hero renders with correct layout)
- [ ] Update `hero-section.test.tsx` — add assertion that full hero renders on desktop
- [ ] Note: RESP-01, RESP-03, RESP-05, RESP-06 are visual/manual-only (CSS class assertions have limited value for layout verification)

## Sources

### Primary (HIGH confidence)
- Codebase analysis: All 3 pages (Dashboard, Analytics, Settings), 14 animation overlays, 4 Vaul drawer sheets, 9 analytics components, layout components examined directly
- Tailwind CSS v4 — default breakpoints from `@tailwindcss/vite` plugin (sm:640, md:768, lg:1024, xl:1280)
- Vaul — snap point API from existing usage in project

### Secondary (MEDIUM confidence)
- Recharts Tooltip `trigger` prop — documented in Recharts API, confirmed via project usage patterns

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all libraries already in project, no new deps
- Architecture: HIGH - standard Tailwind responsive patterns, well-documented
- Pitfalls: HIGH - identified from direct codebase analysis of specific components

**Research date:** 2026-03-08
**Valid until:** 2026-04-08 (stable domain, no fast-moving deps)
