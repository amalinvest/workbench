# Changelog

All notable changes to Workbench will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- `@getworkbench/core` `QueueManager.getJobsByTimeRange` no longer crashes with `TypeError: undefined is not an object (evaluating 'job.finishedOn')` when BullMQ returns `null`/`undefined` entries from `queue.getJobs()`. This affected the two fallback paths (missing Redis client, and the `catch` after a failed `ZRANGEBYSCORE`) and showed up as a 500 on `{basePath}/api/metrics` under real queue churn with `removeOnComplete`/`removeOnFail`. Stale entries are now filtered out before the timestamp comparison. Fixes [#5](https://github.com/pontusab/workbench/issues/5). (Thanks @Stormix, #6.)

### Added

- BullMQ `prioritized` and `waiting-children` job states are now supported in queue and run filters, job fetching, counts, sidebar summaries, badges, flow nodes, and command palette status indicators. (Merged via #2 after 0.3.0 was published; will ship in the next release.)

### Changed

- Job status UI ordering.

## [0.3.0] - 2026-05-26

### Fixed

- `@getworkbench/core` no longer leaks `hono` into the public TypeScript surface of the non-Hono adapters. Previously, importing anything from `@getworkbench/express`, `@getworkbench/fastify`, `@getworkbench/nestjs`, `@getworkbench/next`, or `@getworkbench/elysia` caused `tsc` to load `node_modules/hono/dist/types/types.d.ts`, which uses `const` type parameters introduced in TypeScript 5.0. On TS 4.x this produced dozens of `TS1128: Declaration or statement expected` parse errors that `skipLibCheck` could not suppress, breaking the consumer's build even though their own code never imported Hono.

### Changed

- The Hono-typed core helpers — `buildWorkbenchApp`, `buildWorkbenchApiApp`, and `createApiRoutes` — moved from the main `@getworkbench/core` entry to a new `@getworkbench/core/hono` subpath. Only `@getworkbench/hono` and the desktop sidecar (the two places that actually need a `Hono` instance) import from the new subpath; all other adapters now type-check cleanly on TypeScript 4.x.
- `@getworkbench/hono` continues to require TypeScript 5.0+ because its own public types reference `Hono`. Documented in its README.

### Added

- `engines: { node: ">=18" }` on `@getworkbench/core` and every adapter package so the existing Node 18+ requirement is surfaced by package managers at install time. (`@getworkbench/cli` already declared this.)

## [0.2.1] - 2026-05-24

### Fixed

- `@getworkbench/core` now declares `hono` as a runtime `dependency` instead of a `peerDependency`. Non-Hono adapters (`express`, `fastify`, `nestjs`, `elysia`, `next`) previously failed at import time with `ERR_MODULE_NOT_FOUND: Cannot find package 'hono'` in environments where the package manager did not auto-install peer deps (strict pnpm, certain Docker images, hoisting-disabled monorepos). Hono is a private implementation detail of core's API engine and is now always installed transitively.
- All adapters and the CLI bumped to `0.2.1` so users picking up `@getworkbench/<adapter>@latest` get the corrected `core@0.2.1`.

## [0.2.0] - 2026-05-24

### Added

- `@getworkbench/elysia` — Elysia adapter. Mounts via `.mount(path, workbench({ basePath, queues, auth }))`.
- `@getworkbench/express` — Express adapter. Returns an `express.Router` for `app.use(path, …)`.
- `@getworkbench/fastify` — Fastify v5 plugin. Registers via `app.register(workbench({…}), { prefix })`.
- `@getworkbench/next` — Next.js App Router adapter. Catch-all route exports `{ GET, POST, PUT, PATCH, DELETE }`.
- `@getworkbench/nestjs` — NestJS adapter. Single `await workbench(app, path, options)` call. Detects Express vs Fastify platform and wires the right adapter automatically.
- `buildRouteTable`, `createFetchHandler`, `buildWorkbenchApp`, `resolveBasePath`, `checkBasicAuth`, `serveStaticAsset`, and `renderIndexHtml` exports on `@getworkbench/core` so framework adapters can compose Workbench without re-implementing routing.
- `examples/with-elysia`, `examples/with-express`, `examples/with-fastify`, `examples/with-next`, `examples/with-nestjs` — each fully runnable with a single command, including an in-process worker that produces and consumes jobs so the dashboard is never empty.
- Root `docker-compose.yml` for a shared Redis instance.
- `scripts/smoke.ts` end-to-end smoke tests, wired up as `bun run smoke`. Boots every example, asserts `/api/overview`, `/api/queues`, and `<base href>` on `/` and a deep client route.
- CLI auto-detects Hono, Elysia, Express, Fastify, NestJS, and Next.js projects. For Next.js the CLI scaffolds the catch-all route file; for the others it edits the entry file in place.

### Changed

- `@getworkbench/hono` is now a thin wrapper around the framework-agnostic core (`buildWorkbenchApp`). No behavior change for existing consumers.
- Removed the "planned for 0.2" placeholder from the README; the new adapters are first-class.

## [0.1.0] - 2026-05-24

Initial public release.

### Added

- `@getworkbench/core` — `WorkbenchCore`, `QueueManager`, API router and bundled React UI.
- `@getworkbench/hono` — Hono adapter with basic-auth support.
- `@getworkbench/cli` — `npx @getworkbench/cli init` scaffolds Workbench into an existing Hono project.
- Flows & DAG view, 24h metrics, 7-day activity timeline, schedulers, search with `field:value` syntax.
- Bulk actions (retry, delete, promote).
