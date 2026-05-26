import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Injector } from "./types";

/**
 * Scaffold an Astro catch-all route file for Workbench.
 *
 * Writes `src/pages/<mount>/[...workbench].ts`. Always creates the file;
 * never edits the user's existing pages. Astro must be in server output
 * mode (`output: "server"` or `"hybrid"`) for this to run on every request.
 */
export const injectAstro: Injector = async ({ cwd, mountPath, withAuth }) => {
  const pagesBase = join(cwd, "src/pages");
  if (!existsSync(pagesBase)) {
    return {
      ok: false,
      reason: "no `src/pages/` directory found in this Astro project",
    };
  }

  const segments = mountPath.split("/").filter(Boolean);
  const dir = join(pagesBase, ...segments);
  const file = join(dir, "[...workbench].ts");

  if (existsSync(file)) {
    return { ok: false, reason: `${file} already exists` };
  }

  const contents = `import { Queue } from "bullmq";
import { workbench } from "@getworkbench/astro";

const connection = { url: process.env.REDIS_URL ?? "redis://localhost:6379" };

// TODO: replace with your real BullMQ queue instances.
const queues: Queue[] = [
  // new Queue("email", { connection }),
];

export const { GET, POST, PUT, PATCH, DELETE, prerender } = workbench({
  queues,
  basePath: "${mountPath}",${
    withAuth
      ? `\n  auth: {\n    username: process.env.WORKBENCH_USER!,\n    password: process.env.WORKBENCH_PASS!,\n  },`
      : ""
  }
});
`;

  try {
    mkdirSync(dir, { recursive: true });
    writeFileSync(file, contents);
    return { ok: true, path: file };
  } catch (err) {
    return { ok: false, reason: `could not write file: ${err}` };
  }
};
