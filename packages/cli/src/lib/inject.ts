import { readFileSync, writeFileSync } from "node:fs";

export interface InjectionResult {
  ok: boolean;
  reason?: string;
}

/**
 * Inject a Workbench mount into a Hono entry file using regex-based string edits.
 * This is deliberately conservative — when in doubt, it bails out with `ok: false`
 * and the CLI falls back to printing the snippet for manual copy-paste.
 */
export function injectMount(
  file: string,
  mountPath: string,
  withAuth: boolean,
): InjectionResult {
  let src: string;
  try {
    src = readFileSync(file, "utf-8");
  } catch (err) {
    return { ok: false, reason: `could not read file: ${err}` };
  }

  if (src.includes("@getworkbench/hono")) {
    return { ok: false, reason: "already imports @getworkbench/hono" };
  }

  const appVar = detectHonoVarName(src);
  if (!appVar) {
    return { ok: false, reason: "could not determine Hono variable name" };
  }

  const importLine = `import { workbench } from "@getworkbench/hono";\n`;
  const authBlock = withAuth
    ? `\n  auth: {\n    username: process.env.WORKBENCH_USER!,\n    password: process.env.WORKBENCH_PASS!,\n  },`
    : "";
  const mountLine = `\n${appVar}.route("${mountPath}", workbench({\n  queues: [/* add your BullMQ queues */],${authBlock}\n}));\n`;

  let updated = addImport(src, importLine);
  updated = addMountBeforeServeOrExport(updated, appVar, mountLine);

  if (updated === src) {
    return { ok: false, reason: "no safe insertion point" };
  }

  try {
    writeFileSync(file, updated);
    return { ok: true };
  } catch (err) {
    return { ok: false, reason: `could not write file: ${err}` };
  }
}

function detectHonoVarName(src: string): string | null {
  const m =
    src.match(/(?:const|let|var)\s+(\w+)\s*=\s*new\s+Hono\s*\(/) ?? null;
  return m ? (m[1] ?? null) : null;
}

function addImport(src: string, importLine: string): string {
  const honoImport = src.match(/import\s+.*from\s+["']hono["'];?\n/);
  if (honoImport && honoImport.index !== undefined) {
    const insertAt = honoImport.index + honoImport[0].length;
    return src.slice(0, insertAt) + importLine + src.slice(insertAt);
  }

  const lastImport = [...src.matchAll(/^import\s.+from\s.+;?\s*$/gm)].pop();
  if (lastImport && lastImport.index !== undefined) {
    const insertAt = lastImport.index + lastImport[0].length;
    return `${src.slice(0, insertAt)}\n${importLine}${src.slice(insertAt)}`;
  }

  return `${importLine}\n${src}`;
}

function addMountBeforeServeOrExport(
  src: string,
  appVar: string,
  mountLine: string,
): string {
  const serveMatch = src.match(/\n\s*serve\s*\(/);
  if (serveMatch && serveMatch.index !== undefined) {
    return (
      src.slice(0, serveMatch.index) + mountLine + src.slice(serveMatch.index)
    );
  }

  const bunServeMatch = src.match(/\n\s*Bun\.serve\s*\(/);
  if (bunServeMatch && bunServeMatch.index !== undefined) {
    return (
      src.slice(0, bunServeMatch.index) +
      mountLine +
      src.slice(bunServeMatch.index)
    );
  }

  const exportMatch = src.match(
    new RegExp(`\\n\\s*export\\s+default\\s+${appVar}\\s*;?`),
  );
  if (exportMatch && exportMatch.index !== undefined) {
    return (
      src.slice(0, exportMatch.index) + mountLine + src.slice(exportMatch.index)
    );
  }

  if (!src.endsWith("\n")) src += "\n";
  return src + mountLine;
}
