---
phase: 23
slug: deployment-configuration
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-12
---

# Phase 23 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | pytest (backend), vitest (frontend) |
| **Config file** | `backend/pyproject.toml`, `frontend/package.json` |
| **Quick run command** | `cd backend && python -m pytest tests/ -x --tb=short` |
| **Full suite command** | `cd backend && python -m pytest tests/ -v && cd ../frontend && npm run test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd backend && python -m pytest tests/ -x --tb=short`
- **After every plan wave:** Run `cd backend && python -m pytest tests/ -v && cd ../frontend && npm run test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 23-01-01 | 01 | 1 | DEPLOY-01 | unit | `cd backend && python -m pytest tests/test_config.py::test_database_url_from_env -x` | ❌ W0 | ⬜ pending |
| 23-01-02 | 01 | 1 | DEPLOY-03 | unit | `cd backend && python -m pytest tests/test_config.py::test_cors_origins_parsing -x` | ❌ W0 | ⬜ pending |
| 23-01-03 | 01 | 1 | DEPLOY-04 | unit | `cd backend && python -m pytest tests/test_config.py::test_env_file_loading -x` | ❌ W0 | ⬜ pending |
| 23-02-01 | 02 | 1 | DEPLOY-02 | integration | `cd backend && python -m pytest tests/test_cors.py::test_cors_headers -x` | ❌ W0 | ⬜ pending |
| 23-03-01 | 03 | 2 | DEPLOY-05 | manual-only | Verify vercel.json exists with rewrite rule | N/A | ⬜ pending |
| 23-03-02 | 03 | 2 | DEPLOY-06 | manual-only | Verify VITE_API_BASE in api.ts reads from env | N/A | ⬜ pending |
| 23-03-03 | 03 | 2 | DEPLOY-07 | manual-only | Verify vercel.json in frontend/ directory | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `backend/tests/test_config.py` — stubs for DEPLOY-01, DEPLOY-03, DEPLOY-04 (settings class behavior)
- [ ] `backend/tests/test_cors.py` — stubs for DEPLOY-02 (CORS headers on cross-origin requests)

*Existing conftest.py and test infrastructure cover all other needs.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| vercel.json SPA rewrite | DEPLOY-05 | Static file content check | Verify `frontend/vercel.json` contains `{"rewrites": [{"source": "/(.*)", "destination": "/index.html"}]}` |
| VITE_API_BASE in Vercel | DEPLOY-06 | Vercel dashboard config | Verify env var set in Vercel project settings |
| Root Directory = frontend | DEPLOY-07 | Vercel dashboard config | Verify Root Directory setting in Vercel project |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
