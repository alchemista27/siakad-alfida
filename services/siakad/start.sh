#!/bin/sh
set -e

# Pastikan static assets dan public folder tersedia di folder standalone Next.js
if [ -d "services/siakad/web/.next/static" ] && [ ! -d "services/siakad/web/.next/standalone/services/siakad/web/.next/static" ]; then
  mkdir -p services/siakad/web/.next/standalone/services/siakad/web/.next
  cp -r services/siakad/web/.next/static services/siakad/web/.next/standalone/services/siakad/web/.next/
fi
if [ -d "services/siakad/web/public" ] && [ ! -d "services/siakad/web/.next/standalone/services/siakad/web/public" ]; then
  cp -r services/siakad/web/public services/siakad/web/.next/standalone/services/siakad/web/public
fi

# Proteksi runtime: pastikan prisma generated client tersedia di folder dist
if [ -d "services/siakad/api/src/generated" ] && [ ! -d "services/siakad/api/dist/generated" ]; then
  mkdir -p services/siakad/api/dist
  cp -r services/siakad/api/src/generated services/siakad/api/dist/
fi

# Deploy migration versioned sebelum API menerima request. Jangan gunakan prisma db push di produksi.
echo "Menerapkan migration Prisma SIAKAD..."
pnpm --filter siakad-api exec prisma migrate deploy --schema services/siakad/api/prisma/schema.prisma

echo "Memulai SIAKAD API (NestJS) pada port 3001..."
PORT=3001 node services/siakad/api/dist/main.js &

echo "Memulai SIAKAD Web (Next.js) pada port 3000..."
HOSTNAME=0.0.0.0 PORT=3000 node services/siakad/web/.next/standalone/services/siakad/web/server.js
