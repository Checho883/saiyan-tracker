# Pitfalls Research

**Domain:** Gamified habit tracker (DBZ-theme, ADHD-targeted, animation-heavy, audio-driven)
**Researched:** 2026-03-03
**Confidence:** MEDIUM-HIGH — web search + official docs verified; single-user scope reduces some concerns

---

## Critical Pitfalls

### Pitfall 1: Animation Avalanche — Simultaneous Framer Motion Components Causing Jank

**What goes wrong:**
Every major event in Saiyan Tracker triggers a visual animation: habit check pulses the aura bar, a PointsPopup floats up, the DragonBallTracker might glow, and the transformation meter updates — all at the same moment. When 4-6 animations fire simultaneously on a React component tree, Framer Motion's JavaScript-driven animation engine becomes the bottleneck. On mid-range hardware, this manifests as dropped frames (jank), stuttering aura fills, and audio falling out of sync with visuals.

**Why it happens:**
Framer Motion does not use the Web Animations API (WAAPI) by default — it runs its own JS-driven timing engine. Each `<motion.div>` executing simultaneous property interpolations blocks or competes on the main thread. The perfect-day explosion sequence (screen shake + full-screen overlay + XP counter animate + Dragon Ball appear + quote fade-in) is the worst-case scenario: 5+ animated components firing concurrently.

**How to avoid:**
- Sequence the perfect-day explosion using Framer Motion's `AnimatePresence` and staggered `delay` props rather than firing all components at once.
- Animate only `transform` and `opacity` — never `width`, `height`, `top`, `backgroundColor`, or `boxShadow` directly; these trigger layout/paint, not just composite.
- Avoid applying `willChange` broadly; use it only on the one element that will animate immediately. Blanket `willChange: transform` on habit list items promotes unnecessary GPU layers.
- The aura bar fill animation (the most frequent event) must be a CSS transition on `scaleX` transform, not a Framer Motion value, to avoid adding to the JS animation budget on every single habit check.
- The `PerfectDayAnimation` overlay should unmount when complete — use `AnimatePresence` with `mode="wait"` so it releases GPU layers after the sequence ends.
- Test on a mid-range Android browser (the target "worst-case" device) early — jank invisible on a dev machine becomes obvious on a 3-year-old phone.

**Warning signs:**
- Chrome DevTools Performance tab shows long paint/composite tasks (>16ms frame budget) during habit check
- Audio plays before the visual completes (misaligned feedback)
- The aura bar "jumps" instead of smoothly growing
- `console.log` timings inside animation callbacks show delayed execution

**Phase to address:** Animation & Feedback Phase (whichever phase implements `PerfectDayAnimation` and `ShenronAnimation` — treat these as performance-constrained from day one, not as "optimize later" components)

---

### Pitfall 2: Audio Firing on App Load — Browser Autoplay Policy Silencing Everything

**What goes wrong:**
The app starts, loads the user's daily state, and immediately plays a "welcome back" sound or queues the aura charging sound. The browser blocks it. The AudioContext is in `suspended` state until the user performs a gesture (click, tap, keypress). All audio calls before that first gesture are silently swallowed. The user never hears the scouter beep on their first habit check of the session if they opened the app without clicking anything first.

**Why it happens:**
All major browsers (Chrome, Firefox, Safari) enforce an autoplay policy: `AudioContext` starts suspended, and `context.resume()` must be called from inside a user-initiated event. `use-sound` and Howler.js both rely on Web Audio API and hit this restriction identically. Safari is strictest — it will not play audio unless the resume call is in the same synchronous call stack as the user gesture.

**How to avoid:**
- Implement a `SoundProvider` context that calls `audioContext.resume()` on the first user interaction anywhere in the app (a click/touch on the habit checkbox immediately satisfies this).
- Do NOT try to pre-warm or pre-play audio on `useEffect` or component mount.
- Store the `AudioContext` in a singleton (Howler.js does this automatically), not one per component — multiple contexts compound the permission problem.
- For the habit check sound specifically: the `play()` call must happen in the click handler directly, not in a `setTimeout` or `useEffect` triggered by a state change.
- Test the audio flow on first app load in a new browser tab every time a new sound event is added.

