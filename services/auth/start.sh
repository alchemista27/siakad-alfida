#!/bin/sh
set -e
# Pastikan static assets dan public folder tersedia di folder standalone Next.js
if [ -d "services/auth/web/.next/static" ] && [ ! -d "services/auth/web/.next/standalone/services/auth/web/.next/static" ]; then
  mkdir -p services/auth/web/.next/standalone/services/auth/web/.next
  cp -r services/auth/web/.next/static services/auth/web/.next/standalone/services/auth/web/.next/
fi
if [ -d "services/auth/web/public" ] && [ ! -d "services/auth/web/.next/standalone/services/auth/web/public" ]; then
  cp -r services/auth/web/public services/auth/web/.next/standalone/services/auth/web/
fi

# Proteksi runtime: pastikan prisma generated client tersedia di folder dist
if [ -d "services/auth/api/src/generated" ] && [ ! -d "services/auth/api/dist/generated" ]; then
  mkdir -p services/auth/api/dist
  cp -r services/auth/api/src/generated services/auth/api/dist/
fi

echo "Memulai Alfida Auth API (NestJS) pada port 3001..."
PORT=3001 node services/auth/api/dist/main.js &

echo "Memulai Alfida Auth Web (Next.js) pada port 3000..."
PORT=3000 node services/auth/web/.next/standalone/services/auth/web/server.js
