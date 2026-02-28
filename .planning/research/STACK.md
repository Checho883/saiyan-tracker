# Stack Research: Testing & Auditing Tools

**Domain:** Full stack audit of a FastAPI + React + TypeScript habit tracker
**Researched:** 2026-02-28
**Confidence:** MEDIUM (training data only -- Bash/WebSearch/WebFetch unavailable for version verification)

## Context

This is NOT a greenfield stack decision. The app is built with FastAPI + SQLAlchemy + SQLite (backend) and React 19 + TypeScript + Vite 7 + Tailwind (frontend). This research covers what tools to add for **auditing, testing, and code quality** -- not changing the existing stack.

## Recommended Stack

### Backend Testing

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| pytest | >=8.3 | Test runner | The only serious Python test runner. FastAPI docs use it exclusively. Fixture system is unmatched for database setup/teardown. |
| pytest-asyncio | >=0.24 | Async test support | FastAPI is async; need async fixtures and test functions. Already implied by the async SQLAlchemy setup with aiosqlite. |
| httpx | >=0.27 (already installed) | HTTP test client | FastAPI's recommended test client via `ASGITransport`. Replaces the old `TestClient` from Starlette for async tests. Already in requirements.txt. |

**Note on httpx:** The project already has `httpx>=0.27.0` in requirements.txt. For testing, you use `httpx.AsyncClient` with `ASGITransport` to call FastAPI endpoints directly without starting a server. No additional install needed.

### Frontend Testing

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Vitest | >=3.0 | Test runner | Native Vite integration -- shares the same config, transforms, and plugins. Zero config needed since the project already uses Vite 7. Jest requires separate Babel/SWC config that duplicates Vite's work. |
| @testing-library/react | >=16.0 | Component testing | Standard for React testing. Tests user-visible behavior, not implementation details. Works with React 19. |
| @testing-library/jest-dom | >=6.0 | DOM assertions | Adds `.toBeInTheDocument()`, `.toHaveTextContent()`, etc. Makes test assertions readable. |
| @testing-library/user-event | >=14.0 | User interaction simulation | Simulates real user events (click, type, tab) more accurately than `fireEvent`. Essential for testing habit check/uncheck, form submission, context menus. |
| jsdom | >=25.0 | DOM environment | Vitest needs a DOM environment for React component tests. jsdom is the standard. |
| msw (Mock Service Worker) | >=2.0 | API mocking | Intercepts fetch/axios calls at the network level. Tests frontend in isolation from the backend. Better than mocking axios directly because it tests the actual HTTP layer. |

### Code Quality / Linting (already partially in place)

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Ruff | >=0.8 | Python linter + formatter | Replaces flake8, isort, black, pyflakes, and more in a single Rust-based tool. 10-100x faster than the tools it replaces. The Python ecosystem has converged on Ruff. |
| ESLint | >=9.39 (already installed) | JS/TS linter | Already in devDependencies. Just needs audit-specific rules verified. |
| TypeScript strict mode | -- | Type safety audit | Check if `strict: true` is enabled in tsconfig.json. If not, enabling it is part of the audit. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| pytest-cov | Coverage reporting for Python | Shows which backend code paths are untested. Use `--cov=app --cov-report=term-missing` to see exact uncovered lines. |
| @vitest/coverage-v8 | Coverage reporting for frontend | V8-based coverage is faster and more accurate than Istanbul for Vitest. Shows untested React components. |

## Installation

