"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

/**
 * Theme toggle backed by `next-themes`. We use `resolvedTheme` (always
 * "light" | "dark") rather than `theme` (which can also be "system") so the
 * button flips between the two visible states even when the user is on
 * system-preference mode.
 *
 * The `mounted` gate is the canonical next-themes pattern for hydration
 * safety — the server has no way to know which theme will resolve, so we
 * render a stable placeholder until the client picks it up.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={
        mounted ? `Switch to ${isDark ? "light" : "dark"} mode` : "Toggle theme"
      }
      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[color:var(--color-muted-foreground)] transition hover:bg-[color:var(--color-muted)] hover:text-[color:var(--color-foreground)]"
    >
      <span className="sr-only">Toggle theme</span>
      {mounted ? (
        isDark ? (
          <Sun className="h-4 w-4" strokeWidth={1.75} />
        ) : (
          <Moon className="h-4 w-4" strokeWidth={1.75} />
        )
      ) : (
        // Empty box keeps button width stable until next-themes mounts.
        <span className="h-4 w-4" aria-hidden />
      )}
    </button>
  );
}
