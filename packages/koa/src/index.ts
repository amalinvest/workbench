import { createFetchHandler, type WorkbenchOptions } from "@getworkbench/core";
import type { Queue } from "bullmq";
import type { Context, Middleware, Next } from "koa";

/**
 * Mount the Workbench dashboard on a Koa app.
 *
 * Returns a Koa middleware. Koa has no built-in mount/router, so the
 * middleware does its own prefix matching based on `basePath`. When the
 * incoming request is outside the dashboard's prefix, control is passed
 * downstream via `next()` so the rest of your app keeps working.
 *
 * `basePath` is required — Koa preserves the full path on `ctx.path`, so the
 * handler needs to know where the dashboard is mounted to strip the prefix
 * before routing and to emit a correct `<base href>` in the HTML.
 *
 * @example
 * ```ts
 * import Koa from "koa";
 * import { Queue } from "bullmq";
 * import { workbench } from "@getworkbench/koa";
 *
 * const app = new Koa();
 * const emailQueue = new Queue("email", {
 *   connection: { url: process.env.REDIS_URL! },
 * });
 *
 * app.use(
 *   workbench({
 *     queues: [emailQueue],
 *     basePath: "/jobs",
 *     auth: {
 *       username: process.env.WORKBENCH_USER!,
 *       password: process.env.WORKBENCH_PASS!,
 *     },
 *   }),
 * );
 *
 * app.listen(3000);
 * ```
 */
export function workbench(options: WorkbenchOptions | Queue[]): Middleware {
  const { fetch, core } = createFetchHandler(options);
  const basePath = normalizeBasePath(core.options.basePath);

  if (!basePath) {
    throw new Error(
      '@getworkbench/koa: `basePath` is required (e.g. `basePath: "/jobs"`). Koa has no built-in mount, so the adapter must know its prefix.',
    );
  }

  return async (ctx: Context, next: Next): Promise<void> => {
    if (ctx.path !== basePath && !ctx.path.startsWith(`${basePath}/`)) {
      await next();
      return;
    }

    const protocol = ctx.protocol ?? "http";
    const host = ctx.host || "localhost";
    const url = `${protocol}://${host}${ctx.originalUrl}`;

    const headers = new Headers();
    for (const [key, value] of Object.entries(ctx.headers)) {
      if (typeof value === "string") {
        headers.set(key, value);
      } else if (Array.isArray(value)) {
        for (const v of value) headers.append(key, v);
      }
    }

    const init: Record<string, unknown> = {
      method: ctx.method,
      headers,
    };

    if (ctx.method !== "GET" && ctx.method !== "HEAD") {
      // Stream the Node IncomingMessage as the body. `duplex: 'half'` is
      // required by the Node fetch implementation for streaming request
      // bodies in Node 18+.
      init.duplex = "half";
      init.body = ctx.req;
    }

    const response = await fetch(new Request(url, init as RequestInit));

    ctx.status = response.status;
    response.headers.forEach((value, key) => {
      // Koa manages `Content-Length` itself; let it recompute.
      if (key.toLowerCase() === "content-length") return;
      ctx.set(key, value);
    });

    const buffer = Buffer.from(await response.arrayBuffer());
    ctx.body = buffer;
  };
}

function normalizeBasePath(value: string | undefined): string | null {
  if (!value) return null;
  const trimmed = value.endsWith("/") ? value.slice(0, -1) : value;
  if (trimmed === "" || trimmed === "/") return null;
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

export type { WorkbenchOptions } from "@getworkbench/core";
