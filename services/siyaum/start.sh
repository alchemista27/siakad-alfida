#!/bin/sh
set -e
# Pastikan static assets dan public folder tersedia di folder standalone Next.js
if [ -d "services/siyaum/web/.next/static" ] && [ ! -d "services/siyaum/web/.next/standalone/services/siyaum/web/.next/static" ]; then
  mkdir -p services/siyaum/web/.next/standalone/services/siyaum/web/.next
  cp -r services/siyaum/web/.next/static services/siyaum/web/.next/standalone/services/siyaum/web/.next/
fi
if [ -d "services/siyaum/web/public" ] && [ ! -d "services/siyaum/web/.next/standalone/services/siyaum/web/public" ]; then
  cp -r services/siyaum/web/public services/siyaum/web/.next/standalone/services/siyaum/web/public
fi

# Proteksi runtime: pastikan prisma generated client tersedia di folder dist
if [ -d "services/siyaum/api/src/generated" ] && [ ! -d "services/siyaum/api/dist/generated" ]; then
  mkdir -p services/siyaum/api/dist
  cp -r services/siyaum/api/src/generated services/siyaum/api/dist/
fi

echo "Memulai SIYAUM API (NestJS) pada port 3001..."
PORT=3001 node services/siyaum/api/dist/main.js &

echo "Memulai SIYAUM Web (Next.js) pada port 3000..."
PORT=3000 node services/siyaum/web/.next/standalone/services/siyaum/web/server.js
