import { createFetchHandler, type WorkbenchOptions } from "@getworkbench/core";
import type { Queue } from "bullmq";

/**
 * Fetch handler suitable for `Bun.serve({ fetch })`.
 *
 * Optionally takes a second `next` argument when you want to compose
 * Workbench with your own routes: requests outside the dashboard's
 * `basePath` fall through to it.
 */
export type BunFetchHandler = (
  req: Request,
  /**
   * Fallback handler invoked when the request URL is outside `basePath`.
   * Lets you compose Workbench with your own `Bun.serve` fetch routes.
   */
  next?: (req: Request) => Response | Promise<Response>,
) => Promise<Response>;

/**
 * Mount the Workbench dashboard on a Bun-native server.
 *
 * Returns a fetch handler compatible with `Bun.serve({ fetch })`. When
 * `basePath` is set, requests outside that prefix call the optional `next`
 * fallback so you can compose Workbench with your own routes.
 *
 * @example Standalone Workbench server
 * ```ts
 * import { Queue } from "bullmq";
 * import { workbench } from "@getworkbench/bun";
 *
 * const emailQueue = new Queue("email", {
 *   connection: { url: process.env.REDIS_URL! },
 * });
 *
 * const handler = workbench({
 *   queues: [emailQueue],
 *   auth: {
 *     username: process.env.WORKBENCH_USER!,
 *     password: process.env.WORKBENCH_PASS!,
 *   },
 * });
 *
 * Bun.serve({ port: 3000, fetch: handler });
 * ```
 *
 * @example Composed with your own routes
 * ```ts
 * const handler = workbench({ queues, basePath: "/jobs" });
 *
 * Bun.serve({
 *   port: 3000,
 *   fetch(req) {
 *     return handler(req, () => new Response("home"));
 *   },
 * });
 * ```
 */
export function workbench(
  options: WorkbenchOptions | Queue[],
): BunFetchHandler {
  const { fetch, core } = createFetchHandler(options);
  const basePath = normalizeBasePath(core.options.basePath);

  return async (req, next) => {
    if (basePath) {
      const url = new URL(req.url);
      const inScope =
        url.pathname === basePath || url.pathname.startsWith(`${basePath}/`);
      if (!inScope) {
        if (next) return next(req);
        return new Response("Not found", { status: 404 });
      }
    }
    return fetch(req);
  };
}

function normalizeBasePath(value: string | undefined): string | null {
  if (!value) return null;
  const trimmed = value.endsWith("/") ? value.slice(0, -1) : value;
  if (trimmed === "" || trimmed === "/") return null;
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

export type { WorkbenchOptions } from "@getworkbench/core";
