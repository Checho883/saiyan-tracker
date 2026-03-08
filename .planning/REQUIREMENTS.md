# Requirements: Saiyan Tracker v1.3

**Defined:** 2026-03-08
**Core Value:** Every habit check must feel like something happened — a sound, a visual pulse, a number going up. If the app is silent and still, it has failed.

## v1.3 Requirements

Requirements for The Polish Pass. Each maps to roadmap phases.

### Responsive & Layout

- [x] **RESP-01**: User can use the full app on a mobile phone with proper touch targets (44px minimum) and readable layouts
- [x] **RESP-02**: User sees a bottom tab bar for navigation on mobile viewports (< 768px)
- [x] **RESP-03**: User sees consistent spacing and alignment across all dashboard sections on desktop
- [x] **RESP-04**: User sees the hero section collapse to a compact form on mobile viewports
- [x] **RESP-05**: User can interact with all charts and analytics on mobile with touch-friendly tooltips
- [x] **RESP-06**: User can complete all settings forms on mobile with thumb-friendly input spacing

### Feedback

- [ ] **FDBK-01**: User hears a sound and sees a negative XP popup when unchecking a habit
- [ ] **FDBK-02**: User sees aura gauge shrink when unchecking a habit
- [ ] **FDBK-03**: User sees a streak-break notice on first dashboard load after a streak breaks (shows old streak, Zenkai halved value)
- [ ] **FDBK-04**: User sees a celebration when passing power level milestones that currently go unnoticed

### Habit Detail

- [ ] **DTAIL-01**: User can tap a habit to see weekly and monthly completion rates
- [ ] **DTAIL-02**: User can see total attribute XP earned for a specific habit
- [ ] **DTAIL-03**: User can see target time, creation date, category badge, and importance/attribute tags in the detail view

### Analytics

- [ ] **ANLYT-01**: User can see off-day impact analytics (total off-days, XP missed, streaks preserved, reason breakdown)
- [ ] **ANLYT-02**: User can see weekly and monthly completion rate cards with period-over-period comparison
- [ ] **ANLYT-03**: User can see habits ranked by current streak length (personal power rankings)
- [ ] **ANLYT-04**: User can see their best and worst days highlighted in the analytics view

### Sharing

- [ ] **SHAR-01**: User can copy a DBZ-themed daily summary to clipboard with one tap from the dashboard

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Analytics (Extended)

- **ANLYT-05**: User can see day-of-week completion pattern analysis (bar/radar chart)

### Sharing (Extended)

- **SHAR-02**: User can share an image-based visual summary (html2canvas or server-side rendering)

### Export

- **EXPRT-01**: User can export habit data as CSV/PDF reports

## Out of Scope

| Feature | Reason |
|---------|--------|
| Push/browser notifications | Hostile UX for ADHD users (nagging) — per PROJECT.md |
| Social leaderboard / friend comparison | Solo tracker — per PROJECT.md |
| Undo streak break / manual streak editing | Undermines Zenkai recovery mechanic — per PROJECT.md |
| Time-of-day completion patterns | Over-instrumentation, leads to self-surveillance anxiety |
| Complex per-habit trend line charts | Line charts for binary data are misleading; contribution grid + rates suffice |
| Batch "complete all" button | Destroys per-check dopamine loop — per PROJECT.md |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| RESP-01 | Phase 18 | Complete |
| RESP-02 | Phase 18 | Complete |
| RESP-03 | Phase 18 | Complete |
| RESP-04 | Phase 18 | Complete |
| RESP-05 | Phase 18 | Complete |
| RESP-06 | Phase 18 | Complete |
| FDBK-01 | Phase 22 | Pending |
| FDBK-02 | Phase 22 | Pending |
| FDBK-03 | Phase 22 | Pending |
| FDBK-04 | Phase 22 | Pending |
| DTAIL-01 | Phase 20 | Pending |
| DTAIL-02 | Phase 20 | Pending |
| DTAIL-03 | Phase 20 | Pending |
| ANLYT-01 | Phase 21 | Pending |
| ANLYT-02 | Phase 21 | Pending |
| ANLYT-03 | Phase 21 | Pending |
| ANLYT-04 | Phase 21 | Pending |
| SHAR-01 | Phase 22 | Pending |

**Coverage:**
- v1.3 requirements: 18 total
- Mapped to phases: 18
- Unmapped: 0

---
*Requirements defined: 2026-03-08*
*Last updated: 2026-03-08 after roadmap creation*
