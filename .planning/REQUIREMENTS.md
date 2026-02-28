# Requirements: Saiyan Tracker Full Stack Audit

**Defined:** 2026-03-01
**Core Value:** Every feature built in Phases 1-5 works correctly end-to-end

## v1 Requirements

Requirements for the audit milestone. Each maps to roadmap phases.

### Database & Models

- [ ] **DB-01**: Foreign key enforcement enabled on file-based SQLite (not just in-memory)
- [ ] **DB-02**: No orphaned rows exist from past deletions without FK enforcement
- [ ] **DB-03**: All model relationships correctly defined with proper cascade behavior
- [ ] **DB-04**: Date/time handling is timezone-safe across all models

### Business Logic

- [ ] **BIZ-01**: Streak calculation works correctly for daily frequency habits
- [ ] **BIZ-02**: Streak calculation works correctly for weekday frequency habits (no reset over weekends)
- [ ] **BIZ-03**: Streak calculation works correctly for custom frequency habits
- [ ] **BIZ-04**: Zenkai Recovery halves streak on missed days and applies +100% comeback bonus
- [ ] **BIZ-05**: Consistency bonus (Kaio-ken) applies exactly once per day, no double-apply
- [ ] **BIZ-06**: Consistency bonus tiers correct: 50%→1.1x, 80%→1.25x, 100%→1.5x
- [ ] **BIZ-07**: Habit point calculation matches PRD formula (base × category × streak bonus)
- [ ] **BIZ-08**: Task point calculation includes 0.5x multiplier per PRD
- [ ] **BIZ-09**: Power level total accurately reflects sum of all awarded points
- [ ] **BIZ-10**: Transformation thresholds trigger at correct power levels

### API Endpoints

- [ ] **API-01**: All 11 habit endpoints respond correctly (CRUD, check, calendar, reorder, stats)
- [ ] **API-02**: Habit check endpoint returns correct response shape (points, streak, tier, zenkai, transformation)
- [ ] **API-03**: Task endpoints still function correctly (CRUD, complete)
- [ ] **API-04**: Quote endpoints return quotes with source_saga field
- [ ] **API-05**: Analytics endpoints return accurate data
- [ ] **API-06**: Power level endpoint returns correct current level and transformation
- [ ] **API-07**: Off-day endpoints function correctly
- [ ] **API-08**: Response models use Pydantic schemas (not manual dict construction)
- [ ] **API-09**: No N+1 query patterns in list endpoints

### Frontend Stores & API

- [ ] **FE-01**: habitStore has error handling (try/catch on all API calls)
- [ ] **FE-02**: TypeScript types in `types/index.ts` match backend response shapes
- [ ] **FE-03**: All stores correctly re-fetch after mutations
- [ ] **FE-04**: taskStore, powerStore, uiStore error handling is consistent
- [ ] **FE-05**: API client correctly handles error responses without crashing

### UI Components

- [ ] **UI-01**: HabitCard check toggle triggers ki-burst animation and points popup
- [ ] **UI-02**: HabitFormModal works in create mode (all fields, validation)
- [ ] **UI-03**: HabitFormModal works in edit mode (pre-fills, saves changes)
- [ ] **UI-04**: Context menu actions work (edit, move up, move down, archive, delete)
- [ ] **UI-05**: CalendarHeatmap displays correct data with month navigation
- [ ] **UI-06**: PowerLevelBar displays correct power, transformation, and progress
- [ ] **UI-07**: Dark/light theme consistent across all components
- [ ] **UI-08**: GokuQuote and VegetaDialog display with source saga
- [ ] **UI-09**: Dashboard layout matches PRD wireframe structure

### End-to-End Flows

- [ ] **E2E-01**: Full habit lifecycle — create, check, streak increments, points awarded, power updates
- [ ] **E2E-02**: Habit management — edit, reorder (persists), archive, delete
- [ ] **E2E-03**: Analytics page shows accurate calendar and charts after habit activity
- [ ] **E2E-04**: Transformation triggers when power level crosses threshold
- [ ] **E2E-05**: Off-day creation and its effect on streaks/daily tracking
- [ ] **E2E-06**: App loads cleanly on fresh database (empty state handling)

## v2 Requirements

Deferred to future milestone. Not in current roadmap.

### Testing Infrastructure

- **TEST-01**: Backend pytest suite with API integration tests
- **TEST-02**: Frontend Vitest suite with component tests
- **TEST-03**: Code quality tooling (Ruff for Python, ESLint for TypeScript)

### Performance

- **PERF-01**: Dashboard load consolidated (currently 7 parallel fetches)
- **PERF-02**: N+1 queries eliminated in all list endpoints

## Out of Scope

| Feature | Reason |
|---------|--------|
| New features | Audit-only milestone — make existing work reliable |
| Alembic migrations | Solo dev app, delete-and-rebuild approach is sufficient |
| E2E test framework (Playwright/Cypress) | Overkill for solo-user local app |
| Deployment/CI | Future milestone |
| Mobile/PWA | Future milestone |
| Task system overhaul | Tasks are secondary, verify they still work only |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| DB-01 | - | Pending |
| DB-02 | - | Pending |
| DB-03 | - | Pending |
| DB-04 | - | Pending |
| BIZ-01 | - | Pending |
| BIZ-02 | - | Pending |
| BIZ-03 | - | Pending |
| BIZ-04 | - | Pending |
| BIZ-05 | - | Pending |
| BIZ-06 | - | Pending |
| BIZ-07 | - | Pending |
| BIZ-08 | - | Pending |
| BIZ-09 | - | Pending |
| BIZ-10 | - | Pending |
| API-01 | - | Pending |
| API-02 | - | Pending |
| API-03 | - | Pending |
| API-04 | - | Pending |
| API-05 | - | Pending |
| API-06 | - | Pending |
| API-07 | - | Pending |
| API-08 | - | Pending |
| API-09 | - | Pending |
| FE-01 | - | Pending |
| FE-02 | - | Pending |
| FE-03 | - | Pending |
| FE-04 | - | Pending |
| FE-05 | - | Pending |
| UI-01 | - | Pending |
| UI-02 | - | Pending |
| UI-03 | - | Pending |
| UI-04 | - | Pending |
| UI-05 | - | Pending |
| UI-06 | - | Pending |
| UI-07 | - | Pending |
| UI-08 | - | Pending |
| UI-09 | - | Pending |
| E2E-01 | - | Pending |
| E2E-02 | - | Pending |
| E2E-03 | - | Pending |
| E2E-04 | - | Pending |
| E2E-05 | - | Pending |
| E2E-06 | - | Pending |

**Coverage:**
- v1 requirements: 42 total
- Mapped to phases: 0
- Unmapped: 42 ⚠️

---
*Requirements defined: 2026-03-01*
*Last updated: 2026-03-01 after initial definition*
