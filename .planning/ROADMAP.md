# Roadmap: Saiyan Tracker Full Stack Audit

## Overview

This audit takes the feature-complete Saiyan Tracker v2 and verifies every layer works correctly, bottom-up. Starting from the database (where foreign keys are silently disabled and timestamps use deprecated APIs), through the service layer (where streak logic breaks for non-daily habits and consistency bonuses can double-apply), through the API (where manual dict construction drifts from schemas), through the frontend (where habitStore has zero error handling), through UI components, and finally validating complete end-to-end user flows. The dependency order is strict: each layer must be verified before the layer above it, or we chase phantom bugs caused by foundational issues.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Database and Model Integrity** - Fix FK enforcement, timezone handling, cascade behavior, and orphaned data
- [ ] **Phase 2: Streak and Frequency Logic** - Verify and fix streak calculation for all habit frequencies including Zenkai Recovery
- [ ] **Phase 3: Points, Bonuses, and Transformations** - Verify point formulas, consistency bonus, and transformation thresholds
- [ ] **Phase 4: Habit and Core API Quality** - Fix structural API issues: Pydantic response models, N+1 queries, habit endpoint contracts
- [ ] **Phase 5: Supporting API Endpoints** - Verify task, quote, analytics, power level, and off-day endpoints respond correctly
- [ ] **Phase 6: Frontend Stores and API Client** - Add error handling, fix type mismatches, verify store re-fetch patterns
- [ ] **Phase 7: UI Components and Interactions** - Verify all component rendering, interactions, animations, and theme consistency
- [ ] **Phase 8: End-to-End Flow Verification** - Walk complete user journeys to confirm full stack works together

## Phase Details

### Phase 1: Database and Model Integrity
**Goal**: The database layer enforces data integrity -- foreign keys are active, timestamps are timezone-safe, cascades work correctly, and no orphaned data exists
**Depends on**: Nothing (first phase)
**Requirements**: DB-01, DB-02, DB-03, DB-04
**Success Criteria** (what must be TRUE):
  1. PRAGMA foreign_keys returns ON for the file-based SQLite database (not just in-memory)
  2. Running PRAGMA foreign_key_check on the database returns zero violations
  3. Deleting a habit cascades correctly to its logs and streaks (no orphaned rows remain)
  4. All datetime fields use timezone-aware UTC timestamps (no datetime.utcnow() calls remain)
**Plans**: 2 plans

Plans:
- [ ] 01-01-PLAN.md -- FK enforcement and orphan cleanup
- [ ] 01-02-PLAN.md -- Cascade behavior, datetime fixes, and DB rebuild

