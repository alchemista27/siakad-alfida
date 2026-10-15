#!/bin/sh
set -e
# Pastikan static assets dan public folder tersedia di folder standalone Next.js
if [ -d "services/admin/web/.next/static" ] && [ ! -d "services/admin/web/.next/standalone/services/admin/web/.next/static" ]; then
  mkdir -p services/admin/web/.next/standalone/services/admin/web/.next
  cp -r services/admin/web/.next/static services/admin/web/.next/standalone/services/admin/web/.next/
fi
if [ -d "services/admin/web/public" ] && [ ! -d "services/admin/web/.next/standalone/services/admin/web/public" ]; then
  cp -r services/admin/web/public services/admin/web/.next/standalone/services/admin/web/
fi

# Proteksi runtime: pastikan prisma generated client tersedia di folder dist
if [ -d "services/admin/api/src/generated" ] && [ ! -d "services/admin/api/dist/generated" ]; then
  mkdir -p services/admin/api/dist
  cp -r services/admin/api/src/generated services/admin/api/dist/
fi

echo "Memulai Alfida Admin API (NestJS) pada port 3001..."
PORT=3001 node services/admin/api/dist/main.js &

echo "Memulai Alfida Admin Web (Next.js) pada port 3000..."
HOSTNAME=0.0.0.0 PORT=3000 node services/admin/web/.next/standalone/services/admin/web/server.js
