FROM node:22-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* .npmrc* ./
RUN corepack enable pnpm && pnpm i --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable pnpm && pnpm run generate
RUN corepack enable pnpm && pnpm build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
RUN corepack enable pnpm

# Copy entire builder output (Monorepo approach: run both NestJS and Next.js in 1 container)
COPY --from=builder --chown=nextjs:nodejs /app ./

# Create a start script to launch both API and Web
COPY <<-'SCRIPT' /app/start.sh
#!/bin/sh
echo "Starting NestJS API on port 3001..."
node apps/api/dist/main.js &

echo "Starting Next.js on port 3000..."
cd apps/web && pnpm start
SCRIPT

RUN chmod +x /app/start.sh

USER nextjs

EXPOSE 3000 3001
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["/app/start.sh"]
