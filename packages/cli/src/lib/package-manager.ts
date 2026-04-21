import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

export type PackageManager = "bun" | "pnpm" | "yarn" | "npm";

export function detectPackageManager(cwd: string): PackageManager {
  if (existsSync(join(cwd, "bun.lock")) || existsSync(join(cwd, "bun.lockb"))) {
    return "bun";
  }
  if (existsSync(join(cwd, "pnpm-lock.yaml"))) return "pnpm";
  if (existsSync(join(cwd, "yarn.lock"))) return "yarn";
  return "npm";
}

export function installDep(
  pm: PackageManager,
  pkg: string,
  cwd: string,
): Promise<void> {
  const args =
    pm === "npm"
      ? ["install", pkg]
      : pm === "yarn"
        ? ["add", pkg]
        : ["add", pkg];

  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(pm, args, {
      cwd,
      stdio: "ignore",
      env: process.env,
    });

    child.on("error", rejectPromise);
    child.on("exit", (code) => {
      if (code === 0) resolvePromise();
      else rejectPromise(new Error(`${pm} exited with code ${code}`));
    });
  });
}
