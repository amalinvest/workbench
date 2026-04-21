# Example: Workbench with Hono

Minimal Hono app mounting Workbench at `/jobs`.

## Run

```bash
# From repo root
bun i
bun run build

# Then in this folder
cd examples/with-hono
REDIS_URL=redis://localhost:6379 bun run dev
```

Visit [http://localhost:3000/jobs](http://localhost:3000/jobs).

Set `WORKBENCH_USER` and `WORKBENCH_PASS` to enable basic auth.