**Warning signs:**
- First habit check of the day is silent; subsequent ones have sound
- Console shows `AudioContext was not allowed to start` warning
- Sounds work in development (localhost often has fewer restrictions) but fail in production
- Transformation sounds don't play when triggered by a state change (XP threshold crossed) rather than a direct click

**Phase to address:** Audio Foundation Phase — establish the `SoundProvider` singleton and gesture-resume pattern before wiring up any individual sounds. Every sound added later inherits the correct pattern.

---

### Pitfall 3: Overlapping Audio on Rapid Habit Checks

**What goes wrong:**
Sergio checks habit 1 (scouter beep), then immediately checks habit 2 before the first sound finishes. Two scouter beeps stack. He checks 3-4 habits quickly (ADHD rapid-fire behavior) and 4 beeps are layered over each other. The capsule-drop sound overlaps the habit sound. The Kaio-ken tier-up sound fires on top of both. The dashboard sounds like audio soup.

**Why it happens:**
`use-sound` and Howler.js both allow multiple instances of the same sound to play simultaneously by default. Each `play()` call creates a new audio sprite instance. When a user with ADHD rapid-checks habits (the most natural behavior for the target user), the sound queue accumulates faster than sounds complete.

**How to avoid:**
- For short, per-event sounds (scouter beep): use `interrupt: true` in `use-sound` so each new play stops the previous instance. The beep is <1 second; interrupting is imperceptible.
- For the aura-charging ambient hum (grows with %): use a single Howler.js instance, adjust its `rate` or `volume` over time, never spawn new instances.
- For the perfect-day explosion: gate behind a flag so it cannot be triggered while already playing. A `ref` tracking `isAnimating` prevents re-entrant triggers.
- Implement a global sound priority queue: at most 2 sounds playing simultaneously (foreground event sound + possible background ambient). Queue additional sounds with a 200ms gap.
- Assign sound priority tiers: explosion/transformation (tier 1, interrupts everything), capsule/achievement (tier 2), habit-check beep (tier 3, lowest).

**Warning signs:**
- Audio sounds muddy or distorted during rapid habit checks
- Users report "it plays the sound twice sometimes"
- The perfect-day explosion is drowned out by leftover habit sounds

**Phase to address:** Audio Foundation Phase — build the priority queue and interrupt logic before any individual sounds are wired. Retrofitting audio architecture is painful.

---

### Pitfall 4: XP Calculation Drift Between Frontend and Backend

**What goes wrong:**
The frontend Zustand store calculates and displays XP optimistically (before the API responds). The backend calculates XP authoritatively. They use slightly different rounding, slightly different streak multiplier values, or slightly different tier boundaries. After 30 days, the displayed power level is 47 XP higher than the database value. The user sees a transformation milestone fire in the UI at 1,000 XP, but the backend hasn't crossed 1,000 yet. A page refresh "uncrosses" the transformation. This is invisible for weeks and then confusing when discovered.

**Why it happens:**
The XP formula has multiple multiplication steps with `floor()` calls: `floor(base_daily_xp * completion_rate * tier_multiplier * (1 + streak_bonus))`. Floating-point arithmetic in Python and JavaScript can produce different results at the sub-integer boundary. If the frontend recalculates on state change and the backend recalculates on receipt, one rounding call difference compounds over hundreds of days.

**How to avoid:**
- The backend is the single source of truth for all XP values. The frontend NEVER independently calculates XP — it only displays what the backend returns.
- The `POST /habits/{id}/check` response already returns `daily_xp_so_far`, `attribute_xp_awarded`, `completion_tier` — use these directly, do not recalculate them in the store.
- The `powerStore` sets values from API responses, never derives them locally. `power_level = response.power_level`, not `power_level += calculated_xp`.
- For optimistic UI: show a loading/pending state on the XP counter during the API call rather than optimistically incrementing by a client-calculated amount.
- Write a backend endpoint test that runs the XP formula 1,000 times with edge-case inputs (streak=0, streak=20, completion=0.5, completion=1.0) and asserts exact integer output. This becomes the source of truth for any frontend display logic.

