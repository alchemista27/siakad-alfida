#!/bin/sh
set -e

echo "Memulai SIYAUM API (NestJS) pada port 3001..."
PORT=3001 node services/siyaum/api/dist/main.js &

echo "Memulai SIYAUM Web (Next.js) pada port 3000..."
PORT=3000 node services/siyaum/web/.next/standalone/services/siyaum/web/server.js
