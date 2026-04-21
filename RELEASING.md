# Releasing

Releases are cut manually by maintainers. No Changesets, no automation — just a short checklist.

## Prerequisites

- You are logged in to npm as an owner of `@getworkbench` (`npm whoami`).
- 2FA device available for `npm publish` OTP prompts.
- `bun` installed locally.

## 0.1.0-alpha.0 (first publish)

One-time: create the scope if it doesn't exist yet.

```bash
npm org create getworkbench --scope=@getworkbench
```

Then, from the repo root:

```bash
# 1. Clean build
bun i
bun run build
bun run typecheck
bun run lint

# 2. Bump all publishable packages to the alpha version
for p in core hono cli; do
  (cd packages/$p && npm version 0.1.0-alpha.0 --no-git-tag-version)
done

# 3. Publish core first (hono depends on it)
(cd packages/core && npm publish --access public --tag alpha)
(cd packages/hono && npm publish --access public --tag alpha)
(cd packages/cli  && npm publish --access public --tag alpha)

# 4. Commit + tag
git commit -am "release: 0.1.0-alpha.0"
git tag v0.1.0-alpha.0
git push && git push --tags

# 5. Smoke test in a scratch project
mkdir -p /tmp/wb-smoke && cd /tmp/wb-smoke
bun init -y
bun add hono bullmq
bunx @getworkbench/cli@alpha init --yes --no-docker
```

## Stable release (0.1.x, 0.2.x…)

Same flow, swap `--tag alpha` for the default latest tag:

```bash
for p in core hono cli; do
  (cd packages/$p && npm version 0.1.0 --no-git-tag-version)
done

(cd packages/core && npm publish --access public)
(cd packages/hono && npm publish --access public)
(cd packages/cli  && npm publish --access public)

git commit -am "release: 0.1.0"
git tag v0.1.0
git push && git push --tags
```

Then cut a GitHub Release from `v0.1.0` using the `CHANGELOG.md` entry as the body.

## Versioning rules

- Keep `@getworkbench/core` and `@getworkbench/hono` in **lockstep** (same version). `hono` imports `core` via a caret range, and the two ship together.
- `@getworkbench/cli` versions **independently** — the CLI's public surface is the command line flags, not the API.
- Breaking changes: bump the minor until 1.0 (`0.2.0`, `0.3.0`...).

## Vercel

`apps/web` auto-deploys on every push to `main` via the Vercel GitHub integration. No workflow needed in this repo.
