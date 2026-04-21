import { workbench } from "@getworkbench/hono";
import { serve } from "@hono/node-server";
import { Queue } from "bullmq";
import { Hono } from "hono";

const connection = { url: process.env.REDIS_URL ?? "redis://localhost:6379" };

const emailQueue = new Queue("email", { connection });
const invoiceQueue = new Queue("invoice", { connection });

const app = new Hono();

app.get("/", (c) => c.text("Try /jobs for the Workbench dashboard."));

app.route(
  "/jobs",
  workbench({
    queues: [emailQueue, invoiceQueue],
    title: "Example Workbench",
    auth: process.env.WORKBENCH_USER
      ? {
          username: process.env.WORKBENCH_USER,
          password: process.env.WORKBENCH_PASS ?? "",
        }
      : undefined,
  }),
);

const port = Number(process.env.PORT ?? 3000);
serve({ fetch: app.fetch, port });
console.log(`Workbench example listening on http://localhost:${port}/jobs`);
