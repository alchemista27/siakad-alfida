FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat openssl curl \
  && corepack enable pnpm \
  && corepack prepare pnpm@12.6.0 --activate
ENV TURBO_TELEMETRY_DISABLED=1

FROM base AS builder
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile --ignore-scripts
RUN pnpm --filter siskeu-api exec prisma generate --schema prisma/schema.prisma
RUN pnpm --filter @alfida/contracts build
RUN pnpm --filter @alfida/auth-sdk build
RUN pnpm --filter siskeu-api build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 appuser
COPY --from=builder --chown=appuser:nodejs /app ./
RUN chmod +x services/siskeu/start.sh
USER appuser
EXPOSE 3001
CMD ["./services/siskeu/start.sh"]
