import { createFetchHandler, type WorkbenchOptions } from "@getworkbench/core";
import type { Queue } from "bullmq";

/**
 * Shape of an Astro `APIContext`. Typed structurally so we don't drag the
 * `astro` package into our public types (and so consumers on any Astro 3.x
 * or 4.x version see a working signature).
 */
interface AstroAPIContext {
  request: Request;
}

type AstroAPIRoute = (context: AstroAPIContext) => Promise<Response>;

export interface WorkbenchAstroHandlers {
  GET: AstroAPIRoute;
  POST: AstroAPIRoute;
  PUT: AstroAPIRoute;
  PATCH: AstroAPIRoute;
  DELETE: AstroAPIRoute;
  /** `Astro.config` requires `output: "server"` (or `"hybrid"`) for these. */
  prerender: false;
}

/**
 * Mount the Workbench dashboard on an Astro app.
 *
 * Place this in `src/pages/<mount>/[...workbench].ts` (catch-all route) and
 * re-export the HTTP methods. The dashboard becomes available at `/<mount>`.
 *
 * Astro must be in server output mode (`output: "server"` or `"hybrid"` plus
 * `export const prerender = false`) so the route runs on the server at
 * request time.
 *
 * `basePath` must match the route file's directory so the dashboard's
 * `<base href>` and internal routing line up with Astro's URL.
 *
 * @example
 * ```ts
 * // src/pages/jobs/[...workbench].ts
 * import { Queue } from "bullmq";
 * import { workbench } from "@getworkbench/astro";
 *
 * const emailQueue = new Queue("email", {
 *   connection: { url: process.env.REDIS_URL! },
 * });
 *
 * export const { GET, POST, PUT, PATCH, DELETE, prerender } = workbench({
 *   queues: [emailQueue],
 *   basePath: "/jobs",
 *   auth: {
 *     username: process.env.WORKBENCH_USER!,
 *     password: process.env.WORKBENCH_PASS!,
 *   },
 * });
 * ```
 */
export function workbench(
  options: WorkbenchOptions | Queue[],
): WorkbenchAstroHandlers {
  const { fetch } = createFetchHandler(options);
  const handler: AstroAPIRoute = ({ request }) => fetch(request);
  return {
    GET: handler,
    POST: handler,
    PUT: handler,
    PATCH: handler,
    DELETE: handler,
    prerender: false,
  };
}

export type { WorkbenchOptions } from "@getworkbench/core";
