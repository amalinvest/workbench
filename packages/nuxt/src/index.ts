import {
  workbench as h3Workbench,
  type WorkbenchOptions,
} from "@getworkbench/h3";
import type { Queue } from "bullmq";
import type { EventHandler } from "h3";

/**
 * Mount the Workbench dashboard on a Nuxt app via a Nitro server route.
 *
 * Wraps the framework-agnostic `@getworkbench/h3` adapter — Nuxt's server
 * routes run on Nitro, which is built on h3 — and exposes it under a
 * Nuxt-specific name for discoverability and docs.
 *
 * Because Nitro's `[...].ts` catch-all only matches one-or-more sub
 * segments, register the handler in two route files that delegate to one
 * shared instance:
 *
 *   server/utils/workbench.ts          — shared handler (single instance)
 *   server/routes/<mount>.ts           — handles `/<mount>` and `/<mount>/`
 *   server/routes/<mount>/[...].ts     — handles `/<mount>/<anything>`
 *
 * `basePath` must match the route file's directory so the dashboard's
 * `<base href>` and internal routing line up with Nuxt's URL.
 *
 * @example
 * ```ts
 * // server/utils/workbench.ts
 * import { Queue } from "bullmq";
 * import { workbench } from "@getworkbench/nuxt";
 *
 * const emailQueue = new Queue("email", {
 *   connection: { url: process.env.REDIS_URL! },
 * });
 *
 * export const workbenchHandler = workbench({
 *   queues: [emailQueue],
 *   basePath: "/jobs",
 *   auth: {
 *     username: process.env.WORKBENCH_USER!,
 *     password: process.env.WORKBENCH_PASS!,
 *   },
 * });
 * ```
 *
 * ```ts
 * // server/routes/jobs.ts
 * import { workbenchHandler } from "../utils/workbench";
 * export default workbenchHandler;
 *
 * // server/routes/jobs/[...].ts
 * import { workbenchHandler } from "../../utils/workbench";
 * export default workbenchHandler;
 * ```
 *
 * Nuxt doesn't host long-running BullMQ workers in its server runtime by
 * default — run them in a sibling Node process. See `examples/with-nuxt/`.
 */
export function workbench(options: WorkbenchOptions | Queue[]): EventHandler {
  return h3Workbench(options);
}

export type { WorkbenchOptions } from "@getworkbench/h3";
