#!/bin/sh
set -e

echo "Memulai SPMB API (NestJS) pada port 3001..."
PORT=3001 node services/spmb/api/dist/main.js &

echo "Memulai SPMB Web (Next.js) pada port 3000..."
PORT=3000 node services/spmb/web/.next/standalone/services/spmb/web/server.js
