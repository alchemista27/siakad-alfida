#!/bin/sh
set -e

echo "Memulai SIMAKIN API (NestJS) pada port 3001..."
PORT=3001 node services/simakin/api/dist/main.js &

echo "Memulai SIMAKIN Web (Next.js) pada port 3000..."
PORT=3000 node services/simakin/web/.next/standalone/services/simakin/web/server.js
