import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: false,
  sourcemap: false,
  clean: true,
  target: "node18",
  outDir: "dist",
  banner: {
    js: "#!/usr/bin/env node",
  },
});