**Warning signs:**
- Displayed power level after refresh differs from displayed power level before refresh
- Transformation animation fires on frontend but backend still shows previous form
- Streak bonus percentages displayed in UI don't match analytics summary stats
- The XP counter "corrects" visibly after API response arrives (jerk from optimistic to real value)

**Phase to address:** Database & Model Integrity Phase — establish the calculation-authority contract before any UI is built. The backend service tests must exist before the frontend store is implemented.

---

### Pitfall 5: Streak Breaking at Midnight / Timezone Boundary

**What goes wrong:**
Sergio completes all habits at 11:58 PM. The backend records the completion with the server's local date. He opens the app at 12:02 AM — the frontend sends today's date (now the next calendar day) when checking daily state. The backend compares `last_active_date` to "today" using the server clock. If the server is in UTC and the user is UTC-6, "today" on the server became the next day 6 hours ago. The streak incorrectly breaks even though the user completed habits on both "their" days.

A related failure: Daylight Saving Time transition creates a 23-hour day. If `last_active_date` was yesterday at 11:30 PM and "today" is only 23 hours later due to DST, naive date arithmetic (`today - last_date == 1`) can fail, breaking the streak.

**Why it happens:**
Streak logic that uses `date.today()` on the server computes the date in the server's timezone, not the user's. SQLite's `DATE` type stores dates as `YYYY-MM-DD` strings, which are inherently timezone-naive. When the app is used near midnight in any timezone other than the server's, date comparisons produce off-by-one errors.

