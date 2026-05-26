import { readFileSync, writeFileSync } from "node:fs";
import { addImport } from "./shared";
import type { Injector } from "./types";

/**
 * Inject a Workbench fetch handler into a Bun.serve-based entry file.
 *
 * Rewrites the existing `Bun.serve({ fetch })` call so the Workbench handler
 * is consulted first and falls through to the user's original `fetch` only
 * for non-dashboard requests.
 *
 * For files we can't safely rewrite (e.g. unusual `Bun.serve` shapes) we
 * fall back to appending an importable mount snippet at the bottom of the
 * file and report a non-fatal failure so the CLI can show the manual
 * snippet.
 */
export const injectBun: Injector = async ({ entry, mountPath, withAuth }) => {
  if (!entry) return { ok: false, reason: "missing entry file" };

  let src: string;
  try {
    src = readFileSync(entry, "utf-8");
  } catch (err) {
    return { ok: false, reason: `could not read file: ${err}` };
  }

  if (src.includes("@getworkbench/bun")) {
    return { ok: false, reason: "already imports @getworkbench/bun" };
  }

  // Look for a `fetch(req) { ... }` / `fetch: (req) => ...` / `fetch: handler`
  // inside the Bun.serve options object. There's no fully safe codemod
  // without an AST, so we only rewrite the simplest, most common case:
  //
  //   Bun.serve({ fetch(req) { ... } })
  //   Bun.serve({ fetch: (req) => ... })
  //
  // Anything more elaborate gets a manual snippet via the init command's
  // fallback path.
  const bunServeIndex = src.search(/Bun\s*\.\s*serve\s*\(\s*\{/);
  if (bunServeIndex === -1) {
    return { ok: false, reason: "could not find `Bun.serve({ ... })` call" };
  }

  const importLine = `import { workbench as workbenchBun } from "@getworkbench/bun";\n`;
  const declLine = `\nconst workbenchHandler = workbenchBun({\n  queues: [/* add your BullMQ queues */],\n  basePath: "${mountPath}",${
    withAuth
      ? `\n  auth: {\n    username: process.env.WORKBENCH_USER!,\n    password: process.env.WORKBENCH_PASS!,\n  },`
      : ""
  }\n});\n`;

  // Try to wrap an existing `fetch(req)` method.
  const methodMatch = src.match(/fetch\s*\(\s*([a-zA-Z_$][\w$]*)\s*\)\s*\{/);
  let updated: string | null = null;

  if (methodMatch && methodMatch.index !== undefined) {
    const reqName = methodMatch[1]!;
    const openIdx = methodMatch.index + methodMatch[0].length;
    // Find the matching `}` for this fetch method.
    const closeIdx = findBlockClose(src, openIdx);
    if (closeIdx !== -1) {
      const originalBody = src.slice(openIdx, closeIdx);
      const wrappedBody = `\n    return workbenchHandler(${reqName}, async (${reqName}) => {${originalBody}    });\n  `;
      updated = src.slice(0, openIdx) + wrappedBody + src.slice(closeIdx);
    }
  }

  if (!updated) {
    return { ok: false, reason: "could not rewrite `fetch` handler safely" };
  }

  updated = addImport(updated, importLine);
  // Drop the `workbenchHandler` declaration immediately before `Bun.serve`.
  const reBunServe = /Bun\s*\.\s*serve\s*\(/;
  updated = updated.replace(reBunServe, `${declLine}\nBun.serve(`);

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

/**
 * Given `src` and an index just past an opening `{`, return the index of
 * the matching `}`. Returns -1 if no balanced match is found. Tracks
 * string/template/comment context so braces inside literals don't trip us.
 */
function findBlockClose(src: string, openIdx: number): number {
  let depth = 1;
  let i = openIdx;
  while (i < src.length) {
    const c = src[i]!;

    if (c === "/" && src[i + 1] === "/") {
      const nl = src.indexOf("\n", i);
      i = nl === -1 ? src.length : nl + 1;
      continue;
    }
    if (c === "/" && src[i + 1] === "*") {
      const end = src.indexOf("*/", i + 2);
      i = end === -1 ? src.length : end + 2;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      const quote = c;
      i++;
      while (i < src.length && src[i] !== quote) {
        if (src[i] === "\\") i += 2;
        else i++;
      }
      i++;
      continue;
    }
    if (c === "{") depth++;
    else if (c === "}") {
      depth--;
      if (depth === 0) return i;
    }
    i++;
  }
  return -1;
}
