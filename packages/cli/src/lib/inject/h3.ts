import { readFileSync, writeFileSync } from "node:fs";
import { addImport } from "./shared";
import type { Injector } from "./types";

/**
 * Inject a Workbench mount into a standalone h3 entry file.
 *
 *   const workbenchHandler = workbench({ queues: [...], basePath: "<mount>", auth: {...} });
 *   app.use("<mount>", workbenchHandler);
 *   app.use("<mount>/**", workbenchHandler);
 *
 * Both registrations are needed because h3's `**` only matches one-or-more
 * sub-segments — without the bare-prefix mount, `/<mount>` and `/<mount>/`
 * fall through to whatever else the user has registered.
 *
 * Looks for `createApp()` (or `createRouter()`) and uses the assigned
 * variable name as the mount target. Reports a non-fatal failure if it
 * can't find an obvious anchor so the CLI shows the manual snippet.
 */
export const injectH3: Injector = async ({ entry, mountPath, withAuth }) => {
  if (!entry) return { ok: false, reason: "missing entry file" };

  let src: string;
  try {
    src = readFileSync(entry, "utf-8");
  } catch (err) {
    return { ok: false, reason: `could not read file: ${err}` };
  }

  if (src.includes("@getworkbench/h3")) {
    return { ok: false, reason: "already imports @getworkbench/h3" };
  }

  // Prefer the router variable if present; otherwise fall back to the app
  // variable. `.use(...)` works on both.
  const routerVar = src.match(
    /(?:const|let|var)\s+(\w+)\s*=\s*createRouter\s*\(/,
  )?.[1];
  const appVar = src.match(
    /(?:const|let|var)\s+(\w+)\s*=\s*createApp\s*\(/,
  )?.[1];
  const mountVar = routerVar ?? appVar;
  if (!mountVar) {
    return {
      ok: false,
      reason: "could not find `createApp()` or `createRouter()` declaration",
    };
  }

  const importLine = `import { workbench as workbenchH3 } from "@getworkbench/h3";\n`;
  const mountSnippet = `\nconst workbenchHandler = workbenchH3({\n  queues: [/* add your BullMQ queues */],\n  basePath: "${mountPath}",${
    withAuth
      ? `\n  auth: {\n    username: process.env.WORKBENCH_USER!,\n    password: process.env.WORKBENCH_PASS!,\n  },`
      : ""
  }\n});\n${mountVar}.use("${mountPath}", workbenchHandler);\n${mountVar}.use("${mountPath}/**", workbenchHandler);\n`;

  let updated = addImport(src, importLine, "h3");

  // Insert before `createServer(...)`, `listen(...)`, or `toNodeListener(...)`
  // call so the route is registered before the server starts.
  const anchorRe =
    /(\n\s*createServer\s*\(|\n\s*(?:[\w.]+\.)?listen\s*\(|\n\s*toNodeListener\s*\()/;
  const anchorMatch = updated.match(anchorRe);
  if (anchorMatch && anchorMatch.index !== undefined) {
    updated =
      updated.slice(0, anchorMatch.index) +
      mountSnippet +
      updated.slice(anchorMatch.index);
  } else {
    if (!updated.endsWith("\n")) updated += "\n";
    updated += mountSnippet;
  }

  if (updated === src) {
    return { ok: false, reason: "no safe insertion point" };
  }

  try {
    writeFileSync(entry, updated);
    return { ok: true, path: entry };
  } catch (err) {
    return { ok: false, reason: `could not write file: ${err}` };
  }
};
