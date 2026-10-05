FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat \
  && corepack enable pnpm \
  && corepack prepare pnpm@12.6.0 --activate
ENV NEXT_TELEMETRY_DISABLED=1 \
    TURBO_TELEMETRY_DISABLED=1 \
    COREPACK_ENABLE_DOWNLOAD_PROMPT=0

# Install every workspace dependency once. Only manifests and the Prisma schema
# are copied, so this layer stays cached until dependencies or the schema change.
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY apps/web/package.json apps/web/
COPY apps/api/package.json apps/api/
COPY packages/database/package.json packages/database/
COPY packages/shared/package.json packages/shared/
# Root postinstall runs `prisma generate`, which needs the schema
COPY packages/database/prisma packages/database/prisma
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
# Copy the whole tree so per-package node_modules symlinks stay intact
COPY --from=deps /app ./
COPY . .
RUN pnpm build

# Production image: NestJS API and Next.js run in one container
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app ./

COPY <<-'SCRIPT' /app/start.sh
#!/bin/sh
echo "Starting NestJS API on port 3001..."
node apps/api/dist/main.js &

echo "Starting Next.js on port 3000..."
cd apps/web && exec node node_modules/next/dist/bin/next start
SCRIPT

RUN chmod +x /app/start.sh

USER nextjs

EXPOSE 3000 3001

CMD ["/app/start.sh"]
