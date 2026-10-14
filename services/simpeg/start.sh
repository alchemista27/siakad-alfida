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

echo "Memulai SIMPEG API (NestJS) pada port 3001..."
PORT=3001 node services/simpeg/api/dist/main.js &

echo "Memulai SIMPEG Web (Next.js) pada port 3000..."
PORT=3000 node services/simpeg/web/.next/standalone/services/simpeg/web/server.js
