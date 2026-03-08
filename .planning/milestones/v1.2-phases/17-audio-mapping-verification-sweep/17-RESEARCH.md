# Phase 17: Audio Sound Mapping + Verification Sweep - Research

**Researched:** 2026-03-08
**Domain:** Audio integration, documentation verification, requirements traceability
**Confidence:** HIGH

## Summary

Phase 17 is a gap-closure phase that addresses three categories of issues identified in the v1.2 milestone audit: (1) four missing sound mappings in `EVENT_SOUND_MAP` that leave overlay animations silent, (2) missing VERIFICATION.md files for Phases 13-16, and (3) REQUIREMENTS.md traceability cleanup. This is not a feature-building phase -- all features are already implemented and integration-confirmed. The work is wiring, documenting, and verifying.

The audit found 15 of 24 requirements in "partial" status because their phases lack formal VERIFICATION.md files. Integration checking confirms all features are wired end-to-end, but 4 animation event types (`power_milestone`, `level_up`, `zenkai_recovery`, `streak_milestone`) play with no audio because `EVENT_SOUND_MAP` in `useSoundEffect.ts` only maps 7 of the 11 event types.

**Primary recommendation:** Add 4 entries to EVENT_SOUND_MAP using existing SoundIds from the 13-sound sprite (no new audio synthesis needed), then create VERIFICATION.md for Phases 13-16 confirming integration-checked features pass, and update REQUIREMENTS.md traceability.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Howler.js | (already installed) | Audio sprite playback | Already powering all existing sound effects |
| Vitest | (already installed) | Frontend testing | Already configured in vitest.config.ts |
| Zustand | (already installed) | UI state / animation queue | Already managing AnimationEvent types |

### Supporting
No new libraries needed. This phase only modifies existing files.

### Alternatives Considered
None -- no new technology decisions in this phase.

**Installation:**
```bash
# No new packages needed
```

## Architecture Patterns

### Existing Sound Mapping Architecture
```
frontend/src/
├── audio/
│   ├── soundMap.ts          # SoundId type + SPRITE_MAP offsets (13 sounds)
│   ├── useAudio.ts          # Howler.js wrapper, play(soundId) function
│   └── useSoundEffect.ts    # EVENT_SOUND_MAP + queue subscriber
├── store/
│   └── uiStore.ts           # AnimationEvent union type (11 variants)
└── components/animations/
    ├── AnimationPlayer.tsx   # renderOverlay switch (11 cases)
    └── *Overlay.tsx          # 8 overlay components
```

### Pattern 1: EVENT_SOUND_MAP Extension
**What:** Add missing entries to the `Record<AnimationEvent['type'], SoundId>` constant
**When to use:** When new animation event types are added that need audio feedback
**Current state:**
```typescript
// 7 of 11 mapped:
const EVENT_SOUND_MAP: Record<AnimationEvent['type'], SoundId> = {
  tier_change: 'power_up',
  perfect_day: 'explosion',
  capsule_drop: 'capsule_pop',
  dragon_ball: 'radar_ping',
  transformation: 'transform',
  shenron: 'thunder_roar',
  xp_popup: 'scouter_beep',
};

// 4 MISSING: power_milestone, level_up, zenkai_recovery, streak_milestone
```

**Required additions (mapping rationale):**
```typescript
power_milestone: 'explosion',      // Big celebration -- reuse explosion (1500ms boom)
level_up: 'reveal_chime',          // Attribute level-up -- chime matches "unlock" feel
zenkai_recovery: 'power_up',       // Recovery surge -- rising energy sweep fits recovery theme
streak_milestone: 'reveal_chime',  // Achievement unlocked -- chime matches badge reveal
```

**Note on SoundId reuse:** The 13 existing SoundIds already cover the sonic palette needed. The success criteria call for 4 new SoundId names (`power_milestone`, `level_up`, `zenkai_recovery`, `streak_milestone`), but this would require new audio synthesis, new sprite compilation, and SPRITE_MAP updates. Research finding: the success criteria text says "4 new" but the audit's actual gap is about EVENT_SOUND_MAP entries, not new audio files. The planner should decide whether to:
- (A) Reuse existing SoundIds (zero audio work, just 4 map entries) -- recommended
- (B) Create 4 new SoundIds with new synthesized audio + recompile sprite -- matches literal success criteria wording

