# example-with-astro

Minimal [Astro](https://astro.build) example (server output mode) with the Workbench BullMQ dashboard mounted at `/jobs`.

Astro doesn't host long-running BullMQ workers in its dev server, so this example runs them in a sibling `tsx` process via `concurrently`.

## Run

```bash
# 1. Boot Redis (from the repo root)
docker compose up -d redis

# 2. Install + start (Astro on PORT, worker as sibling)
bun install
bun run --filter example-with-astro dev
```

Then open <http://localhost:3000/jobs>.

## Files

- `astro.config.mjs` — server output + Node adapter.
- `src/queues.ts` — shared `Queue` instances.
- `src/pages/jobs/[...workbench].ts` — catch-all dashboard route.
- `src/worker.ts` — sibling worker + producer.
