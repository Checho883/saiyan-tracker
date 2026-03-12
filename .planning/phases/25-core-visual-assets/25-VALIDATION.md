---
phase: 25
slug: core-visual-assets
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-12
---

# Phase 25 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest (frontend), pytest (backend) |
| **Config file** | `frontend/vitest.config.ts`, `backend/` (pytest via pyproject.toml or CLI) |
| **Quick run command** | `cd backend && python -m pytest tests/test_api_quotes.py tests/test_roast_service.py -x --tb=short` |
| **Full suite command** | `cd backend && python -m pytest && cd ../frontend && npx vitest run` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd backend && python -m pytest -x --tb=short`
- **After every plan wave:** Run `cd backend && python -m pytest && cd ../frontend && npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 25-01-01 | 01 | 1 | ART-01..ART-09 | smoke | `ls frontend/public/assets/avatars/*.webp` | ❌ W0 | ⬜ pending |
| 25-02-01 | 02 | 1 | ART-10 | unit | `cd backend && python -m pytest tests/test_api_quotes.py tests/test_roast_service.py -x` | ✅ | ⬜ pending |
| 25-02-02 | 02 | 1 | ART-15 | manual | Manual SVG inspection | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `frontend/public/assets/avatars/` directory — create target directory for processed images
- [ ] `frontend/public/assets/raw/` directory — staging area for user downloads
- [ ] `.gitignore` entry — add `frontend/public/assets/raw/` to prevent committing large source files

*These are directory/config setup, not test infrastructure gaps.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| SVG files have no embedded scripts | ART-15 | Content inspection, not behavioral | Open each SVG source in text editor; search for `<script`, `on*=`, `javascript:`, `xlink:href="http`, `<foreignObject>` |
| Each transformation form is visually distinct | ART-01..ART-07 | Visual quality/faithfulness | View each avatar in browser at 96px circular display; confirm unique hair/pose per form |
| Portraits render well at 40x40px | ART-08, ART-09 | Visual quality at small size | View quote toast and roast card; confirm character is recognizable |

*If none: "All phase behaviors have automated verification."*

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