### Phase 2: Streak and Frequency Logic
**Goal**: Streak tracking works correctly for every habit frequency type, including edge cases around weekends, custom schedules, and recovery after missed days
**Depends on**: Phase 1
**Requirements**: BIZ-01, BIZ-02, BIZ-03, BIZ-04
**Success Criteria** (what must be TRUE):
  1. A daily habit completed on consecutive days shows an incrementing current streak
  2. A weekday-only habit completed Friday then Monday does NOT trigger Zenkai Recovery (streak continues)
  3. A custom-frequency habit (e.g., Mon/Wed/Fri) maintains streak across non-scheduled days
  4. After missing a scheduled day, Zenkai Recovery halves the streak to max(1, old//2) and awards the +100% comeback bonus on the next completion
**Plans**: TBD

Plans:
- [ ] 02-01: TBD
- [ ] 02-02: TBD

### Phase 3: Points, Bonuses, and Transformations
**Goal**: The gamification math is correct -- points, consistency bonuses, and transformation triggers all match the PRD formulas with no double-application or miscalculation
**Depends on**: Phase 2
**Requirements**: BIZ-05, BIZ-06, BIZ-07, BIZ-08, BIZ-09, BIZ-10
**Success Criteria** (what must be TRUE):
  1. Consistency bonus (Kaio-ken) applies exactly once per day regardless of how many times habits are toggled, at the correct tier (50% -> 1.1x, 80% -> 1.25x, 100% -> 1.5x)
  2. Habit points equal base * category_multiplier * streak_bonus as defined in the PRD
  3. Task points include the 0.5x multiplier per PRD
  4. Power level total equals the sum of all awarded points (habits + tasks)
  5. Transformation triggers at the exact threshold power levels defined in the PRD (not off-by-one)
**Plans**: TBD

Plans:
- [ ] 03-01: TBD
- [ ] 03-02: TBD

### Phase 4: Habit and Core API Quality
**Goal**: The habit API endpoints return correct data through Pydantic response models (not manual dicts), with no N+1 query patterns
**Depends on**: Phase 3
**Requirements**: API-01, API-02, API-08, API-09
**Success Criteria** (what must be TRUE):
  1. All 11 habit endpoints respond with correct status codes and data for valid requests
  2. Habit check endpoint returns the full response shape: points, streak, tier, zenkai flag, transformation info
  3. All API responses are serialized through Pydantic response_model (no manual dict construction in route handlers)
  4. List endpoints use eager loading (joinedload/selectinload) -- no N+1 query patterns visible in SQL logs
**Plans**: TBD

Plans:
- [ ] 04-01: TBD
- [ ] 04-02: TBD

### Phase 5: Supporting API Endpoints
**Goal**: All non-habit endpoints (tasks, quotes, analytics, power level, off-days) respond correctly and return accurate data
**Depends on**: Phase 4
**Requirements**: API-03, API-04, API-05, API-06, API-07
**Success Criteria** (what must be TRUE):
  1. Task CRUD and complete endpoints respond correctly with proper status codes
  2. Quote endpoints return quotes with the source_saga field populated
  3. Analytics endpoints return data that accurately reflects the habit log records in the database
  4. Power level endpoint returns the correct current level, transformation name, and progress to next threshold
  5. Off-day endpoints create/retrieve off-days and those off-days are respected by streak calculations
**Plans**: TBD

Plans:
- [ ] 05-01: TBD
- [ ] 05-02: TBD

### Phase 6: Frontend Stores and API Client
**Goal**: Frontend state management is robust -- all stores handle errors gracefully, TypeScript types match backend responses, and stores re-fetch correctly after mutations
**Depends on**: Phase 5
**Requirements**: FE-01, FE-02, FE-03, FE-04, FE-05
**Success Criteria** (what must be TRUE):
  1. habitStore has try/catch on every API call with loading state reset in finally blocks (matching taskStore pattern)
  2. TypeScript types in types/index.ts match the actual backend Pydantic response schemas (including sort_order, frequency fields)
  3. After any mutation (create, edit, delete, check, reorder), the relevant store re-fetches to stay in sync
  4. A backend error (500 or network drop) shows an error state in the UI instead of an infinite spinner
**Plans**: TBD

Plans:
- [ ] 06-01: TBD
- [ ] 06-02: TBD

### Phase 7: UI Components and Interactions
**Goal**: Every UI component renders correctly, interactions work as expected, animations fire, and theming is consistent across dark and light modes
**Depends on**: Phase 6
**Requirements**: UI-01, UI-02, UI-03, UI-04, UI-05, UI-06, UI-07, UI-08, UI-09
**Success Criteria** (what must be TRUE):
  1. Checking a habit on HabitCard triggers the ki-burst animation and shows a points popup
  2. HabitFormModal creates a new habit with all field combinations (name, category, frequency, custom days) and validates required fields
  3. HabitFormModal in edit mode pre-fills all fields from the existing habit and saves changes correctly
  4. Context menu actions (edit, move up, move down, archive, delete) all function and update the UI immediately
  5. CalendarHeatmap shows correct completion data, month navigation works, today is highlighted, and forward navigation is disabled on the current month
**Plans**: TBD

Plans:
- [ ] 07-01: TBD
- [ ] 07-02: TBD

### Phase 8: End-to-End Flow Verification
**Goal**: Complete user journeys work from frontend action through API to database and back, confirming no cross-layer integration bugs
**Depends on**: Phase 7
**Requirements**: E2E-01, E2E-02, E2E-03, E2E-04, E2E-05, E2E-06
**Success Criteria** (what must be TRUE):
  1. Creating a habit, checking it daily for 3+ days, and viewing analytics shows correct streak count, points total, and calendar heatmap entries
  2. Editing a habit name/category, reordering habits, archiving a habit, and deleting a habit all persist correctly through page refresh
  3. Reaching a transformation threshold triggers the transformation display update in the UI
  4. Creating an off-day and verifying it does not break the active streak
  5. Starting the app with a fresh (empty) database shows a clean empty state with no errors or broken UI

**Plans**: TBD

Plans:
- [ ] 08-01: TBD
- [ ] 08-02: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7 -> 8

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Database and Model Integrity | 0/2 | Planned | - |
| 2. Streak and Frequency Logic | 0/0 | Not started | - |
| 3. Points, Bonuses, and Transformations | 0/0 | Not started | - |
| 4. Habit and Core API Quality | 0/0 | Not started | - |
| 5. Supporting API Endpoints | 0/0 | Not started | - |
| 6. Frontend Stores and API Client | 0/0 | Not started | - |
| 7. UI Components and Interactions | 0/0 | Not started | - |
| 8. End-to-End Flow Verification | 0/0 | Not started | - |
