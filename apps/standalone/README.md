# Workbench Standalone

Standalone Bun server for Workbench. Useful for hosted deployments such as Railway.

## Run Locally

```bash
docker compose up -d redis
REDIS_URL=redis://localhost:6379 bun run --filter @getworkbench/standalone dev
```

Open <http://localhost:3000>.

## Docker

Build from repo root:

```bash
docker build -f apps/standalone/Dockerfile -t workbench-standalone .
```

Run:

```bash
docker run --rm -p 3000:3000 \
  -e REDIS_URL=redis://host.docker.internal:6379 \
  -e QUEUE_NAMES=default \
  workbench-standalone
```

Health check:

```bash
curl http://localhost:3000/healthcheck
```

## Environment

| Variable | Default | Description |
| --- | --- | --- |
| `REDIS_URL` | none | Redis connection URL used by BullMQ. |
| `QUEUE_NAMES` | `default` | Comma-separated BullMQ queue names. |
| `PORT` | `3000` | HTTP port. |
| `BASE_PATH` | `/` | Dashboard base path. |
| `AUTH_USERNAME` | none | Basic auth username. Requires `AUTH_PASSWORD`. |
| `AUTH_PASSWORD` | none | Basic auth password. Requires `AUTH_USERNAME`. |
| `TITLE` | `Workbench` | Dashboard title. |
| `LOGO_URL` | none | Dashboard logo URL. |
| `READONLY` | `false` | Set to `true` to disable write actions. |
| `TAGS` | none | Comma-separated job data fields to expose as filters. |

Unauthenticated mode is allowed when `AUTH_USERNAME` and `AUTH_PASSWORD` are unset.

## Image Publishing

GitHub Actions builds the image on PRs that touch the standalone app or its dependencies. Version tags publish to GHCR:

```text
ghcr.io/<owner>/workbench-standalone:<version>
ghcr.io/<owner>/workbench-standalone:latest
```

## Railway

Use published GHCR image or point Railway at this repo with Dockerfile path `apps/standalone/Dockerfile`.

Set at least `REDIS_URL` and `QUEUE_NAMES`.