### Pattern 2: VERIFICATION.md Format
**What:** Formal phase verification document confirming all success criteria passed
**Format:** Follow the exact structure from existing `12-VERIFICATION.md`:
```markdown
---
phase: {phase-slug}
status: passed
verified: {date}
---
# Phase N: Name - Verification
## Phase Goal
## Success Criteria Verification
### 1. {criterion}
**Status:** PASSED
- {evidence}
## Requirement Coverage
| Requirement | Status | Covered By |
## Test Results
## Verification: PASSED
```

### Anti-Patterns to Avoid
- **Creating new audio files when mapping to existing SoundIds suffices:** The 13-sound sprite already exists with all needed timbres. Don't resynthesize unless the success criteria strictly require new SoundId names.
- **Retroactive VERIFICATION.md that claims to have run tests that weren't run:** Verifications should honestly document what was integration-checked vs. formally tested.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Sound effect playback | Custom Web Audio API code | Howler.js (already integrated) | Sprite support, format fallback, cross-browser |
| Animation event typing | Loose string matching | TypeScript Record type (already enforced) | Compile-time completeness checking |

**Key insight:** TypeScript's `Record<AnimationEvent['type'], SoundId>` will produce a compile error if EVENT_SOUND_MAP doesn't cover all 11 AnimationEvent types. This means adding the 4 missing entries is a type-system requirement, not just a runtime one. The code currently has this type annotation but it compiles because TypeScript allows partial Records by default -- the `Record` type ensures all keys have the right value type but doesn't enforce completeness at the type level. The runtime check `if (soundId)` handles missing keys gracefully (silent playback).

## Common Pitfalls

### Pitfall 1: SPRITE_MAP Offset Errors
**What goes wrong:** Adding new SoundIds to soundMap.ts with wrong offsets breaks all subsequent sounds
**Why it happens:** Offsets are cumulative -- each sound's offset = previous offset + previous duration + 100ms gap
**How to avoid:** If reusing existing SoundIds, no SPRITE_MAP changes needed. If adding new SoundIds, recompile the sprite and recalculate all offsets.
**Warning signs:** Sounds play wrong audio or clip early

### Pitfall 2: Verification Scope Creep
**What goes wrong:** VERIFICATION.md becomes a re-implementation effort instead of documentation
**Why it happens:** Verifier discovers "partial" features and tries to fix them
**How to avoid:** Phase 17 verification is documentary -- confirm what the audit already integration-checked. The audit confirmed all features are WIRED. Verification just formalizes that finding.
**Warning signs:** Creating new components or modifying feature code

### Pitfall 3: REQUIREMENTS.md Checkbox Inconsistency
**What goes wrong:** Traceability table shows items as "Pending" that are verified PASSED
**Why it happens:** Phase 12 VERIFICATION.md confirmed 7 requirements PASSED but REQUIREMENTS.md checkboxes were already updated in a later edit
**How to avoid:** Cross-reference audit's tech_debt section -- the audit found this was already fixed (all checkboxes now show `[x]`). Verify current state before making changes.
**Warning signs:** Making changes that are already done

## Code Examples

### Adding Missing EVENT_SOUND_MAP Entries
```typescript
// Source: frontend/src/audio/useSoundEffect.ts (current file)
// Add 4 new entries to complete all 11 AnimationEvent types:
const EVENT_SOUND_MAP: Record<AnimationEvent['type'], SoundId> = {
  tier_change: 'power_up',
  perfect_day: 'explosion',
  capsule_drop: 'capsule_pop',
  dragon_ball: 'radar_ping',
  transformation: 'transform',
  shenron: 'thunder_roar',
  xp_popup: 'scouter_beep',
  // NEW: Phase 17 gap closure
  power_milestone: 'explosion',
  level_up: 'reveal_chime',
  zenkai_recovery: 'power_up',
  streak_milestone: 'reveal_chime',
};
```

