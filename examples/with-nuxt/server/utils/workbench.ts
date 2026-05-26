import { workbench } from "@getworkbench/nuxt";
import { queues } from "./queues";

const auth =
  process.env.WORKBENCH_USER && process.env.WORKBENCH_PASS
    ? {
        username: process.env.WORKBENCH_USER,
        password: process.env.WORKBENCH_PASS,
      }
    : undefined;

/**
 * Shared workbench handler reused by both the `/jobs` and `/jobs/**` route
 * files. Nuxt/Nitro's `[...].ts` catch-all only matches one or more sub
 * segments, so we also register a bare-prefix route to handle `/jobs` and
 * `/jobs/` reliably.
 */
export const workbenchHandler = workbench({
  queues,
  title: "Nuxt · Workbench",
  basePath: "/jobs",
  auth,
});
