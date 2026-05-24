import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import {
  cancel,
  confirm,
  intro,
  isCancel,
  log,
  note,
  outro,
  spinner,
  text,
} from "@clack/prompts";
import pc from "picocolors";
import { findHonoEntry } from "../lib/hono-detect.js";
import { injectMount } from "../lib/inject.js";
import { detectPackageManager, installDep } from "../lib/package-manager.js";
import { generatePassword } from "../lib/password.js";

export interface InitOptions {
  cwd: string;
  mount: string;
  auth: boolean;
  docker: boolean;
  yes: boolean;
}

export async function init(opts: InitOptions): Promise<void> {
  const cwd = resolve(opts.cwd);

  console.log();
  intro(pc.bgCyan(pc.black(" Workbench ")));

  const pkgJsonPath = join(cwd, "package.json");
  if (!existsSync(pkgJsonPath)) {
    cancel(
      `No package.json found in ${pc.cyan(cwd)}. Run this inside your project root.`,
    );
    process.exit(1);
  }

  const pkgJson = JSON.parse(readFileSync(pkgJsonPath, "utf-8")) as {
    name?: string;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };

  const deps = {
    ...(pkgJson.dependencies ?? {}),
    ...(pkgJson.devDependencies ?? {}),
  };

  if (!deps.hono) {
    log.warn(
      `Workbench currently ships a ${pc.bold("Hono")} adapter. Add ${pc.cyan(
        "hono",
      )} to your project and re-run ${pc.cyan("npx @getworkbench/cli init")}.`,
    );
    cancel("hono not found in dependencies");
    process.exit(1);
  }

  log.info(`Project: ${pc.cyan(pkgJson.name ?? relative(process.cwd(), cwd))}`);

  let mountPath = opts.mount;
  let enableAuth = opts.auth;
  let writeDocker = opts.docker;

  if (!opts.yes) {
    const mountAnswer = await text({
      message: "Mount path for the dashboard",
      initialValue: mountPath,
      placeholder: "/jobs",
      validate(value) {
        if (!value.startsWith("/")) return "Must start with /";
      },
    });
    if (isCancel(mountAnswer)) return cancelAndExit();
    mountPath = mountAnswer as string;

    const authAnswer = await confirm({
      message: "Protect the dashboard with basic auth?",
      initialValue: enableAuth,
    });
    if (isCancel(authAnswer)) return cancelAndExit();
    enableAuth = authAnswer as boolean;

    if (!existsSync(join(cwd, "docker-compose.yml"))) {
      const dockerAnswer = await confirm({
        message: "Write a docker-compose.yml for Redis?",
        initialValue: writeDocker,
      });
      if (isCancel(dockerAnswer)) return cancelAndExit();
      writeDocker = dockerAnswer as boolean;
    } else {
      writeDocker = false;
    }
  }

  const pm = detectPackageManager(cwd);
  log.info(`Detected package manager: ${pc.cyan(pm)}`);

  const s = spinner();
  s.start(`Installing ${pc.bold("@getworkbench/hono")}`);
  try {
    await installDep(pm, "@getworkbench/hono", cwd);
    s.stop(`Installed ${pc.bold("@getworkbench/hono")}`);
  } catch (err) {
    s.stop(pc.red("Install failed"));
    log.error(String(err));
    process.exit(1);
  }

  const entry = await findHonoEntry(cwd);
  if (!entry) {
    log.warn(
      "Could not locate a Hono app entrypoint. Add the mount manually — see the snippet below.",
    );
  } else {
    const rel = relative(cwd, entry);
    const injection = injectMount(entry, mountPath, enableAuth);
    if (injection.ok) {
      log.success(`Added Workbench mount to ${pc.cyan(rel)}`);
    } else {
      log.warn(
        `Couldn't auto-edit ${pc.cyan(rel)} (${injection.reason}). Add the snippet below manually.`,
      );
    }
  }

  const envExample = join(cwd, ".env.example");
  const envEntries: string[] = [];
  if (enableAuth) {
    const password = generatePassword(24);
    envEntries.push(
      "# Workbench dashboard auth",
      "WORKBENCH_USER=admin",
      `WORKBENCH_PASS=${password}`,
    );
  }
  envEntries.push(
    "# BullMQ Redis connection",
    "REDIS_URL=redis://localhost:6379",
  );

  const envBlock = `\n${envEntries.join("\n")}\n`;
  if (existsSync(envExample)) {
    const current = readFileSync(envExample, "utf-8");
    if (!current.includes("WORKBENCH_USER")) {
      writeFileSync(envExample, current.trimEnd() + envBlock);
      log.success(`Appended Workbench vars to ${pc.cyan(".env.example")}`);
    }
  } else {
    writeFileSync(envExample, envBlock.trimStart());
    log.success(`Wrote ${pc.cyan(".env.example")}`);
  }

  if (writeDocker) {
    writeFileSync(
      join(cwd, "docker-compose.yml"),
      `services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - workbench_redis:/data

volumes:
  workbench_redis:
`,
    );
    log.success(`Wrote ${pc.cyan("docker-compose.yml")}`);
  }

  note(
    [
      `Add your BullMQ queues to the mount:`,
      "",
      pc.dim('  import { workbench } from "@getworkbench/hono";'),
      pc.dim(`  app.route("${mountPath}", workbench({`),
      pc.dim("    queues: [/* your BullMQ Queue instances */],"),
      enableAuth
        ? pc.dim(
            "    auth: { username: process.env.WORKBENCH_USER!, password: process.env.WORKBENCH_PASS! },",
          )
        : null,
      pc.dim("  }));"),
      "",
      `Dashboard will be live at ${pc.cyan(`http://localhost:PORT${mountPath}`)}`,
      `Docs & README: ${pc.cyan("https://getworkbench.dev")}`,
    ]
      .filter(Boolean)
      .join("\n"),
    "Next steps",
  );

  outro(pc.green("Workbench is ready."));
}

function cancelAndExit(): void {
  cancel("Cancelled");
  process.exit(0);
}
