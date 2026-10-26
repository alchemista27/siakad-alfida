#!/bin/sh
set -e
# Pastikan static assets dan public folder tersedia di folder standalone Next.js
if [ -d "services/simpeg/web/.next/static" ] && [ ! -d "services/simpeg/web/.next/standalone/services/simpeg/web/.next/static" ]; then
  mkdir -p services/simpeg/web/.next/standalone/services/simpeg/web/.next
  cp -r services/simpeg/web/.next/static services/simpeg/web/.next/standalone/services/simpeg/web/.next/
fi
if [ -d "services/simpeg/web/public" ] && [ ! -d "services/simpeg/web/.next/standalone/services/simpeg/web/public" ]; then
  cp -r services/simpeg/web/public services/simpeg/web/.next/standalone/services/simpeg/web/public
fi

# Proteksi runtime: pastikan prisma generated client tersedia di folder dist
if [ -d "services/simpeg/api/src/generated" ] && [ ! -d "services/simpeg/api/dist/generated" ]; then
  mkdir -p services/simpeg/api/dist
  cp -r services/simpeg/api/src/generated services/simpeg/api/dist/
fi

# Deploy versioned migrations before the API accepts traffic. Do not use prisma db push in production.
echo "Applying SIMPEG Prisma migrations..."
./services/simpeg/api/node_modules/.bin/prisma migrate deploy --schema services/simpeg/api/prisma/schema.prisma

# Reconcile provider holidays after migrations, then every six hours. A missing
# provider key leaves the last successful calendar intact and disables polling.
if [ -n "${API_INDONESIA_API_KEY:-}" ]; then
  (
    while :; do
      node services/simpeg/api/dist/attendance/sync-national-holidays.cli.js || echo "SIMPEG holiday sync failed; retrying at next interval" >&2
      sleep 21600
    done
  ) &
else
  echo "SIMPEG holiday sync disabled: API_INDONESIA_API_KEY is absent" >&2
fi

echo "Memulai SIMPEG API (NestJS) pada port 3001..."
PORT=3001 node services/simpeg/api/dist/main.js &

echo "Memulai SIMPEG Web (Next.js) pada port 3000..."
HOSTNAME=0.0.0.0 PORT=3000 node services/simpeg/web/.next/standalone/services/simpeg/web/server.js
