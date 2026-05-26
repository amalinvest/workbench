# example-with-nuxt

Minimal [Nuxt 3](https://nuxt.com) example with the Workbench BullMQ dashboard mounted at `/jobs`.

Nuxt's dev server doesn't host long-running BullMQ workers, so this example runs them in a sibling `tsx` process via `concurrently`.

## Run

```bash
# 1. Boot Redis (from the repo root)
docker compose up -d redis

# 2. Install + start (Nuxt on PORT, worker as sibling)
bun install
bun run --filter example-with-nuxt dev
```

Then open <http://localhost:3000/jobs>.

## Files

- `nuxt.config.ts` — base config.
- `app.vue` — landing page.
- `server/utils/queues.ts` — shared `Queue` instances (auto-imported in `server/`).
- `server/routes/jobs/[...].ts` — catch-all dashboard route.
- `scripts/worker.ts` — sibling worker + producer.
