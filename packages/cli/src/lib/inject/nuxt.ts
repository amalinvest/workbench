import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import type { Injector } from "./types";

/**
 * Scaffold Nuxt (Nitro) server routes for Workbench.
 *
 * Nitro's `[...].ts` catch-all only matches sub-segments, so we scaffold
 * three files that share one handler:
 *
 *   server/utils/workbench.ts         — shared handler
 *   server/routes/<mount>.ts          — handles bare `/<mount>` and `/<mount>/`
 *   server/routes/<mount>/[...].ts    — handles `/<mount>/<anything>`
 *
 * Always creates the files; never edits user code.
 */
export const injectNuxt: Injector = async ({ cwd, mountPath, withAuth }) => {
  const segments = mountPath.split("/").filter(Boolean);
  if (segments.length === 0) {
    return { ok: false, reason: "mountPath must have at least one segment" };
  }

  const routesBase = join(cwd, "server/routes");
  const utilsBase = join(cwd, "server/utils");
  const sharedFile = join(utilsBase, "workbench.ts");
  const baseRouteFile = join(routesBase, `${segments.join("/")}.ts`);
  const catchallRouteFile = join(routesBase, ...segments, "[...].ts");

  if (
    existsSync(sharedFile) ||
    existsSync(baseRouteFile) ||
    existsSync(catchallRouteFile)
  ) {
    return {
      ok: false,
      reason: `one of ${sharedFile}, ${baseRouteFile}, ${catchallRouteFile} already exists`,
    };
  }

  const sharedContents = `import { Queue } from "bullmq";
import { workbench } from "@getworkbench/nuxt";

const connection = { url: process.env.REDIS_URL ?? "redis://localhost:6379" };

// TODO: replace with your real BullMQ queue instances.
const queues: Queue[] = [
  // new Queue("email", { connection }),
];

export const workbenchHandler = workbench({
  queues,
  basePath: "${mountPath}",${
    withAuth
      ? `\n  auth: {\n    username: process.env.WORKBENCH_USER!,\n    password: process.env.WORKBENCH_PASS!,\n  },`
      : ""
  }
});
`;

  const baseRouteContents = `import { workbenchHandler } from "${baseRouteImportPath(segments.length)}";

export default workbenchHandler;
`;

  const catchallRouteContents = `import { workbenchHandler } from "${catchallRouteImportPath(segments.length)}";

export default workbenchHandler;
`;

  try {
    mkdirSync(dirname(sharedFile), { recursive: true });
    writeFileSync(sharedFile, sharedContents);
    mkdirSync(dirname(baseRouteFile), { recursive: true });
    writeFileSync(baseRouteFile, baseRouteContents);
    mkdirSync(dirname(catchallRouteFile), { recursive: true });
    writeFileSync(catchallRouteFile, catchallRouteContents);
    return { ok: true, path: catchallRouteFile };
  } catch (err) {
    return { ok: false, reason: `could not write file: ${err}` };
  }
};

/**
 * Relative import path from `server/routes/<segments>.ts` to
 * `server/utils/workbench.ts`. `segments.length` is the depth — for the
 * mount `/jobs` it's 1 (so we need one `..`).
 */
function baseRouteImportPath(depth: number): string {
  // server/routes/<segments>.ts → server/utils/workbench
  // up `depth` directories to reach `server/`, then into `utils`.
  return `${"../".repeat(depth)}utils/workbench`;
}

/**
 * Relative import path from `server/routes/<segments>/[...].ts` to
 * `server/utils/workbench.ts`. `segments.length + 1` because the file is
 * nested one level deeper than the segments themselves.
 */
function catchallRouteImportPath(depth: number): string {
  return `${"../".repeat(depth + 1)}utils/workbench`;
}
