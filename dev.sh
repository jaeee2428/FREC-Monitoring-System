#!/usr/bin/env bash
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "=== CertTrack Dev Environment ==="

# ── Prisma sync (if schema changed) ──
echo ""
echo "[1/3] Syncing database schema…"
(cd "$ROOT/FREC-Monitoring-System-Server" && npx prisma generate && npx prisma db push --accept-data-loss 2>/dev/null) && echo "  ✓ schema synced"

# ── Start backend (background) ──
echo ""
echo "[2/3] Starting backend (port 5000)…"
(cd "$ROOT/FREC-Monitoring-System-Server" && npm run dev) &
BACKEND_PID=$!
sleep 2

# ── Start frontend (foreground) ──
echo ""
echo "[3/3] Starting frontend (port 5173)…"
echo ""
(cd "$ROOT/FREC-Monitoring-System-Client" && npm run dev)

# When frontend stops, clean up backend
kill $BACKEND_PID 2>/dev/null
