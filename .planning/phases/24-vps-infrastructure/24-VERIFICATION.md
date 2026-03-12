---
phase: 24
slug: vps-infrastructure
status: human_needed
verified: 2026-03-12
score: 5/5
---

# Phase 24: VPS Infrastructure - Verification

## Phase Goal
The FastAPI backend runs as a persistent HTTPS service on the Hostinger VPS that survives reboots and serves the production database.

## Requirement Verification

| Req ID | Description | Status | Evidence |
|--------|-------------|--------|----------|
| DEPLOY-08 | systemd unit for auto-start + restart-on-failure | PASS | `deploy/saiyan-tracker.service` has `Restart=on-failure`, `WantedBy=multi-user.target`, correct `ExecStart` |
| DEPLOY-09 | Nginx reverse proxy for API subdomain | PASS | `deploy/saiyan-tracker.nginx` proxies `api.saiyantracker.com` to Unix socket |
| DEPLOY-10 | Let's Encrypt TLS via Certbot | PASS | `deploy/SETUP.md` step 8 documents `certbot --nginx` command |
| DEPLOY-11 | SQLite WAL mode + correct permissions | PASS | `session.py` sets `PRAGMA journal_mode=WAL` on connect; tests pass; deploy script chowns DB files |
| DEPLOY-12 | Environment file for systemd | PASS | `deploy/saiyan-tracker.env.example` template + systemd `EnvironmentFile=/etc/saiyan-tracker.env` |

**Score: 5/5 requirements verified in codebase**

## Must-Haves Verification

### Plan 24-01 Must-Haves
- [x] SQLite WAL pragma is executed on every new database connection -- verified in `session.py` line 16
- [x] WAL mode test passes confirming pragma is set -- `tests/test_wal_mode.py` passes (2/2 tests)
- [x] `set_sqlite_pragma` event handler sets both foreign_keys and journal_mode -- confirmed

### Plan 24-02 Must-Haves
- [x] systemd unit file defines auto-start + restart-on-failure -- `deploy/saiyan-tracker.service` confirmed
- [x] Nginx config proxies api.saiyantracker.com to Unix socket -- `deploy/saiyan-tracker.nginx` confirmed
- [x] Environment file template includes DATABASE_URL and CORS_ORIGINS -- `deploy/saiyan-tracker.env.example` confirmed
- [x] Deploy script automates backup, pull, install, chown, restart -- `deploy/deploy.sh` confirmed
- [x] SETUP.md documents exact VPS setup steps in order -- 10 steps, copy-pasteable

## Success Criteria Check

| Criterion | Status |
|-----------|--------|
| After VPS reboot, API reachable at HTTPS subdomain | Config ready -- needs VPS deployment |
| Browser requests from Vercel frontend succeed over HTTPS | Config ready -- needs VPS deployment |
| SQLite DB persists with WAL mode, no lock errors | WAL pragma in code, chown in deploy script |
| Environment secrets from protected file, not hardcoded | EnvironmentFile directive + chmod 640 in setup |

## Human Verification Required

The following items require human action on the VPS and cannot be verified locally:

1. **VPS setup execution** -- User must SSH to VPS and follow `deploy/SETUP.md`
2. **DNS verification** -- A record for `api.saiyantracker.com` pointing to VPS IP
3. **Certbot certificate** -- Let's Encrypt cert obtained via `certbot --nginx`
4. **Service persistence** -- Reboot VPS and confirm API auto-starts
5. **End-to-end HTTPS** -- Browser test from Vercel frontend to VPS backend
6. **Smoke test** -- Run `deploy/smoke-test.sh` on VPS (5 checks)

## Automated Verification

```bash
# All backend tests pass (including WAL mode tests)
cd backend && python -m pytest tests/ -v
# Result: 310 passed

# Shell scripts syntax-valid
bash -n deploy/deploy.sh    # OK
bash -n deploy/smoke-test.sh # OK
```

## Verdict

**Status: human_needed** -- All code artifacts are in place and verified. Phase completion requires the user to perform VPS setup using the provided guide and config files.
