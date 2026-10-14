#!/bin/sh
set -e
# Pastikan static assets dan public folder tersedia di folder standalone Next.js
if [ -d "services/simakin/web/.next/static" ] && [ ! -d "services/simakin/web/.next/standalone/services/simakin/web/.next/static" ]; then
  mkdir -p services/simakin/web/.next/standalone/services/simakin/web/.next
  cp -r services/simakin/web/.next/static services/simakin/web/.next/standalone/services/simakin/web/.next/
fi
if [ -d "services/simakin/web/public" ] && [ ! -d "services/simakin/web/.next/standalone/services/simakin/web/public" ]; then
  cp -r services/simakin/web/public services/simakin/web/.next/standalone/services/simakin/web/public
fi

echo "Memulai SIMAKIN API (NestJS) pada port 3001..."
PORT=3001 node services/simakin/api/dist/main.js &

echo "Memulai SIMAKIN Web (Next.js) pada port 3000..."
PORT=3000 node services/simakin/web/.next/standalone/services/simakin/web/server.js
