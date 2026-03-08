# Pitfalls Research

**Domain:** Adding responsive design, habit detail expansion, off-day analytics, shareable summary, feedback gaps, and enhanced data views to an existing gamified DBZ habit tracker (v1.3 QoL)
**Researched:** 2026-03-08
**Confidence:** HIGH (based on direct codebase analysis of AppShell, Dashboard, HabitCard, HabitDetailSheet, AnimationPlayer, uiStore, habitStore, index.css @theme tokens, BottomTabBar, Analytics page, HeroSection)

## Critical Pitfalls

### Pitfall 1: Responsive Retrofit Breaks the Animation Overlay System

**What goes wrong:**
The `AnimationPlayer` renders fixed-position full-screen overlays (`PerfectDayOverlay`, `TransformationOverlay`, `ShenronCeremony`, etc.) that assume a wide viewport. These overlays use absolute pixel positioning, large text, and particle effects designed for desktop. On a 375px-wide phone screen: text clips, particle systems extend beyond viewport causing horizontal scroll, and the dismiss tap target becomes unreachable behind the `BottomTabBar` (which is `fixed bottom-0` with `h-16`). The Dashboard already has `pb-20` padding to account for the tab bar, but animation overlays mount via `AnimationPlayer` at the AppShell level (`AppShell.tsx` line 39) OUTSIDE the padded content area.

**Why it happens:**
Responsive design is typically applied to page content components (Dashboard, Analytics, Settings). The animation overlay system sits at the app shell level and is easy to forget. Each overlay component was built desktop-first with hardcoded sizes. When the responsive pass touches page layouts but skips `components/animations/`, mobile users get broken overlays on top of a perfectly responsive dashboard.

**How to avoid:**
- Audit ALL 11 overlay components in `components/animations/` for mobile viewport compatibility: `PerfectDayOverlay`, `CapsuleDropOverlay`, `DragonBallTrajectory`, `TransformationOverlay`, `ShenronCeremony`, `TierChangeBanner`, `ComboSummaryOverlay`, `PowerMilestoneOverlay`, `LevelUpOverlay`, `ZenkaiRecoveryOverlay`, `StreakMilestoneOverlay`.
- Ensure overlays use `inset-0` (or equivalent full-viewport coverage) and center content with flexbox, not absolute pixel offsets.
- Add `pb-16` or `mb-16` to overlay dismiss buttons to keep them above the fixed BottomTabBar.
- Test the "last habit perfect day" scenario on a 375px viewport width -- this triggers the most complex overlay sequence.

**Warning signs:**
- Horizontal scrollbar appears when an overlay is active on mobile.
- Overlay dismiss/continue button is hidden behind the bottom tab bar.
- Particle effects or text extend beyond viewport edges.

**Phase to address:**
Responsive design phase. Overlay audit must be part of the responsive pass, not deferred to a separate phase.

---

### Pitfall 2: Dashboard Decluttering That Removes Dopamine Touchpoints

**What goes wrong:**
The Dashboard currently stacks: RoastWelcomeCard, HeroSection (avatar + aura gauge + scouter HUD), StatsPanel (attributes + streaks + dragon balls), HabitList, NudgeBanner, and a FAB. On mobile, this is a LOT of content above the fold before the user reaches the habit list. The instinct is to "declutter" by hiding or collapsing sections. But the core value is "every interaction must feel like something happened." If the aura gauge, scouter HUD, or dragon ball tracker are collapsed/hidden by default on mobile, the user loses the visual feedback loop that makes habit-checking feel rewarding.

**Why it happens:**
Responsive design principles say "reduce visual noise on small screens." ADHD dopamine design says "maximize visible feedback." These goals directly conflict. A developer following mobile-first best practices will hide the "non-essential" sections (dragon balls, attribute grid, streaks) -- but those ARE the dopamine. Hiding them kills the product's core value.

**How to avoid:**
- Never auto-hide the AuraGauge or SaiyanAvatar on mobile. These are the PRIMARY feedback mechanisms. Scale them down (120px instead of 160px) but keep them visible.
- The HeroSection with collapsing MiniHero (via IntersectionObserver, Dashboard.tsx lines 24-41) already solves the "too much above fold" problem elegantly. Do NOT replace this with a different mechanism.
- StatsPanel content (attributes, streaks, dragon balls) can be reorganized into a horizontal scrollable row on mobile instead of being hidden.
- The RoastWelcomeCard can be made dismissible on mobile (swipe to dismiss) since it is informational, not feedback.
- Rule of thumb: if the element changes visually when a habit is checked, it MUST stay visible. If it is static/informational, it can be collapsed or made scrollable.

