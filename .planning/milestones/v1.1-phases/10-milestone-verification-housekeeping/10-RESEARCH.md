# Phase 10: Milestone Verification & Housekeeping - Research

**Researched:** 2026-03-06
**Domain:** Documentation verification and metadata housekeeping
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Verify requirements against actual source code (static analysis of components, hooks, stores)
- Follow the same VERIFICATION.md format used by Phases 4, 5, and 6
- Each requirement gets a pass/fail with file:line evidence
- Phase 7 VERIFICATION.md covers ANIM-01..09
- Phase 8 VERIFICATION.md covers ANLYT-01..05, SET-01..07
- Phase 7 SUMMARY frontmatter: populate empty requirements_completed arrays
- REQUIREMENTS.md checkbox updates: DASH-01..13 [x], AUDIO-02..03/05..09 [x], ANIM and ANLYT/SET based on verification

### Claude's Discretion
- Exact wording and formatting of verification evidence
- How to handle edge cases where implementation partially meets a requirement
- Whether to include code snippets or just file:line references in VERIFICATION.md

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

## Summary

Phase 10 is a pure documentation/verification phase with no code changes. The work involves: (1) creating 07-VERIFICATION.md by examining animation component source files against ANIM-01..09, (2) creating 08-VERIFICATION.md by examining analytics/settings components against ANLYT-01..05 and SET-01..07, (3) fixing Phase 7 SUMMARY frontmatter, and (4) updating REQUIREMENTS.md checkboxes and traceability table.

All source code files exist and were confirmed during Phase 7-9 execution. Phase 9 already fixed 3 cross-phase integration issues (SET-01, AUDIO-01, AUDIO-04, DASH-04) that were identified in the v1.1 audit.

**Primary recommendation:** Execute as a single plan with 4 sequential tasks — each verification document depends on examining source files but the tasks themselves are independent documentation writes.

## Standard Stack

No new libraries or tools needed. This phase uses only:
- File reading (Read tool) to examine source code
- File writing (Write/Edit tools) to create/update documentation
- Git for committing documentation changes

## Architecture Patterns

### VERIFICATION.md Format (from Phases 4-6)

```markdown
---
phase: XX-phase-name
status: passed | failed | human_needed
verified: YYYY-MM-DD
verifier: orchestrator | automated
score: N/N (optional)
---

# Phase X: Name - Verification

## Phase Goal
[Goal from roadmap]

## Success Criteria Verification
### 1. [Criterion from roadmap]
**Status:** PASSED | FAILED
- [Evidence with file:line references]

## Requirements Coverage
| ID | Description | Status | Evidence |
|----|-------------|--------|----------|
| REQ-XX | [desc] | PASSED/FAILED | [file:line evidence] |

## Test Results
- **Total tests:** N passed, N failed
- **TypeScript:** npx tsc --noEmit status

## Must-Haves Verification
| Truth | Verified |
|-------|----------|
| [must-have statement] | Yes/No - [evidence] |

## Conclusion
Phase X [PASSED/FAILED]. [Summary].
```

### SUMMARY Frontmatter Format
```yaml
requirements-completed: [REQ-01, REQ-02, ...]
```

### REQUIREMENTS.md Checkbox Format
```markdown
- [x] **REQ-ID**: Description
```

### REQUIREMENTS.md Traceability Table Format
```markdown
| Requirement | Phase | Status |
|-------------|-------|--------|
| REQ-ID | Phase N | Complete |
```

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Verification format | Custom format | Existing VERIFICATION.md format from Phases 4-6 | Consistency across milestone |
| Requirement mapping | Manual tracking | PLAN.md task assignments + SUMMARY.md body text | Already documented which plans cover which requirements |

## Common Pitfalls

### Pitfall 1: Confusing SET-01/AUDIO-01 Ownership
**What goes wrong:** SET-01 and AUDIO-01 were fixed in Phase 9, not Phase 8
**Why it happens:** Phase 8 originally claimed SET-01 but the integration was broken
**How to avoid:** Phase 8 VERIFICATION should note SET-01 was partially implemented (toggle UI) but fully fixed in Phase 9. Mark PASSED with cross-reference to 09-VERIFICATION.md.