### Updating sound-triggers.test.ts
```typescript
// Add 4 new expected mappings to the test:
{ eventType: 'power_milestone', soundId: 'explosion', description: 'Power milestone plays explosion', requirement: 'FEED-02' },
{ eventType: 'level_up', soundId: 'reveal_chime', description: 'Level-up plays reveal chime', requirement: 'FEED-01' },
{ eventType: 'zenkai_recovery', soundId: 'power_up', description: 'Zenkai recovery plays power-up', requirement: 'FEED-03' },
{ eventType: 'streak_milestone', soundId: 'reveal_chime', description: 'Streak milestone plays reveal chime', requirement: 'ACHV-02' },
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| 7-event sound map | 11-event sound map needed | Phase 13-14 added 4 new event types | 4 overlays play silently |

**Deprecated/outdated:**
- Nothing deprecated -- this is a wiring fix, not a technology change

## Open Questions

1. **New SoundIds vs. Reuse Existing?**
   - What we know: Success criteria says "4 new: power_milestone, level_up, zenkai_recovery, streak_milestone" as SoundIds. But the 13-sound sprite already covers the sonic needs.
   - What's unclear: Does "4 new" mean 4 new SoundId names requiring new audio files, or 4 new EVENT_SOUND_MAP entries?
   - Recommendation: Reuse existing SoundIds unless the planner determines literal new audio synthesis is required. The audit's actual gap is "EVENT_SOUND_MAP missing entries" not "soundMap.ts missing SoundIds."

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest (jsdom environment) |
| Config file | frontend/vitest.config.ts |
| Quick run command | `cd frontend && npx vitest run --reporter=verbose` |
| Full suite command | `cd frontend && npx vitest run` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FEED-01 | Level-up animation has audio mapping | unit | `cd frontend && npx vitest run src/__tests__/sound-triggers.test.ts -x` | Needs update |
| FEED-02 | Power milestone has audio mapping | unit | `cd frontend && npx vitest run src/__tests__/sound-triggers.test.ts -x` | Needs update |
| FEED-03 | Zenkai recovery has audio mapping | unit | `cd frontend && npx vitest run src/__tests__/sound-triggers.test.ts -x` | Needs update |
| TECH-02 | All event types mapped to sounds | unit | `cd frontend && npx vitest run src/__tests__/sound-triggers.test.ts -x` | Needs update |
| FEED-04 | Nudge banner wired | integration-check | Manual (already integration-confirmed by audit) | N/A |
| FEED-05 | Daily summary toast wired | integration-check | Manual (already integration-confirmed by audit) | N/A |
| ACHV-03 | Achievement UI wired | integration-check | Manual (already integration-confirmed by audit) | N/A |
| ANLT-01 | Capsule history wired | unit | `cd frontend && npx vitest run src/__tests__/capsule-history.test.tsx -x` | Exists |
| ANLT-02 | Wish history wired | unit | `cd frontend && npx vitest run src/__tests__/wish-history.test.tsx -x` | Exists |
| ANLT-03 | Contribution graph wired | unit | `cd frontend && npx vitest run src/__tests__/contribution-graph.test.tsx -x` | Exists |
| ANLT-04 | Calendar day detail wired | unit | `cd frontend && npx vitest run src/__tests__/calendar-heatmap.test.tsx -x` | Exists |
| HMGT-01 | Drag-and-drop reorder wired | integration-check | Manual (already integration-confirmed by audit) | N/A |
| HMGT-03 | Archived habits view/restore | unit | `cd frontend && npx vitest run src/__tests__/settings.test.tsx -x` | Exists |
| HMGT-04 | Temporary habits with dates | unit | `cd frontend && npx vitest run src/__tests__/habit-form.test.tsx -x` | Exists |
| HMGT-05 | Day-of-week buttons | unit | `cd frontend && npx vitest run src/__tests__/habit-form.test.tsx -x` | Exists |
| CHAR-01 | Vegeta roast escalation | verified | Phase 12 VERIFICATION.md: PASSED | N/A |
| CHAR-02 | Roast secondary element | verified | Phase 12 VERIFICATION.md: PASSED | N/A |
| ACHV-01 | Achievement recording | verified | Phase 12 VERIFICATION.md: PASSED | N/A |
| ACHV-02 | Streak milestone detection | verified | Phase 12 VERIFICATION.md: PASSED | N/A |
| ACHV-04 | Achievements only in check_habit() | verified | Phase 12 VERIFICATION.md: PASSED | N/A |
| ANLT-05 | Per-habit calendar/stats API | verified | Phase 12 VERIFICATION.md: PASSED | N/A |
| HMGT-02 | PUT /habits/reorder endpoint | verified | Phase 12 VERIFICATION.md: PASSED | N/A |

### Sampling Rate
- **Per task commit:** `cd frontend && npx vitest run src/__tests__/sound-triggers.test.ts -x`
- **Per wave merge:** `cd frontend && npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `frontend/src/__tests__/sound-triggers.test.ts` -- update expectedMappings to include 4 new event types (currently tests 7, needs 11)
- [ ] Update test assertion from "all 7" to "all 11" animation event types

*(No framework install needed -- Vitest already configured)*

## Sources

