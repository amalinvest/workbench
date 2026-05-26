# example-with-h3

Minimal standalone [h3](https://h3.unjs.io) example with the Workbench BullMQ dashboard mounted at `/jobs`.

Runs on plain `node:http` via `toNodeListener`. The same `workbench()` handler also drops into Nitro, SolidStart, Analog, or any other h3-based runtime.

## Run

```bash
# 1. Boot Redis (from the repo root)
docker compose up -d redis

# 2. Install + start
bun install
bun run --filter example-with-h3 dev
```

Then open <http://localhost:3000/jobs>.

## Files

- `src/index.ts` — h3 app, router, queues, worker, producer.
