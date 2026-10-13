FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat \
  && corepack enable pnpm \
  && corepack prepare pnpm@12.6.0 --activate
ENV NEXT_TELEMETRY_DISABLED=1 \
    TURBO_TELEMETRY_DISABLED=1

FROM base AS builder
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @alfida/auth-api exec prisma generate
RUN pnpm --filter @alfida/contracts build
RUN pnpm --filter @alfida/auth-sdk build
RUN pnpm --filter @alfida/auth-api build
RUN pnpm --filter @alfida/auth-web build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 appuser

COPY --from=builder /app ./
RUN chmod +x services/auth/start.sh

USER appuser
EXPOSE 3000

CMD ["./services/auth/start.sh"]
