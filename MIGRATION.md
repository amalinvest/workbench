# Migration: midday/apps/worker → @getworkbench/hono

Once `@getworkbench/core` + `@getworkbench/hono` are published to npm (see [RELEASING.md](./RELEASING.md)), migrate `midday/apps/worker` with the diff below.

Do not apply this until the packages are live on npm — otherwise `apps/worker` will fail to resolve the dep.

## Diff

### `midday/apps/worker/package.json`

```diff
   "dependencies": {
-    "workbench": "workspace:*",
+    "@getworkbench/hono": "^0.1.0",
```

### `midday/apps/worker/src/index.ts`

```diff
-import { workbench } from "workbench/hono";
+import { workbench } from "@getworkbench/hono";
```

### `midday/apps/worker/Dockerfile`

Remove the workbench build step (~lines 35-36):

```diff
-RUN cd packages/workbench && bun run build
```

### Delete the vendored package

In a follow-up PR, once the above is merged and deployed:

```bash
rm -rf midday/packages/workbench
```

The `packages/*` workspace glob in midday's root `package.json` doesn't need to change.

## Verification

After the changes, run:

```bash
cd midday
bun i
bun run --filter=@midday/worker typecheck
bun run --filter=@midday/worker build
```

Then deploy `apps/worker` and hit `/jobs` in your browser to confirm the dashboard loads from the npm package.
