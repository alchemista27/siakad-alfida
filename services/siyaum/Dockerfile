FROM node:22.23.4-alpine AS base
RUN apk add --no-cache libc6-compat openssl \
  && corepack enable pnpm \
  && corepack prepare pnpm@12.6.0 --activate
ENV NEXT_TELEMETRY_DISABLED=1 \
    TURBO_TELEMETRY_DISABLED=1

FROM base AS builder
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile --ignore-scripts
RUN pnpm --filter siyaum-api exec prisma generate
RUN pnpm --filter @alfida/contracts build
RUN pnpm --filter @alfida/auth-sdk build
RUN pnpm --filter @alfida/ui build
RUN pnpm --filter siyaum-api build
RUN pnpm --filter @alfida/siyaum-web build
RUN mkdir -p services/siyaum/web/.next/standalone/services/siyaum/web/.next \
  && cp -r services/siyaum/web/.next/static services/siyaum/web/.next/standalone/services/siyaum/web/.next/ \
  && if [ -d services/siyaum/web/public ]; then cp -r services/siyaum/web/public services/siyaum/web/.next/standalone/services/siyaum/web/; fi

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 appuser

COPY --from=builder /app ./
RUN chmod +x services/siyaum/start.sh

USER appuser
EXPOSE 3000

CMD ["./services/siyaum/start.sh"]
