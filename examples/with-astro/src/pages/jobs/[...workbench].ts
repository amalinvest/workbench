import { workbench } from "@getworkbench/astro";
import { queues } from "../../queues";

const auth =
  process.env.WORKBENCH_USER && process.env.WORKBENCH_PASS
    ? {
        username: process.env.WORKBENCH_USER,
        password: process.env.WORKBENCH_PASS,
      }
    : undefined;

export const { GET, POST, PUT, PATCH, DELETE, prerender } = workbench({
  queues,
  title: "Astro · Workbench",
  basePath: "/jobs",
  auth,
});
