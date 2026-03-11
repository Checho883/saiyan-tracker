# Phase 22: Feedback Gaps + Shareable Summary - Context

**Gathered:** 2026-03-11
**Status:** Ready for planning

<domain>
## Phase Boundary

Close remaining feedback loops for negative events (uncheck, streak break) and add milestone celebration escalation + a copy-to-clipboard daily summary. No new game mechanics or data models — this phase layers feedback UX onto existing backend data (CheckHabitResponse, StatusResponse.streak_breaks, POWER_MILESTONES).

</domain>

<decisions>
## Implementation Decisions

### Uncheck Feedback
- Red negative XP popup mirroring the existing XpPopup — same component with a negative variant, showing actual deducted amount (e.g., "-15 STR XP"), floating downward instead of upward
- AuraGauge smoothly animates shrink over ~500ms when completion drops (same Motion lib used for growth, just reversed)
- Keep the existing `undo` sound on uncheck (already wired in HabitCard) — no change to audio
- Backend's `attribute_xp_awarded` on uncheck provides the actual deduction amount for the popup

### Streak-Break Acknowledgment Card
- Dismissible banner card rendered above the habit list on first dashboard load when `StatusResponse.streak_breaks[]` is non-empty
- Multiple broken streaks stacked in a single card (e.g., "2 streaks broken" with a list of habit: old → halved)
- Encouraging Saiyan tone: "A Saiyan grows stronger after every defeat." with CTA button labeled "Get Back Up"
- Plays `power_up` sound when the card appears (Zenkai recovery theme — emphasizes comeback)
- Single dismiss action closes card for the session (X button or CTA both dismiss)

### Milestone Expansion
- Expand POWER_MILESTONES from 4 to 10: [100, 250, 500, 1000, 2500, 5000, 10000, 25000, 50000, 100000]
- Escalating celebration intensity by tier:
  - 100–2,500: Standard PowerMilestoneOverlay + explosion sound
  - 5K–10K: Overlay + ScreenShake component
  - 25K–50K: Overlay + ScreenShake + longer sound FX
  - 100K: Full-screen gold theme + thunder_roar sound (maximum drama)
- Reuses existing PowerMilestoneOverlay and ScreenShake components — escalation adds props/variants

### Shareable Daily Summary
- Copy-to-clipboard text summary with full stats: date, completion % (done/total), XP earned, power level + transformation name, best streak highlight, capsule drop if any, "Powered by Saiyan Tracker" footer
- Share button (clipboard icon) placed in the hero section next to power level display — always visible
- Quick success toast on copy: "Scouter data copied!" (2s, top-center, matches existing toast style)
- Today's data only — no yesterday fallback
- Uses navigator.clipboard.writeText API

### Claude's Discretion
- Exact animation timing for negative XP popup float-down
- Streak-break card styling details (border color, icon choice)
- Milestone escalation thresholds for ScreenShake intensity
- Share summary text formatting details and emoji usage
- Whether to add the clipboard button to mobile MiniHero variant

</decisions>

<specifics>
## Specific Ideas

- Negative XP popup should drift DOWN (gravity feel) vs positive drifting UP — visual metaphor for loss vs gain
- Streak-break card tone: "A Saiyan grows stronger after every defeat" — Zenkai spirit, not punishment
- CTA button: "Get Back Up" — action-oriented, encouraging
- Milestone 100K should feel like a final boss moment — thunder_roar + gold treatment
- Share toast: "Scouter data copied!" — stays in DBZ vocabulary

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `XpPopup` component (`dashboard/XpPopup.tsx`): Currently positive-only, needs negative variant (red color, downward animation)
- `AuraGauge` component (`dashboard/AuraGauge.tsx`): Already animates growth — needs reverse animation path
- `PowerMilestoneOverlay` (`animations/PowerMilestoneOverlay.tsx`): Existing celebration, extend with escalation variants
- `ScreenShake` (`animations/ScreenShake.tsx`): Already exists for PerfectDay — reusable for milestone escalation
- `EVENT_SOUND_MAP` (`audio/useSoundEffect.ts`): Maps animation types to sounds, will need new entries
- `PRIORITY_TIERS` (`store/uiStore.ts`): Existing tier system for animation queue
- `RoastWelcomeCard` (`dashboard/RoastWelcomeCard.tsx`): Pattern for dismissible card at dashboard top

### Established Patterns
- Optimistic UI with rollback in habitStore — uncheck path already exists at line 80-98
- Animation queue (uiStore.enqueueAnimation) for all visual events — Tier 1/2/3 priority system
- Sound triggers via useSoundEffect hook subscribing to animation queue changes
- Toast notifications via react-hot-toast for transient messages

### Integration Points
- `HabitCard.handleTap` (line 76-98): Uncheck branch (`!result.is_checking`) — add negative XP popup trigger here
- `habitStore.checkHabit` (line 80-222): Distributes check results to stores — aura shrink happens naturally via completion recalculation
- `useInitApp` hook: Fetches `/status` on load — streak_breaks data already available, needs to trigger card render
- `HeroSection`/`ScouterHUD`: Where share button will be placed next to power level
- `POWER_MILESTONES` constant in habitStore (line 9): Currently hardcoded [1000, 5000, 10000, 50000] — expand array

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 22-feedback-gaps-shareable-summary*
*Context gathered: 2026-03-11*