**Warning signs:**
- Habit list is the first thing visible on mobile (nothing above it provides context/feedback).
- Aura gauge or avatar are inside a collapsed accordion on mobile.
- User checks a habit on mobile and nothing visually changes above the habit card itself.
- The MiniHero sticky header is removed in favor of a different pattern.

**Phase to address:**
Responsive design phase. The PRD review for "what stays visible on mobile" must happen BEFORE writing responsive CSS.

---

### Pitfall 3: Habit Detail View Fetches on Every Card Render

**What goes wrong:**
The current `HabitDetailSheet` (`HabitDetailSheet.tsx` lines 28-44) fires `habitsApi.contributionGraph(habitId, 90)` inside a `useEffect` every time the sheet opens. This is fine when the detail sheet is a bottom drawer opened by explicit user action. But if v1.3 expands the detail view into a full page route (e.g., `/habits/:id`) or a persistent panel, the API call fires on mount. If the dashboard also mounts detail data for preview purposes (e.g., showing mini-graphs on each habit card), that is N API calls on dashboard load (one per habit). With 8 habits, that is 8 parallel requests to the SQLite backend, which is single-threaded.

**Why it happens:**
The v1.3 PRD says "habit detail view (full history, streaks, contribution graph, target time)." The natural implementation is to create a richer detail view. If the richer view is eagerly loaded or mounted as part of the habit list, the data fetching multiplies. SQLite with synchronous SQLAlchemy handles one request at a time -- 8 concurrent contribution graph queries create serial blocking.

**How to avoid:**
- Keep the detail view as a user-initiated action (tap to open), NOT eagerly rendered. The current bottom sheet pattern is correct.
- If adding a route-based detail view (`/habits/:id`), fetch data on navigation, not on dashboard mount.
- Cache contribution graph data in a Zustand store slice with a TTL (e.g., 5 minutes). If the user opens the same habit detail twice within 5 minutes, use cached data.
- NEVER render mini contribution graphs on HabitCard components. The card already shows streak count -- that is sufficient inline data.
- If adding new detail data (weekly/monthly rates, best/worst patterns), aggregate on the backend in a single endpoint, not multiple calls.

**Warning signs:**
- Dashboard load triggers N API calls (one per habit) visible in Network tab.
- SQLite "database is locked" errors under concurrent requests.
- Detail view shows loading spinner every time it opens, even for the same habit.

**Phase to address:**
Habit detail view phase. API design must be a single `/habits/:id/detail` endpoint returning all detail data, not multiple calls.

---

### Pitfall 4: Clipboard Sharing Silently Fails on Mobile Browsers

**What goes wrong:**
The `navigator.clipboard.writeText()` API requires either a secure context (HTTPS) or a user gesture. In development (localhost), it works. On a phone accessing the app via local IP (e.g., `http://192.168.1.x:5173`), `navigator.clipboard` is undefined because the context is not secure. Even on HTTPS, some mobile browsers (older Safari, Firefox) require the copy to happen inside a direct click handler -- not inside an async callback. If the share summary formats text, makes an API call to get stats, THEN copies, the user gesture chain is broken and the copy silently fails.

