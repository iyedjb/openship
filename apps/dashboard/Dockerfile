# ─── Build stage ────────────────────────────────────────
FROM oven/bun:latest AS builder
WORKDIR /app
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1
# Same-origin API proxy (browser → /api/proxy/* → INTERNAL_API_URL). Baked at
# build time (NEXT_PUBLIC_* is inlined) so the dashboard never calls a hardcoded
# API host — works behind any reverse proxy / on a remote host.
ENV NEXT_PUBLIC_API_PROXY=true

COPY package.json bun.lock pnpm-workspace.yaml ./
COPY tsconfig.base.json ./
COPY packages/ ./packages/
COPY apps/ ./apps/

RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install || bun install \
 && cd apps/dashboard && bun run build

# ─── Production stage ──────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

COPY --from=builder /app/apps/dashboard/.next/standalone ./
COPY --from=builder /app/apps/dashboard/.next/static ./apps/dashboard/.next/static
COPY --from=builder /app/apps/dashboard/public ./apps/dashboard/public

ENV NODE_ENV=production
ENV PORT=6661
ENV HOSTNAME=0.0.0.0
EXPOSE 6661
CMD ["node", "apps/dashboard/server.js"]
