FROM node:22.23.4-alpine AS base
RUN apk add --no-cache libc6-compat \
  && corepack enable pnpm \
  && corepack prepare pnpm@12.6.0 --activate
ENV NEXT_TELEMETRY_DISABLED=1 \
    TURBO_TELEMETRY_DISABLED=1

FROM base AS builder
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile --ignore-scripts
RUN pnpm --filter @alfida/simakin-api exec prisma generate
RUN pnpm --filter @alfida/contracts build
RUN pnpm --filter @alfida/auth-sdk build
RUN pnpm --filter @alfida/ui build
RUN pnpm --filter @alfida/simakin-api build
RUN pnpm --filter @alfida/simakin-web build
RUN mkdir -p services/simakin/web/.next/standalone/services/simakin/web/.next \
  && cp -r services/simakin/web/.next/static services/simakin/web/.next/standalone/services/simakin/web/.next/ \
  && if [ -d services/simakin/web/public ]; then cp -r services/simakin/web/public services/simakin/web/.next/standalone/services/simakin/web/; fi

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 appuser

COPY --from=builder /app ./
RUN chmod +x services/simakin/start.sh

USER appuser
EXPOSE 3000

CMD ["./services/simakin/start.sh"]
