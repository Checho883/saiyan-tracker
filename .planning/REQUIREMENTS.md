# Requirements: Saiyan Tracker v1.2

**Defined:** 2026-03-06
**Core Value:** Every habit check must feel like something happened -- a sound, a visual pulse, a number going up. If the app is silent and still, it has failed.

## v1.2 Requirements

### Feedback & Animations

- [x] **FEED-01**: User sees attribute level-up animation and title unlock notification when an attribute reaches a new level
- [x] **FEED-02**: User sees power level milestone celebration when hitting round numbers (1K, 5K, 10K, 50K)
- [x] **FEED-03**: User sees Zenkai recovery animation with visual feedback on first Perfect Day after a streak break
- [x] **FEED-04**: User sees "You're close!" nudge banner when 1-2 habits remain for 100% completion
- [x] **FEED-05**: User sees daily summary toast after checking last habit (closure signal showing %, tier, XP even on imperfect days)
- [x] **FEED-06**: Animation queue supports priority tiers and batching to prevent overload from simultaneous events

### Character & Roasts

- [ ] **CHAR-01**: App detects consecutive missed days and triggers Vegeta roast quotes with escalating severity (mild/medium/savage)
- [ ] **CHAR-02**: Vegeta roast appears as secondary element (never modal), with a welcome_back Goku quote shown first

### Achievements & Streaks

- [ ] **ACHV-01**: Achievement service records transformation unlocks and streak milestones in the achievements table
- [ ] **ACHV-02**: Streak milestone detection fires at 3/7/21/30/60/90/365 day thresholds with badge and character quote
- [x] **ACHV-03**: User can view earned achievements and badges in the UI
- [ ] **ACHV-04**: Achievements only fire inside check_habit() flow, never retroactively on app load

### Analytics & History

- [x] **ANLT-01**: User can view capsule drop history in Analytics page
- [x] **ANLT-02**: User can view wish grant history in Analytics page
- [x] **ANLT-03**: User can view per-habit contribution graph (GitHub-style 90-day grid)
- [x] **ANLT-04**: User can click any calendar day to see popover with per-habit breakdown and XP earned
- [ ] **ANLT-05**: Per-habit calendar and stats API endpoints exist (GET /habits/{id}/calendar, GET /habits/{id}/stats)

### Habit Management

- [x] **HMGT-01**: User can drag-and-drop to reorder habits (with dedicated drag handle, not conflicting with tap-to-check)
- [ ] **HMGT-02**: PUT /habits/reorder API endpoint accepts batch sort_order updates
- [x] **HMGT-03**: User can view archived habits and restore them
- [x] **HMGT-04**: User can create temporary habits with start and end dates via the habit form
- [x] **HMGT-05**: User can select custom frequency days via tappable day-of-week buttons (not raw number input)

### Tech Debt & Polish

- [x] **TECH-01**: recharts react-is peer dependency resolved (explicit react-is@19 install, remove overrides hack)
- [x] **TECH-02**: Real audio sprite files replace placeholder sounds (all 13 existing + any new sound IDs)

## Future Requirements (v1.3+)

### UX Enhancements

- **UX-01**: Habit detail view showing description and target time
- **UX-02**: Off-day analytics rollup (count, most common reason)
- **UX-03**: Onboarding / first-run wizard for new users
- **UX-04**: Shareable daily summary (copy-to-clipboard)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Push/browser notifications | Hostile UX for ADHD users -- experienced as nagging |
| Undo streak break / manual streak editing | Undermines Zenkai recovery mechanic |
| Batch "complete all" button | Destroys the per-check dopamine loop |
| Complex per-habit trend charts | Contribution grid + calendar is sufficient |
| Social/sharing features | Solo tracker by design |
| Mobile PWA | Deferred to v2 |
| Roast intensity Settings toggle | Scope capped at 24 features, revisit if needed |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| FEED-01 | Phase 14 | Complete |
| FEED-02 | Phase 13 | Complete |
| FEED-03 | Phase 14 | Complete |
| FEED-04 | Phase 13 | Complete |
| FEED-05 | Phase 13 | Complete |
| FEED-06 | Phase 11 | Complete |
| CHAR-01 | Phase 12 | Pending |
| CHAR-02 | Phase 12 | Pending |
| ACHV-01 | Phase 12 | Pending |
| ACHV-02 | Phase 12 | Pending |
| ACHV-03 | Phase 14 | Complete |
| ACHV-04 | Phase 12 | Pending |
| ANLT-01 | Phase 13 | Complete |
| ANLT-02 | Phase 13 | Complete |
| ANLT-03 | Phase 13 | Complete |
| ANLT-04 | Phase 15 | Complete |
| ANLT-05 | Phase 12 | Pending |
| HMGT-01 | Phase 15 | Complete |
| HMGT-02 | Phase 12 | Pending |
| HMGT-03 | Phase 16 | Complete |
| HMGT-04 | Phase 16 | Complete |
| HMGT-05 | Phase 16 | Complete |
| TECH-01 | Phase 11 | Complete |
| TECH-02 | Phase 16 | Complete |

**Coverage:**
- v1.2 requirements: 24 total
- Mapped to phases: 24
- Unmapped: 0

---
*Requirements defined: 2026-03-06*
*Last updated: 2026-03-07 after Phase 16 completion*
