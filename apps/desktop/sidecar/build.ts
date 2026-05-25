#!/usr/bin/env bun
/**
 * Compile the sidecar into a `bun --compile` single-file binary per Rust
 * target triple. Tauri's `externalBin` resolves `binaries/workbench-sidecar`
 * to `binaries/workbench-sidecar-<rust-triple>` (with `.exe` on Windows), so
 * we mirror that naming here.
 *
 * Usage:
 *   bun run build.ts                 # current host triple only (dev loop)
 *   bun run build.ts --all           # every supported triple
 *   bun run build.ts --triple <rust-triple>
 *   bun run build.ts --watch         # host triple, rebuild on change
 */

import { execSync, spawn } from "node:child_process";
import { existsSync, mkdirSync, renameSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

interface Target {
  rust: string;
  bun: string;
  ext: "" | ".exe";
}

const TARGETS: Target[] = [
  { rust: "aarch64-apple-darwin", bun: "bun-darwin-arm64", ext: "" },
  { rust: "x86_64-apple-darwin", bun: "bun-darwin-x64", ext: "" },
  { rust: "x86_64-unknown-linux-gnu", bun: "bun-linux-x64", ext: "" },
  { rust: "aarch64-unknown-linux-gnu", bun: "bun-linux-arm64", ext: "" },
  { rust: "x86_64-pc-windows-msvc", bun: "bun-windows-x64", ext: ".exe" },
];

const here = dirname(fileURLToPath(import.meta.url));
const entry = resolve(here, "src/main.ts");
// Output lives OUTSIDE src-tauri so `tauri dev`'s file watcher doesn't
// restart the Rust app every time the sidecar recompiles. `tauri.conf.json`
// references this directory via `externalBin: ["../dist-sidecar/..."]`.
const outDir = resolve(here, "../dist-sidecar");

function hostTriple(): string {
  // `rustc --print host-tuple` is available since Rust 1.84; fall back to
  // parsing `rustc -vV` for older toolchains so dev machines on stable-X
  // don't need to bump.
  try {
    const out = execSync("rustc --print host-tuple", {
      encoding: "utf8",
    }).trim();
    if (out) return out;
  } catch {
    // fall through
  }
  const info = execSync("rustc -vV", { encoding: "utf8" });
  const match = /host:\s*(\S+)/.exec(info);
  if (!match)
    throw new Error("Could not detect Rust host triple. Is rustc installed?");
  return match[1];
}

function targetByTriple(triple: string): Target {
  const t = TARGETS.find((t) => t.rust === triple);
  if (!t) {
    throw new Error(
      `Unsupported Rust target triple: ${triple}. Supported: ${TARGETS.map((t) => t.rust).join(", ")}`,
    );
  }
  return t;
}

async function buildOnce(target: Target): Promise<void> {
  mkdirSync(outDir, { recursive: true });
  const outName = `workbench-sidecar-${target.rust}${target.ext}`;
  const outPath = join(outDir, outName);

  const args = [
    "build",
    "--compile",
    "--minify",
    `--target=${target.bun}`,
    entry,
    "--outfile",
    outPath,
  ];

  console.log(`[sidecar] bun ${args.join(" ")}`);

  await new Promise<void>((resolveExec, rejectExec) => {
    const child = spawn("bun", args, { stdio: "inherit" });
    child.on("exit", (code) => {
      if (code === 0) resolveExec();
      else rejectExec(new Error(`bun build exited with code ${code}`));
    });
    child.on("error", rejectExec);
  });

  if (!existsSync(outPath)) {
    const fallback = outPath.replace(/\.exe$/, "");
    if (target.ext === ".exe" && existsSync(fallback)) {
      renameSync(fallback, outPath);
    } else {
      throw new Error(
        `Expected sidecar output at ${outPath} but file is missing`,
      );
    }
  }

  console.log(`[sidecar] -> ${outPath}`);
}

async function buildWatch(target: Target): Promise<void> {
  mkdirSync(outDir, { recursive: true });
  const outName = `workbench-sidecar-${target.rust}${target.ext}`;
  const outPath = join(outDir, outName);

  const args = [
    "build",
    "--watch",
    "--compile",
    `--target=${target.bun}`,
    entry,
    "--outfile",
    outPath,
  ];

  console.log(`[sidecar:dev] bun ${args.join(" ")}`);
  const child = spawn("bun", args, { stdio: "inherit" });
  await new Promise<void>((_resolve, rejectExec) => {
    child.on("exit", (code) => {
      if (code !== 0)
        rejectExec(new Error(`bun build --watch exited with code ${code}`));
    });
    child.on("error", rejectExec);
  });
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const watch = args.includes("--watch");
  const all = args.includes("--all");
  const tripleArg = args[args.indexOf("--triple") + 1];

  if (all) {
    for (const t of TARGETS) {
      await buildOnce(t);
    }
    return;
  }

  const triple =
    tripleArg && args.includes("--triple") ? tripleArg : hostTriple();
  const target = targetByTriple(triple);

  if (watch) {
    await buildWatch(target);
  } else {
    await buildOnce(target);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
