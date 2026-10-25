FROM node:22.23.4-alpine AS base
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
RUN pnpm --filter @alfida/ui build
RUN pnpm --filter siskeu-api build
RUN pnpm --filter @alfida/siskeu-web build
RUN mkdir -p services/siskeu/web/.next/standalone/services/siskeu/web/.next \
  && cp -r services/siskeu/web/.next/static services/siskeu/web/.next/standalone/services/siskeu/web/.next/static

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 appuser
COPY --from=builder --chown=appuser:nodejs /app ./
RUN chmod +x services/siskeu/start.sh
USER appuser
EXPOSE 3000
CMD ["./services/siskeu/start.sh"]
