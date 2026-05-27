FROM oven/bun:1.3-alpine AS deps

WORKDIR /app

COPY package.json bun.lock turbo.json tsconfig.base.json ./
COPY apps apps
COPY examples examples
COPY packages packages

RUN bun install --frozen-lockfile

FROM deps AS builder

RUN bun run --filter=@getworkbench/core build
RUN bun run --filter=@getworkbench/bun build
RUN bun run --filter=@getworkbench/standalone build

FROM oven/bun:1.3-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/package.json /app/bun.lock ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/standalone/node_modules ./apps/standalone/node_modules
COPY --from=builder /app/packages/core/node_modules ./packages/core/node_modules
COPY --from=builder /app/packages/bun/node_modules ./packages/bun/node_modules
COPY --from=builder /app/packages/core/package.json ./packages/core/package.json
COPY --from=builder /app/packages/core/dist ./packages/core/dist
COPY --from=builder /app/packages/bun/package.json ./packages/bun/package.json
COPY --from=builder /app/packages/bun/dist ./packages/bun/dist
COPY --from=builder /app/apps/standalone/package.json ./apps/standalone/package.json
COPY --from=builder /app/apps/standalone/dist ./apps/standalone/dist

WORKDIR /app/apps/standalone

EXPOSE 3000

CMD ["bun", "run", "dist/index.js"]
