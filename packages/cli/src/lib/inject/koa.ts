import { readFileSync, writeFileSync } from "node:fs";
import { addImport } from "./shared";
import type { Injector } from "./types";

/**
 * Inject a Workbench middleware into a Koa entry file.
 *
 *   app.use(workbench({ queues: [...], basePath: "<mount>", auth: {...} }));
 *
 * Koa has no built-in mount helper, so the adapter does its own prefix
 * matching based on `basePath`. We always emit `basePath` for that reason.
 */
export const injectKoa: Injector = async ({ entry, mountPath, withAuth }) => {
  if (!entry) return { ok: false, reason: "missing entry file" };

  let src: string;
  try {
    src = readFileSync(entry, "utf-8");
  } catch (err) {
    return { ok: false, reason: `could not read file: ${err}` };
  }

  if (src.includes("@getworkbench/koa")) {
    return { ok: false, reason: "already imports @getworkbench/koa" };
  }

  const appVar = src.match(
    /(?:const|let|var)\s+(\w+)\s*=\s*new\s+Koa\s*\(/,
  )?.[1];
  if (!appVar) {
    return { ok: false, reason: "could not determine Koa variable name" };
  }

  const importLine = `import { workbench } from "@getworkbench/koa";\n`;
  const mountLine = `\n${appVar}.use(workbench({\n  queues: [/* add your BullMQ queues */],\n  basePath: "${mountPath}",${
    withAuth
      ? `\n  auth: {\n    username: process.env.WORKBENCH_USER!,\n    password: process.env.WORKBENCH_PASS!,\n  },`
      : ""
  }\n}));\n`;

  let updated = addImport(src, importLine, "koa");

  const listenMatch = updated.match(
    new RegExp(`\\n\\s*${appVar}\\.listen\\s*\\(`),
  );
  if (listenMatch && listenMatch.index !== undefined) {
    updated =
      updated.slice(0, listenMatch.index) +
      mountLine +
      updated.slice(listenMatch.index);
  } else {
    const exportMatch = updated.match(
      new RegExp(`\\n\\s*export\\s+default\\s+${appVar}\\s*;?`),
    );
    if (exportMatch && exportMatch.index !== undefined) {
      updated =
        updated.slice(0, exportMatch.index) +
        mountLine +
        updated.slice(exportMatch.index);
    } else {
      if (!updated.endsWith("\n")) updated += "\n";
      updated += mountLine;
    }
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