### Pitfall 2: AUDIO-04 Cross-Phase Fix
**What goes wrong:** AUDIO-04 (capsule reveal chime) was wired in Phase 9, not Phase 7
**Why it happens:** Phase 6 defined the sound, Phase 7 built the overlay but didn't wire the chime, Phase 9 fixed it
**How to avoid:** Phase 7 VERIFICATION should note ANIM-04/ANIM-05 (capsule overlay) is PASSED for animation, and cross-reference Phase 9 for the audio wiring.

### Pitfall 3: Stale REQUIREMENTS.md Checkboxes
**What goes wrong:** Updating checkboxes without updating the traceability table
**Why it happens:** Two sections need to stay in sync
**How to avoid:** Update both checkbox list AND traceability table in the same task.

## Code Examples

### Source Files for Phase 7 Verification (ANIM-01..09)

| Req | Component File | What to Check |
|-----|----------------|---------------|
| ANIM-01 | `frontend/src/components/animations/AnimationPlayer.tsx` + `frontend/src/store/uiStore.ts` | Queue in uiStore, AnimatePresence mode="wait" |
| ANIM-02 | `frontend/src/components/animations/TierChangeBanner.tsx` | Scale-in animation at 50%/80% thresholds |
| ANIM-03 | `frontend/src/components/animations/PerfectDayOverlay.tsx` | Choreographed 2-3s sequence |
| ANIM-04 | `frontend/src/components/animations/CapsuleDropOverlay.tsx` | Bounce-in with scale spring, pulse |
| ANIM-05 | `frontend/src/components/animations/CapsuleDropOverlay.tsx` | Card flip (rotateY) with rarity glow |
| ANIM-06 | `frontend/src/components/animations/DragonBallTrajectory.tsx` | Trajectory arc animation |
| ANIM-07 | `frontend/src/components/animations/TransformationOverlay.tsx` | Form-specific visuals + avatar swap |
| ANIM-08 | `frontend/src/components/animations/ShenronCeremony.tsx` | Full-screen sequence |
| ANIM-09 | `frontend/src/components/animations/ShenronCeremony.tsx` | Wish enforcement (min 1 active wish) |

### Source Files for Phase 8 Verification (ANLYT-01..05, SET-01..07)

| Req | Component File | What to Check |
|-----|----------------|---------------|
| ANLYT-01 | `frontend/src/components/analytics/CalendarHeatmap.tsx` | 4-color coding (gold/blue/red/gray) |
| ANLYT-02 | `frontend/src/components/analytics/CalendarHeatmap.tsx` | Month prev/next navigation |
| ANLYT-03 | `frontend/src/components/analytics/AttributeChart.tsx` | Area chart with period selector |
| ANLYT-04 | `frontend/src/components/analytics/StatCards.tsx` | 4 stat cards |
| ANLYT-05 | `frontend/src/components/analytics/PowerLevelChart.tsx` | Cumulative XP line chart |
| SET-01 | `frontend/src/components/settings/PreferencesSection.tsx` + `frontend/src/audio/SoundProvider.tsx` | Sound toggle + persistence (Phase 9 fix) |
| SET-02 | `frontend/src/hooks/useTheme.ts` + `frontend/src/components/settings/PreferencesSection.tsx` | Dark/light toggle + persistence |
| SET-03 | `frontend/src/components/settings/RewardSection.tsx` + `RewardFormSheet.tsx` | CRUD + rarity |
| SET-04 | `frontend/src/components/settings/WishSection.tsx` + `WishFormSheet.tsx` | CRUD + active toggle |
| SET-05 | `frontend/src/components/settings/CategorySection.tsx` + `CategoryFormSheet.tsx` | Category CRUD |
| SET-06 | `frontend/src/components/settings/OffDaySelector.tsx` | Off-day with reasons |
| SET-07 | `frontend/src/components/settings/PreferencesSection.tsx` | Display name input |

### Phase 7 SUMMARY Frontmatter Fix

07-01-SUMMARY.md: Add `requirements-completed: [ANIM-01, ANIM-02]`
07-02-SUMMARY.md: Add `requirements-completed: [ANIM-03, ANIM-04, ANIM-05, ANIM-06, ANIM-07, ANIM-08, ANIM-09]`

