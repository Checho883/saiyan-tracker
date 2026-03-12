---
phase: 24
slug: vps-infrastructure
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-12
---

# Phase 24 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | pytest 7.x (backend) |
| **Config file** | backend/pyproject.toml |
| **Quick run command** | `cd backend && python -m pytest tests/ -x -q` |
| **Full suite command** | `cd backend && python -m pytest tests/ -v` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd backend && python -m pytest tests/ -x -q`
- **After every plan wave:** Run `cd backend && python -m pytest tests/ -v`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 24-01-01 | 01 | 1 | DEPLOY-11 | unit | `cd backend && python -m pytest tests/test_wal_mode.py -v` | ❌ W0 | ⬜ pending |
| 24-02-01 | 02 | 1 | DEPLOY-08 | manual | N/A — VPS systemd config | N/A | ⬜ pending |
| 24-02-02 | 02 | 1 | DEPLOY-09 | manual | N/A — VPS nginx config | N/A | ⬜ pending |
| 24-02-03 | 02 | 1 | DEPLOY-10 | manual | N/A — VPS certbot | N/A | ⬜ pending |
| 24-02-04 | 02 | 1 | DEPLOY-12 | manual | N/A — VPS env file | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠ flaky*

---

## Wave 0 Requirements

- [ ] `tests/test_wal_mode.py` — test that WAL pragma is set on connection

*Remaining requirements are VPS-side infrastructure with no local automated tests.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Service starts on boot | DEPLOY-08 | Requires VPS reboot | `sudo reboot`, then `curl https://api.saiyantracker.com/health` |
| Service restarts on failure | DEPLOY-08 | Requires process kill on VPS | `sudo systemctl kill saiyan-tracker`, wait 5s, check status |
| Nginx proxies to backend | DEPLOY-09 | Requires VPS nginx running | `curl -I https://api.saiyantracker.com/health` |
| HTTPS with valid cert | DEPLOY-10 | Requires DNS + VPS certbot | Browser check — no SSL warnings |
| No mixed content | DEPLOY-09/10 | Requires Vercel frontend + VPS | Browser console on frontend — no warnings |
| Env file protected | DEPLOY-12 | Requires VPS filesystem | `ls -la /etc/saiyan-tracker.env` — no world read |
| DB persists across restarts | DEPLOY-11 | Requires VPS service restart | Create task via API, restart, verify task exists |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
