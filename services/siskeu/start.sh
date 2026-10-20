#!/bin/sh
set -e

# Preserve Prisma generated client when a deployment layer omits static generated files.
if [ -d "services/siskeu/api/src/generated" ] && [ ! -d "services/siskeu/api/dist/generated" ]; then
  mkdir -p services/siskeu/api/dist
  cp -r services/siskeu/api/src/generated services/siskeu/api/dist/
fi

./services/siskeu/api/node_modules/.bin/prisma migrate deploy --schema services/siskeu/api/prisma/schema.prisma
exec node services/siskeu/api/dist/main.js
