import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

/**
 * Vite config for the desktop app.
 *
 * The dashboard UI is imported from `@getworkbench/core/ui` (source files in
 * `packages/core/src/ui`). Those source files use `@/...` and `@/core/...`
 * imports internally, so we replicate the core package's alias setup here.
 * The desktop's own source files use **relative imports** (no `@/` prefix)
 * so the alias map stays unambiguous.
 */
export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  server: {
    port: 5173,
    strictPort: true,
    host: "127.0.0.1",
    hmr: {
      protocol: "ws",
      host: "127.0.0.1",
      port: 5173,
    },
    watch: {
      ignored: ["**/src-tauri/**", "**/sidecar/**"],
    },
  },
  envPrefix: ["VITE_", "TAURI_"],
  resolve: {
    alias: [
      // Note: order matters. The more-specific `@/core` alias must come
      // before the generic `@/` to win for paths like `@/core/types`.
      {
        find: /^@\/core\/(.*)$/,
        replacement: resolve(__dirname, "../../packages/core/src/core/$1"),
      },
      {
        find: /^@\/(.*)$/,
        replacement: resolve(__dirname, "../../packages/core/src/ui/$1"),
      },
    ],
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    target: "esnext",
    chunkSizeWarningLimit: 1500,
  },
});
