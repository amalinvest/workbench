# Contributing to Workbench

Thanks for considering a contribution!

## Setup

```bash
git clone git@github.com:pontusab/workbench.git
cd workbench
bun i
bun run build
```

## Project layout

```
apps/
  web/                  marketing site (getworkbench.dev)
packages/
  core/                 @getworkbench/core — core + API + UI
  hono/                 @getworkbench/hono — Hono adapter
  cli/                  @getworkbench/cli — setup CLI
examples/
  with-hono/            minimal Hono example
```

## Development

```bash
bun run dev           # watch all packages
bun run typecheck     # typecheck everything
bun run lint          # biome
bun run lint:fix      # biome with autofix
```

## Pull requests

- One logical change per PR.
- Add or update the relevant section of `README.md` or `CHANGELOG.md` if your change affects users.
- CI (lint, typecheck, build) must pass.

## Releases

Releases are cut manually by maintainers. See `CHANGELOG.md` for history.

## Code style

[Biome](https://biomejs.dev/) handles formatting and linting. Run `bun run lint:fix` before committing.

## Questions?

Open a [Discussion](https://github.com/pontusab/workbench/discussions).