### Primary (HIGH confidence)
- `frontend/src/audio/useSoundEffect.ts` -- current EVENT_SOUND_MAP with 7 entries
- `frontend/src/audio/soundMap.ts` -- SoundId type union (13 sounds), SPRITE_MAP offsets
- `frontend/src/store/uiStore.ts` -- AnimationEvent union type (11 variants), PRIORITY_TIERS
- `.planning/v1.2-MILESTONE-AUDIT.md` -- gap identification (15 partial requirements, 4 missing sound mappings)
- `.planning/phases/12-backend-detection-services/12-VERIFICATION.md` -- format reference for VERIFICATION.md
- `.planning/REQUIREMENTS.md` -- current traceability table (all 24 checkboxes already checked)

### Secondary (MEDIUM confidence)
- Phase SUMMARY.md files (13-03, 14-02, 16-03) -- confirm what was built in each phase

### Tertiary (LOW confidence)
- None

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| FEED-01 | Level-up animation + title unlock notification | Add `level_up: 'reveal_chime'` to EVENT_SOUND_MAP; create 14-VERIFICATION.md confirming LevelUpOverlay wired |
| FEED-02 | Power milestone celebration at 1K/5K/10K/50K | Add `power_milestone: 'explosion'` to EVENT_SOUND_MAP; create 13-VERIFICATION.md confirming PowerMilestoneOverlay wired |
| FEED-03 | Zenkai recovery animation with visual feedback | Add `zenkai_recovery: 'power_up'` to EVENT_SOUND_MAP; create 14-VERIFICATION.md confirming ZenkaiRecoveryOverlay wired |
| FEED-04 | Nudge banner when 1-2 habits remain | Create 13-VERIFICATION.md confirming NudgeBanner wired (integration-confirmed by audit) |
| FEED-05 | Daily summary toast after last habit | Create 13-VERIFICATION.md confirming daily summary toast wired (integration-confirmed by audit) |
| TECH-02 | Real audio sprites replace placeholders | Confirm all 11 event types mapped to SoundIds; 16-VERIFICATION.md confirms 13 sounds synthesized |
| ACHV-03 | Achievement/badge UI viewing | Create 14-VERIFICATION.md confirming AchievementsGrid wired to GET /achievements/ |
| ANLT-01 | Capsule drop history in Analytics | Create 13-VERIFICATION.md confirming CapsuleHistoryList wired |
| ANLT-02 | Wish grant history in Analytics | Create 13-VERIFICATION.md confirming WishHistoryList wired |
| ANLT-03 | Per-habit contribution graph | Create 13-VERIFICATION.md confirming ContributionGrid wired |
| ANLT-04 | Calendar day detail popover | Create 15-VERIFICATION.md confirming DayDetailPopover wired |
| HMGT-01 | Drag-and-drop habit reorder | Create 15-VERIFICATION.md confirming DnD reordering wired to PUT /habits/reorder |
| HMGT-03 | View archived habits and restore | Create 16-VERIFICATION.md confirming ArchivedHabitsSection wired |
| HMGT-04 | Temporary habits with dates | Create 16-VERIFICATION.md confirming HabitForm temp toggle + date pickers |
| HMGT-05 | Custom frequency day-of-week buttons | Create 16-VERIFICATION.md confirming circular day-of-week buttons |
| CHAR-01 | Vegeta roast with escalating severity | Already verified in 12-VERIFICATION.md (PASSED) -- ensure traceability updated |
| CHAR-02 | Roast secondary, welcome_back first | Already verified in 12-VERIFICATION.md (PASSED) -- ensure traceability updated |
| ACHV-01 | Achievement recording in DB | Already verified in 12-VERIFICATION.md (PASSED) -- ensure traceability updated |
| ACHV-02 | Streak milestone detection at thresholds | Already verified in 12-VERIFICATION.md (PASSED); add `streak_milestone: 'reveal_chime'` to EVENT_SOUND_MAP |
| ACHV-04 | Achievements only in check_habit() | Already verified in 12-VERIFICATION.md (PASSED) -- ensure traceability updated |
| ANLT-05 | Per-habit calendar/stats API endpoints | Already verified in 12-VERIFICATION.md (PASSED) -- ensure traceability updated |
| HMGT-02 | PUT /habits/reorder endpoint | Already verified in 12-VERIFICATION.md (PASSED) -- ensure traceability updated |
</phase_requirements>

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - No new libraries, all changes to existing files with known patterns
- Architecture: HIGH - EVENT_SOUND_MAP pattern is established, VERIFICATION.md format is established
- Pitfalls: HIGH - Clear scope, main risk is unnecessary scope creep (trying to build new audio)

**Research date:** 2026-03-08
**Valid until:** 2026-04-07 (stable -- no external dependencies changing)
