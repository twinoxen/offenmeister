#!/usr/bin/env bash
# Ensures a Claude Code on the web session can run tests, lint, and build.
# Installs dependencies (and generates Nuxt types) when they're missing.
set -euo pipefail

cd "$(dirname "$0")/../.."

if [ ! -d node_modules ] || [ ! -d node_modules/nuxt ]; then
  echo "[session-start] Installing dependencies…"
  npm install
else
  # Make sure Nuxt's generated types / eslint config exist for lint + typecheck.
  if [ ! -f .nuxt/eslint.config.mjs ]; then
    echo "[session-start] Preparing Nuxt…"
    npx nuxt prepare || true
  fi
fi

echo "[session-start] Ready. Run: npm run test | npm run lint | npm run build"
echo "[session-start] For runtime: npx convex dev (+ npm run seed) then npm run dev"
