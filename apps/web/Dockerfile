# ─── Build stage ────────────────────────────────────────
FROM oven/bun:latest AS builder
WORKDIR /app
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1

COPY package.json bun.lock pnpm-workspace.yaml ./
COPY tsconfig.base.json ./
COPY packages/ ./packages/
COPY apps/ ./apps/

RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install || bun install \
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
