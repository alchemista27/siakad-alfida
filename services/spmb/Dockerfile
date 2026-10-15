FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat \
  && corepack enable pnpm \
  && corepack prepare pnpm@12.6.0 --activate
ENV NEXT_TELEMETRY_DISABLED=1 \
    TURBO_TELEMETRY_DISABLED=1

FROM base AS builder
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile --ignore-scripts
RUN pnpm --filter spmb-api exec prisma generate
RUN pnpm --filter @alfida/contracts build
RUN pnpm --filter @alfida/auth-sdk build
RUN pnpm --filter @alfida/ui build
RUN pnpm --filter spmb-api build
RUN pnpm --filter @alfida/spmb-web build
RUN mkdir -p services/spmb/web/.next/standalone/services/spmb/web/.next \
  && cp -r services/spmb/web/.next/static services/spmb/web/.next/standalone/services/spmb/web/.next/ \
  && if [ -d services/spmb/web/public ]; then cp -r services/spmb/web/public services/spmb/web/.next/standalone/services/spmb/web/; fi

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 appuser

COPY --from=builder /app ./
RUN chmod +x services/spmb/start.sh

USER appuser
EXPOSE 3000

CMD ["./services/spmb/start.sh"]
