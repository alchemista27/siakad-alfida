#!/bin/sh
set -e
# Pastikan static assets dan public folder tersedia di folder standalone Next.js
if [ -d "services/spmb/web/.next/static" ] && [ ! -d "services/spmb/web/.next/standalone/services/spmb/web/.next/static" ]; then
  mkdir -p services/spmb/web/.next/standalone/services/spmb/web/.next
  cp -r services/spmb/web/.next/static services/spmb/web/.next/standalone/services/spmb/web/.next/
fi
if [ -d "services/spmb/web/public" ] && [ ! -d "services/spmb/web/.next/standalone/services/spmb/web/public" ]; then
  cp -r services/spmb/web/public services/spmb/web/.next/standalone/services/spmb/web/public
fi

echo "Memulai SPMB API (NestJS) pada port 3001..."
PORT=3001 node services/spmb/api/dist/main.js &

echo "Memulai SPMB Web (Next.js) pada port 3000..."
PORT=3000 node services/spmb/web/.next/standalone/services/spmb/web/server.js
