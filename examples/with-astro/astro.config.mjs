import node from "@astrojs/node";
import { defineConfig } from "astro/config";

export default defineConfig({
  output: "server",
  adapter: node({ mode: "standalone" }),
  server: { host: true },
  // Astro 5's default CSRF protection (`security.checkOrigin`) blocks
  // non-browser POST/PUT/DELETE requests to the Workbench API (the dashboard
  // ships its own basic-auth, and is also called from non-browser tools).
  // Disable for the entire app here, or scope it to the dashboard route via
  // a middleware in your own project.
  security: { checkOrigin: false },
});
