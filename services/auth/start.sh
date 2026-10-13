#!/bin/sh
set -e

echo "Memulai Alfida Auth API (NestJS) pada port 3001..."
PORT=3001 node services/auth/api/dist/main.js &

echo "Memulai Alfida Auth Web (Next.js) pada port 3000..."
PORT=3000 node services/auth/web/.next/standalone/services/auth/web/server.js
