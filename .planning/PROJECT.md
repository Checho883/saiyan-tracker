# Saiyan Tracker — Full Stack Audit

## What This Is

A Dragon Ball Z themed daily habit tracker built for Sergio (solo user with ADHD). It uses gamification — power levels, transformations, per-habit streaks, consistency bonuses, and real anime quotes — to create the dopamine loop needed for daily habit consistency. Backend is FastAPI + SQLite, frontend is React 19 + TypeScript + Tailwind.

## Core Value

Every feature that was built in Phases 1-5 works correctly end-to-end — habits can be created, checked off, tracked with streaks, managed (edit/reorder/archive/delete), and visualized in analytics.

## Requirements

### Validated

- ✓ Habit CRUD — create, read, update, delete habits — existing
- ✓ Habit check/uncheck — toggle daily completion with points — existing
- ✓ Per-habit streaks — track current and best streaks — existing
- ✓ Dragon Ball quotes — 55 real quotes with source saga — existing
- ✓ Dark/light theme — CSS variable theming with system preference — existing
- ✓ Scouter-style power level display — existing
- ✓ HabitCard with ki-burst animation — existing
- ✓ HabitFormModal (create + edit) — existing
- ✓ Calendar heatmap with month navigation — existing
- ✓ Context menu (edit, move up/down, archive, delete) — existing
- ✓ Habit reordering via API — existing

### Active

- [ ] Full backend API audit — all endpoints respond correctly, no errors
- [ ] Full frontend UI audit — all components render, interactions work, theme consistent
- [ ] End-to-end flow verification — create/edit/complete/delete habits, streaks track, analytics display
- [ ] Code cleanup — remove dead code, fix inconsistencies, ensure reliability

### Out of Scope

- New features — this milestone is about making existing features solid, not adding new ones
- Deployment — no VPS/Docker/CI setup
- Mobile/PWA — future consideration
- Task system overhaul — tasks are secondary, focus is habits

## Context

- 5 phases were completed in the v2 redesign (habits backend, quotes, UI redesign, analytics calendar, habit management)
- Phase 6 (Update PRD) was listed but PRD is already updated
- Backend runs on Python 3.14, FastAPI, SQLAlchemy, SQLite at `backend/data/saiyan_tracker.db`
- Frontend runs on React 19, Vite 7, TypeScript, Tailwind CSS, Framer Motion, Zustand
- Single user app — DEFAULT_USER_ID = "default-user", no auth
- Database must be deleted when schema changes (kill python process first)
- Backend: `cd backend && source venv/Scripts/activate && uvicorn app.main:app --port 8000`
- Frontend: `cd frontend && node node_modules/vite/bin/vite.js`

## Constraints

- **Tech stack**: Must use existing stack (FastAPI + React + SQLite) — no migrations
- **Solo user**: No auth system, single DEFAULT_USER_ID throughout
- **Local dev**: SQLite database, localhost only
- **No new features**: Audit and fix only — don't add capabilities

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Audit-only milestone | Make existing work reliable before adding more | — Pending |
| Full stack scope | Backend + frontend + end-to-end flows all need verification | — Pending |

---
*Last updated: 2026-02-28 after initialization*
