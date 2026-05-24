# Changelog

All notable changes to Workbench will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-05-24

Initial public release.

### Added

- `@getworkbench/core` — `WorkbenchCore`, `QueueManager`, API router and bundled React UI.
- `@getworkbench/hono` — Hono adapter with basic-auth support.
- `@getworkbench/cli` — `npx @getworkbench/cli init` scaffolds Workbench into an existing Hono project.
- Flows & DAG view, 24h metrics, 7-day activity timeline, schedulers, search with `field:value` syntax.
- Bulk actions (retry, delete, promote).
