import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  createApiRoutes,
  UI_DIST_PATH,
  WorkbenchCore,
  type WorkbenchOptions,
} from "@getworkbench/core";
import type { Queue } from "bullmq";
import { Hono } from "hono";
import { basicAuth } from "hono/basic-auth";
import { cors } from "hono/cors";

/**
 * Create a Workbench Hono app
 *
 * @example
 * ```typescript
 * // Minimal - just pass queues
 * app.route("/jobs", workbench([inboxQueue, transactionsQueue]));
 *
 * // With options
 * app.route("/jobs", workbench({
 *   queues: [inboxQueue, transactionsQueue],
 *   auth: { username: "admin", password: "secret" },
 *   title: "My Jobs",
 * }));
 * ```
 */
export function workbench(options: WorkbenchOptions | Queue[]): Hono {
  const core = new WorkbenchCore(options);
  const app = new Hono();

  app.use("/api/*", cors());

  if (core.requiresAuth()) {
    app.use(
      "*",
      basicAuth({
        username: core.options.auth!.username,
        password: core.options.auth!.password,
      }),
    );
  }

  const apiRoutes = createApiRoutes(core);
  app.route("/api", apiRoutes);

  app.get("/config", (c) => {
    return c.json(core.getConfig());
  });

  app.get("/assets/:file", async (c) => {
    const fileName = c.req.param("file");
    const filePath = join(UI_DIST_PATH, "assets", fileName);

    if (!existsSync(filePath)) {
      return c.text("Not found", 404);
    }

    const content = readFileSync(filePath);
    const contentType = fileName.endsWith(".js")
      ? "application/javascript"
      : fileName.endsWith(".css")
        ? "text/css"
        : "application/octet-stream";

    return c.body(content, 200, { "Content-Type": contentType });
  });

  app.get("*", async (c) => {
    const indexPath = join(UI_DIST_PATH, "index.html");

    const url = new URL(c.req.url);
    let basePath = url.pathname;

    const clientRoutes = [
      /\/queues\/[^/]+\/jobs\/[^/]+\/?$/,
      /\/queues\/[^/]+\/?$/,
      /\/flows\/[^/]+\/[^/]+\/?$/,
      /\/schedulers\/?$/,
      /\/flows\/?$/,
      /\/metrics\/?$/,
      /\/test\/?$/,
    ];

    for (const route of clientRoutes) {
      basePath = basePath.replace(route, "");
    }

    if (!basePath.endsWith("/")) {
      basePath = `${basePath}/`;
    }

    if (existsSync(indexPath)) {
      let html = readFileSync(indexPath, "utf-8");
      html = html.replace("<head>", `<head>\n    <base href="${basePath}">`);
      return c.html(html);
    }

    const html = getIndexHtml(core.options.title || "Workbench", basePath);
    return c.html(html);
  });

  return app;
}

function getIndexHtml(title: string, basePath: string): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <base href="${basePath}">
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <style>
      body {
        font-family: system-ui, sans-serif;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        margin: 0;
        background: #0a0a0a;
        color: #fafafa;
      }
      .message {
        text-align: center;
        padding: 2rem;
      }
      code {
        background: #1a1a1a;
        padding: 0.5rem 1rem;
        border-radius: 0.5rem;
        display: block;
        margin-top: 1rem;
      }
    </style>
  </head>
  <body>
    <div class="message">
      <h1>${title}</h1>
      <p>UI assets not found. Build @getworkbench/core first:</p>
      <code>bun run --filter=@getworkbench/core build</code>
    </div>
  </body>
</html>`;
}

export type { WorkbenchOptions } from "@getworkbench/core";
