import { readFile } from "node:fs/promises";
import fg from "fast-glob";

const HONO_REGEX = /new\s+Hono\s*\(/;

/**
 * Scan the project for files that construct a Hono app.
 * Returns the most likely entrypoint (shortest path wins — usually `src/index.ts`).
 */
export async function findHonoEntry(cwd: string): Promise<string | null> {
  const files = await fg(
    ["src/**/*.{ts,tsx,js,mjs}", "app/**/*.{ts,tsx,js,mjs}", "index.{ts,js}"],
    {
      cwd,
      absolute: true,
      ignore: [
        "**/node_modules/**",
        "**/dist/**",
        "**/.next/**",
        "**/build/**",
      ],
    },
  );

  const matches: string[] = [];
  for (const file of files) {
    try {
      const content = await readFile(file, "utf-8");
      if (HONO_REGEX.test(content)) {
        matches.push(file);
      }
    } catch {
      // ignore unreadable files
    }
  }

  if (matches.length === 0) return null;
  matches.sort((a, b) => a.length - b.length);
  return matches[0]!;
}