Based on PLAN.md task assignments:
- 07-01 covers: AnimationPlayer (ANIM-01), TierChangeBanner (ANIM-02)
- 07-02 covers: PerfectDay (ANIM-03), Capsule (ANIM-04, ANIM-05), DragonBall (ANIM-06), Transformation (ANIM-07), Shenron (ANIM-08, ANIM-09)

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 3.x |
| Config file | `frontend/vitest.config.ts` |
| Quick run command | `cd frontend && npx vitest run --reporter=verbose` |
| Full suite command | `cd frontend && npx vitest run --reporter=verbose` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ANIM-01 | Animation queue sequential playback | unit | `npx vitest run src/__tests__/animation-queue.test.tsx -x` | Verification only (code review) |
| ANIM-02 | TierChangeBanner spring animation | unit | N/A | Verification only |
| ANIM-03..09 | Animation overlays | unit | N/A | Verification only |
| ANLYT-01..05 | Analytics components | unit | `npx vitest run src/__tests__/calendar-heatmap.test.tsx src/__tests__/stat-cards.test.tsx src/__tests__/analytics-charts.test.tsx` | Existing |
| SET-01..07 | Settings components | unit | `npx vitest run src/__tests__/settings.test.tsx src/__tests__/settings-crud.test.tsx` | Existing |

### Sampling Rate
- **Per task commit:** `cd frontend && npx vitest run --reporter=verbose`
- **Phase gate:** Full suite green + tsc --noEmit clean

### Wave 0 Gaps
None — this phase creates documentation only, no test infrastructure needed.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| ANIM-01 | Animation queue sequential playback | Verify AnimationPlayer.tsx + uiStore queue |
| ANIM-02 | TierChangeBanner scale-in at thresholds | Verify TierChangeBanner.tsx |
| ANIM-03 | PerfectDay choreographed sequence | Verify PerfectDayOverlay.tsx |
| ANIM-04 | Capsule drop bounce-in | Verify CapsuleDropOverlay.tsx |
| ANIM-05 | Capsule 3D card flip with rarity glow | Verify CapsuleDropOverlay.tsx |
| ANIM-06 | DragonBall trajectory arc | Verify DragonBallTrajectory.tsx |
| ANIM-07 | Transformation form-specific visuals | Verify TransformationOverlay.tsx |
| ANIM-08 | Shenron full-screen ceremony | Verify ShenronCeremony.tsx |
| ANIM-09 | Shenron wish enforcement | Verify ShenronCeremony.tsx |
| ANLYT-01 | Calendar heatmap 4-color coding | Verify CalendarHeatmap.tsx |
| ANLYT-02 | Month navigation controls | Verify CalendarHeatmap.tsx |
| ANLYT-03 | Attribute area chart with period selector | Verify AttributeChart.tsx |
| ANLYT-04 | StatCards (4 metrics) | Verify StatCards.tsx |
| ANLYT-05 | PowerLevel line chart | Verify PowerLevelChart.tsx |
| SET-01 | Sound toggle persistence | Verify PreferencesSection + SoundProvider (Phase 9 fix) |
| SET-02 | Theme toggle persistence | Verify useTheme + PreferencesSection |
| SET-03 | Capsule rewards CRUD with rarity | Verify RewardSection + RewardFormSheet |
| SET-04 | Wishes CRUD with active toggle | Verify WishSection + WishFormSheet |
| SET-05 | Category management | Verify CategorySection + CategoryFormSheet |
| SET-06 | Off-day marking with reasons | Verify OffDaySelector |
| SET-07 | Display name input | Verify PreferencesSection |
</phase_requirements>

## Sources

### Primary (HIGH confidence)
- Existing VERIFICATION.md files (Phases 04, 05, 06, 09) — format reference
- v1.1-MILESTONE-AUDIT.md — gap analysis with per-requirement evidence
- Phase 7/8 SUMMARY.md files — what was built and requirement mappings
- Phase 7/8 PLAN.md files — original task assignments
- Actual source files in frontend/src/components/ — code to verify against

## Metadata

**Confidence breakdown:**
- Verification format: HIGH — 4 existing examples to follow
- File locations: HIGH — all source files confirmed present
- Requirement mapping: HIGH — PLAN.md + SUMMARY.md + audit report provide clear mapping

**Research date:** 2026-03-06
**Valid until:** 2026-04-06 (stable — documentation format)
