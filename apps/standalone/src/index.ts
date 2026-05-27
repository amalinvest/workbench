import { workbench } from "@getworkbench/bun";
import { Queue } from "bullmq";

const queueNames = (Bun.env.QUEUE_NAMES || "default").split(",");

const queues = queueNames.map(
  (name) =>
    new Queue(name.trim(), {
      connection: { url: Bun.env.REDIS_URL! },
    }),
);

const handler = workbench({
  queues,
  basePath: Bun.env.BASE_PATH || "/",
  ...(Bun.env.AUTH_USERNAME &&
    Bun.env.AUTH_PASSWORD && {
      auth: {
        username: Bun.env.AUTH_USERNAME,
        password: Bun.env.AUTH_PASSWORD,
      },
    }),
  ...(Bun.env.TITLE && { title: Bun.env.TITLE }),
  ...(Bun.env.LOGO_URL && { logo: Bun.env.LOGO_URL }),
  ...(Bun.env.READONLY === "true" && { readonly: true }),
  ...(Bun.env.TAGS && { tags: Bun.env.TAGS.split(",") }),
});

Bun.serve({
  port: Number(Bun.env.PORT) || 3000,
  fetch(req) {
    const url = new URL(req.url);
    if (url.pathname === "/healthcheck") {
      return new Response("OK", { status: 200 });
    }
    return handler(req, () => new Response("Not found", { status: 404 }));
  },
});