```bash
# Backend (in venv)
pip install pytest pytest-asyncio pytest-cov ruff

# Frontend
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom msw @vitest/coverage-v8
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Vitest | Jest | Only if you are NOT using Vite. Since this project uses Vite 7, Vitest is the obvious choice -- shared config, faster, native ESM. |
| @testing-library/react | Enzyme | Never. Enzyme is dead (no React 18+ support, let alone 19). Testing Library is the React team's recommendation. |
| msw | Nock / axios mock | Nock only works with Node http module. Mocking axios directly is fragile -- you test your mock, not your code. msw intercepts at the service worker level, which is closer to real behavior. |
| Ruff | flake8 + black + isort | Only if you have an existing config you cannot migrate. Ruff supports the same rule sets and is a drop-in replacement. For a new audit, start with Ruff. |
| pytest-asyncio | anyio pytest plugin | Only if using anyio directly. This project uses standard asyncio via FastAPI, so pytest-asyncio is the right fit. |
| jsdom | happy-dom | happy-dom is faster but has edge cases with some DOM APIs. jsdom is safer for an audit where correctness matters more than speed. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| unittest (Python stdlib) | Verbose, no fixtures, no parameterize, no async support without boilerplate. FastAPI docs never use it. | pytest |
| Enzyme | Dead project. No React 18/19 support. | @testing-library/react |
| Jest (in a Vite project) | Requires separate transform config (babel/swc), does not understand Vite's resolve aliases or plugins natively. Vitest was created to solve this exact problem. | Vitest |
| Playwright/Cypress (for this milestone) | E2E testing is overkill for an audit milestone. These tools test browser behavior and require a running server. Manual verification is faster for a solo-user local app. Consider for a future milestone if the app grows. | Manual E2E verification + unit/integration tests |
| coverage.py standalone | pytest-cov wraps it with better CLI integration and pytest fixtures. | pytest-cov |
| Black + isort + flake8 separately | Three tools, three configs, three CI steps. Ruff does all of it in one. | Ruff |

## Stack Patterns for This Audit

**Backend test pattern:**
- Use `httpx.AsyncClient` + `ASGITransport` for API endpoint tests
- Use a separate test SQLite database (`:memory:` or temp file) to avoid corrupting dev data
- Test each endpoint: correct response, edge cases, error handling
- Fixture for database session that rolls back after each test

**Frontend test pattern:**
- Use Vitest with jsdom environment for component tests
- Use msw to mock API responses
- Test user flows: render component, simulate interaction, assert DOM change
- Focus on HabitCard, HabitFormModal, context menu, and CalendarHeatmap

**Code quality pattern:**
- Run Ruff on entire backend with default rules
- Run ESLint on entire frontend
- Check for unused imports, dead code, type errors
- Verify TypeScript strict mode

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| Vitest >=3.0 | Vite 7 | Vitest 3.x is designed for Vite 6+. Should work with Vite 7. |
| @testing-library/react >=16.0 | React 19 | Testing Library 16+ added React 19 support. |
| msw >=2.0 | Vitest | msw 2.x uses a new API (`http.get()` instead of `rest.get()`). Make sure to follow v2 docs. |
| pytest-asyncio >=0.24 | Python 3.14, pytest 8 | pytest-asyncio 0.24+ supports the `asyncio_mode = "auto"` config in pytest.ini. |
| Ruff >=0.8 | Python 3.14 | Ruff tracks Python versions quickly. Should support 3.14 syntax. LOW confidence on 3.14 specifically -- verify. |

## Confidence Assessment

| Recommendation | Confidence | Reason |
|----------------|------------|--------|
| pytest for backend testing | HIGH | FastAPI official docs recommend it. Universal Python standard. |
| httpx as test client | HIGH | Already in project. FastAPI docs show this pattern. |
| Vitest for frontend testing | HIGH | Vite project = Vitest. This is settled consensus. |
| @testing-library/react | HIGH | React team recommended. No serious alternative exists for React 19. |
| msw for API mocking | MEDIUM | Standard recommendation, but this audit may not need API mocking -- manual testing may suffice for a solo app. Include it for completeness. |
| Ruff for Python linting | MEDIUM | Training data says Ruff is dominant, but could not verify latest version against Python 3.14 compatibility. |
| Specific version numbers | LOW | Could not verify against PyPI/npm due to tool restrictions. Versions are based on training data up to May 2025. Pin after running `pip install` / `npm install` to get actual latest. |

## Sources

- Training data knowledge of FastAPI testing patterns (FastAPI official docs recommend pytest + httpx)
- Training data knowledge of Vitest/Testing Library ecosystem
- Training data knowledge of Ruff adoption in Python ecosystem
- **No live verification was possible** -- Bash, WebSearch, and WebFetch tools were unavailable

---
*Stack research for: Full stack audit testing tools*
*Researched: 2026-02-28*
*Confidence degraded to MEDIUM due to inability to verify versions against live sources*
