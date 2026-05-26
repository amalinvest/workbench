import { createFetchHandler, type WorkbenchOptions } from "@getworkbench/core";
import type { Queue } from "bullmq";
import { defineEventHandler, type EventHandler, toWebRequest } from "h3";

/**
 * Mount the Workbench dashboard inside an h3 app.
 *
 * Works for any framework built on h3 — standalone h3, Nitro, Nuxt 3,
 * SolidStart, Analog, etc. Returns an `EventHandler` you register at a
 * catch-all path.
 *
 * Internally uses h3's `toWebRequest()` so requests are translated into
 * standard `Request` objects before being routed through the shared
 * Workbench fetch handler.
 *
 * `basePath` must match the mount path so the dashboard's `<base href>`
 * and internal routing line up with h3's URL.
 *
 * @example Standalone h3 on Node
 * ```ts
 * import { createServer } from "node:http";
 * import { createApp, createRouter, toNodeListener } from "h3";
 * import { Queue } from "bullmq";
 * import { workbench } from "@getworkbench/h3";
 *
 * const emailQueue = new Queue("email", {
 *   connection: { url: process.env.REDIS_URL! },
 * });
 *
 * const handler = workbench({
 *   queues: [emailQueue],
 *   basePath: "/jobs",
 *   auth: {
 *     username: process.env.WORKBENCH_USER!,
 *     password: process.env.WORKBENCH_PASS!,
 *   },
 * });
 *
 * const router = createRouter()
 *   .use("/jobs", handler)
 *   .use("/jobs/**", handler);
 *
 * const app = createApp().use(router);
 *
 * createServer(toNodeListener(app)).listen(3000);
 * ```
 *
 * Register the handler at both the bare prefix (`/jobs`) and the catch-all
 * (`/jobs/**`). h3's `**` matches one-or-more sub-segments, so the bare
 * mount needs its own registration for `/jobs` and `/jobs/`.
 */
export function workbench(options: WorkbenchOptions | Queue[]): EventHandler {
  const { fetch } = createFetchHandler(options);
  return defineEventHandler(async (event) => {
    const request = toWebRequest(event);
    return await fetch(request);
  });
}

export type { WorkbenchOptions } from "@getworkbench/core";
