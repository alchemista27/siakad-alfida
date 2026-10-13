#!/bin/sh
set -e

echo "Memulai SIMPEG API (NestJS) pada port 3001..."
PORT=3001 node services/simpeg/api/dist/main.js &

echo "Memulai SIMPEG Web (Next.js) pada port 3000..."
PORT=3000 node services/simpeg/web/.next/standalone/services/simpeg/web/server.js