**Why it happens:**
Clipboard API works perfectly in dev (localhost is treated as secure). The developer never tests on an actual phone over the network. Or: the copy fires after an await (e.g., formatting the summary requires fetching today's stats), which breaks the user gesture requirement on some browsers.

**How to avoid:**
- Pre-compute the shareable summary text BEFORE the user taps "Copy." The summary data (completion %, habits done, streak, power level) is already in Zustand stores. Do NOT make an API call at copy time.
- Use a fallback chain: `navigator.clipboard.writeText()` first, then fall back to the legacy `document.execCommand('copy')` with a temporary textarea element.
- Show a toast confirming success ("Copied!") or failure ("Couldn't copy -- tap and hold to select text") so the user knows what happened.
- If targeting PWA later, ensure the service worker does not intercept clipboard operations.
- Test on actual mobile device over HTTP and HTTPS to verify both paths.

**Warning signs:**
- Copy button does nothing on mobile (no toast, no clipboard content).
- Copy works in Chrome desktop but not Safari mobile.
- Copy works on first tap after page load but fails on subsequent taps.

**Phase to address:**
Shareable summary phase. Must include fallback mechanism and mobile testing.

---

### Pitfall 5: New Animation Events Without Sound Mappings

**What goes wrong:**
v1.3 introduces new feedback events: uncheck feedback, streak-break acknowledgment, and additional milestone celebrations. The existing system has a tight coupling between animation events and sound: `EVENT_SOUND_MAP` in `useSoundEffect.ts` maps each `AnimationEvent` type to a `SoundId`. If a new event type is added to the `AnimationEvent` union in `uiStore.ts` but not to `EVENT_SOUND_MAP`, the event fires silently. The core value is "every interaction must have audio feedback." A silent event violates this principle.

**Why it happens:**
Adding a new `AnimationEvent` type requires updating 4 locations: (1) `AnimationEvent` type union in `uiStore.ts`, (2) `PRIORITY_TIERS` record in `uiStore.ts`, (3) `renderOverlay` switch in `AnimationPlayer.tsx`, (4) `EVENT_SOUND_MAP` in `useSoundEffect.ts`. It is easy to update 3 of 4 and miss one. The TypeScript compiler will catch a missing switch case (if using `exhaustive` checks) but will NOT catch a missing `EVENT_SOUND_MAP` entry because that record uses partial typing.

**How to avoid:**
- Make `EVENT_SOUND_MAP` use `Record<AnimationEvent['type'], SoundId>` (required for all keys) instead of `Partial<Record<...>>`. This way TypeScript will error if a new event type has no sound mapping.
- Before adding any new event type, decide: does it use an EXISTING sound (reuse from the 13 available) or need a NEW sound? v1.2 already established the pattern of reusing sounds (`power_milestone` -> `explosion`, `level_up` -> `reveal_chime`). Follow this pattern.
- Candidate mappings for v1.3 events: `uncheck` already has `play('undo')` in HabitCard; `streak_break` could use `power_down`; new milestone celebrations reuse `reveal_chime`.
- Create a pre-merge checklist: "Does every new AnimationEvent type have entries in PRIORITY_TIERS, renderOverlay, and EVENT_SOUND_MAP?"

**Warning signs:**
- New overlay plays but no sound accompanies it.
- TypeScript compiles clean but a runtime console.warn appears for unmapped event type.
- New event type works in isolation but sounds break when queued with existing events.

**Phase to address:**
Feedback gaps phase. Must be coordinated with any phase that adds new AnimationEvent types.

---

### Pitfall 6: Off-Day Analytics Query Returns Wrong Data for Partial Off-Days

**What goes wrong:**
The existing off-day system marks entire days as off-days in Settings (specific weekdays). Off-day analytics should show "impact of off-days on streaks, XP, and power level." But the off-day concept has an edge case: a user might check some habits on an off-day before realizing it is an off-day (or the off-day setting might be changed mid-day). The `daily_log` table records the day's actual state. If analytics queries filter `WHERE is_off_day = true`, they miss days where the user partially completed habits AND the day was configured as off. If they use Settings weekday config, they get the CURRENT config, not the historical one (the user might have changed which days are off-days).

**Why it happens:**
Off-day status is derived from Settings (which weekdays are off), not stored per-day. If the user changes off-day settings (e.g., removes Saturday as an off-day after 3 months), historical analytics retroactively recategorize all past Saturdays as non-off-days. This is a classic "derived vs. stored" data problem.

**How to avoid:**
- Store `is_off_day: boolean` on the `daily_log` table (or verify it already exists). The off-day status should be snapshotted at the time the log is created, not derived retroactively from current Settings.
- If `daily_log` does not have this field, add a migration that backfills it from the current off-day schedule (best approximation).
- Analytics queries should use `daily_log.is_off_day`, never re-derive from Settings config.
- Show off-day analytics separately: "Your off-day completion rate" vs. "Your active-day completion rate" -- do not mix them.

**Warning signs:**
- Changing off-day settings retroactively changes historical analytics charts.
- Off-day analytics shows 0% for days where the user actually completed habits.
- No `is_off_day` field on daily_log records.

**Phase to address:**
Off-day analytics phase. The data model must be verified/migrated before building the analytics views.

---

### Pitfall 7: Responsive Tailwind Classes Conflict with Existing @theme Token System

**What goes wrong:**
The app uses Tailwind v4 with `@theme` tokens in `index.css` (28 custom color tokens). Responsive design typically uses Tailwind breakpoint prefixes (`sm:`, `md:`, `lg:`). The existing codebase has ZERO responsive prefixes -- everything is mobile-width by default because it was designed for a single desktop-width layout that happens to be narrow. Adding responsive prefixes retroactively means touching almost every component. The risk is introducing inconsistencies: some components get responsive classes, others do not, creating a mixed experience.

**Why it happens:**
The app was built as a "phone-width column on desktop" design. It actually looks decent on mobile already because the layout is narrow. The real responsive issues are: (1) the HeroSection `size={160}` AuraGauge is too large on small screens, (2) fixed-position elements (BottomTabBar, FAB, NudgeBanner, MiniHero) overlap on short viewports, (3) Analytics page charts overflow narrow viewports, (4) modals/sheets assume minimum viewport height. These are surgical fixes, not a full responsive rewrite.

**How to avoid:**
- Do NOT do a "responsive rewrite" of every component. The narrow single-column layout already works on mobile. Focus on the specific breakage points listed above.
- Use `min-h-dvh` (dynamic viewport height) instead of `min-h-screen` to handle mobile browser chrome (address bar, tab bar). The current `min-h-screen` in AppShell may cause content to be hidden behind iOS Safari's bottom bar.
- For the AuraGauge, pass size as a prop derived from viewport: `const gaugeSize = useMediaQuery('(min-width: 768px)') ? 160 : 120` or use responsive Tailwind classes on the container.
- For overlapping fixed elements: audit all `fixed` position elements. On a 568px tall viewport (iPhone SE landscape): BottomTabBar (64px) + FAB (56px + 80px offset from bottom) + MiniHero (when sticky) + NudgeBanner can consume 200px+ of viewport, leaving minimal space for content.
- For charts: ensure recharts `ResponsiveContainer` is used everywhere (it likely already is, but verify).

**Warning signs:**
- Every component file gets touched in the responsive PR (scope creep signal).
- Some pages look responsive, others do not (inconsistent application).
- iOS Safari users report content hidden behind browser chrome.
- iPhone SE landscape shows more fixed UI than scrollable content.

**Phase to address:**
Responsive design phase. Scope should be surgical fixes to specific breakage points, not a full rewrite.

---

### Pitfall 8: Weekly/Monthly Completion Rates Computed Client-Side from Raw Data

**What goes wrong:**
v1.3 includes "weekly/monthly completion rates, streak leaderboard, best/worst day patterns." The naive approach is to fetch all `daily_log` records for the period and compute aggregates in JavaScript. For a month, that is 30 records -- fine. For "all time" after a year, that is 365 records with per-habit breakdowns. The real danger is not performance but ACCURACY: the frontend might calculate completion rate as `completedHabits / totalHabits` using the CURRENT habit count, but the actual rate should use the habit count on EACH historical day (which varies as habits are added/removed/archived).

**Why it happens:**
The `daily_log` table already stores `habits_due` and `habits_completed` per day -- the correct denominator is snapshotted. But if the frontend computes from habit-level data instead of using daily_log snapshots, the denominator is wrong. A developer might also compute "best day" by looking at habits, not daily_logs.

**How to avoid:**
- All aggregate analytics MUST be computed from `daily_log` snapshots, never from current habit state.
- Create a dedicated backend endpoint: `GET /analytics/summary?period=week|month|all` that returns pre-computed aggregates: average completion rate, best day of week, worst day of week, streak leaderboard (sorted habits by current streak).
- The streak leaderboard is a simple sort of active habits by `streak_current` -- this can be computed from the existing `todayHabits` data in habitStore without a new endpoint.
- Best/worst day patterns: `GROUP BY day_of_week` on daily_logs, average `completion_rate` per weekday. This MUST be a backend query, not client-side.

**Warning signs:**
- Analytics show 120% completion rate (denominator mismatch).
- Adding a new habit retroactively lowers all historical completion rates.
- "Best day" computation takes visible time on the frontend.

**Phase to address:**
Enhanced data views phase. Backend aggregation endpoint must exist before frontend views are built.

---

### Pitfall 9: Uncheck Feedback Triggers Reverse Animation Chaos

**What goes wrong:**
v1.3 includes "uncheck feedback" and "streak-break acknowledgment." Currently, unchecking a habit plays `play('undo')` and that is it (`HabitCard.tsx` line 84). If uncheck gets full animation treatment (reverse aura shrink, streak break overlay, power level decrease animation), the animation queue -- which was designed for positive-direction events -- must handle negative-direction events. The priority tier system (`PRIORITY_TIERS` in uiStore.ts) has no concept of "negative" events. An uncheck that fires a `streak_break` event at Tier 2 could get combo-batched with positive events from a previous check, creating nonsensical summaries like "Streak Broken! + Capsule Drop!"

**Why it happens:**
The animation system was designed for the "things getting better" direction. Every event type is celebratory. Introducing negative events (uncheck, streak break) into the same queue creates semantic conflicts. The combo batching system groups Tier 2 events by count, not by valence.

**How to avoid:**
- Negative feedback should NOT use the animation queue. Keep it simple and inline:
  - Uncheck: `play('undo')` + subtle visual pulse on the HabitCard (current behavior is already correct).
  - Streak break: show a small inline toast or character quote (Vegeta), NOT a full overlay. Use `showCharacterQuote()` which already exists.
  - Aura gauge decrease: this already happens naturally when the percentage drops (AuraGauge re-renders with new percent).
- If a streak break acknowledgment overlay IS desired, give it a separate rendering path from the positive animation queue. Use a simple `useState` in Dashboard, not `useUiStore.enqueueAnimation`.
- The `AnimationPlayer` and combo batching system should remain exclusively for positive/celebratory events.

**Warning signs:**
- Uncheck triggers a full-screen overlay.
- Combo summary includes both positive and negative events.
- Unchecking a habit causes a 3-second animation delay before the UI updates.

**Phase to address:**
Feedback gaps phase. Explicitly decide: negative feedback is inline-only, positive feedback uses the queue.

---

### Pitfall 10: Shareable Summary Text Looks Bad When Pasted

**What goes wrong:**
The clipboard summary is plain text that will be pasted into messaging apps (WhatsApp, Discord, iMessage). If the summary uses emoji-heavy formatting that looks good in the app but renders as boxes or misaligned text in some messaging apps, or if it includes internal jargon ("Tier: Kaio-ken x10", "Zenkai activated") that makes no sense to recipients, the share feature is useless.

**Why it happens:**
The developer formats the summary for how it looks in the app's console/preview, not how it renders when pasted into common destinations. Emoji rendering varies across platforms. Line breaks (`\n`) render differently in different apps.

**How to avoid:**
- Keep the summary simple and universally readable:
  ```
  Saiyan Tracker - March 8, 2026
  Completed: 6/6 habits (100%)
  Current streak: 14 days
  Power Level: 12,450
  ```
- Avoid emoji in the core data lines. One optional emoji at the top is fine.
- Use `\n` line breaks (not `\r\n`), which work in all modern messaging apps.
- Do NOT include internal game terms that require context (no "Kaio-ken", "Zenkai", "capsule drops" unless the user opts in).
- Test by copying and pasting into: (1) WhatsApp, (2) Discord, (3) plain text editor.

**Warning signs:**
- Summary text has broken formatting when pasted into WhatsApp.
- Summary includes game mechanics that confuse non-users.
- Summary is more than 5 lines (too long for casual sharing).

**Phase to address:**
Shareable summary phase. Format must be tested by actual paste into messaging apps.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Adding responsive classes only to Dashboard, skipping Analytics/Settings | Faster to ship responsive dashboard | Inconsistent experience across tabs; user notices | Never -- all three pages must get responsive treatment in the same phase |
| Computing analytics aggregates client-side | No new backend endpoint needed | Wrong denominators, slow on large datasets, duplicated logic | Only for streak leaderboard (simple sort of existing data) |
| Skipping overlay audit during responsive pass | Responsive page layouts ship faster | Overlays break on mobile, discovered by user during celebrations | Never -- overlays are part of the core experience |
| Hardcoding share summary format without config | Quick implementation | Cannot adjust format without code change | Acceptable for v1.3; make it a utility function for easy future changes |
| Using `window.innerWidth` checks instead of Tailwind breakpoints | Works immediately | Duplicates breakpoint logic, does not respond to resize | Acceptable ONLY for JavaScript logic (gauge size); use Tailwind for CSS |

## Integration Gotchas

| Integration Point | Common Mistake | Correct Approach |
|-------------------|----------------|------------------|
| Responsive + AnimationPlayer overlays | Applying responsive only to page content, forgetting overlay components | Include all 11 overlay components in responsive audit |
| Habit detail view + existing HabitDetailSheet | Building a new component instead of expanding the existing one | Enhance `HabitDetailSheet.tsx` with additional sections (target time, weekly rate, etc.) |
| Off-day analytics + daily_log | Deriving off-day status from current Settings config | Use snapshotted `is_off_day` from daily_log, not current Settings |
| Clipboard copy + async data fetch | Fetching data after user click, breaking gesture chain | Pre-compute summary from Zustand store data, copy synchronously on click |
| Uncheck feedback + animation queue | Adding negative events to the positive-only animation queue | Keep negative feedback inline (sound + visual pulse), not queued |
| New analytics views + existing useAnalyticsData hook | Creating separate data-fetching hooks per new view | Extend the existing `useAnalyticsData` hook or create a single new endpoint |
| Responsive BottomTabBar + safe area | Not accounting for iOS safe area (notch/home indicator) | Add `pb-safe` or `env(safe-area-inset-bottom)` to BottomTabBar |
| MiniHero sticky + responsive | MiniHero content overflows on narrow screens | Ensure MiniHero uses truncation and responsive text sizing |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Re-rendering all HabitCards when one detail sheet opens | Dashboard stutters on detail open | Keep `showDetail` state local to each HabitCard (already correct in current code) | If detail state is lifted to parent or put in Zustand |
| Contribution grid re-fetching on every sheet open | Network tab shows repeated API calls for same habit | Cache contribution data in a Map keyed by habitId with TTL | After user opens same habit detail 3+ times per session |
| Analytics page computing aggregates on every period change | Visible delay when switching between week/month/all | Backend computes aggregates; frontend only displays | After 6+ months of data |
| Responsive images/avatars not size-constrained | Layout shift when avatar loads on mobile | Use explicit `width` and `height` attributes; use Tailwind `w-` and `h-` classes | On slow connections where images load progressively |
| Too many `matchMedia` listeners for responsive logic | Memory leaks, stale listeners | Use a single shared `useMediaQuery` hook; clean up listeners in useEffect return | If every component adds its own listener |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Hiding dopamine elements on mobile for "cleanliness" | User loses visual feedback that makes checking habits rewarding | Scale down (smaller avatar, compact stats row) instead of hiding |
| Habit detail view blocks the dashboard | User cannot check other habits while viewing detail | Use a bottom sheet (current pattern) or slide-over that allows dismissal with swipe |
| Off-day analytics showing "0% completion" prominently | User feels bad about off-days that were intentionally scheduled | Show off-day stats separately: "You rested 8 days this month" (positive framing) |
| Share summary requiring multiple taps (format selection, confirm, copy) | User gives up before sharing | Single tap: copy pre-formatted summary, show success toast |
| Streak-break overlay on uncheck | User regrets unchecking, stops correcting mistakes | Streak-break feedback should be subtle (inline text change), not dramatic |
| Responsive chart text becoming unreadable | User cannot read axis labels on mobile charts | Use abbreviations for mobile axis labels; ensure minimum 10px font size |

## "Looks Done But Isn't" Checklist

- [ ] **Responsive overlays:** All 11 animation overlay components tested on 375px width -- no horizontal scroll, dismiss button above tab bar
- [ ] **Responsive fixed elements:** BottomTabBar, FAB, MiniHero, NudgeBanner all tested on iPhone SE viewport height (568px) -- content area has at least 350px usable space
- [ ] **iOS safe areas:** `env(safe-area-inset-bottom)` applied to BottomTabBar and any fixed-bottom elements -- tested on iPhone with notch
- [ ] **Clipboard fallback:** Copy works on HTTP (not just HTTPS) with textarea fallback -- tested on actual phone
- [ ] **Off-day data:** `daily_log` records have snapshotted off-day status, not derived from current settings -- verified with SQL query after settings change
- [ ] **Habit detail caching:** Opening the same habit detail twice does not fire two API calls -- verified in Network tab
- [ ] **Analytics aggregates:** Completion rates use `daily_log.habits_due` denominator, not current habit count -- verified by adding a new habit and checking historical rates unchanged
- [ ] **Share text format:** Summary pasted into WhatsApp and Discord renders correctly -- no broken lines, no emoji boxes
- [ ] **Uncheck feedback:** Unchecking does NOT trigger animation queue events -- only inline sound and visual change
- [ ] **Chart responsiveness:** All recharts components use `ResponsiveContainer` and render correctly at 375px -- no axis label clipping
- [ ] **MiniHero sticky:** Works correctly on mobile -- no overlap with content, smooth transition, text fits

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Broken mobile overlays | MEDIUM | Audit each overlay component, add responsive classes and viewport-aware sizing; 1-2 days |
| Hidden dopamine elements | LOW | Restore visibility, switch from `hidden` to `scale-down` approach; UI-only changes |
| Wrong analytics denominators | HIGH | Must audit all analytics queries, switch to daily_log snapshots, possibly backfill data; 1+ day |
| Clipboard silent failure | LOW | Add textarea fallback and toast feedback; 1-2 hour fix |
| Off-day retroactive recalculation | MEDIUM | Add `is_off_day` column to daily_log, backfill from settings, update queries; migration + query changes |
| Negative events in animation queue | MEDIUM | Extract negative events from queue, create inline feedback path; refactor animation enqueue logic |
| Share text formatting | LOW | Adjust format string, test in messaging apps; 30-minute fix |
| Responsive scope creep | LOW | Revert to surgical-fix approach, list specific breakage points; planning change only |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Animation overlay mobile breakage | Responsive design phase | All 11 overlays tested at 375px; no horizontal scroll |
| Dashboard decluttering kills dopamine | Responsive design phase | Aura gauge and avatar visible without scrolling on mobile |
| Fixed element overlap on short viewports | Responsive design phase | iPhone SE landscape has 350px+ usable content area |
| iOS safe area gaps | Responsive design phase | BottomTabBar sits above home indicator on iPhone |
| Tailwind responsive scope creep | Responsive design phase | PR touches specific breakage points, not every component |
| Habit detail over-fetching | Habit detail view phase | Opening detail sheet fires max 1 API call per habit per session |
| Wrong analytics denominators | Enhanced data views phase | Adding a new habit does not change historical rates |
| Off-day retroactive recalculation | Off-day analytics phase | Changing settings does not change past analytics |
| Clipboard silent failure | Shareable summary phase | Copy works on HTTP localhost AND actual mobile device |
| Share text readability | Shareable summary phase | Pasted into WhatsApp/Discord without formatting issues |
| Negative events in animation queue | Feedback gaps phase | Unchecking does not trigger animation queue |
| Missing sound mappings | Feedback gaps phase | Every new event type has an EVENT_SOUND_MAP entry |
| Client-side aggregate computation | Enhanced data views phase | Backend returns pre-computed aggregates |

## Sources

- Direct codebase analysis: `AppShell.tsx`, `Dashboard.tsx`, `HabitCard.tsx`, `HabitDetailSheet.tsx`, `AnimationPlayer.tsx`, `uiStore.ts` (PRIORITY_TIERS, AnimationEvent union), `habitStore.ts` (checkHabit distribution logic), `index.css` (@theme tokens), `BottomTabBar.tsx`, `HeroSection.tsx`, `Analytics.tsx`, `MiniHero.tsx`
- Tailwind v4 responsive design: uses standard breakpoint prefixes (`sm:`, `md:`, `lg:`) -- HIGH confidence (from @theme usage in codebase)
- Clipboard API secure context requirement: [MDN Clipboard API](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API) -- HIGH confidence
- iOS safe area insets: `env(safe-area-inset-bottom)` for fixed-position elements -- HIGH confidence
- Dynamic viewport units (`dvh`): supported in all modern browsers for handling mobile browser chrome -- HIGH confidence

---
*Pitfalls research for: Saiyan Tracker v1.3 -- QoL features (responsive, detail views, analytics, sharing, feedback gaps)*
*Researched: 2026-03-08*
