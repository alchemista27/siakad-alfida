FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat openssl \
  && corepack enable pnpm \
  && corepack prepare pnpm@12.6.0 --activate
ENV NEXT_TELEMETRY_DISABLED=1 \
    TURBO_TELEMETRY_DISABLED=1

FROM base AS builder
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile --ignore-scripts
RUN pnpm --filter siakad-api exec prisma generate
RUN pnpm --filter @alfida/contracts build
RUN pnpm --filter @alfida/auth-sdk build
RUN pnpm --filter @alfida/ui build
RUN pnpm --filter siakad-api build
RUN pnpm --filter @alfida/siakad-web build
RUN mkdir -p services/siakad/web/.next/standalone/services/siakad/web/.next \
  && cp -r services/siakad/web/.next/static services/siakad/web/.next/standalone/services/siakad/web/.next/ \
  && if [ -d services/siakad/web/public ]; then cp -r services/siakad/web/public services/siakad/web/.next/standalone/services/siakad/web/; fi

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 appuser

COPY --from=builder /app ./
RUN chmod +x services/siakad/start.sh

USER appuser
EXPOSE 3000

CMD ["./services/siakad/start.sh"]
