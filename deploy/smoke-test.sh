#!/usr/bin/env bash
echo "=== Saiyan Tracker Smoke Test ==="

PASS=0
FAIL=0

check() {
    if [ "$1" = "0" ]; then
        echo "   PASS"
        PASS=$((PASS + 1))
    else
        echo "   FAIL"
        FAIL=$((FAIL + 1))
    fi
}

echo "1. Service status:"
systemctl is-active saiyan-tracker > /dev/null 2>&1
check $?

echo "2. HTTPS health check:"
curl -sf https://api.saiyantracker.com/health | grep -q '"ok"' 2>/dev/null
check $?

echo "3. WAL mode:"
WAL=$(sqlite3 /home/user/saiyan-tracker/backend/saiyan_tracker.db "PRAGMA journal_mode;" 2>/dev/null)
if [ "$WAL" = "wal" ]; then
    echo "   PASS (journal_mode=$WAL)"
    PASS=$((PASS + 1))
else
    echo "   FAIL (journal_mode=$WAL)"
    FAIL=$((FAIL + 1))
fi

echo "4. Env file permissions:"
PERMS=$(stat -c '%a' /etc/saiyan-tracker.env 2>/dev/null)
if [ "$PERMS" = "640" ]; then
    echo "   PASS (permissions=$PERMS)"
    PASS=$((PASS + 1))
else
    echo "   FAIL (permissions=$PERMS)"
    FAIL=$((FAIL + 1))
fi

echo "5. Socket exists:"
if [ -S /run/saiyan-tracker/saiyan-tracker.sock ]; then
    echo "   PASS"
    PASS=$((PASS + 1))
else
    echo "   FAIL"
    FAIL=$((FAIL + 1))
fi

echo ""
echo "=== Results: $PASS passed, $FAIL failed ==="