**How to avoid:**
- All `log_date` values must be stored using the **client's local date** in `YYYY-MM-DD` format, sent explicitly in the API request body, not derived from `datetime.now()` on the server.
- The `POST /habits/{id}/check` request body must include `local_date: "2026-03-03"` (the user's local calendar date).
- Streak evaluation compares `last_active_date` to the client-provided `local_date`, never to `datetime.now(tz=UTC).date()`.
- Off day logic must also accept `local_date` for the same reason.
- DST safety: all date arithmetic uses Python's `datetime.date` subtraction (pure date objects, no time component) — never convert DATE to DATETIME for comparison.
- Add a backend test: simulate a habit check submitted with `local_date = "2026-03-04"` when `last_active_date = "2026-03-03"` and assert streak increments; simulate `local_date = "2026-03-05"` and assert streak breaks.

**Warning signs:**
- Users report streaks breaking "when I'm sure I completed all my habits yesterday"
- The streak shows "(paused)" for an off day that was never declared
- Streak resets consistently happen around midnight or on DST transition dates
- `last_active_date` in the database shows UTC date, not local date

**Phase to address:** Database & Model Integrity Phase — this is a data contract decision. Once habits are being checked in production with the wrong date authority, correcting historical streak data is high-effort.

---

### Pitfall 6: Reward System Saturation — 25% Capsule Rate Feels Spammy by Week 3

**What goes wrong:**
The 25% capsule drop rate feels exciting on day 1. By week 3, Sergio has accumulated 15 unclaimed capsules in the history. The popup interrupts habit checking every third check. The slot-machine thrill habituates. Opening capsules becomes a chore rather than a delight. He stops caring about capsules entirely, which removes a core motivation layer. The variable reward circuit needs variability — if rewards come too frequently, they lose their power.

**Why it happens:**
25% per habit check on 6 habits = statistically ~1.5 capsules per day. In a week, that's 10+ common rewards. Research on variable reward schedules (slot machine psychology) shows that reward frequency must be calibrated to the specific reward type: micro-rewards (common capsules) can be frequent, but the excitement of "opening" requires that the reward feels genuinely surprising, which habituates fast at 25%.

**How to avoid:**
- The 25% rate is correct for the PRD. Do NOT inflate it further during testing to make the demo feel exciting.
- Implement a "pending capsule" notification badge rather than an immediate popup interrupt. The user opens capsules when they want to, not mid-habit-check flow.
- The capsule opening animation must be short (<2 seconds) and skippable. If it feels like work to open, the mechanic collapses.
- Monitor: if unclaimed capsules in history > 5 for a single day, the rate or UX needs adjustment.
- The Shenron wish loop (7 Dragon Balls = 1 wish) must be calibrated separately: 7 non-consecutive perfect days is achievable in 2 weeks. If it takes too long, motivation drops. If it happens too fast (1 week), the macro-reward loop loses meaning.

**Warning signs:**
- Capsule history shows large unclaimed backlog
- User disables the capsule popup in settings
- The habit-check flow feels interrupted and annoying rather than exciting

**Phase to address:** Reward System Phase — establish the UX pattern of "notification badge, open when ready" from the start. Do not build an intrusive popup-first design and retrofit it later.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Calculate XP in frontend Zustand store | Instant UI without waiting for API | XP drift, inconsistent transformation triggers, rollback complexity | Never — the backend must own all XP math |
| Use `date.today()` server-side for streak date | Simpler code, no client date required | Streaks break near midnight for non-server-timezone users | Never — client must send local_date |
| Animate `backgroundColor` and `boxShadow` directly | Simpler code, fewer transform workarounds | Browser paint on every frame, jank on mid-range hardware | Never for high-frequency animations (aura bar) |
| One `AudioContext` per component | Simpler sound wiring | Exceeds browser limits (6 concurrent contexts), permission issues | Never |
| Skip `interrupt: true` on short sounds | Simpler sound setup | Audio soup during rapid habit checks | Never |
| Pre-populate all 10 transformation animations on load | No lazy-load delay during transformation unlock | Bundle size doubles; animations 8-10 never seen by week-1 users | Only if transformation unlock latency is perceptible |
| Hard-code the "today" date in tests | Faster test setup | Tests break on real date boundaries, DST | Never for date-sensitive logic |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Framer Motion + React 19 | Using deprecated `motion` component import paths from v10 — v11 changed exports | Import from `motion/react`, not `framer-motion` (v11 renamed the package) |
| use-sound + AudioContext | Calling `play()` before user gesture (app load, useEffect) | Call `play()` only inside click/tap handlers; implement `SoundProvider` that resume()s context on first interaction |
| SQLite + date arithmetic | Using `DATETIME` type for streak date comparison instead of `DATE` | Use bare `DATE` columns; SQLite `DATE` subtraction returns integer days cleanly |
| FastAPI + SQLite | Not closing sessions between requests; SQLite single-writer issue under concurrent requests | Use `scoped_session` pattern; SQLite is fine for single-user but session leaks create file locks |
| Framer Motion + `AnimatePresence` | Not setting a unique `key` prop on animated overlays — same key means the exit animation doesn't fire | Every overlay component (`PerfectDayAnimation`, `ShenronAnimation`) needs a unique key that changes when re-triggered |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Animating all 6 habit cards simultaneously on load | Dashboard load causes visible card stagger lag; main thread blocks | Stagger with `delay: index * 0.05` so cards animate in sequence | Immediately visible with 6+ habits |
| `motion.div` on every habit card list item | React DevTools shows 6x `motion` wrappers re-rendering on any state change | Only animate the specific property that changes (the checkbox state); use CSS for static card layout | Noticeable on slower hardware; invisible on dev machine |
| Howler.js loading all audio files at startup | First paint is delayed 1-2 seconds while audio buffers load | Lazy-load audio files; only preload the most frequent sounds (habit-check beep) | At page load, especially on slower connections |
| SQLite full-table scan for today's habits | `GET /habits/today/list` becomes slow as habit_logs grows over months | Index `(habit_id, log_date)` on `habit_logs` table; index `(user_id, log_date)` on `daily_logs` | Noticeable after 6+ months of daily use (~1000+ rows) |
| Zustand store re-rendering all dashboard components on any XP change | Every habit check causes the entire dashboard to re-render | Use Zustand selectors — subscribe each component only to the specific slice it needs | Immediately, as component tree grows |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Animation plays, then locks UI during it | ADHD users cannot check the next habit until the previous animation finishes; frustration, abandonment | Animations must be non-blocking. The aura fill plays while the next habit is already checkable |
| Screen shake on every habit check (not just 100%) | Overstimulation by habit 3; screen shake becomes noise, not reward | Reserve screen shake exclusively for 100% perfect day and transformation unlocks |
| Vegeta roast appears mid-session when user opens app | User is actively trying to complete habits; a roast interrupts flow and feels punishing | Vegeta roast triggers only at session start (opening the app) when previous day was missed, never during an active habit-check session |
| No visual distinction between "completed this session" and "completed earlier today" | User cannot tell if an undo/recheck is happening or if they're confused about state | Completed habits show time of completion on hover; recently completed (this session) have a brief highlight that fades |
| Sound volume not calibrated across events | Habit beep is quiet; perfect-day explosion is window-shaking loud | All sounds normalized to the same peak volume in editing; the explosion is dramatic through animation, not decibel level |
| Too many visible numbers at once (Power Level + 4 attributes + streak + completion % + XP earned) | ADHD cognitive overload; decision paralysis about what to focus on | The dashboard hierarchy must be clear: completion % is huge and primary; everything else is secondary, smaller, less prominent |
| Capsule popup interrupts habit check flow | User is in "check habits" mode; a popup demanding interaction breaks the flow | Queue capsule notification, show badge; user opens capsule drawer intentionally after completing habits |

---

## "Looks Done But Isn't" Checklist

- [ ] **Streak calculation:** Verify streak increments correctly when `local_date` is provided by client, not server clock — test at 11:59 PM and 12:01 AM explicitly
- [ ] **XP display:** Verify the power level displayed after page refresh matches the power level displayed after habit check (no drift)
- [ ] **Audio on cold load:** Open a new browser tab, do NOT click anything before checking a habit — verify the sound plays (SoundProvider resume pattern works)
- [ ] **Rapid habit checks:** Check all 6 habits within 5 seconds — verify no audio stacking/soup, no jank in aura bar fill
- [ ] **Perfect day sequence:** Trigger 100% completion — verify the full sequence (screen darken → explosion → XP counter → Dragon Ball → quote) plays in order without any step being skipped or overlapping the next
- [ ] **Off day declared today:** Verify that marking today as an off day immediately removes habits from the due list and shows "(paused)" streak — not a stale cached state
- [ ] **Transformation unlock:** Cross an XP threshold — verify transformation animation fires exactly once even if the user rapidly checks habits right at the boundary
- [ ] **Dragon Ball 7th collection:** Collect the 7th Dragon Ball — verify Shenron animation fires and `dragon_balls_collected` resets to 0 in the database (not just the UI)
- [ ] **Capsule RNG at 0 rewards configured:** Open the app with the capsule reward list empty — verify habit check doesn't crash when capsule drop triggers but no rewards exist
- [ ] **Habit with frequency=weekdays on weekend:** Open app on Saturday — verify no weekday habits appear in today's list and daily% calculates from remaining habits correctly

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| XP drift discovered after weeks of use | HIGH | Audit `daily_logs.xp_earned` vs. sum of expected formula output per day; recalculate correct values; UPDATE database; clear Zustand persistence |
| Streak data corrupted by wrong date authority | HIGH | Reconstruct streaks from `habit_logs` table (source of truth); add `PATCH /streaks/recalculate` admin endpoint for recovery |
| Audio architecture missing interrupt/priority | MEDIUM | Add `SoundManager` singleton with queue; replace all direct `play()` calls with `SoundManager.play(soundId, priority)` |
| Animation jank discovered in production | MEDIUM | Profile with Chrome DevTools; convert worst offenders from `motion.div` to CSS transitions; takes 1-2 days per component |
| Capsule popup UX is too intrusive | LOW | Change popup trigger from immediate to badge notification; UI-only change, no backend work |
| Reward inflation / saturation | LOW | Adjust capsule drop rate in a constants file; no schema change required |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| XP calculation drift | Database & Model Integrity | Backend formula tests assert exact integer output; frontend store never derives XP |
| Streak timezone bug | Database & Model Integrity | Tests simulate habit check at 11:59 PM and 12:02 AM local time with UTC server; streak increments correctly |
| Off-by-one streak date | Database & Model Integrity | Client sends `local_date`; backend uses it; both tested with explicit date payloads |
| Audio autoplay restriction | Audio Foundation | First-load test: no pre-gesture sounds; first habit check in new tab plays audio |
| Overlapping sounds | Audio Foundation | Rapid-check test: 6 habits in 5 seconds; audio sounds clean, not stacked |
| Animation avalanche (jank) | Animation & Feedback | Chrome DevTools frame budget during perfect-day sequence; all frames <16ms |
| will-change over-promotion | Animation & Feedback | Layers panel in DevTools; no unexpected GPU layers on static habit cards |
| XP display/optimistic drift | State Management | Page-refresh test: displayed XP before and after refresh is identical |
| Reward saturation | Reward System | Week-3 simulation: 15 capsule drops in history; UX still feels rewarding, not spammy |
| Capsule crash (empty rewards) | Reward System | Test: capsule drops with 0 configured rewards; no 500 error, graceful no-op |
| Transformation fires twice | Animation & Feedback | Rapid habit check at XP boundary; transformation animation fires exactly once |
| UI blocks during animation | Animation & Feedback | Habit checkbox is interactive during all animations including perfect-day sequence |

---

## Sources

- [Motion.dev Performance Guide](https://motion.dev/docs/performance) — MEDIUM confidence (content was CSS-only on fetch; guidance sourced from search + known architecture)
- [Framer Motion vs Motion One Mobile Performance 2025 — reactlibraries.com](https://reactlibraries.com/blog/framer-motion-vs-motion-one-mobile-animation-performance-in-2025) — MEDIUM confidence (verified via WebFetch: JS engine vs WAAPI architecture confirmed)
- [Web Audio Autoplay Policy — Chrome for Developers](https://developer.chrome.com/blog/web-audio-autoplay) — HIGH confidence (official Google Chrome docs, verified via WebFetch)
- [MDN Autoplay Guide](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay) — HIGH confidence (MDN official documentation)
- [How to Build a Streaks Feature — Trophy](https://trophy.so/blog/how-to-build-a-streaks-feature) — HIGH confidence (verified via WebFetch; specific DST/midnight edge cases confirmed)
- [Howler.js Overlapping Sounds — GitHub Issues #686, #1227](https://github.com/goldfire/howler.js/issues/686) — HIGH confidence (direct issue tracker, specific to this library)
- [use-sound — GitHub](https://github.com/joshwcomeau/use-sound) — HIGH confidence (`interrupt` option confirmed in official README)
- [Counterproductive Effects of Gamification: Habitica Analysis — ScienceDirect](https://www.sciencedirect.com/science/article/abs/pii/S1071581918305135) — MEDIUM confidence (paywalled; abstract and secondary summaries accessed)
- [Gamification in Habit Tracking: Does It Work? — Cohorty](https://www.cohorty.app/blog/gamification-in-habit-tracking-does-it-work-research-real-user-data) — MEDIUM confidence (WebSearch summary; 67% abandonment by week 4 statistic cited)
- [Solving Eventual Consistency in Frontend — LogRocket](https://blog.logrocket.com/solving-eventual-consistency-frontend/) — MEDIUM confidence (optimistic update rollback patterns verified)
- [Zustand Optimistic Persist Discussion](https://github.com/pmndrs/zustand/discussions/2497) — MEDIUM confidence (community discussion on persistence inconsistency)

---
*Pitfalls research for: Gamified habit tracker (Saiyan Tracker v3)*
*Researched: 2026-03-03*
