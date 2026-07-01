#!/usr/bin/env bash
# Smoke test for the OSSCA Chromium contributions site (Next.js, static export).
#
# IMPORTANT: next.config.ts sets basePath=/contributions and trailingSlash=true,
# so EVERY route lives under http://localhost:PORT/contributions/... — hitting
# "/" returns 404 and "/foo" 308-redirects. Always use the /contributions/ prefix.
#
# Launches the dev server, waits for it, curls the home route, then stops the server.
set -uo pipefail

PORT="${PORT:-3000}"
BASE="http://localhost:${PORT}/contributions"
LOG="/tmp/run-contributions-dev.log"

echo "Starting dev server (npm run dev) on :${PORT} ..."
npm run dev -- -p "$PORT" > "$LOG" 2>&1 &
DEV_PID=$!
trap 'kill "$DEV_PID" 2>/dev/null' EXIT

echo "Waiting for server (first compile can take a few seconds) ..."
if ! curl -s -o /dev/null --retry 60 --retry-connrefused --retry-delay 1 --retry-max-time 90 "${BASE}/"; then
  echo "SERVER DID NOT START — tail of ${LOG}:"
  tail -20 "$LOG"
  exit 1
fi

echo "--- home (/contributions/) ---"
curl -s -o /dev/null -w "home HTTP: %{http_code}\n" --max-time 30 "${BASE}/"

echo "--- home content signal ---"
curl -s --max-time 30 "${BASE}/" | grep -oE "OSSCA Chromium Contributions" | head -1

echo "Smoke OK."
