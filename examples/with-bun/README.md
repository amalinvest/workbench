# example-with-bun

Minimal [Bun.serve](https://bun.sh/docs/api/http) example with the Workbench BullMQ dashboard mounted at `/jobs`.

The entry script also runs an in-process BullMQ worker and producer so the dashboard always has live data.

## Run

```bash
# 1. Boot Redis (from the repo root)
docker compose up -d redis

# 2. Install + start
bun install
bun run --filter example-with-bun dev
```

Then open <http://localhost:3000/jobs>.

## Files

- `src/index.ts` — server, queues, worker, producer.
