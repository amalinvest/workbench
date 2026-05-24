# @getworkbench/cli

One-command setup for [Workbench](https://getworkbench.dev) — a beautiful, open-source BullMQ dashboard for modern Node apps.

## Quick start

In your existing Hono project:

```bash
npx @getworkbench/cli init
```

The CLI:

1. Detects your Hono entrypoint
2. Installs `@getworkbench/hono`
3. Injects the dashboard mount with sensible defaults
4. Writes `.env.example` entries (basic auth credentials, Redis URL)
5. Optionally drops a `docker-compose.yml` for Redis

## Options

```bash
workbench init [options]

  --cwd <path>      Project directory (default: cwd)
  --mount <path>    Mount path for the dashboard (default: /jobs)
  --no-auth         Skip basic auth setup
  --no-docker       Skip docker-compose Redis setup
  --yes             Skip all prompts, use defaults
```

## Non-interactive

```bash
npx @getworkbench/cli init --yes --no-docker
```

## Currently supported

- [Hono](https://hono.dev) — shipped today.
- Express, Fastify, Next.js, [Hyper](https://hyperjs.ai) — planned for 0.2.

## Documentation

[getworkbench.dev](https://getworkbench.dev) · [GitHub](https://github.com/pontusab/workbench)

## License

MIT
