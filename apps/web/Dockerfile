# ─── Build stage ────────────────────────────────────────
FROM oven/bun:1.3.10 AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

COPY package.json bun.lock pnpm-workspace.yaml ./
COPY tsconfig.base.json ./
COPY packages/ ./packages/
COPY apps/ ./apps/

RUN --mount=type=cache,target=/tmp/bun-cache \
    BUN_INSTALL_CACHE_DIR=/tmp/bun-cache bun install --frozen-lockfile \
 && cd apps/web && bun run build

# ─── Production stage ──────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

ENV NODE_ENV=production
ENV PORT=6662
ENV HOSTNAME=0.0.0.0
EXPOSE 6662
CMD ["node", "apps/web/server.js"]
