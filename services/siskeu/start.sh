#!/bin/sh
set -eu

# Preserve Prisma generated client when a deployment layer omits static generated files.
if [ -d "services/siskeu/api/src/generated" ] && [ ! -d "services/siskeu/api/dist/generated" ]; then
  mkdir -p services/siskeu/api/dist
  cp -r services/siskeu/api/src/generated services/siskeu/api/dist/
fi

./services/siskeu/api/node_modules/.bin/prisma migrate deploy --schema services/siskeu/api/prisma/schema.prisma

PORT=3001 node services/siskeu/api/dist/main.js &
api_pid=$!
HOSTNAME=0.0.0.0 PORT=3000 node services/siskeu/web/.next/standalone/services/siskeu/web/server.js &
web_pid=$!

cleanup() {
  kill "$api_pid" "$web_pid" 2>/dev/null || true
  wait "$api_pid" "$web_pid" 2>/dev/null || true
}
trap cleanup INT TERM EXIT
wait "$web_pid"
